"""Tests end-to-end de l'API Aides Énergie France (public + admin).
Usage : python3 /app/tests/test_api.py
"""
import json
import sys

import requests

API = "https://site-fonctionnel-2.preview.emergentagent.com/api"
results = []


def check(name, cond, extra=""):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name + ((" | " + str(extra)[:160]) if extra else ""))


base_payload = {
    "answers": {"projet": "ssc", "statut": "proprietaire_occupant", "type_logement": "maison",
                "plus_de_2_ans": "oui", "surface": 120, "code_postal": "44300", "commune": "Nantes",
                "occupants": 4, "chauffage_actuel": "chaudiere_gaz", "emetteurs": "acier",
                "toiture_orientation": "sud", "surface_toiture_16m2": "oui", "espace_technique": "oui"},
    "contact": {"prenom": "Jean", "nom": "Test", "telephone": "0612345678", "email": "jean.test1@example.fr"},
    "contact_ok": True, "marketing_ok": False, "utm": {"source": "test"},
}

r = requests.post(f"{API}/leads", json=base_payload, timeout=20)
d = r.json()
check("lead create 200", r.status_code == 200, d.get("reference"))
check("pack max(8,8)=8 confirme", d.get("prequal", {}).get("pack_kw") == 8 and d.get("prequal", {}).get("pack_confirmed") is True, d.get("prequal", {}).get("pack_note"))
check("zone H2 pour 44", d.get("prequal", {}).get("zone") == "H2")
REF = d["reference"]

r2 = requests.get(f"{API}/leads/{REF}", timeout=10)
check("lead public suivi (sans donnees perso)", r2.status_code == 200 and r2.json()["reference"] == REF and "contact" not in r2.json())

p2 = json.loads(json.dumps(base_payload)); p2["contact_ok"] = False; p2["contact"]["email"] = "x@example.fr"; p2["contact"]["telephone"] = "0612345679"
r3 = requests.post(f"{API}/leads", json=p2, timeout=20)
check("lead sans consentement -> 422", r3.status_code == 422, r3.status_code)

p3 = json.loads(json.dumps(base_payload)); p3["answers"]["statut"] = "locataire"; p3["contact"]["email"] = "j2@example.fr"; p3["contact"]["telephone"] = "0612345670"
r4 = requests.post(f"{API}/leads", json=p3, timeout=20)
check("locataire -> hors_criteres", r4.json().get("prequal", {}).get("status") == "hors_criteres", r4.json().get("prequal", {}).get("status"))

p4 = json.loads(json.dumps(base_payload)); p4["answers"]["toiture_orientation"] = "inconnu"; p4["answers"]["code_postal"] = "70000"; p4["contact"]["email"] = "j3@example.fr"; p4["contact"]["telephone"] = "0612345671"
r5 = requests.post(f"{API}/leads", json=p4, timeout=20)
check("inconnus -> a_verifier", r5.json().get("prequal", {}).get("status") == "a_verifier", r5.json().get("prequal", {}).get("status"))

p5 = json.loads(json.dumps(base_payload)); p5["answers"]["surface"] = 150; p5["contact"]["email"] = "j4@example.fr"; p5["contact"]["telephone"] = "0612345672"
r6 = requests.post(f"{API}/leads", json=p5, timeout=20)
d6 = r6.json()
check("surface 150 -> pack a confirmer", d6.get("prequal", {}).get("pack_confirmed") is False and d6.get("prequal", {}).get("pack_kw") == 8, d6.get("prequal", {}).get("pack_note"))

p6 = json.loads(json.dumps(base_payload)); p6["website"] = "spam-bot"; p6["contact"]["email"] = "j5@example.fr"; p6["contact"]["telephone"] = "0612345673"
r7 = requests.post(f"{API}/leads", json=p6, timeout=20)
check("honeypot -> faux succes sans insertion", r7.status_code == 200 and r7.json().get("duplicate") is True)

p7 = json.loads(json.dumps(base_payload)); p7["contact"]["email"] = "jean.test1@example.fr"
r8 = requests.post(f"{API}/leads", json=p7, timeout=20)
check("dedup 24h -> meme reference", r8.json().get("reference") == REF, r8.json().get("reference"))

ra = requests.get(f"{API}/articles", timeout=10)
check("articles publies >= 4", ra.json()["total"] >= 4, ra.json()["total"])
check("brouillon non liste", all(i["status"] == "published" for i in ra.json()["items"]))
ra2 = requests.get(f"{API}/articles/cheque-energie-a-quoi-sert-il", timeout=10)
check("article par slug", ra2.status_code == 200)
ra3 = requests.get(f"{API}/articles/isolation-combles-preparer-son-projet", timeout=10)
check("brouillon 404 public", ra3.status_code == 404, ra3.status_code)
raf = requests.get(f"{API}/articles", params={"category": "aides"}, timeout=10)
check("filtre categorie", raf.json()["total"] == 2, raf.json()["total"])
raq = requests.get(f"{API}/articles", params={"q": "solaire"}, timeout=10)
check("recherche plein texte", raq.json()["total"] >= 1, raq.json()["total"])

