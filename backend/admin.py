"""Routes d'administration privées : auth JWT (cookies httpOnly), RBAC, CRUD."""

import csv
import io
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field

from models import new_id, now_iso, serialize, serialize_list

router = APIRouter(prefix="/admin", tags=["admin"])

JWT_ALGORITHM = "HS256"
COOKIE_MAX_AGE_ACCESS = 900
COOKIE_MAX_AGE_REFRESH = 604800

STATUTS_LEAD = ["nouveau", "a_verifier", "prequalifie", "transmis", "contacte", "audit",
                "valide", "refuse", "installe", "commission_facturee", "encaissee"]


def get_jwt_secret() -> str:
    return __import__("os").environ["JWT_SECRET"]


def _cookie(response: Response, name: str, value: str, max_age: int):
    response.set_cookie(key=name, value=value, httponly=True, secure=True,
                        samesite="none", max_age=max_age, path="/")


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(minutes=15)}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    db = request.app.state.db
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Non authentifié")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Type de jeton invalide")
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Session expirée")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Jeton invalide")
    admin = await db.admin_profiles.find_one({"_id": payload.get("sub")})
    if not admin:
        raise HTTPException(401, "Compte introuvable")
    admin = dict(admin)
    admin.pop("password_hash", None)
    return admin


def require_role(minimum: str):
    order = {"agent": 0, "editor": 1, "admin": 2}

    async def checker(admin: dict = Depends(get_current_admin)) -> dict:
        if order.get(admin.get("role"), -1) < order[minimum]:
            raise HTTPException(403, "Permission insuffisante")
        return admin

    return checker


async def audit(db, actor: str, action: str, target: str, detail: str = ""):
    await db.audit_log.insert_one({"_id": new_id(), "created_at": now_iso(), "actor": actor,
                                   "action": action, "target": target, "detail": detail})


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class LeadPatch(BaseModel):
    status_admin: str | None = None
    notes: str | None = Field(default=None, max_length=4000)
    commission: dict | None = None


class ArticleInput(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    slug: str = Field(min_length=3, max_length=180, pattern=r"^[a-z0-9-]+$")
    category: str = Field(min_length=2, max_length=40)
    status: str = Field(pattern=r"^(published|draft)$")
    excerpt: str = Field(default="", max_length=400)
    content: str = Field(min_length=10)
    image_url: str = ""
    author: str = ""
    source_urls: list[str] = []
    seo_title: str = ""
    seo_description: str = ""


class PartnerInput(BaseModel):
    raison_sociale: str = Field(min_length=2, max_length=160)
    contact_email: str = ""
    active: bool = True
    note: str = ""


class ConsentInput(BaseModel):
    recipient: str = Field(min_length=2, max_length=160)
    contact_text: str = Field(min_length=10, max_length=2000)
    marketing_text: str = Field(min_length=5, max_length=2000)


class MessagePatch(BaseModel):
    status: str = Field(pattern=r"^(nouveau|traite|archive)$")


@router.post("/login")
async def login(input: LoginInput, request: Request, response: Response):
    db = request.app.state.db
    email = input.email.lower().strip()
    identifier = f"{request.client.host}:{email}"

    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until"):
        lock = datetime.fromisoformat(attempt["locked_until"])
        if datetime.now(timezone.utc) < lock:
            raise HTTPException(429, "Trop de tentatives. Réessayez dans 15 minutes.")

    admin = await db.admin_profiles.find_one({"email": email})
    if not admin or not bcrypt.checkpw(input.password.encode("utf-8"),
                                       admin["password_hash"].encode("utf-8")):
        fails = ((attempt or {}).get("fails", 0) or 0) + 1
        update = {"fails": fails, "identifier": identifier}
        if fails >= 5:
            update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
            update["fails"] = 0
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(401, "Identifiants invalides")

    await db.login_attempts.delete_one({"identifier": identifier})
    access = create_access_token(admin["_id"], admin["email"])
    refresh = create_refresh_token(admin["_id"])
    _cookie(response, "access_token", access, COOKIE_MAX_AGE_ACCESS)
    _cookie(response, "refresh_token", refresh, COOKIE_MAX_AGE_REFRESH)
    await audit(db, email, "login", "admin")
    return {"email": admin["email"], "name": admin.get("name"), "role": admin.get("role")}


@router.post("/logout")
async def logout(response: Response, admin: dict = Depends(get_current_admin)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    db = request.app.state.db
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "Non authentifié")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Jeton invalide")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Session expirée")
    admin = await db.admin_profiles.find_one({"_id": payload.get("sub")})
    if not admin:
        raise HTTPException(401, "Compte introuvable")
    _cookie(response, "access_token", create_access_token(admin["_id"], admin["email"]), COOKIE_MAX_AGE_ACCESS)
    return {"ok": True}


