"""Statistiques de visite first-party (sans cookie) : collecte publique + restitution admin."""

import hashlib
import os
import re
from datetime import datetime, timedelta
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from admin import require_role
from models import new_id

router = APIRouter(tags=["analytics"])
PARIS = ZoneInfo("Europe/Paris")
BOT_RE = re.compile(r"bot|crawl|spider|slurp|headless|lighthouse|pingdom|facebookexternalhit|python-requests|curl|wget|monitor", re.I)
PAGE_LABELS = [
    (r"^/$", "Accueil"), (r"^/simulation", "Simulation"), (r"^/merci", "Confirmation"),
    (r"^/aides/?$", "Aides (index)"), (r"^/aides/", "Fiche aide"), (r"^/solutions/?$", "Solutions (index)"),
    (r"^/solutions/", "Fiche solution"), (r"^/actualites/?$", "Actualités"), (r"^/actualites/", "Article"),
    (r"^/a-propos", "À propos"), (r"^/contact", "Contact"),
]


class Hit(BaseModel):
    path: str = Field(min_length=1, max_length=200)
    referrer: str = Field(default="", max_length=400)
    screen: int = Field(default=0, ge=0, le=20000)
    utm_source: str = Field(default="", max_length=80)


def _device(ua: str) -> str:
    if re.search(r"iPad|Tablet", ua, re.I):
        return "tablette"
    if re.search(r"Mobi|Android|iPhone", ua, re.I):
        return "mobile"
    return "ordinateur"


def _browser(ua: str) -> str:
    for pat, name in ((r"Edg/", "Edge"), (r"OPR/|Opera", "Opera"), (r"SamsungBrowser", "Samsung"),
                      (r"Chrome/", "Chrome"), (r"Firefox/", "Firefox"), (r"Safari/", "Safari")):
        if re.search(pat, ua):
            return name
    return "Autre"


def _referrer(ref: str) -> str:
    host = (urlparse(ref).hostname or "").lower().removeprefix("www.")
    site = (urlparse(os.environ.get("SITE_ORIGIN", "")).hostname or "").lower().removeprefix("www.")
    if not host or host == site or host.endswith("localhost"):
        return "direct"
    return host


def _visitor(ip: str, ua: str, date: str) -> str:
    salt = hashlib.sha256(f"{os.environ.get('JWT_SECRET', '')}|{date}".encode()).hexdigest()
    return hashlib.sha256(f"{salt}|{ip}|{ua}".encode()).hexdigest()[:16]


def page_label(path: str) -> str:
    for pat, lab in PAGE_LABELS:
        if re.search(pat, path):
            return lab
    return "Autre page"


@router.post("/analytics/hit")
async def record_hit(input: Hit, request: Request):
    ua = request.headers.get("user-agent", "")[:300]
    if BOT_RE.search(ua) or input.path.startswith("/administration"):
        return {"ok": True, "ignored": True}
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "inconnu")
    now = datetime.now(PARIS)
    date = now.strftime("%Y-%m-%d")
    path = input.path.split("?")[0][:200]
    if len(path) > 1:
        path = path.rstrip("/") or "/"
    await request.app.state.db.visits.insert_one({
        "_id": new_id(), "ts": now.isoformat(), "date": date, "hour": now.hour,
        "path": path, "page": page_label(path), "referrer": _referrer(input.referrer),
        "utm_source": input.utm_source[:80], "device": _device(ua), "browser": _browser(ua),
        "screen": input.screen, "visitor": _visitor(ip, ua, date),
    })
    return {"ok": True}


async def _group(db, match: dict, key, extra_sort=None, limit=None):
    pipeline = [{"$match": match},
                {"$group": {"_id": key, "views": {"$sum": 1}, "visitors": {"$addToSet": "$visitor"}}},
                {"$project": {"views": 1, "visitors": {"$size": "$visitors"}}},
                {"$sort": extra_sort or {"views": -1}}]
    if limit:
        pipeline.append({"$limit": limit})
    out = []
    async for d in db.visits.aggregate(pipeline):
        out.append({"key": d.get("_id"), "views": d["views"], "visitors": d["visitors"]})
    return out


