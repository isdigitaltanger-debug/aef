# PRD — Aides Énergie France

## Problème initial (extrait du document fourni)
« Réaliser une application web de production entièrement fonctionnelle pour la marque privée
"Aides Énergie France" : portail éditorial d'aides énergétiques + génération de demandes
volontaires pour travaux (SSC et PAC+SSC d'abord). Toutes les routes, interactions, formulaires,
contenus, liens, états et écrans doivent fonctionner. Plateforme privée clairement identifiée,
sans confusion avec France Rénov' ou un service de l'État. Jamais d'éligibilité définitive ni de
montant garanti. Administration privée avec leads, articles, règles versionnées. »
Compléments demandés par l'exploitant : destinataire des dossiers **Holding SMIE**, notification
**demandes@aidesenergiefrance.fr**, design institutionnel « codes de l'État » (police Marianne),
formulaire en diapositives horizontales, créneaux de rappel, bouton flottant « Me faire rappeler »,
pas d'italique, ZIP livrable.

## Architecture
- **Frontend** : React (CRA) + Tailwind + framer-motion (kinetic hero, slides du formulaire) + lenis
  (scroll fluide) + react-helmet-async (SEO par route). Police Marianne auto-hébergée.
- **Backend** : FastAPI (server.py public, admin.py privé, rules.py moteur versionné, seed.py,
  models.py) — JWT httpOnly (bcrypt, anti-force-brute), RBAC admin/editor/agent.
- **MongoDB** : leads (réponses + consentement + événements embarqués), articles, partners,
  qualification_rules (historique versionné), consent_versions, contact_messages,
  integration_events, audit_log, admin_profiles, login_attempts.
- **SEO** : sitemap dynamique /api/sitemap.xml, robots.txt, JSON-LD (Article, FAQPage,
  BreadcrumbList), canonical/OG par page.

## Personas
- **Propriétaire 40-65 ans** : veut comprendre ses aides avant de s'engager ; parcours = simulation
  4 étapes → préqualification → étude gratuite.
- **Visiteur pressé** : veut parler à un humain → bouton flottant + créneau de rappel.
- **Exploitant (Holding SMIE)** : gère leads (statuts, notes, commissions), articles, règles
  versionnées, partenaires, intégrations — back-office /administration.

## Réalisé (26/09/2026)
- Site public complet : accueil (hero + formulaire flottant + aides du moment), /simulation/,
  /merci/, 6 pages aides (dont chèque énergie sans captation), 6 pages solutions, actualités
  (recherche, catégories, pagination), à propos, contact, 4 pages légales à trous identifiés, 404.
- Formulaire 4 étapes en diapositives horizontales, état conservé, honeypot, dédup 24 h,
  rate limit, consentement versionné (destinataire Holding SMIE), créneaux de rappel si profil
  favorable, préqualification server-side (jamais d'« éligible », pack = max des 2 grilles
  uniquement si les deux définies, zones H1/H2/H3 versionnées).
- Bouton flottant « Me faire rappeler » avec créneau optionnel (POST /api/callback).
- Back-office : dashboard, leads filtrables + fiche + statuts + notes + commissions, export CSV,
  CRUD articles (brouillon/publié), partenaires, règles versionnées + case « vérifié »,
  messages, journal d'intégrations (états réels : e-mail non configuré), lead de test.
- Bannière cookies (accepter/refuser/personnaliser), bandeau de transparence, Marianne, zéro
  italique, aucun montant d'aide affiché.
- Vérifié : 38/38 tests API (tests/test_api.py), parcours UI complet soumis et confirmé,
  captures desktop 1440 + mobile 390, zip régénéré et téléchargeable.

## Reste à faire
- P0 : valider juridiquement les pages légales (SIREN, hébergeur, conservation), recouper la
  table des zones (case « vérifié »), brancher l'envoi d'e-mails (fournisseur au choix).
- P1 : webhooks n8n/CRM (N8N_WEBHOOK_URL), GA4 + Search Console, comptes editor/agent réels.
- P2 : veille d'articles assistée, statistiques avancées, FAQ dynamiques admin.
