"""Tests des nouvelles fonctionnalités : analytics, notification e-mail, PDF de lead, intégrations."""
import os
import time

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://site-fonctionnel-2.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@aidesenergiefrance.fr"
ADMIN_PASSWORD = "AEF-7c7b8860ef14"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, r.text
    return s


# ------------------ Analytics publiques ------------------
class TestAnalyticsHit:
    def test_hit_valid_mobile(self):
        r = requests.post(
            f"{API}/analytics/hit",
            json={"path": "/aides/cee/", "referrer": "https://www.google.com/", "screen": 390},
            headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"},
            timeout=10,
        )
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert not data.get("ignored")

    def test_hit_bot_ignored(self):
        r = requests.post(
            f"{API}/analytics/hit",
            json={"path": "/", "referrer": "", "screen": 1200},
            headers={"User-Agent": "Googlebot/2.1"},
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json().get("ignored") is True

    def test_hit_administration_ignored(self):
        r = requests.post(
            f"{API}/analytics/hit",
            json={"path": "/administration/statistiques", "referrer": "", "screen": 1200},
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json().get("ignored") is True


# ------------------ Analytics admin ------------------
class TestAnalyticsAdmin:
    def test_analytics_requires_auth(self):
        r = requests.get(f"{API}/admin/analytics", timeout=10)
        assert r.status_code == 401

    def test_analytics_structure(self, admin_session):
        # Ensure at least one non-bot hit exists
        requests.post(
            f"{API}/analytics/hit",
            json={"path": "/aides/cee/", "referrer": "https://www.google.com/", "screen": 390},
            headers={"User-Agent": "Mozilla/5.0 (iPhone) Safari/605.1"},
            timeout=10,
        )
        r = admin_session.get(f"{API}/admin/analytics?days=7", timeout=15)
        assert r.status_code == 200
        d = r.json()
        totals = d["totals"]
        for k in ("views", "visitors", "today_views", "today_visitors", "live_visitors", "avg_daily_views"):
            assert k in totals
        assert len(d["daily"]) == 7
        assert len(d["hourly"]) == 24
        assert len(d["heatmap"]) == 7
        for row in d["heatmap"]:
            assert len(row["hours"]) == 24
        for k in ("pages", "referrers", "devices", "browsers", "recent"):
            assert k in d
        # Vérifier trace du hit /aides/cee (chemin normalisé sans slash final)
        paths = [p.get("path") for p in d["pages"]]
        assert any("/aides/cee" in (p or "") for p in paths), paths
        referrers = [x.get("referrer") for x in d["referrers"]]
        assert any("google" in (x or "") for x in referrers), referrers
        devices = [x.get("device") for x in d["devices"]]
        assert "mobile" in devices, devices


# ------------------ Email non configuré ------------------
class TestEmailNotConfigured:
    def test_email_test_returns_409(self, admin_session):
        r = admin_session.post(f"{API}/admin/email/test", json={}, timeout=15)
        assert r.status_code == 409, r.text

    def test_integrations_email_state(self, admin_session):
        r = admin_session.get(f"{API}/admin/integrations", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["email"]["configured"] is False
        assert d["email"]["internal_email"] == "aidesenergiefrance88@gmail.com"
        assert d["email"]["notification_email"] == "demandes@aidesenergiefrance.fr"
        assert d["ga4"]["configured"] is False


# ------------------ PDF de lead ------------------
class TestLeadPdf:
    def test_generate_lead_pdf(self, admin_session):
        r = admin_session.post(f"{API}/admin/test-lead", timeout=15)
        assert r.status_code == 200, r.text
        ref = r.json()["reference"]
        # PDF interne
        rp = admin_session.get(f"{API}/admin/leads/{ref}/pdf", timeout=20)
        assert rp.status_code == 200
        assert rp.headers.get("content-type", "").startswith("application/pdf")
        assert rp.content[:4] == b"%PDF"
        # PDF version client
        rp2 = admin_session.get(f"{API}/admin/leads/{ref}/pdf?internal=false", timeout=20)
        assert rp2.status_code == 200
        assert rp2.content[:4] == b"%PDF"


# ------------------ Callback + journal email non_configure ------------------
class TestCallbackJournal:
    def test_callback_logs_non_configure(self, admin_session):
        # Le rate limiter callback = 3/h, ce test consomme 1
        r = requests.post(
            f"{API}/callback",
            json={"nom": "Test Journal", "telephone": "06 11 22 33 44", "slot": "", "contact_ok": True},
            timeout=20,
        )
        assert r.status_code == 200, r.text
        time.sleep(2.5)
        rint = admin_session.get(f"{API}/admin/integrations", timeout=10)
        events = rint.json().get("journal", [])
        email_events = [e for e in events if e.get("type") == "email_notification"]
        assert email_events, "Aucun événement email_notification trouvé"
        assert any(e.get("state") == "non_configure" for e in email_events), email_events[:3]