@router.get("/me")
async def me(admin: dict = Depends(get_current_admin)):
    return admin


@router.get("/dashboard")
async def dashboard(request: Request, admin: dict = Depends(require_role("agent"))):
    db = request.app.state.db
    pipeline_status = [{"$group": {"_id": "$status_admin", "count": {"$sum": 1}}}]
    by_admin_status = {d["_id"]: d["count"] async for d in db.leads.aggregate(pipeline_status)}
    pipeline_prequal = [{"$group": {"_id": "$prequal.status", "count": {"$sum": 1}}}]
    by_prequal = {d["_id"]: d["count"] async for d in db.leads.aggregate(pipeline_prequal)}
    pipeline_source = [{"$group": {"_id": "$source", "count": {"$sum": 1}}}]
    by_source = {d["_id"]: d["count"] async for d in db.leads.aggregate(pipeline_source)}
    total = await db.leads.count_documents({})
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = await db.leads.count_documents({"created_at": {"$gte": today.isoformat()}})
    messages = await db.contact_messages.count_documents({"status": "nouveau"})
    recent = await db.leads.find({}, {"contact": 1, "prequal.status_label": 1, "status_admin": 1,
                                      "created_at": 1, "reference": 1, "source": 1}) \
        .sort("created_at", -1).to_list(8)
    return {
        "total_leads": total, "today_leads": today_count,
        "by_admin_status": by_admin_status, "by_prequal": by_prequal, "by_source": by_source,
        "new_messages": messages,
        "recent_leads": serialize_list(recent),
        "statuts_possibles": STATUTS_LEAD,
    }


