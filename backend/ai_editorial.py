"""Assistant éditorial IA — ChatGPT (GPT-5.4 via clé universelle Emergent).

Règle produit : l'IA ne fait que PROPOSER des brouillons d'articles (statut
« brouillon »). Aucune publication automatique : validation humaine obligatoire.
"""

import json
import os
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from admin import audit, require_role
from models import new_id, now_iso, serialize

router = APIRouter(prefix="/admin/ai", tags=["ia"])

AI_SYSTEM = """Tu es l'assistant éditorial de « Aides Énergie France », plateforme privée française
d'information sur les aides énergétiques (solaire thermique, pompe à chaleur, isolation).
Règles absolues :
- Français institutionnel, sobre, factuel. Jamais de promesse d'éligibilité, jamais de montant
  d'aide, jamais de date limite, jamais de témoignage ou de certification inventée.
- Ne jamais se faire passer pour un service de l'État ; rappeler que les sources officielles font foi.
- Contenu intemporel, structuré avec des sous-titres « ## », paragraphes séparés par une ligne vide.
- Sources : uniquement des domaines officiels (france-renov.gouv.fr, service-public.fr,
  chequeenergie.gouv.fr, ademe.fr, ecologie.gouv.fr).
Réponds UNIQUEMENT avec un JSON valide :
{"title": str, "slug": str (kebab-case), "excerpt": str (max 200 caractères),
 "content": str (600-900 mots), "seo_title": str, "seo_description": str (max 160),
 "source_urls": [str]}"""


class DraftRequest(BaseModel):
    brief: str = Field(min_length=10, max_length=600)
    category: str = Field(default="guide", pattern=r"^(aides|solutions|travaux|guide)$")


async def _journal(db, state: str, detail: str):
    await db.integration_events.insert_one({
        "_id": new_id(), "created_at": now_iso(), "type": "ai_draft",
        "state": state, "detail": detail, "reference": "",
    })


@router.post("/draft")
async def draft_article(input: DraftRequest, request: Request,
                        admin: dict = Depends(require_role("editor"))):
    db = request.app.state.db
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        await _journal(db, "non_configure", "EMERGENT_LLM_KEY absente — assistant IA indisponible.")
        raise HTTPException(503, "Assistant IA non configuré : ajoutez EMERGENT_LLM_KEY dans l'environnement.")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=api_key,
            session_id=f"aef-editorial-{uuid.uuid4().hex[:8]}",
            system_message=AI_SYSTEM,
        ).with_model("openai", "gpt-5.4")
        # Réponse non streamée volontairement : le contrat exige un JSON complet à persister.
        response = await chat.send_message(
            UserMessage(text=f"Sujet du brouillon : {input.brief}\nCatégorie : {input.category}"))
    except HTTPException:
        raise
    except Exception as exc:
        await _journal(db, "echec", str(exc)[:200])
        raise HTTPException(502, "La génération a échoué. Réessayez dans un instant.")

    raw = str(response)
    match = re.search(r"\{.*\}", raw, re.S)
    if not match:
        await _journal(db, "echec", "Réponse IA non exploitable (JSON absent).")
        raise HTTPException(502, "La réponse de l'IA n'a pas pu être analysée. Réessayez.")
    try:
        draft = json.loads(match.group(0))
    except json.JSONDecodeError:
        await _journal(db, "echec", "Réponse IA non exploitable (JSON invalide).")
        raise HTTPException(502, "La réponse de l'IA n'a pas pu être analysée. Réessayez.")

    slug = re.sub(r"[^a-z0-9-]+", "-", str(draft.get("slug", "")).lower()).strip("-")[:80] \
        or f"brouillon-ia-{uuid.uuid4().hex[:6]}"
    if await db.articles.find_one({"slug": slug}):
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"

    doc = {
        "_id": new_id(),
        "title": str(draft.get("title", input.brief))[:180],
        "slug": slug, "category": input.category, "status": "draft",
        "excerpt": str(draft.get("excerpt", ""))[:400],
        "content": str(draft.get("content", "")),
        "image_url": "",
        "author": f"Assistant IA — brouillon à valider ({admin['email']})",
        "source_urls": [u for u in draft.get("source_urls", []) if isinstance(u, str)][:5],
        "seo_title": str(draft.get("seo_title", ""))[:180],
        "seo_description": str(draft.get("seo_description", ""))[:160],
        "published_at": None, "updated_at": now_iso(),
        "ai_generated": True,
    }
    await db.articles.insert_one(doc)
    await audit(db, admin["email"], "ai_draft", slug, f"Brief : {input.brief[:80]}")
    await _journal(db, "succes", f"Brouillon « {doc['title']} » créé — en attente de validation éditoriale.")
    return serialize(doc)
