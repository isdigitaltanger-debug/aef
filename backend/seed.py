"""Seed idempotent : admin, partenaire, règles, consentement, catégories, articles."""

import logging

import rules as rules_mod
from models import now_iso

logger = logging.getLogger(__name__)

CONSENT_V1 = {
    "version": 1,
    "recipient": "Holding SMIE",
    "contact_text": "Je confirme ma demande d'être recontacté(e) au sujet de l'étude gratuite de mon projet. "
                    "Mes informations (coordonnées et réponses au formulaire) seront transmises au destinataire "
                    "désigné ci-dessous, seul responsable de leur traitement pour cette étude. "
                    "Je peux retirer mon consentement à tout moment (voir Politique de confidentialité).",
    "marketing_text": "J'accepte de recevoir des communications commerciales de Aides Énergie France "
                      "concernant des solutions énergétiques (facultatif).",
    "created_at": now_iso(),
}

CATEGORIES = ["aides", "solutions", "travaux", "guide"]

ARTICLES = [
    {
        "slug": "systeme-solaire-combine-fonctionnement",
        "title": "Système solaire combiné (SSC) : fonctionnement et points de repère",
        "category": "solutions",
        "status": "published",
        "image_url": "https://images.unsplash.com/photo-1655300283247-6b1924b1d152?crop=entropy&cs=srgb&fm=jpg&q=85",
        "excerpt": "Comment un système solaire combiné chauffe votre logement et votre eau chaude, "
                   "quels logements il convient le mieux et quels points vérifier avant de se lancer.",
        "content": ("Le système solaire combiné, souvent abrégé SSC, utilise l'énergie du soleil pour participer "
                    "au chauffage du logement et à la production d'eau chaude sanitaire. Des capteurs posés sur "
                    "la toiture récupèrent la chaleur, qu'un circuit transfère vers un plancher chauffant ou des "
                    "émetteurs basse température et vers un ballon de stockage.\n\n"
                    "## Dans quelles conditions le SSC est-il pertinent ?\n\n"
                    "Un système solaire combiné se conçoit avant tout pour une maison individuelle dont le "
                    "besoin de chauffage est compatible avec une production solaire : bonne exposition de la "
                    "toiture, surface exploitable suffisante pour les capteurs et emplacement technique pour "
                    "le ballon de stockage. L'orientation la plus favorable est généralement sud, mais des "
                    "orientations est ou ouest peuvent être étudiées selon la configuration.\n\n"
                    "## SSC seul ou associé à une pompe à chaleur ?\n\n"
                    "Selon le chauffage existant et le niveau de confort recherché, le SSC peut être installé "
                    "seul ou être associé à une pompe à chaleur. Cette association, dite PAC + SSC, vise à "
                    "réduire le recours à l'énergie d'appoint. Le choix entre les deux configurations se fait "
                    "à l'issue d'une étude technique du logement.\n\n"
                    "## Les points de vigilance\n\n"
                    "Un projet SSC réussi suppose de vérifier l'état de la toiture, la place disponible pour "
                    "l'installation technique (une hauteur minimale et un accès suffisant sont nécessaires), "
                    "ainsi que le dimensionnement du ballon par rapport au nombre d'occupants. Un "
                    "dimensionnement mal calibré dégrade le rendement de l'installation.\n\n"
                    "## À retenir\n\n"
                    "Le SSC est une solution de chauffage et d'eau chaude qui demande une étude sérieuse du "
                    "bâti. Avant tout engagement, faites réaliser une étude gratuite et comparez les "
                    "préconisations techniques."),
        "source_urls": ["https://www.france-renov.gouv.fr/", "https://www.ademe.fr/"],
        "seo_title": "Système solaire combiné (SSC) : fonctionnement et points de repère",
        "seo_description": "Comprendre le fonctionnement d'un système solaire combiné, les logements concernés "
                           "et les points de vigilance avant d'engager un projet.",
    },
    {
        "slug": "pompe-a-chaleur-air-eau-points-de-repere",
        "title": "Pompe à chaleur air-eau : les points de repère avant de se lancer",
        "category": "travaux",
        "status": "published",
        "image_url": "https://images.unsplash.com/photo-1776860150272-653efc74193c?crop=entropy&cs=srgb&fm=jpg&q=85",
        "excerpt": "Principes, émetteurs compatibles, dimensionnement : ce qu'il faut comprendre "
                   "avant d'envisager l'installation d'une pompe à chaleur air-eau.",
        "content": ("Une pompe à chaleur air-eau prélève les calories de l'air extérieur pour chauffer le "
                    "logement, via un circuit d'eau qui alimente des radiateurs ou un plancher chauffant. "
                    "Elle remplace souvent une chaudière gaz ou fioul.\n\n"
                    "## Émetteurs : un point clé du projet\n\n"
                    "Les PAC air-eau fonctionnent d'autant mieux que les émetteurs sont basse température. "
                    "Des radiateurs en fonte, en acier ou en aluminium peuvent être conservés selon leur "
                    "dimensionnement ; un expert devra les évaluer. Dans certains cas, un remplacement partiel "
                    "des émetteurs est recommandé.\n\n"
                    "## Pourquoi le dimensionnement compte\n\n"
                    "Une PAC surdimensionnée se met et s'arrête souvent, ce qui use le matériel ; sous-"
                    "dimensionnée, elle ne couvre pas les besoins. Le dimensionnement s'appuie sur les "
                    "besoins du logement (surface chauffée, zone climatique, nombre d'occupants) et se "
                    "valide par une étude thermique de terrain.\n\n"
                    "## PAC seule ou PAC + solaire thermique ?\n\n"
                    "Associer une pompe à chaleur à un système solaire thermique peut réduire la consommation "
                    "liée à l'eau chaude sanitaire. Cette combinaison se décide selon la toiture, la zone "
                    "climatique et le profil d'occupation du logement.\n\n"
                    "## À retenir\n\n"
                    "Un projet de pompe à chaleur se prépare : évaluation des émetteurs, étude de "
                    "dimensionnement et vérification de l'espace technique extérieur sont les étapes "
                    "indispensables avant toute signature."),
        "source_urls": ["https://www.france-renov.gouv.fr/", "https://www.ademe.fr/"],
        "seo_title": "Pompe à chaleur air-eau : points de repère avant de se lancer",
        "seo_description": "Émetteurs, dimensionnement, association au solaire thermique : comprendre les "
                           "grands principes d'un projet de pompe à chaleur air-eau.",
    },
    {
        "slug": "maprimerenov-avant-de-deposer-un-dossier",
        "title": "MaPrimeRénov' : ce qu'il faut savoir avant de déposer un dossier",
        "category": "aides",
        "status": "published",
        "image_url": "https://images.unsplash.com/photo-1768321916128-c242ca443253?crop=entropy&cs=srgb&fm=jpg&q=85",
        "excerpt": "Logique du dispositif, parcours de demande et précautions : préparer un dossier "
                   "MaPrimeRénov' sereinement, sans promesse de montant.",
        "content": ("MaPrimeRénov' est le dispositif public d'aide à la rénovation énergétique. Il accompagne "
                    "des travaux performants dans un logement ancien occupé en résidence principale. Son "
                    "atout : un parcours en ligne unique, un dossier par logement.\n\n"
                    "## Une aide qui suit la performance du projet\n\n"
                    "Le montant des aides dépend de la nature des travaux, des gains visés et de la situation "
                    "du foyer. Les barèmes évoluent régulièrement : ne vous fiez ni aux montants anciens ni "
                    "aux promesses génériques. Le bon réflexe est de consulter le simulateur et la "
                    "documentation du service public au moment précis de votre projet.\n\n"
                    "## Le parcours de demande en bref\n\n"
                    "Le parcours classique : création d'un compte sur la plateforme officielle, dépôt du "
                    "dossier avant signature des devis, acceptance, réalisation des travaux par un "
                    "professionnel certifié RGE, puis versement de l'aide. L'aide est accordée avant les "
                    "travaux : ne signez jamais un devis avant d'avoir déposé votre demande.\n\n"
                    "## Les précautions à prendre\n\n"
                    "Méfiez-vous des démarchages agressifs promettant des travaux « gratuits ». Aucune aide "
                    "n'est acquise avant l'accord officiel, et les plateformes privées d'accompagnement, "
                    "comme la nôtre, ne délivrent pas MaPrimeRénov' : elles aident à préparer votre projet "
                    "et vous orientent vers les bons guichets.\n\n"
                    "## À retenir\n\n"
                    "MaPrimeRénov' est une aide publique sérieuse, dont les montants varient selon la "
                    "situation et les travaux. Préparez votre dossier, faites réaliser les travaux par un "
                    "artisan RGE et vérifiez chaque condition sur le site officiel."),
        "source_urls": ["https://www.france-renov.gouv.fr/", "https://www.service-public.fr/"],
        "seo_title": "MaPrimeRénov' : préparer son dossier sans mauvaise surprise",
        "seo_description": "Logique du dispositif MaPrimeRénov', parcours de demande et précautions avant "
                           "de déposer un dossier de rénovation énergétique.",
    },
    {
        "slug": "cheque-energie-a-quoi-sert-il",
        "title": "Chèque énergie : à quoi sert-il et comment l'utiliser ?",
        "category": "aides",
        "status": "published",
        "image_url": "https://images.unsplash.com/photo-1566838616631-f2618f74a6a2?crop=entropy&cs=srgb&fm=jpg&q=85",
        "excerpt": "Le chèque énergie est une aide au paiement des factures, distincte des aides aux "
                   "travaux. Mode d'emploi et lien vers le service officiel.",
        "content": ("Le chèque énergie est une aide financière destinée aux ménages modestes pour les aider à "
                    "payer leurs factures d'énergie (électricité, gaz, bois, fioul…) ou certains travaux de "
                    "rénovation. Il est envoyé automatiquement par les services publics aux foyers qui y ont "
                    "droit.\n\n"
                    "## Une aide aux factures, pas une aide aux travaux\n\n"
                    "Il ne faut pas confondre le chèque énergie avec les aides à la rénovation comme "
                    "MaPrimeRénov' ou les primes CEE. Le chèque énergie sert d'abord à régler des factures "
                    "d'énergie. Son usage pour des travaux est limité à des cas précis.\n\n"
                    "## Comment l'utiliser\n\n"
                    "Le chèque est utilisable auprès des fournisseurs d'énergie partenaires, en ligne ou par "
                    "courrier. Chaque chèque porte un numéro unique et une date de validité. Aucune démarche "
                    "n'est nécessaire pour le recevoir : il est envoyé au domicile des bénéficiaires.\n\n"
                    "## Attention aux faux services\n\n"
                    "Des sites privés imitent le service public pour capter des coordonnées contre un "
                    "prétendu chèque. Le seul service officiel est le site gouvernemental dédié au chèque "
                    "énergie : n'y communiquez jamais plus d'informations qu'on ne vous le demande.\n\n"
                    "## À retenir\n\n"
                    "Le chèque énergie est envoyé automatiquement aux foyers éligibles. En cas de doute sur "
                    "vos droits, consultez le site officiel du chèque énergie. Cette plateforme privée ne "
                    "collecte aucune demande de chèque énergie."),
        "source_urls": ["https://www.chequeenergie.gouv.fr/", "https://www.service-public.fr/"],
        "seo_title": "Chèque énergie : à quoi sert-il et comment l'utiliser ?",
        "seo_description": "Comprendre le chèque énergie, aide aux factures distincte des aides aux travaux, "
                           "et l'utiliser sans risque via le service officiel.",
    },
    {
        "slug": "isolation-combles-preparer-son-projet",
        "title": "Isolation des combles : préparer son projet étape par étape",
        "category": "travaux",
        "status": "draft",
        "image_url": "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "excerpt": "Diagnostic, choix des matériaux, artisans RGE : les étapes pour préparer "
                   "un projet d'isolation des combles, à publier une fois les montants vérifiés.",
        "content": ("La toiture est le premier poste de déperdition de chaleur d'une maison mal isolée. "
                    "Isoler les combles est souvent l'un des travaux les plus rentables d'un projet de "
                    "rénovation énergétique.\n\n"
                    "## Commencer par un diagnostic\n\n"
                    "Avant tout devis, un diagnostic permet d'évaluer les déperditions, l'état de la "
                    "charpente et de la ventilation. C'est ce diagnostic qui déterminera l'épaisseur et la "
                    "nature de l'isolant à poser.\n\n"
                    "## Choisir des artisans certifiés\n\n"
                    "Les aides publiques aux travaux exigent des professionnels certifiés RGE. Demandez "
                    "plusieurs devis comparatifs et vérifiez la certification en cours de validité.\n\n"
                    "## Brouillon — à compléter avant publication\n\n"
                    "Cet article reste en brouillon : les montants d'aides et références réglementaires "
                    "doivent être vérifiés et datés avant publication."),
        "source_urls": ["https://www.france-renov.gouv.fr/"],
        "seo_title": "Isolation des combles : préparer son projet étape par étape",
        "seo_description": "Les étapes pour préparer un projet d'isolation des combles : diagnostic, "
                           "matériaux, artisans certifiés.",
    },
]


