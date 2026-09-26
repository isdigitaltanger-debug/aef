"""Aides Énergie France — API publique (leads, contenus, contact, SEO)."""

import logging
import os
import re
import secrets
import time
from collections import defaultdict, deque
from xml.sax.saxutils import escape

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

import seed as seed_mod
import rules as rules_mod
from models import new_id, now_iso, serialize, serialize_list, LeadCreate, ContactCreate, CallbackCreate
from admin import router as admin_router

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("aef")

app = FastAPI(title="Aides Énergie France", docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


api = APIRouter(prefix="/api")
api.include_router(admin_router)

RATE_LIMIT = defaultdict(deque)


def rate_limited(ip: str, limit: int = 5, window: int = 3600) -> bool:
    now = time.time()
    q = RATE_LIMIT[ip]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


def normalize_phone(phone: str) -> str:
    p = re.sub(r"[\s.\-()]", "", phone or "")
    if p.startswith("+33"):
        p = "0" + p[3:]
    return p


async def get_rules(db) -> dict:
    doc = await db.qualification_rules.find_one({"key": "ssc"})
    return doc or rules_mod.DEFAULT_RULES


async def active_partner(db) -> dict:
    return await db.partners.find_one({"active": True}) or {}


async def current_consent(db) -> dict:
    return await db.consent_versions.find_one({}, sort=[("version", -1)]) or {}


async def journal(db, event_type: str, state: str, detail: str, ref: str = ""):
    await db.integration_events.insert_one({
        "_id": new_id(), "created_at": now_iso(), "type": event_type,
        "state": state, "detail": detail, "reference": ref,
    })


async def dispatch_lead(db, lead: dict):
    """Webhook n8n/CRM optionnel (env) + journal. Le lead est TOUJOURS conservé."""
    webhook = os.environ.get("N8N_WEBHOOK_URL")
    if webhook:
        try:
            import asyncio

            import requests

            def _post():
                return requests.post(webhook, json={"reference": lead["reference"],
                                                    "answers": lead["answers"],
                                                    "prequal": lead["prequal"]}, timeout=8)
            r = await asyncio.to_thread(_post)
            state = "succes" if r.status_code < 300 else "echec"
            await journal(db, "lead_webhook", state, f"HTTP {r.status_code}", lead["reference"])
        except Exception as exc:
            await journal(db, "lead_webhook", "echec", str(exc)[:200], lead["reference"])
    else:
        await journal(db, "lead_webhook", "non_configure",
                      "Aucun N8N_WEBHOOK_URL configuré — lead conservé en base.", lead["reference"])
    await journal(db, "email_notification", "non_configure",
                  f"Aucun fournisseur e-mail actif. Destinataire configuré : "
                  f"{os.environ.get('NOTIFICATION_EMAIL', '—')}", lead["reference"])


@api.get("/")
async def root():
    return {"message": "Aides Énergie France — API", "status": "ok"}


@api.post("/leads")
async def create_lead(input: LeadCreate, request: Request):
    db = request.app.state.db
    ip = request.client.host if request.client else "inconnu"

    # Honeypot : réponse fictive, aucune écriture
    if (input.website or "").strip():
        return {"reference": "AEF-" + secrets.token_hex(4).upper(), "prequal": None, "duplicate": True}

    if not input.contact_ok:
        raise HTTPException(422, "Le consentement d'être recontacté est requis pour envoyer la demande.")
    if rate_limited(ip):
        raise HTTPException(429, "Trop de demandes depuis cette adresse. Réessayez plus tard.")

    # Déduplication 24 h
    email = input.contact.email.lower()
    phone = normalize_phone(input.contact.telephone)
    day_ago = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(time.time() - 86400))
    dup = await db.leads.find_one({"$or": [
        {"contact.email": email, "created_at": {"$gte": day_ago}},
        {"answers.normalized_phone": phone, "created_at": {"$gte": day_ago}},
    ]})
    if dup:
        return {"reference": dup["reference"], "prequal": dup.get("prequal"), "duplicate": True}

    rules = await get_rules(db)
    answers = input.answers.model_dump()
    answers["normalized_phone"] = phone
    prequal = rules_mod.prequalify(answers, rules)
    partner = await active_partner(db)
    consent = await current_consent(db)

    reference = "AEF-" + secrets.token_hex(4).upper()
    lead = {
        "_id": new_id(), "reference": reference, "created_at": now_iso(),
        "source": "simulation", "status_admin": "nouveau",
        "answers": answers, "contact": input.contact.model_dump(),
        "contact_ok": input.contact_ok, "marketing_ok": input.marketing_ok,
        "prequal": prequal,
        "consent": {
            "version": consent.get("version"), "recipient": partner.get("raison_sociale"),
            "contact_text": consent.get("contact_text"), "marketing_text": consent.get("marketing_text"),
            "timestamp": now_iso(), "ip": ip,
            "user_agent": request.headers.get("user-agent", "")[:300],
        },
        "utm": {k: str(v)[:120] for k, v in input.utm.items() if k in ("source", "medium", "campaign")
                and str(v)[:120]},
        "partner": partner.get("raison_sociale"),
        "transmitted": False,
        "transmission": {"state": "en_attente", "detail": "En attente d'envoi selon intégrations configurées."},
        "notes": "", "commission": {"montant_prevu": None, "montant_facture": None, "montant_encaisse": None},
        "events": [{"_id": new_id(), "ts": now_iso(), "actor": "systeme", "type": "creation",
                    "detail": f"Création via simulation (source {input.utm.get('source') or 'directe'})"}],
    }
    await db.leads.insert_one(lead)
    await dispatch_lead(db, lead)
    logger.info("Lead créé : %s", reference)
    return {"reference": reference, "prequal": prequal, "duplicate": False}


