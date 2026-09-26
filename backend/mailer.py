"""Notifications e-mail (Gmail SMTP) + PDF récapitulatif des dossiers (interne et client)."""

import asyncio
import io
import logging
import os
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr
from html import escape
from zoneinfo import ZoneInfo

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (Image, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

logger = logging.getLogger("aef.mailer")

LOGO_PATH = os.path.join(os.path.dirname(__file__), "assets", "logo.png")
GREEN = colors.HexColor("#155C45")
GOLD = colors.HexColor("#B8923A")
INK = colors.HexColor("#1F2A2E")
IVORY = colors.HexColor("#F4F4EE")
LINE = colors.HexColor("#D9DED8")

LABELS = {
    "projet": {"ssc": "Système solaire combiné (SSC)", "pac_ssc": "Pompe à chaleur + SSC",
               "pac": "Pompe à chaleur", "isolation": "Isolation", "chauffage": "Chauffage",
               "autre": "Autre projet", "ne_sais_pas": "Ne sait pas encore",
               "rappel_telephonique": "Demande de rappel téléphonique"},
    "statut": {"proprietaire_occupant": "Propriétaire occupant", "proprietaire_bailleur": "Propriétaire bailleur",
               "locataire": "Locataire", "autre": "Autre"},
    "type_logement": {"maison": "Maison individuelle", "appartement": "Appartement", "autre": "Autre"},
    "chauffage_actuel": {"chaudiere_gaz": "Chaudière gaz", "chaudiere_fioul": "Chaudière fioul",
                         "pac": "Pompe à chaleur", "radiateurs_electriques": "Radiateurs électriques",
                         "autre": "Autre", "inconnu": "Ne sait pas"},
    "emetteurs": {"acier": "Radiateurs acier", "aluminium": "Radiateurs aluminium", "fonte": "Radiateurs fonte",
                  "autre": "Autre", "inconnu": "Ne sait pas"},
    "toiture_orientation": {"sud": "Sud", "est": "Est", "ouest": "Ouest", "nord": "Nord",
                            "mixte": "Mixte", "inconnu": "Ne sait pas"},
    "ouinon": {"oui": "Oui", "non": "Non", "incertain": "Incertain", "inconnu": "Ne sait pas"},
}
FIELDS = [
    ("projet", "Projet envisagé"), ("statut", "Statut de l'occupant"), ("type_logement", "Type de logement"),
    ("plus_de_2_ans", "Logement de plus de 2 ans"), ("surface", "Surface habitable"),
    ("code_postal", "Code postal"), ("commune", "Commune"), ("occupants", "Nombre d'occupants"),
    ("chauffage_actuel", "Chauffage actuel"), ("emetteurs", "Émetteurs de chaleur"),
    ("toiture_orientation", "Orientation de la toiture"), ("surface_toiture_16m2", "≥ 16 m² de toiture disponible"),
    ("espace_technique", "Espace technique pour le ballon"), ("callback_slot", "Créneau de rappel souhaité"),
]
OUI_NON_FIELDS = {"plus_de_2_ans", "surface_toiture_16m2", "espace_technique"}


def is_configured() -> bool:
    return bool(os.environ.get("GMAIL_USERNAME") and os.environ.get("GMAIL_APP_PASSWORD"))


def internal_recipient() -> str:
    return os.environ.get("NOTIFICATION_EMAIL_INTERNAL") or os.environ.get("NOTIFICATION_EMAIL", "")


def public_email() -> str:
    return os.environ.get("NOTIFICATION_EMAIL", "")


def label(field: str, value) -> str:
    if value in (None, ""):
        return "—"
    if field in OUI_NON_FIELDS:
        return LABELS["ouinon"].get(str(value), str(value))
    if field == "surface":
        return f"{value} m²"
    table = LABELS.get(field)
    return table.get(str(value), str(value)) if table else str(value)


def fmt_date(iso: str) -> str:
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(ZoneInfo("Europe/Paris"))
        return d.strftime("%d/%m/%Y à %Hh%M")
    except Exception:
        return iso or "—"


# ---------------------------------------------------------------- PDF
def _styles():
    base = ParagraphStyle("base", fontName="Helvetica", fontSize=9.5, leading=13, textColor=INK)
    return {
        "base": base,
        "small": ParagraphStyle("small", parent=base, fontSize=8, leading=11, textColor=colors.HexColor("#5B6A6E")),
        "title": ParagraphStyle("title", parent=base, fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=GREEN),
        "sub": ParagraphStyle("sub", parent=base, fontSize=9.5, textColor=colors.HexColor("#5B6A6E")),
        "h2": ParagraphStyle("h2", parent=base, fontName="Helvetica-Bold", fontSize=10.5, leading=14,
                             textColor=GREEN, spaceBefore=4, spaceAfter=4),
        "big": ParagraphStyle("big", parent=base, fontName="Helvetica-Bold", fontSize=13, leading=16),
        "cell_k": ParagraphStyle("cell_k", parent=base, fontName="Helvetica-Bold", fontSize=8.5, textColor=colors.HexColor("#3E4C50")),
        "cell_v": ParagraphStyle("cell_v", parent=base, fontSize=9.5),
        "bullet": ParagraphStyle("bullet", parent=base, leftIndent=10, bulletIndent=0),
    }


def _section(title: str, st):
    t = Table([[Paragraph(title, st["h2"])]], colWidths=[176 * mm])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 1.2, GREEN), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]))
    return t


