"""Moteur de préqualification commerciale — règles versionnées, administrables.

Affichage : préqualification indicative uniquement. Jamais d'« éligible »
définitif ni de montant d'aide garanti.
"""

from copy import deepcopy

ZONE_TABLE = {
    "H1": ["02", "08", "10", "14", "22", "27", "28", "29", "35", "36", "37", "41", "45",
           "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62",
           "72", "75", "76", "77", "78", "80", "89", "90", "91", "92", "93", "94", "95"],
    "H2": ["01", "03", "04", "05", "07", "09", "12", "15", "16", "17", "18", "19", "21",
           "23", "24", "25", "26", "31", "32", "33", "38", "39", "40", "42", "43", "44",
           "46", "47", "48", "49", "63", "64", "65", "67", "68", "69", "70", "71", "73",
           "74", "79", "81", "82", "85", "86", "87", "88"],
    "H3": ["06", "11", "13", "20", "30", "34", "66", "83", "84"],
}

DEFAULT_RULES = {
    "key": "ssc",
    "version": 1,
    "offer": "Système solaire combiné — offre partenaire",
    "verified": False,
    "note": "Règles de préqualification commerciale versionnées. La table des zones doit être "
            "recoupée avec la source officielle avant mise en production ; les surfaces hors "
            "grille (120/180/250 m²) donnent un pack « à confirmer par étude ».",
    "zone_table": ZONE_TABLE,
    "occupant_pack": [[1, 5, 8], [6, 9, 12], [10, 12, 16], [13, 99, 20]],
    "surface_pack": {
        "120": {"H1": 12, "H2": 8, "H3": 8},
        "180": {"H1": 16, "H2": 12, "H3": 12},
        "250": {"H1": 20, "H2": 16, "H3": 16},
    },
    "ecs_seule_zone": "H3",
    "updated_at": None,
    "updated_by": None,
}

STATUS_LABELS = {
    "hors_criteres": "Hors critères",
    "a_verifier": "À vérifier",
    "potentiel_a_verifier": "Potentiel à vérifier",
    "demande_generale": "Demande générale",
}

DISCLAIMER = "Préqualification commerciale indicative — sans valeur de garantie d'éligibilité ni de montant d'aide."


def get_zone(code_postal: str, rules: dict) -> str:
    dept = (code_postal or "")[:2]
    table = rules.get("zone_table", ZONE_TABLE)
    for zone, depts in table.items():
        if dept in depts:
            return zone
    return "à confirmer"


def occupant_pack(occupants: int, rules: dict):
    for lo, hi, kw in rules.get("occupant_pack", []):
        if lo <= occupants <= hi:
            return kw
    return None


def surface_pack(surface: int, zone: str, rules: dict):
    grid = rules.get("surface_pack", {})
    entry = grid.get(str(surface))
    if entry and zone in ("H1", "H2", "H3"):
        return entry.get(zone)
    return None


def compute_pack(occupants: int, surface: int, zone: str, rules: dict):
    """Pack final = max des deux calculs, uniquement si les deux sont définis."""
    p_occ = occupant_pack(occupants, rules)
    p_surf = surface_pack(surface, zone, rules)
    if p_occ and p_surf:
        return max(p_occ, p_surf), True, "Dimensionnement préliminaire — à confirmer par étude technique."
    if p_occ:
        return p_occ, False, "Pack à confirmer par étude : grille de surface non explicite pour cette surface."
    return None, False, "Pack à confirmer par étude."


def prequalify(a: dict, rules: dict) -> dict:
    """Applique les règles SSC versionnées aux réponses du formulaire."""
    exclusions = []
    unknowns = []
    orientations = []

    if a.get("statut") == "locataire":
        exclusions.append("Le statut de locataire ne permet pas d'engager des travaux de cette nature : "
                          "notre offre s'adresse aux propriétaires.")
    if a.get("type_logement") == "appartement":
        exclusions.append("L'offre concerne les maisons individuelles : les projets en appartement "
                          "sont hors critères.")
    if a.get("plus_de_2_ans") == "non":
        exclusions.append("Les logements de moins de 2 ans sont hors critères pour cette offre.")

    if a.get("toiture_orientation") == "nord":
        exclusions.append("Une toiture orientée uniquement au nord n'offre pas un rendement suffisant "
                          "pour un système solaire combiné.")
    if a.get("surface_toiture_16m2") == "non":
        exclusions.append("Une surface de toiture exploitable inférieure à 16 m² ne permet pas "
                          "d'implanter le système.")

    if a.get("plus_de_2_ans") == "incertain":
        unknowns.append("L'année de construction (logement de plus de 2 ans) reste à confirmer.")
    if a.get("toiture_orientation") == "inconnu":
        unknowns.append("L'orientation de la toiture reste à préciser.")
    if a.get("surface_toiture_16m2") in ("inconnu",):
        unknowns.append("La surface de toiture exploitable (16 m² minimum) reste à vérifier.")
    if a.get("espace_technique") != "oui":
        unknowns.append("L'espace technique (hauteur ≥ 2 m et accès de porte ≥ 70 cm) reste à valider "
                        "lors de l'étude.")
    if a.get("emetteurs") == "fonte":
        unknowns.append("Émetteurs en fonte : étude au cas par cas.")

    if exclusions:
        status = "hors_criteres"
        headline = ("Votre projet ne rentre pas, à ce jour, dans les critères de notre offre "
                    "de système solaire combiné.")
        messages = exclusions + ["Vous pouvez consulter nos guides pour découvrir les autres pistes."]
    elif a.get("projet") not in ("ssc", "pac_ssc"):
        status = "demande_generale"
        headline = "Votre demande générale a bien été enregistrée pour étude."
        messages = ["Pour ce type de projet, aucune règle d'éligibilité n'est simulée ici : votre demande "
                    "sera étudiée et orientée vers la solution adaptée."]
    else:
        if unknowns:
            status = "a_verifier"
            headline = "Votre projet pourrait correspondre — des points restent à vérifier."
            messages = list(unknowns)
        else:
            status = "potentiel_a_verifier"
            headline = ("Votre situation correspond aux premiers critères de notre offre : "
                        "à confirmer par une étude gratuite.")
            messages = ["Maison individuelle, propriétaire, logement de plus de 2 ans, toiture exploitable "
                        "et espace technique identifié : un technicien validera ces éléments lors de l'étude."]
        if a.get("chauffage_actuel") in ("chaudiere_gaz", "chaudiere_fioul"):
            orientations.append("Votre chauffage actuel (chaudière) peut orienter le projet vers une "
                                "solution « pompe à chaleur + solaire combiné », sous validation de l'étude.")

    zone = get_zone(a.get("code_postal", ""), rules)
    pack_kw = None
    pack_confirmed = False
    pack_note = None
    if status in ("potentiel_a_verifier", "a_verifier"):
        pack_kw, pack_confirmed, pack_note = compute_pack(
            int(a.get("occupants") or 0), int(a.get("surface") or 0), zone, rules)

    return {
        "status": status,
        "status_label": STATUS_LABELS[status],
        "headline": headline,
        "messages": messages,
        "exclusions": exclusions,
        "orientations": orientations,
        "zone": zone,
        "pack_kw": pack_kw,
        "pack_confirmed": pack_confirmed,
        "pack_note": pack_note,
        "disclaimer": DISCLAIMER,
        "rules_version": rules.get("version"),
    }