@api.get("/leads/{reference}")
async def get_lead_public(reference: str, request: Request):
    """Suivi public minimal : référence non devinable, aucune donnée personnelle."""
    db = request.app.state.db
    lead = await db.leads.find_one({"reference": reference})
    if not lead:
        raise HTTPException(404, "Référence introuvable")
    p = lead.get("prequal") or {}
    return {
        "reference": reference,
        "created_at": lead.get("created_at"),
        "status_label": p.get("status_label"),
        "headline": p.get("headline"),
        "messages": p.get("messages"),
        "orientations": p.get("orientations"),
        "zone": p.get("zone"),
        "pack_kw": p.get("pack_kw"),
        "pack_confirmed": p.get("pack_confirmed"),
        "pack_note": p.get("pack_note"),
        "disclaimer": p.get("disclaimer"),
        "recipient": lead.get("partner"),
    }


@api.post("/callback")
async def create_callback(input: CallbackCreate, request: Request):
    """Bouton flottant « Me faire rappeler » — sans simulation préalable."""
    db = request.app.state.db
    if (input.website or "").strip():
        return {"ok": True, "reference": "AEF-RAPPEL-" + secrets.token_hex(3).upper(), "duplicate": True}
    if not input.contact_ok:
        raise HTTPException(422, "Le consentement d'être rappelé est requis.")
    ip = request.client.host if request.client else "inconnu"
    if rate_limited(ip + ":callback", limit=3):
        raise HTTPException(429, "Trop de demandes depuis cette adresse. Réessayez plus tard.")
    partner = await active_partner(db)
    reference = "AEF-RAPPEL-" + secrets.token_hex(3).upper()
    doc = {
        "_id": new_id(), "reference": reference, "created_at": now_iso(),
        "source": "rappel", "status_admin": "nouveau",
        "answers": {"projet": "rappel_telephonique", "callback_slot": input.slot[:60]},
        "contact": {"prenom": "", "nom": input.nom, "telephone": input.telephone,
                    "email": "", "normalized_phone": normalize_phone(input.telephone)},
        "contact_ok": True, "marketing_ok": False, "prequal": None,
        "consent": {"version": None, "recipient": partner.get("raison_sociale"),
                    "text": "Demande de rappel volontaire (sans simulation préalable)",
                    "timestamp": now_iso(), "ip": ip},
        "utm": {}, "partner": partner.get("raison_sociale"),
        "transmitted": False,
        "transmission": {"state": "en_attente", "detail": "Rappel téléphonique à planifier par l'équipe."},
        "notes": "", "commission": {"montant_prevu": None, "montant_facture": None, "montant_encaisse": None},
        "events": [{"_id": new_id(), "ts": now_iso(), "actor": "systeme", "type": "creation",
                    "detail": f"Demande de rappel via bouton flottant (créneau : {input.slot or 'non précisé'})"}],
    }
    await db.leads.insert_one(doc)
    await journal(db, "email_notification", "non_configure",
                  f"Demande de rappel {reference} — notification e-mail non configurée. "
                  f"Destinataire : {os.environ.get('NOTIFICATION_EMAIL', '—')}", reference)
    logger.info("Rappel demandé : %s", reference)
    return {"ok": True, "reference": reference}