def _kv_table(rows, st, key_w=62 * mm):
    data = [[Paragraph(escape(k), st["cell_k"]), Paragraph(escape(str(v)), st["cell_v"])] for k, v in rows]
    t = Table(data, colWidths=[key_w, 176 * mm - key_w])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, IVORY]),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def _header(story, st, title, lead):
    logo = Image(LOGO_PATH, width=62 * mm, height=62 * mm * 364 / 1600) if os.path.exists(LOGO_PATH) else Spacer(1, 1)
    right = [Paragraph(title, st["title"]),
             Paragraph(f"Référence <b>{escape(lead.get('reference', ''))}</b> · reçue le "
                       f"{fmt_date(lead.get('created_at', ''))}", st["sub"])]
    t = Table([[logo, right]], colWidths=[70 * mm, 106 * mm])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
    story.append(t)
    story.append(Spacer(1, 3 * mm))
    bar = Table([[""]], colWidths=[176 * mm], rowHeights=[2.2])
    bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), GREEN)]))
    story.append(bar)
    bar2 = Table([[""]], colWidths=[176 * mm], rowHeights=[1.2])
    bar2.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), GOLD)]))
    story.append(bar2)
    story.append(Spacer(1, 6 * mm))


def _footer_factory(text: str):
    def draw(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.line(17 * mm, 14 * mm, 193 * mm, 14 * mm)
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#5B6A6E"))
        canvas.drawString(17 * mm, 9.5 * mm, text)
        canvas.drawRightString(193 * mm, 9.5 * mm, f"Page {doc.page}")
        canvas.restoreState()
    return draw


def _answers_rows(a: dict):
    rows = []
    for key, lab in FIELDS:
        if key == "callback_slot" and not a.get(key):
            continue
        if key == "commune" and not a.get(key):
            continue
        rows.append((lab, label(key, a.get(key))))
    return rows


def _prequal_block(p: dict, st, story):
    if not p:
        story.append(Paragraph("Aucune simulation réalisée : demande de rappel directe.", st["base"]))
        return
    story.append(Paragraph(f"<b>{escape(p.get('status_label') or '—')}</b> — {escape(p.get('headline') or '')}", st["big"]))
    story.append(Spacer(1, 2 * mm))
    for m in p.get("messages") or []:
        story.append(Paragraph(escape(m), st["bullet"], bulletText="•"))
    rows = [("Zone climatique", p.get("zone") or "—")]
    if p.get("pack_kw"):
        rows.append(("Puissance indicative", f"{p['pack_kw']} kW" + (" (confirmée)" if p.get("pack_confirmed") else " (à confirmer)")))
    if p.get("pack_note"):
        rows.append(("Note", p["pack_note"]))
    if p.get("orientations"):
        rows.append(("Orientations", " · ".join(p["orientations"])))
    if p.get("exclusions"):
        rows.append(("Points bloquants", " · ".join(p["exclusions"])))
    story.append(Spacer(1, 2 * mm))
    story.append(_kv_table(rows, st))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(escape(p.get("disclaimer") or ""), st["small"]))


