# Aides Énergie France — portail complet (React + FastAPI + MongoDB)

Portail privé d'information sur les aides énergétiques + génération de demandes
d'étude volontaires (système solaire combiné SSC et PAC + SSC en priorité).
Plateforme privée, non affiliée à l'administration.

## Démarrage

```bash
# Backend (FastAPI)
cd backend
pip install -r requirements.txt
cp .env.example .env   # puis compléter les valeurs
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend (React CRA + Tailwind)
cd frontend
yarn install
cp .env.example .env   # REACT_APP_BACKEND_URL = URL publique du backend
yarn start
```

Au démarrage, le backend crée automatiquement : comptes admin, partenaire
destinataire, règles de qualification v1, version de consentement, catégories
et articles initiaux (4 publiés + 1 brouillon).

## Variables d'environnement (backend/.env)

| Variable | Rôle |
|---|---|
| MONGO_URL | Connexion MongoDB |
| DB_NAME | Nom de la base |
| CORS_ORIGINS | Origines autorisées, séparées par des virgules |
| JWT_SECRET | Secret JWT (hex 64) |
| ADMIN_EMAIL / ADMIN_PASSWORD | Compte administrateur seedé |
| NOTIFICATION_EMAIL | Destinataire des notifications (demandes@aidesenergiefrance.fr) |
| SITE_ORIGIN | URL publique (sitemap) |
| N8N_WEBHOOK_URL | *Optionnel* — webhook n8n/CRM ; si absent : état « non configuré » |

Le lead est TOUJOURS conservé en base, indépendamment des envois externes ;
chaque tentative est journalisée (collection `integration_events`, visible dans
Administration > Intégrations).

## Architecture

```
backend/
  server.py   # app FastAPI, routes publiques (leads, articles, contact, sitemap)
  admin.py    # routes /api/admin/* (JWT cookies httpOnly, RBAC admin/editor/agent)
  rules.py    # moteur de préqualification versionné (zones H1/H2/H3, packs)
  seed.py     # seed idempotent (admin, partenaire, règles, consentement, articles)
  models.py   # validation Pydantic, helpers Mongo (_id -> id)
frontend/
  src/pages/        # accueil, simulation, merci, aides, solutions, actualités, légal…
  src/wizard/       # formulaire 4 étapes (contexte partagé accueil <-> /simulation)
  src/admin/        # back-office (dashboard, leads, articles, partenaires, règles…)
  src/content/      # données éditoriales aides & solutions
tests/test_api.py   # suite end-to-end de l'API (33 vérifications)
```

## Sécurité & conformité
- Mots de passe bcrypt, JWT httpOnly (access 15 min + refresh 7 j), anti-force-brute (5 essais / 15 min)
- Honeypot anti-bot, rate limiting (5 leads/heure/IP), déduplication 24 h
- Consentement explicite versionné (texte + horodatage serveur + destinataire), case marketing séparée et facultative
- Aucune donnée personnelle dans localStorage, les URL ou les logs publics
- Bannière cookies : accepter / refuser / personnaliser au même niveau ; aucun script de suivi actif par défaut

## SEO
- Metadata + OpenGraph + canonical par page (react-helmet-async)
- JSON-LD : Article, FAQPage, BreadcrumbList (contenu visible uniquement)
- Sitemap dynamique : `/api/sitemap.xml` — robots.txt à mettre à jour avec le domaine final
- Pour brancher Search Console : déployer, vérifier le domaine, soumettre /api/sitemap.xml

## États de configuration (honnêtes)
- **Opérationnel et testé** : site public complet, tunnel SSC, préqualification, back-office, articles, export CSV, sitemap, cookies
- **À configurer** : envoi d'e-mails (aucun fournisseur actif — le lead reste en base), webhook n8n (N8N_WEBHOOK_URL), GA4, Search Console
- **Nécessite une validation humaine avant lancement public** : mentions légales (SIREN, hébergeur), durée de conservation, relecture juridique des pages légales, table des zones H1/H2/H3 (case « vérifié » dans Administration > Règles)

## Tests
```bash
python3 tests/test_api.py   # 33 vérifications bout en bout
```