rc = requests.post(f"{API}/contact", json={"nom": "Marie", "email": "marie@example.fr", "message": "Bonjour, question sur le SSC pour ma maison.", "contact_ok": True}, timeout=20)
check("contact 200", rc.status_code == 200)
rc2 = requests.post(f"{API}/contact", json={"nom": "Marie", "email": "marie@example.fr", "message": "Bonjour, question sur le SSC pour ma maison.", "contact_ok": False}, timeout=20)
check("contact sans consent -> 422", rc2.status_code == 422, rc2.status_code)

rs = requests.get(f"{API}/sitemap.xml", timeout=10)
check("sitemap complet", "/aides/" in rs.text and "cheque-energie-a-quoi-sert-il" in rs.text and "/solutions/" in rs.text)

# ---- ADMIN ----
s = requests.Session()
rl = s.post(f"{API}/admin/login", json={"email": "admin@aidesenergiefrance.fr", "password": "AEF-7c7b8860ef14"}, timeout=20)
check("admin login cookies", rl.status_code == 200 and "access_token" in s.cookies, rl.status_code)
rm = s.get(f"{API}/admin/me", timeout=10)
check("admin me role=admin", rm.status_code == 200 and rm.json().get("role") == "admin")
check("dashboard sans cookie -> 401", requests.get(f"{API}/admin/dashboard", timeout=10).status_code == 401)
rd = s.get(f"{API}/admin/dashboard", timeout=10)
check("dashboard donnees", rd.status_code == 200 and rd.json()["total_leads"] >= 3, rd.json().get("total_leads"))
rls = s.get(f"{API}/admin/leads", params={"status": "nouveau"}, timeout=10)
check("liste leads filtree", rls.status_code == 200 and rls.json()["total"] >= 1)
lid = rls.json()["items"][0]["id"]
rp = s.patch(f"{API}/admin/leads/{lid}", json={"status_admin": "transmis", "notes": "Dossier envoye au partenaire."}, timeout=10)
check("patch lead -> transmis", rp.json()["status_admin"] == "transmis" and rp.json()["transmitted"] is True)
rx = s.get(f"{API}/admin/leads/export", timeout=10)
check("export CSV", rx.status_code == 200 and "reference" in rx.text)
rt = s.post(f"{API}/admin/test-lead", timeout=10)
check("lead de test AEF-TEST-", rt.json().get("reference", "").startswith("AEF-TEST-"), rt.json().get("reference"))

# nettoyage d'un éventuel run précédent
_tmp = s.get(f"{API}/admin/articles", timeout=10).json()
for _a in _tmp.get("items", []):
    if _a["slug"] == "article-temp-test":
        s.delete(f"{API}/admin/articles/{_a['id']}", timeout=10)
rnew = s.post(f"{API}/admin/articles", json={"title": "Article temporaire de test", "slug": "article-temp-test", "category": "guide", "status": "draft", "content": "Contenu de test temporaire, sera supprime.", "source_urls": []}, timeout=10)
check("creation article admin", rnew.status_code == 200, rnew.text[:120])
aid = rnew.json()["id"]
rpub = s.patch(f"{API}/admin/articles/{aid}", json={"title": "Article temporaire de test", "slug": "article-temp-test", "category": "guide", "status": "published", "content": "Contenu de test temporaire, sera supprime.", "source_urls": ["https://exemple.fr"]}, timeout=10)
check("publication article", rpub.json().get("status") == "published")
rdel = s.delete(f"{API}/admin/articles/{aid}", timeout=10)
check("suppression article", rdel.status_code == 200)
rr = s.get(f"{API}/admin/rules", timeout=10)
check("regles versionnees", rr.json()["latest"]["version"] >= 1)
rint = s.get(f"{API}/admin/integrations", timeout=10)
check("integrations etat non configure", rint.json()["email"]["configured"] is False)
rmg = s.get(f"{API}/admin/messages", timeout=10)
check("messages liste", rmg.status_code == 200 and len(rmg.json()["items"]) >= 1)

# ---- RAPPEL (bouton flottant) ----
rcb = requests.post(f"{API}/callback", json={"nom": "Paul Rapide", "telephone": "0699887766", "slot": "", "contact_ok": True}, timeout=20)
check("rappel 200 + ref AEF-RAPPEL-", rcb.status_code == 200 and rcb.json().get("reference", "").startswith("AEF-RAPPEL-"), rcb.text[:100])
rcb2 = requests.post(f"{API}/callback", json={"nom": "X", "telephone": "0699887700", "slot": "mardi 30 septembre · 9h – 11h", "contact_ok": False}, timeout=20)
check("rappel sans consent -> 422", rcb2.status_code == 422, rcb2.status_code)
rcb3 = requests.post(f"{API}/callback", json={"nom": "Bot", "telephone": "0699887711", "contact_ok": True, "website": "spam"}, timeout=20)
check("rappel honeypot -> faux succes", rcb3.status_code == 200 and rcb3.json().get("duplicate") is True)
rcb4 = requests.post(f"{API}/callback", json={"nom": "Num invalide", "telephone": "12345", "contact_ok": True}, timeout=20)
check("rappel tel invalide -> 422", rcb4.status_code == 422, rcb4.status_code)
rls2 = s.get(f"{API}/admin/leads", params={"q": "Paul Rapide"}, timeout=10)
check("lead rappel visible dans admin", any(i["source"] == "rappel" for i in rls2.json()["items"]))

fails = [r_ for r_ in results if not r_[1]]
print(f"\n=== {len(results) - len(fails)}/{len(results)} PASS ===")
sys.exit(1 if fails else 0)