def build_pdf(lead: dict, internal: bool = True) -> bytes:
    st = _styles()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=17 * mm, rightMargin=17 * mm,
                            topMargin=15 * mm, bottomMargin=20 * mm,
                            title=f"Dossier {lead.get('reference', '')} — Aides Énergie France")
    a = lead.get("answers") or {}
    c = lead.get("contact") or {}
    p = lead.get("prequal") or {}
    story = []

    if internal:
        _header(story, st, "Dossier de demande — fiche de reprise de contact", lead)
        story.append(_section("1. Contact à rappeler", st))
        story.append(Spacer(1, 2 * mm))
        story.append(_kv_table([
            ("Nom", f"{c.get('prenom', '')} {c.get('nom', '')}".strip() or "—"),
            ("Téléphone", c.get("telephone") or "—"),
            ("E-mail", c.get("email") or "—"),
            ("Créneau souhaité", a.get("callback_slot") or "Au plus tôt (aucun créneau précisé)"),
            ("Consentement recontact", "Oui" if lead.get("contact_ok") else "Non"),
            ("Consentement marketing", "Oui" if lead.get("marketing_ok") else "Non"),
            ("Source", {"simulation": "Simulation 4 étapes", "rappel": "Bouton « Me faire rappeler »",
                        "test_admin": "Lead de test"}.get(lead.get("source"), lead.get("source") or "—")),
        ], st))
        story.append(Spacer(1, 5 * mm))
        story.append(_section("2. Logement et projet", st))
        story.append(Spacer(1, 2 * mm))
        story.append(_kv_table(_answers_rows(a), st))
        story.append(Spacer(1, 5 * mm))
        story.append(_section("3. Préqualification indicative (règles version %s)" % (p.get("rules_version") or "—"), st))
        story.append(Spacer(1, 2 * mm))
        _prequal_block(p, st, story)
        story.append(Spacer(1, 5 * mm))
        consent = lead.get("consent") or {}
        story.append(_section("4. Consentement et traçabilité", st))
        story.append(Spacer(1, 2 * mm))
        utm = lead.get("utm") or {}
        story.append(_kv_table([
            ("Version du consentement", str(consent.get("version") or "—")),
            ("Destinataire déclaré", consent.get("recipient") or lead.get("partner") or "—"),
            ("Horodatage", fmt_date(consent.get("timestamp") or lead.get("created_at", ""))),
            ("Adresse IP", consent.get("ip") or "—"),
            ("Navigateur", (consent.get("user_agent") or "—")[:120]),
            ("Campagne (UTM)", " / ".join(f"{k}={v}" for k, v in utm.items()) or "Accès direct"),
        ], st))
        story.append(Spacer(1, 5 * mm))
        story.append(KeepTogether([
            _section("5. Reprise de contact — check-list équipe", st),
            Spacer(1, 2 * mm),
            _kv_table([
                ("☐ Appel", f"Appeler {c.get('telephone') or '—'} " + (f"au créneau « {a['callback_slot']} »" if a.get("callback_slot") else "dans les 24 h ouvrées")),
                ("☐ Vérifier", "Statut propriétaire, type de logement, ancienneté > 2 ans, surface habitable"),
                ("☐ Toiture", "Orientation, surface disponible ≥ 16 m², masques et ombrages"),
                ("☐ Technique", "Emplacement ballon / local technique, chauffage actuel, émetteurs"),
                ("☐ Planifier", "Étude gratuite à domicile et transmission au partenaire installateur"),
                ("☐ Mettre à jour", f"Statut du dossier dans l'administration ({os.environ.get('SITE_ORIGIN', '')}/administration/leads)"),
            ], st, key_w=34 * mm),
        ]))
        footer = "Document confidentiel — usage interne Aides Énergie France. Aucune éligibilité définitive ni montant garanti : les barèmes officiels font foi."
    else:
        _header(story, st, "Récapitulatif de votre demande", lead)
        story.append(Paragraph(
            f"Bonjour {escape(c.get('prenom') or c.get('nom') or '')},<br/>voici le récapitulatif de la demande que vous avez "
            "transmise à Aides Énergie France. Conservez ce document : votre référence vous permettra de suivre votre dossier.",
            st["base"]))
        story.append(Spacer(1, 5 * mm))
        story.append(_section("Vos coordonnées", st))
        story.append(Spacer(1, 2 * mm))
        story.append(_kv_table([
            ("Nom", f"{c.get('prenom', '')} {c.get('nom', '')}".strip() or "—"),
            ("Téléphone", c.get("telephone") or "—"),
            ("E-mail", c.get("email") or "—"),
            ("Créneau de rappel", a.get("callback_slot") or "Au plus tôt"),
        ], st))
        story.append(Spacer(1, 5 * mm))
        story.append(_section("Votre logement et votre projet", st))
        story.append(Spacer(1, 2 * mm))
        story.append(_kv_table(_answers_rows(a), st))
        story.append(Spacer(1, 5 * mm))
        story.append(_section("Première analyse indicative", st))
        story.append(Spacer(1, 2 * mm))
        _prequal_block(p, st, story)
        story.append(Spacer(1, 5 * mm))
        story.append(KeepTogether([
            _section("Et maintenant ?", st),
            Spacer(1, 2 * mm),
            _kv_table([
                ("1. Un conseiller vous appelle", "Au créneau choisi ou dans les 24 h ouvrées, pour vérifier ensemble les informations transmises."),
                ("2. Étude gratuite", "Si votre projet correspond, une étude gratuite et sans engagement est organisée avec un professionnel."),
                ("3. Vous décidez", "Vous recevez un devis détaillé. Aucune obligation : vous restez libre de donner suite ou non."),
            ], st, key_w=52 * mm),
            Spacer(1, 4 * mm),
            Paragraph("Aides Énergie France est une plateforme privée d'information et de mise en relation. "
                      "Nous ne délivrons aucune aide publique : les barèmes officiels font foi et seul l'instructeur "
                      "compétent confirme un droit. Vos données sont utilisées uniquement pour traiter votre demande "
                      f"(destinataire : {escape(lead.get('partner') or 'Holding SMIE')}). Une question ? "
                      f"Écrivez à {escape(public_email())}.", st["small"]),
        ]))
        footer = f"Aides Énergie France — plateforme privée · {public_email()} · référence {lead.get('reference', '')}"

    doc.build(story, onFirstPage=_footer_factory(footer), onLaterPages=_footer_factory(footer))
    return buf.getvalue()