async def seed(db, admin_email: str, admin_password: str):
    from models import new_id

    # Admin (playbook : crée si absent, resynchronise le hash si le mot de passe .env change)
    existing_admin = await db.admin_profiles.find_one({"email": admin_email})
    if existing_admin is None:
        import bcrypt
        hashed = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        await db.admin_profiles.insert_one({
            "_id": new_id(), "email": admin_email, "password_hash": hashed,
            "name": "Administrateur", "role": "admin", "created_at": now_iso(),
        })
        logger.info("Admin seedé : %s", admin_email)
    else:
        import bcrypt
        if not bcrypt.checkpw(admin_password.encode("utf-8"), existing_admin["password_hash"].encode("utf-8")):
            hashed = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            await db.admin_profiles.update_one({"_id": existing_admin["_id"]},
                                               {"$set": {"password_hash": hashed, "updated_at": now_iso()}})

    # Indexes
    await db.leads.create_index("reference", unique=True)
    await db.leads.create_index("created_at")
    await db.leads.create_index("status_admin")
    await db.articles.create_index("slug", unique=True)
    await db.contact_messages.create_index("created_at")
    await db.integration_events.create_index("created_at")
    await db.audit_log.create_index("created_at")
    await db.login_attempts.create_index("identifier")
    await db.qualification_rules.create_index("version")

    # Partenaire destinataire (raison sociale fournie par l'exploitant)
    if not await db.partners.find_one({"raison_sociale": {"$ne": None}}):
        await db.partners.insert_one({
            "_id": new_id(), "raison_sociale": "Holding SMIE",
            "contact_email": "demandes@aidesenergiefrance.fr",
            "active": True,
            "note": "Destinataire des dossiers configuré par l'exploitant.",
            "created_at": now_iso(),
        })

    # Règles de qualification versionnées
    if not await db.qualification_rules.find_one({"key": "ssc"}):
        doc = dict(rules_mod.DEFAULT_RULES)
        doc["updated_at"] = now_iso()
        await db.qualification_rules.insert_one(doc)

    # Version de consentement
    if not await db.consent_versions.find_one({"version": CONSENT_V1["version"]}):
        await db.consent_versions.insert_one(dict(CONSENT_V1))

    # Catégories
    for cat in CATEGORIES:
        if not await db.article_categories.find_one({"slug": cat}):
            await db.article_categories.insert_one({"_id": new_id(), "slug": cat, "label": cat.capitalize()})

    # Articles
    for art in ARTICLES:
        if not await db.articles.find_one({"slug": art["slug"]}):
            doc = {**art, "_id": new_id(), "author": "Rédaction Aides Énergie France",
                   "published_at": art.get("published_at") or "2025-11-12T09:00:00+00:00",
                   "updated_at": now_iso()}
            await db.articles.insert_one(doc)

    logger.info("Seed terminé.")
