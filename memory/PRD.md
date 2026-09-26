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
- Design institutionnel « codes de l'État » : police Marianne auto-hébergée, bandeau de
  transparence, double filet vert/or sous le header et au-dessus du footer, motif de fond à
  fines lignes, puces carrées sur les intitulés, zéro italique, aucun montant d'aide affiché.
- Formulaire 4 étapes en diapositives horizontales, état conservé, honeypot, dédup 24 h,
  rate limit, consentement versionné (destinataire Holding SMIE), préqualification server-side
  (jamais d'« éligible », pack = max des 2 grilles uniquement si les deux définies, zones
  H1/H2/H3 versionnées).
- Créneaux de rappel : planning 4 jours ouvrés × 4 créneaux, ~65 % laissés libres (masque
  déterministe + capacité réelle en base), slots complets non sélectionnables.
- Bouton flottant « Me faire rappeler » (POST /api/callback) avec créneau optionnel.
- **Google sign-in géré par Emergent** : bouton « Continuer avec Google » sur /administration/login,
  échange session_id côté serveur (POST /api/admin/google-session), session 7 jours httpOnly,
  liste d'accès = e-mails admin existants (compte inconnu → 403).
- **Assistant éditorial IA (ChatGPT GPT-5.4, clé universelle Emergent)** : propose des brouillons
  d'articles depuis un brief, enregistrés en statut « brouillon », jamais publiés sans validation ;
  journal des générations ; état visible dans Intégrations.
- Back-office : dashboard, leads filtrables + fiche + statuts + notes + commissions, export CSV
  (tolérant aux leads sans préqualification), CRUD articles, partenaires, règles versionnées +
  case « vérifié », messages, journal d'intégrations (états réels), lead de test.
- Bannière cookies (accepter/refuser/personnaliser), sitemap dynamique, JSON-LD.
- Vérifié : 46/46 tests API (dont session Google émulée, planning 65 %, brouillon IA réel),
  parcours UI complet soumis et confirmé, image chauffage réparée, captures desktop 1440 +
  mobile 390, zip régénéré et téléchargeable.

## Réalisé (26/09/2026 — suite)
- **E-mails réels Gmail SMTP** (mailer.py) : chaque dossier (simulation, rappel, contact) → mail équipe vers
  la boîte interne non affichée (turnlife8888@gmail.com, NOTIFICATION_EMAIL_INTERNAL) avec **fiche PDF
  complète** (logo AEF, contact, réponses, préqualification, consentement/IP, check-list de reprise de
  contact) ; le client reçoit un accusé de réception + **PDF récapitulatif**. Adresse publique inchangée
  (demandes@aidesenergiefrance.fr). Envoi en tâche de fond, journal succès/échec, état visible dans
  Intégrations, bouton « Envoyer le mail test », fiche PDF téléchargeable depuis chaque lead.
  Mail test envoyé avec succès (interne + client).
- **Statistiques de visite first-party** (analytics.py, Stats.jsx) : sans cookie, robots exclus, heure de
  Paris — KPIs (en ligne, jour, période), jour par jour, heure par heure (jour sélectionnable), carte de
  chaleur 7 j × 24 h, pages, types de page, sources, UTM, appareils, navigateurs, 60 dernières visites.
  GA4 optionnel (REACT_APP_GA4_ID + GA4_MEASUREMENT_ID), chargé uniquement après consentement.
- Mentions « non affilié à l'administration » supprimées partout → « Plateforme privée ».
- 3 illustrations line-art discrètes en fond (aides, comment ça marche, footer), opacité 9 %.
- ZIP régénéré (/aides-energie-france.zip). Tests : 46/46 API + 9/9 nouvelles fonctionnalités + UI.

## Reste à faire
- P0 : valider juridiquement les pages légales (SIREN, hébergeur, conservation), recouper la
  table des zones (case « vérifié »).
- P1 : renseigner l'ID GA4 si souhaité, webhooks n8n/CRM (N8N_WEBHOOK_URL), Search Console,
  comptes editor/agent réels, déploiement Git.
- P2 : capacité multi-réservations par créneau, rappels automatiques, statistiques avancées.
