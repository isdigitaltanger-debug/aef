# Playbook de test — Authentification admin Aides Énergie France

## 1. Vérification MongoDB
```
mongosh
use test_database
db.admin_profiles.find({role: "admin"}, {email: 1, role: 1}).pretty()
db.leads.find({}, {reference: 1, status_admin: 1}).sort({created_at: -1}).limit(5)
```
Vérifier : le hash du mot de passe commence par `$2b$`, index unique sur `leads.reference`.

## 2. Tests API
```
BASE=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# Login (cookies)
curl -s -c /tmp/cookies.txt -X POST "$BASE/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aidesenergiefrance.fr","password":"<voir test_credentials.md>"}'

# Session courante
curl -s -b /tmp/cookies.txt "$BASE/api/admin/me"

# Dashboard protégé
curl -s -b /tmp/cookies.txt "$BASE/api/admin/dashboard"

# Création d'un lead public
curl -s -X POST "$BASE/api/leads" -H "Content-Type: application/json" -d '{"answers":{"projet":"ssc","statut":"proprietaire_occupant","type_logement":"maison","plus_de_2_ans":"oui","surface":120,"code_postal":"44300","occupants":4,"chauffage_actuel":"chaudiere_gaz","emetteurs":"acier","toiture_orientation":"sud","surface_toiture_16m2":"oui","espace_technique":"oui"},"contact":{"prenom":"Test","nom":"Utilisateur","telephone":"0612345678","email":"test@example.fr"},"contact_ok":true,"marketing_ok":false}'

# Sans consentement → 422 attendu
# Sitemap
curl -s "$BASE/api/sitemap.xml" | head -5
```

## 3. Résultats attendus
- Login sans cookie → 401 sur /api/admin/me.
- Login avec identifiants valides → cookies access_token/refresh_token httpOnly.
- 5 échecs de login → verrouillage 15 minutes (429).
- Lead de test admin : référence AEF-TEST-XXXX, jamais transmis au partenaire.