@api.get("/meta")
async def meta(request: Request):
    db = request.app.state.db
    partner = await active_partner(db)
    consent = await current_consent(db)
    return {
        "site_name": "Aides Énergie France",
        "recipient": partner.get("raison_sociale") or "À configurer (voir administration)",
        "consent_version": consent.get("version"),
        "consent_contact_text": consent.get("contact_text", ""),
        "consent_marketing_text": consent.get("marketing_text", ""),
        "contact_email": os.environ.get("NOTIFICATION_EMAIL", ""),
    }


@api.get("/articles")
async def list_articles(request: Request, category: str = "", q: str = "", page: int = 1, limit: int = 9):
    db = request.app.state.db
    query = {"status": "published"}
    if category:
        query["category"] = category
    if q:
        rx = {"$regex": re.escape(q[:80]), "$options": "i"}
        query["$or"] = [{"title": rx}, {"excerpt": rx}, {"content": rx}]
    total = await db.articles.count_documents(query)
    lim = min(max(1, limit), 24)
    items = await db.articles.find(query, {"content": 0}) \
        .sort("published_at", -1).skip((max(1, page) - 1) * lim).to_list(lim)
    cats = await db.article_categories.find({}).to_list(20)
    return {"items": serialize_list(items), "total": total, "page": page,
            "pages": (total + lim - 1) // lim,
            "categories": [serialize(c) for c in cats]}


@api.get("/articles/{slug}")
async def get_article(slug: str, request: Request):
    db = request.app.state.db
    art = await db.articles.find_one({"slug": slug, "status": "published"})
    if not art:
        raise HTTPException(404, "Article introuvable")
    return serialize(art)


@api.post("/contact")
async def create_message(input: ContactCreate, request: Request):
    db = request.app.state.db
    if (input.website or "").strip():
        return {"ok": True}
    if not input.contact_ok:
        raise HTTPException(422, "Le consentement est requis pour envoyer le message.")
    ip = request.client.host if request.client else "inconnu"
    if rate_limited(ip + ":contact", limit=3):
        raise HTTPException(429, "Trop de messages. Réessayez plus tard.")
    doc = {"_id": new_id(), "created_at": now_iso(), "status": "nouveau",
           "nom": input.nom, "email": input.email, "sujet": input.sujet[:160],
           "message": input.message[:4000], "ip": ip}
    await db.contact_messages.insert_one(doc)
    await journal(db, "contact_notification", "non_configure",
                  f"Message reçu de {input.email} — aucun fournisseur e-mail actif. "
                  f"Destinataire configuré : {os.environ.get('NOTIFICATION_EMAIL', '—')}")
    return {"ok": True}


@api.get("/sitemap.xml", response_class=Response)
async def sitemap(request: Request):
    db = request.app.state.db
    base = os.environ.get("SITE_ORIGIN", "").rstrip("/") or str(request.base_url).rstrip("/")
    static_routes = ["", "/simulation/", "/merci/", "/aides/", "/aides/maprimerenov/", "/aides/cee/",
                     "/aides/solaire-thermique/", "/aides/pompe-a-chaleur/", "/aides/locales/",
                     "/aides/cheque-energie/", "/solutions/", "/solutions/solaire-thermique/",
                     "/solutions/systeme-solaire-combine/", "/solutions/pompe-a-chaleur/",
                     "/solutions/pac-solaire-thermique/", "/solutions/isolation/", "/solutions/chauffage/",
                     "/actualites/", "/a-propos/", "/contact/", "/mentions-legales/",
                     "/confidentialite/", "/cookies/", "/conditions-utilisation/"]
    urls = [f"{base}{r}" for r in static_routes]
    async for art in db.articles.find({"status": "published"}, {"slug": 1, "updated_at": 1}):
        urls.append(f"{base}/actualites/{art['slug']}/")
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        xml.append(f"<url><loc>{escape(u)}</loc></url>")
    xml.append("</urlset>")
    return Response(content="\n".join(xml), media_type="application/xml")


app.include_router(api)


@app.on_event("startup")
async def startup():
    app.state.db = AsyncIOMotorClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    admin_email = os.environ.get("ADMIN_EMAIL")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_email or not admin_password:
        raise RuntimeError("ADMIN_EMAIL et ADMIN_PASSWORD requis dans .env")
    await seed_mod.seed(app.state.db, admin_email, admin_password)
    logger.info("Démarrage terminé — base %s", os.environ["DB_NAME"])


@app.on_event("shutdown")
async def shutdown():
    if hasattr(app.state, "db"):
        app.state.db.client.close()