@router.get("/leads")
async def list_leads(request: Request, status: str = "", q: str = "", page: int = 1,
                     admin: dict = Depends(require_role("agent"))):
    db = request.app.state.db
    query = {}
    if status:
        query["status_admin"] = status
    if q:
        rx = {"$regex": q.replace("+", "\\+").replace("(", "\\("), "$options": "i"}
        query["$or"] = [{"contact.nom": rx}, {"contact.prenom": rx}, {"contact.email": rx},
                        {"contact.telephone": rx}, {"reference": rx}]
    per_page = 20
    total = await db.leads.count_documents(query)
    items = await db.leads.find(query) \
        .sort("created_at", -1).skip((max(1, page) - 1) * per_page).to_list(per_page)
    return {"items": serialize_list(items), "total": total, "page": page,
            "pages": (total + per_page - 1) // per_page, "statuts": STATUTS_LEAD}


@router.get("/leads/export")
async def export_leads(request: Request, admin: dict = Depends(require_role("editor"))):
    db = request.app.state.db
    buffer = io.StringIO()
    writer = csv.writer(buffer, delimiter=";")
    writer.writerow(["reference", "created_at", "statut_admin", "statut_prequal", "zone", "pack_kw",
                     "projet", "statut", "type_logement", "plus_de_2_ans", "surface_m2", "code_postal",
                     "commune", "occupants", "chauffage_actuel", "emetteurs", "toiture_orientation",
                     "toiture_16m2", "espace_technique", "prenom", "nom", "telephone", "email",
                     "contact_ok", "marketing_ok", "source", "transmis", "notes"])
    async for lead in db.leads.find({}).sort("created_at", -1):
        a = lead.get("answers", {})
        c = lead.get("contact", {})
        p = lead.get("prequal", {})
        writer.writerow([lead.get("reference"), lead.get("created_at"), lead.get("status_admin"),
                         p.get("status"), p.get("zone"), p.get("pack_kw"), a.get("projet"),
                         a.get("statut"), a.get("type_logement"), a.get("plus_de_2_ans"),
                         a.get("surface"), a.get("code_postal"), a.get("commune", ""),
                         a.get("occupants"), a.get("chauffage_actuel"), a.get("emetteurs"),
                         a.get("toiture_orientation"), a.get("surface_toiture_16m2"),
                         a.get("espace_technique"), c.get("prenom", ""), c.get("nom", ""),
                         c.get("telephone", ""), c.get("email", ""), lead.get("contact_ok"),
                         lead.get("marketing_ok"), lead.get("source"), lead.get("transmitted"),
                         lead.get("notes", "")])
    buffer.seek(0)
    return StreamingResponse(io.BytesIO(buffer.read().encode("utf-8-sig")), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=leads_aef_export.csv"})


@router.get("/leads/{lead_id}")
async def get_lead(lead_id: str, request: Request, admin: dict = Depends(require_role("agent"))):
    db = request.app.state.db
    lead = await db.leads.find_one({"_id": lead_id}) or await db.leads.find_one({"reference": lead_id})
    if not lead:
        raise HTTPException(404, "Lead introuvable")
    return serialize(lead)


@router.patch("/leads/{lead_id}")
async def patch_lead(lead_id: str, input: LeadPatch, request: Request,
                     admin: dict = Depends(require_role("agent"))):
    db = request.app.state.db
    lead = await db.leads.find_one({"_id": lead_id})
    if not lead:
        raise HTTPException(404, "Lead introuvable")
    update = {}
    event = {"_id": new_id(), "ts": now_iso(), "actor": admin["email"], "type": "modification",
             "detail": ""}
    if input.status_admin is not None:
        if input.status_admin not in STATUTS_LEAD:
            raise HTTPException(422, "Statut invalide")
        update["status_admin"] = input.status_admin
        event["detail"] = f"Statut → {input.status_admin}"
    if input.notes is not None:
        update["notes"] = input.notes
        if not event["detail"]:
            event["detail"] = "Notes mises à jour"
    if input.commission is not None and admin.get("role") == "admin":
        com = lead.get("commission", {}) or {}
        for key in ("montant_prevu", "montant_facture", "montant_encaisse"):
            if key in input.commission:
                com[key] = input.commission[key]
        update["commission"] = com
        event["detail"] = (event["detail"] + " Commissions mises à jour").strip()
    if input.status_admin == "transmis":
        update["transmitted"] = True
    update.setdefault("events", lead.get("events", []))
    update["events"] = update.get("events", []) + [event]
    await db.leads.update_one({"_id": lead["_id"]}, {"$set": update})
    await audit(db, admin["email"], "lead_patch", lead_id, event["detail"])
    lead = await db.leads.find_one({"_id": lead["_id"]})
    return serialize(lead)


@router.post("/test-lead")
async def test_lead(request: Request, admin: dict = Depends(require_role("editor"))):
    """Lead de test clairement identifié — jamais transmis au partenaire."""
    from rules import prequalify, DEFAULT_RULES

    db = request.app.state.db
    rules_doc = await db.qualification_rules.find_one({"key": "ssc"}) or DEFAULT_RULES
    answers = {"projet": "ssc", "statut": "proprietaire_occupant", "type_logement": "maison",
               "plus_de_2_ans": "oui", "surface": 120, "code_postal": "44300", "commune": "Nantes",
               "occupants": 4, "chauffage_actuel": "chaudiere_gaz", "emetteurs": "acier",
               "toiture_orientation": "sud", "surface_toiture_16m2": "oui", "espace_technique": "oui"}
    prequal = prequalify(answers, rules_doc)
    reference = "AEF-TEST-" + secrets.token_hex(3).upper()
    doc = {"_id": new_id(), "reference": reference, "created_at": now_iso(), "source": "test_admin",
           "status_admin": "nouveau", "answers": answers,
           "contact": {"prenom": "Lead", "nom": "TEST — NE PAS TRANSMETTRE",
                       "telephone": "0600000000",
                       "email": f"test-{secrets.token_hex(3)}@test.local"},
           "contact_ok": True, "marketing_ok": False, "prequal": prequal,
           "consent": {"version": 0, "recipient": "— test interne —"},
           "utm": {}, "transmitted": False,
           "transmission": {"state": "skipped", "detail": "Lead de test : jamais transmis au partenaire."},
           "notes": "Lead de test créé depuis l'administration.", "events": [
              {"_id": new_id(), "ts": now_iso(), "actor": admin["email"], "type": "creation",
               "detail": "Lead de TEST créé via l'administration — non transmis."}]}
    await db.leads.insert_one(doc)
    await audit(db, admin["email"], "test_lead", reference)
    return {"reference": reference, "prequal": prequal}


@router.get("/articles")
async def admin_articles(request: Request, admin: dict = Depends(require_role("editor"))):
    items = await db_articles(request).find({}).sort("published_at", -1).to_list(200)
    return {"items": serialize_list(items)}


def db_articles(request: Request):
    return request.app.state.db.articles


@router.post("/articles")
async def create_article(input: ArticleInput, request: Request,
                         admin: dict = Depends(require_role("editor"))):
    db = request.app.state.db
    if await db.articles.find_one({"slug": input.slug}):
        raise HTTPException(409, "Un article avec ce slug existe déjà")
    result = input.model_dump()
    doc = {**result}
    doc.update({"_id": new_id(), "author": input.author or "Rédaction Aides Énergie France",
                "published_at": now_iso() if input.status == "published" else None,
                "updated_at": now_iso()})
    await db.articles.insert_one(doc)
    await audit(db, admin["email"], "article_create", input.slug)
    saved = await db.articles.find_one({"_id": doc["_id"]})
    return serialize(saved)


@router.patch("/articles/{article_id}")
async def patch_article(article_id: str, input: ArticleInput, request: Request,
                        admin: dict = Depends(require_role("editor"))):
    db = request.app.state.db
    current = await db.articles.find_one({"_id": article_id})
    if not current:
        raise HTTPException(404, "Article introuvable")
    doc = input.model_dump()
    if input.status == "published" and not current.get("published_at"):
        doc["published_at"] = now_iso()
    doc["updated_at"] = now_iso()
    await db.articles.update_one({"_id": article_id}, {"$set": doc})
    await audit(db, admin["email"], "article_patch", input.slug)
    return serialize(await db.articles.find_one({"_id": article_id}))


@router.delete("/articles/{article_id}")
async def delete_article(article_id: str, request: Request,
                         admin: dict = Depends(require_role("admin"))):
    db = request.app.state.db
    await db.articles.delete_one({"_id": article_id})
    await audit(db, admin["email"], "article_delete", article_id)
    return {"ok": True}


@router.get("/partners")
async def list_partners(request: Request, admin: dict = Depends(require_role("admin"))):
    items = await request.app.state.db.partners.find({}).to_list(50)
    return {"items": serialize_list(items)}


@router.post("/partners")
async def add_partner(input: PartnerInput, request: Request, admin: dict = Depends(require_role("admin"))):
    db = request.app.state.db
    result = input.model_dump()
    doc = {**result}
    doc.update({"_id": new_id(), "created_at": now_iso()})
    await db.partners.insert_one(doc)
    await audit(db, admin["email"], "partner_add", input.raison_sociale)
    saved = await db.partners.find_one({"_id": doc["_id"]})
    return serialize(saved)


@router.patch("/partners/{partner_id}")
async def patch_partner(partner_id: str, input: PartnerInput, request: Request,
                        admin: dict = Depends(require_role("admin"))):
    db = request.app.state.db
    await db.partners.update_one({"_id": partner_id}, {"$set": input.model_dump()})
    await audit(db, admin["email"], "partner_patch", partner_id)
    return serialize(await db.partners.find_one({"_id": partner_id}))


@router.get("/rules")
async def get_rules(request: Request, admin: dict = Depends(require_role("admin"))):
    db = request.app.state.db
    latest = await db.qualification_rules.find_one({"key": "ssc"}, {"_id": 0})
    history = await db.qualification_rules.find({"key": "ssc"}, {"_id": 0, "version": 1,
                                              "updated_at": 1, "updated_by": 1}) \
        .sort("version", -1).to_list(20)
    return {"latest": serialize(latest), "history": serialize_list(history)}


@router.put("/rules")
async def put_rules(request: Request, admin: dict = Depends(require_role("admin"))):
    db = request.app.state.db
    body = await request.json()
    latest = await db.qualification_rules.find_one({"key": "ssc"})
    doc = {**latest, **body, "key": "ssc"}
    doc["version"] = (latest["version"] if latest else 0) + 1
    doc["updated_at"] = now_iso()
    doc["updated_by"] = admin["email"]
    doc.pop("_id", None)
    await db.qualification_rules.replace_one({"key": "ssc"}, doc, upsert=True)
    await audit(db, admin["email"], "rules_update", "ssc", f"version {doc['version']}")
    return serialize(doc)


@router.get("/consent-versions")
async def consent_versions(request: Request, admin: dict = Depends(require_role("admin"))):
    items = await request.app.state.db.consent_versions.find({}, {"_id": 0}) \
        .sort("version", -1).to_list(20)
    return {"items": items}


@router.post("/consent-versions")
async def new_consent_version(input: ConsentInput, request: Request,
                              admin: dict = Depends(require_role("admin"))):
    db = request.app.state.db
    latest = await db.consent_versions.find_one({}, sort=[("version", -1)])
    result = input.model_dump()
    doc = {**result}
    doc["version"] = ((latest or {}).get("version", 0)) + 1
    doc["created_at"] = now_iso()
    await db.consent_versions.insert_one(doc)
    await audit(db, admin["email"], "consent_version", f"v{doc['version']}")
    return {**result, "version": doc["version"], "created_at": doc["created_at"]}


@router.get("/messages")
async def messages(request: Request, admin: dict = Depends(require_role("agent"))):
    items = await request.app.state.db.contact_messages.find({}) \
        .sort("created_at", -1).to_list(100)
    return {"items": serialize_list(items)}


@router.patch("/messages/{message_id}")
async def patch_message(message_id: str, input: MessagePatch, request: Request,
                        admin: dict = Depends(require_role("agent"))):
    db = request.app.state.db
    await db.contact_messages.update_one({"_id": message_id}, {"$set": {"status": input.status}})
    await audit(db, admin["email"], "message_patch", message_id, input.status)
    return serialize(await db.contact_messages.find_one({"_id": message_id}))


@router.get("/integrations")
async def integrations(request: Request, admin: dict = Depends(require_role("editor"))):
    import os
    db = request.app.state.db
    events = await db.integration_events.find({}, {"_id": 0}) \
        .sort("created_at", -1).to_list(30)
    return {
        "webhook_n8n": {"configured": bool(os.environ.get("N8N_WEBHOOK_URL")),
                        "env": "N8N_WEBHOOK_URL"},
        "email": {"configured": False,
                  "notification_email": os.environ.get("NOTIFICATION_EMAIL", ""),
                  "detail": "Aucun fournisseur e-mail actif. Le lead est conservé en base ; "
                            "l'envoi reste à configurer (état « non configuré »)."},
        "ga4": {"configured": False, "detail": "Mesure d'audience désactivée tant qu'aucun ID "
                                              "GA4 n'est configuré et aucun consentement recueilli."},
        "search_console": {"configured": False,
                           "detail": "Brancher via le README (fichier de vérification + sitemap)."},
        "journal": events,
    }