@router.get("/admin/analytics")
async def analytics(request: Request, days: int = 30, day: str = "",
                    admin: dict = Depends(require_role("agent"))):
    db = request.app.state.db
    days = min(max(days, 1), 365)
    today = datetime.now(PARIS)
    today_key = today.strftime("%Y-%m-%d")
    start = (today - timedelta(days=days - 1)).strftime("%Y-%m-%d")
    focus = day if re.fullmatch(r"\d{4}-\d{2}-\d{2}", day or "") else today_key
    in_range = {"date": {"$gte": start, "$lte": today_key}}

    daily_raw = {d["key"]: d for d in await _group(db, in_range, "$date", {"_id": 1})}
    daily = []
    for i in range(days):
        k = (today - timedelta(days=days - 1 - i)).strftime("%Y-%m-%d")
        d = daily_raw.get(k, {})
        daily.append({"date": k, "views": d.get("views", 0), "visitors": d.get("visitors", 0)})

    hourly_raw = {d["key"]: d for d in await _group(db, {"date": focus}, "$hour", {"_id": 1})}
    hourly = [{"hour": h, "label": f"{h:02d}h", "views": hourly_raw.get(h, {}).get("views", 0),
               "visitors": hourly_raw.get(h, {}).get("visitors", 0)} for h in range(24)]

    week_start = (today - timedelta(days=6)).strftime("%Y-%m-%d")
    heat_raw = await _group(db, {"date": {"$gte": week_start, "$lte": today_key}},
                            {"date": "$date", "hour": "$hour"}, {"_id.date": 1, "_id.hour": 1})
    heat_map = {(d["key"]["date"], d["key"]["hour"]): d["views"] for d in heat_raw}
    heatmap = []
    for i in range(7):
        k = (today - timedelta(days=6 - i)).strftime("%Y-%m-%d")
        heatmap.append({"date": k, "hours": [heat_map.get((k, h), 0) for h in range(24)]})

    def fmt(items, name):
        return [{name: d["key"] or "—", "views": d["views"], "visitors": d["visitors"]} for d in items]

    totals = await _group(db, in_range, None)
    t = totals[0] if totals else {}
    today_t = await _group(db, {"date": today_key}, None)
    live_since = (today - timedelta(minutes=5)).isoformat()
    live = await _group(db, {"ts": {"$gte": live_since}}, None)
    recent = await db.visits.find({}, {"_id": 0, "visitor": 0}).sort("ts", -1).to_list(60)

    return {
        "range": {"start": start, "end": today_key, "days": days, "focus_day": focus},
        "totals": {"views": t.get("views", 0), "visitors": t.get("visitors", 0),
                   "today_views": (today_t[0]["views"] if today_t else 0),
                   "today_visitors": (today_t[0]["visitors"] if today_t else 0),
                   "live_visitors": (live[0]["visitors"] if live else 0),
                   "avg_daily_views": round(t.get("views", 0) / days, 1)},
        "daily": daily, "hourly": hourly, "heatmap": heatmap,
        "pages": fmt(await _group(db, in_range, "$path", limit=15), "path"),
        "page_types": fmt(await _group(db, in_range, "$page", limit=15), "page"),
        "referrers": fmt(await _group(db, in_range, "$referrer", limit=12), "referrer"),
        "utm_sources": fmt(await _group(db, {**in_range, "utm_source": {"$ne": ""}}, "$utm_source", limit=10), "source"),
        "devices": fmt(await _group(db, in_range, "$device"), "device"),
        "browsers": fmt(await _group(db, in_range, "$browser", limit=8), "browser"),
        "recent": recent,
    }