# ---------------------------------------------------------------- E-mail
def _html_shell(title: str, body: str, footer: str) -> str:
    return f"""<!doctype html><html lang="fr"><body style="margin:0;background:#F4F4EE;font-family:Arial,Helvetica,sans-serif;color:#1F2A2E">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4EE;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#fff;border:1px solid #D9DED8">
  <tr><td style="padding:20px 28px;border-bottom:4px solid #155C45"><img src="cid:aef-logo" alt="Aides Énergie France" width="220" style="display:block;width:220px;height:auto"></td></tr>
  <tr><td style="height:3px;background:#B8923A"></td></tr>
  <tr><td style="padding:28px 28px 8px"><h1 style="margin:0 0 6px;font-size:20px;line-height:26px;color:#155C45">{title}</h1></td></tr>
  <tr><td style="padding:0 28px 28px;font-size:14px;line-height:22px">{body}</td></tr>
  <tr><td style="padding:16px 28px;background:#F4F4EE;border-top:1px solid #D9DED8;font-size:11px;line-height:16px;color:#5B6A6E">{footer}</td></tr>
</table></td></tr></table></body></html>"""


def _kv_html(rows) -> str:
    cells = "".join(
        f'<tr><td style="padding:8px 10px;border-bottom:1px solid #E6E9E4;font-weight:bold;font-size:12px;color:#3E4C50;width:42%">{escape(k)}</td>'
        f'<td style="padding:8px 10px;border-bottom:1px solid #E6E9E4;font-size:13px">{escape(str(v))}</td></tr>' for k, v in rows)
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D9DED8;margin:12px 0">{cells}</table>'


def _button(href: str, text: str) -> str:
    return (f'<p style="margin:18px 0"><a href="{escape(href)}" style="display:inline-block;background:#155C45;color:#fff;'
            f'text-decoration:none;font-weight:bold;padding:12px 22px;font-size:14px">{escape(text)}</a></p>')


