# Playbook de test — Authentifications & IA, Aides Énergie France

## 1. Auth e-mail/mot de passe (JWT)
```
BASE=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -s -c /tmp/cookies.txt -X POST "$BASE/api/admin/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@aidesenergiefrance.fr","password":"<voir test_credentials.md>"}'
curl -s -b /tmp/cookies.txt "$BASE/api/admin/me"
```
- Hash bcrypt `$2b$`, verrouillage 5 essais / 15 min, refresh 7 jours.

## 2. Google sign-in géré par Emergent
Flux : bouton « Continuer avec Google » → auth.emergentagent.com → retour
`/administration/callback#session_id=…` → POST /api/admin/google-session (échange serveur)
→ cookie `session_token` httpOnly 7 jours.
- **Liste d'accès** : seuls les e-mails déjà présents dans `admin_profiles` sont acceptés ;
  un compte Google inconnu reçoit 403 (pas d'inscription publique).
- Test sans navigateur : insérer une session factice et appeler /admin/me :
```
mongosh --eval "use('test_database');
db.admin_sessions.insertOne({user_id: db.admin_profiles.findOne().\_id, session_token: 'test_session_1',
email: 'admin@aidesenergiefrance.fr', expires_at: new Date(Date.now()+7*864e5), created_at: new Date()})"
curl -s -H "Cookie: session_token=test_session_1" "$BASE/api/admin/me"
```
- Nettoyage : `db.admin_sessions.deleteOne({session_token: 'test_session_1'})`
- Test navigateur : injecter le cookie session_token (secure, SameSite=None) puis ouvrir /administration.
- Vérifié par la suite automatisée : session valide → me/dashboard/écritures OK ; jeton inconnu → 401.

## 3. Assistant éditorial IA (ChatGPT — GPT-5.4, clé universelle Emergent)
- POST /api/admin/ai/draft {brief, category} (rôle editor+) → crée un article en **brouillon**
  (jamais publié automatiquement), journalisé dans integration_events (type ai_draft).
- Sans EMERGENT_LLM_KEY → 503 état « non configuré ».
- Test réel effectué : brief « Entretenir sa pompe à chaleur… » → brouillon créé puis supprimé.

## 4. Planning des créneaux de rappel
- GET /api/slots?days=4 → 4 jours ouvrés × 4 créneaux ; ~65 % libres, le reste « complet »
  (masque déterministe + créneaux réellement pris en base). Un créneau réservé devient complet.

## 5. Suite complète
`python3 /app/tests/test_api.py` — 46 vérifications bout en bout.