def internal_email_html(lead: dict) -> str:
    a, c, p = lead.get("answers") or {}, lead.get("contact") or {}, lead.get("prequal") or {}
    site = os.environ.get("SITE_ORIGIN", "").rstrip("/")
    body = (
        f'<p style="margin:0 0 12px">Un nouveau dossier vient d’arriver. Le récapitulatif complet est en pièce jointe (PDF) : '
        f'coordonnées, réponses détaillées, préqualification, consentement et check-list de reprise de contact.</p>'
        f'<p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#5B6A6E">À rappeler</p>'
        f'<p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#155C45">{escape((c.get("prenom", "") + " " + c.get("nom", "")).strip() or "—")}</p>'
        f'<p style="margin:2px 0 0;font-size:20px;font-weight:bold"><a href="tel:{escape(c.get("telephone", ""))}" style="color:#1F2A2E;text-decoration:none">{escape(c.get("telephone") or "—")}</a></p>'
        f'<p style="margin:2px 0 0;color:#5B6A6E">{escape(c.get("email") or "Pas d’e-mail communiqué")}</p>'
        + _kv_html([
            ("Créneau souhaité", a.get("callback_slot") or "Au plus tôt"),
            ("Projet", label("projet", a.get("projet"))),
            ("Logement", f"{label('type_logement', a.get('type_logement'))} · {label('surface', a.get('surface'))} · {a.get('code_postal') or '—'} {a.get('commune') or ''}".strip()),
            ("Statut", label("statut", a.get("statut"))),
            ("Chauffage actuel", label("chauffage_actuel", a.get("chauffage_actuel"))),
            ("Préqualification", f"{p.get('status_label') or 'Sans simulation'}" + (f" — {p.get('headline')}" if p.get("headline") else "")),
            ("Zone / puissance", f"{p.get('zone') or '—'} / {str(p.get('pack_kw')) + ' kW' if p.get('pack_kw') else '—'}"),
            ("Source", lead.get("source") or "—"),
        ])
        + _button(f"{site}/administration/leads/{lead.get('_id') or lead.get('id') or ''}", "Ouvrir le dossier dans l'administration")
        + '<p style="margin:0;font-size:12px;color:#5B6A6E">Pensez à mettre le statut à jour après l’appel.</p>'
    )
    footer = ("Message automatique — usage interne Aides Énergie France. Données confidentielles : ne pas transférer "
              "hors de l'équipe. Aucune éligibilité définitive ni montant garanti.")
    return _html_shell(f"Nouveau dossier {escape(lead.get('reference', ''))}", body, footer)


def client_email_html(lead: dict) -> str:
    a, c, p = lead.get("answers") or {}, lead.get("contact") or {}, lead.get("prequal") or {}
    body = (
        f'<p style="margin:0 0 12px">Bonjour {escape(c.get("prenom") or c.get("nom") or "")},</p>'
        f'<p style="margin:0 0 12px">Nous avons bien reçu votre demande. Votre référence est '
        f'<strong style="color:#155C45">{escape(lead.get("reference", ""))}</strong>. Le récapitulatif complet de vos réponses '
        f'est joint à cet e-mail au format PDF.</p>'
        + _kv_html([
            ("Projet", label("projet", a.get("projet"))),
            ("Logement", f"{label('type_logement', a.get('type_logement'))} · {label('surface', a.get('surface'))} · {a.get('code_postal') or '—'}"),
            ("Première analyse", p.get("status_label") or "Demande de rappel"),
            ("Rappel prévu", a.get("callback_slot") or "Sous 24 h ouvrées"),
        ])
        + '<p style="margin:0 0 8px"><strong>Et maintenant ?</strong></p>'
        '<ol style="margin:0 0 16px;padding-left:20px"><li>Un conseiller vous appelle au créneau choisi (ou sous 24 h ouvrées).</li>'
        '<li>Si votre projet correspond, une étude gratuite et sans engagement est organisée.</li>'
        '<li>Vous recevez un devis détaillé et restez libre de donner suite.</li></ol>'
        f'<p style="margin:0;font-size:12px;color:#5B6A6E">Une question ? Répondez à cet e-mail ou écrivez à {escape(public_email())}.</p>'
    )
    footer = ("Aides Énergie France est une plateforme privée d'information et de mise en relation. Nous ne délivrons aucune "
              "aide publique : les barèmes officiels font foi et seul l'instructeur compétent confirme un droit. "
              f"Vos données sont traitées uniquement pour votre demande (destinataire : {escape(lead.get('partner') or 'Holding SMIE')}).")
    return _html_shell("Votre demande a bien été reçue", body, footer)


def _message(to: str, subject: str, html: str, text: str, pdf: bytes | None = None,
             pdf_name: str = "", reply_to: str = "") -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = formataddr(("Aides Énergie France", os.environ["GMAIL_USERNAME"]))
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    if os.path.exists(LOGO_PATH):
        with open(LOGO_PATH, "rb") as f:
            msg.get_payload()[1].add_related(f.read(), maintype="image", subtype="png", cid="<aef-logo>")
    if pdf:
        msg.add_attachment(pdf, maintype="application", subtype="pdf", filename=pdf_name or "dossier.pdf")
    return msg


def _send_sync(msg: EmailMessage):
    ctx = ssl.create_default_context()
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ctx)
        smtp.ehlo()
        smtp.login(os.environ["GMAIL_USERNAME"], os.environ["GMAIL_APP_PASSWORD"])
        smtp.send_message(msg)


async def send(msg: EmailMessage) -> tuple[str, str]:
    """Retourne (état, détail) — jamais d'exception, jamais d'identifiant dans les logs."""
    if not is_configured():
        return "non_configure", "GMAIL_USERNAME / GMAIL_APP_PASSWORD absents"
    try:
        await asyncio.to_thread(_send_sync, msg)
        return "succes", f"Envoyé à {msg['To']}"
    except smtplib.SMTPAuthenticationError:
        return "echec", "Authentification Gmail refusée : vérifiez le mot de passe d'application (validation en 2 étapes requise)."
    except Exception as exc:
        return "echec", f"{type(exc).__name__}: {str(exc)[:160]}"


def lead_subject(lead: dict) -> str:
    a, c = lead.get("answers") or {}, lead.get("contact") or {}
    who = (c.get("prenom", "") + " " + c.get("nom", "")).strip() or "Contact"
    return f"[AEF] Nouveau dossier {lead.get('reference', '')} — {who} — {label('projet', a.get('projet'))} — {a.get('code_postal') or 'rappel'}"


async def notify_lead(db, lead: dict, journal, internal_to: str | None = None) -> dict:
    """E-mail interne (PDF fiche complète) + e-mail client (PDF récapitulatif) si e-mail connu."""
    ref = lead.get("reference", "")
    results = {}
    internal_to = internal_to or internal_recipient()
    if internal_to:
        pdf = build_pdf(lead, internal=True)
        text = (f"Nouveau dossier {ref}.\nContact : {lead.get('contact', {}).get('prenom', '')} {lead.get('contact', {}).get('nom', '')}"
                f" — {lead.get('contact', {}).get('telephone', '')}\nRécapitulatif complet en pièce jointe (PDF).")
        state, detail = await send(_message(internal_to, lead_subject(lead), internal_email_html(lead), text,
                                            pdf, f"dossier-{ref}.pdf",
                                            reply_to=lead.get("contact", {}).get("email") or ""))
        results["interne"] = state
        await journal(db, "email_notification", state, f"E-mail équipe : {detail}", ref)
    client_to = (lead.get("contact") or {}).get("email")
    if client_to and not client_to.endswith("@test.local"):
        pdf = build_pdf(lead, internal=False)
        text = (f"Bonjour,\n\nNous avons bien reçu votre demande (référence {ref}). Le récapitulatif est joint en PDF.\n"
                f"Un conseiller vous appelle prochainement.\n\nAides Énergie France — {public_email()}")
        state, detail = await send(_message(client_to, f"Votre demande {ref} — Aides Énergie France",
                                            client_email_html(lead), text, pdf, f"recapitulatif-{ref}.pdf",
                                            reply_to=public_email()))
        results["client"] = state
        await journal(db, "email_client", state, f"Accusé de réception client : {detail}", ref)
    if results:
        await db.leads.update_one({"_id": lead["_id"]}, {"$set": {"emails": results, "emails_at": datetime.now().isoformat()}})
    return results


async def notify_contact(db, doc: dict, journal) -> str:
    to = internal_recipient()
    if not to:
        return "non_configure"
    body = (_kv_html([("De", f"{doc.get('nom')} <{doc.get('email')}>"), ("Sujet", doc.get("sujet") or "—"),
                      ("Reçu le", fmt_date(doc.get("created_at", "")))])
            + f'<p style="white-space:pre-wrap;margin:0;padding:14px;background:#F4F4EE;border-left:3px solid #B8923A">{escape(doc.get("message", ""))}</p>')
    html = _html_shell("Nouveau message via le formulaire de contact", body,
                       "Message automatique — répondez directement à cet e-mail pour joindre l'expéditeur.")
    text = f"Message de {doc.get('nom')} <{doc.get('email')}>\nSujet : {doc.get('sujet')}\n\n{doc.get('message')}"
    state, detail = await send(_message(to, f"[AEF] Contact — {doc.get('sujet') or doc.get('nom')}", html, text,
                                        reply_to=doc.get("email", "")))
    await journal(db, "contact_notification", state, f"E-mail équipe : {detail}")
    return state
