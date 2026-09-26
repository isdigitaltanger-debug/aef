export const AIDS = [
  {
    slug: "maprimerenov",
    title: "MaPrimeRénov'",
    family: "Aides nationales",
    tagline: "L'aide publique de référence pour la rénovation énergétique",
    image: "https://images.unsplash.com/photo-1768321916128-c242ca443253?crop=entropy&cs=srgb&fm=jpg&q=85",
    intro:
      "MaPrimeRénov' est le dispositif public d'aide à la rénovation énergétique des logements. Elle finance des travaux performants réalisés par des professionnels certifiés, dans une logique de parcours : d'abord les gestes qui isolent, ensuite les systèmes de chauffage efficients.",
    conditions: [
      "Logement en France métropolitaine, occupé en résidence principale",
      "Propriétaire occupant ou propriétaire bailleur (conditions spécifiques)",
      "Logement construit depuis plus de 15 ans (2 ans en Outre-mer)",
      "Travaux réalisés par un professionnel certifié RGE",
      "Dépôt du dossier avant la signature des devis",
    ],
    demarches: [
      "Créez votre compte sur la plateforme officielle MaPrimeRénov'",
      "Simulez vos aides et préparez votre dossier",
      "Déposez votre demande avant de signer vos devis",
      "Recevez l'accord, faites réaliser les travaux par un artisan RGE",
      "L'aide est versée après les travaux, sur factures",
    ],
    sources: [
      { label: "France Rénov' — portail officiel", url: "https://www.france-renov.gouv.fr/" },
      { label: "Service-Public.fr — MaPrimeRénov'", url: "https://www.service-public.fr/particuliers/vosdroits/F32126" },
    ],
    faq: [
      { q: "MaPrimeRénov' couvre-t-elle un système solaire combiné ?", a: "Les équipements financés évoluent régulièrement. Le solaire thermique et la pompe à chaleur peuvent être concernés selon les barèmes en vigueur : vérifiez la liste des travaux aidés au moment de votre projet sur le site officiel." },
      { q: "Peut-on cumuler MaPrimeRénov' et les primes CEE ?", a: "Oui, certains cumuls sont possibles selon les dispositifs et les travaux. Chaque financeur applique ses propres règles : faites formaliser l'ensemble avant de signer vos devis." },
      { q: "L'aide est-elle garantie avant les travaux ?", a: "Aucune aide n'est acquise tant que la demande n'a pas reçu un accord officiel. Ne signez jamais de devis avant d'avoir déposé votre dossier." },
    ],
    lastChecked: null,
    cta: { label: "Je teste mon éligibilité en 2 minutes", to: "/simulation/" },
    related: [
      { to: "/solutions/pompe-a-chaleur/", label: "Pompe à chaleur : comment ça marche ?" },
      { to: "/aides/cee/", label: "Comprendre les primes CEE" },
    ],
  },
  {
    slug: "cee",
    title: "Primes CEE (certificats d'économies d'énergie)",
    family: "Aides nationales",
    tagline: "Les primes versées par les fournisseurs d'énergie",
    image: "https://images.unsplash.com/photo-1655300283247-6b1924b1d152?crop=entropy&cs=srgb&fm=jpg&q=85",
    intro:
      "Les certificats d'économies d'énergie (CEE) obligent les fournisseurs d'énergie à financer des travaux d'économies d'énergie chez les particuliers, sous forme de primes. Le solaire thermique et les systèmes solaires combinés en font partie, tout comme les pompes à chaleur et l'isolation.",
    conditions: [
      "Logement en France, la plupart des travaux concernent la résidence principale",
      "Travaux réalisés par un professionnel certifié RGE",
      "Demande déposée avant la signature du devis",
      "L'équipement doit répondre aux critères techniques du dispositif (ex. zone climatique pour le solaire thermique)",
    ],
    demarches: [
      "Choisissez un professionnel RGE partenaire d'un financeur CEE",
      "Déposez la demande de prime avant de signer le devis",
      "Faites réaliser les travaux",
      "Renvoyez les pièces justificatives pour déclencher le versement de la prime",
    ],
    sources: [
      { label: "France Rénov' — les CEE expliqués", url: "https://www.france-renov.gouv.fr/aides/les-certificats-economies-energie-646" },
      { label: "Ministère de la Transition écologique — dispositif CEE", url: "https://www.ecologie.gouv.fr/dispositif-des-certificats-leconomies-energie" },
    ],
    faq: [
      { q: "Qui verse la prime CEE ?", a: "Les fournisseurs d'énergie (électricité, gaz, chaleur) sont obligés de financer des économies d'énergie. Ce sont eux, ou leurs intermédiaires, qui versent les primes." },
      { q: "Le montant de la prime est-il fixe ?", a: "Non : il dépend du type d'équipement, de la zone climatique, du revenu du ménage et des barèmes en vigueur au moment des travaux. Aucun montant générique ne peut être promis à l'avance." },
      { q: "Le chèque énergie est-il une prime CEE ?", a: "Non : le chèque énergie est une aide au paiement des factures, financée par l'État, distincte des primes CEE." },
    ],
    lastChecked: null,
    cta: { label: "Je teste mon éligibilité en 2 minutes", to: "/simulation/" },
    related: [
      { to: "/solutions/systeme-solaire-combine/", label: "Le système solaire combiné (SSC)" },
      { to: "/aides/maprimerenov/", label: "MaPrimeRénov'" },
    ],
  },
  {
    slug: "solaire-thermique",
    title: "Aides pour le solaire thermique",
    family: "Aides nationales",
    tagline: "Chauffer eau et logement avec l'énergie du soleil",
    image: "https://images.unsplash.com/flagged/photo-1566838616631-f2618f74a6a2?crop=entropy&cs=srgb&fm=jpg&q=85",
    intro:
      "Le solaire thermique (chauffe-eau solaire individuel, système solaire combiné) est soutenu par plusieurs dispositifs cumulables selon les cas : primes CEE, aides locales, TVA réduite selon la situation. C'est le cœur de l'offre pour laquelle notre étude gratuite est conçue.",
    conditions: [
      "Maison individuelle avec toiture exploitable (orientation et surface suffisantes)",
      "Équipement certifié et installé par un professionnel RGE qualifié",
      "Pour les SSC : un besoin de chauffage compatible avec la production solaire",
      "Demandes d'aides déposées avant signature des devis",
    ],
    demarches: [
      "Vérifiez la compatibilité de votre toiture (orientation, surface, état)",
      "Réalisez une étude technique de votre projet",
      "Comparez les devis de professionnels RGE",
      "Déposez les demandes d'aides avant de signer",
    ],
    sources: [
      { label: "France Rénov' — solaire thermique", url: "https://www.france-renov.gouv.fr/" },
      { label: "ADEME — le solaire thermique", url: "https://www.ademe.fr/" },
    ],
    faq: [
      { q: "Le solaire thermique fonctionne-t-il par temps couvert ?", a: "Les capteurs produisent même par temps nuageux, avec un rendement moindre. Un appoint (électrique, gaz, pompe à chaleur) prend le relais quand la production solaire est insuffisante." },
      { q: "Quelle différence avec le solaire photovoltaïque ?", a: "Le solaire thermique produit de la chaleur (eau chaude, chauffage). Le photovoltaïque produit de l'électricité. Ce sont deux technologies différentes." },
      { q: "Quelle surface de toiture faut-il ?", a: "Pour un système solaire combiné, une surface exploitable d'au moins 16 m² est généralement nécessaire, hors toiture orientée uniquement au nord." },
    ],
    lastChecked: null,
    cta: { label: "Je teste mon éligibilité en 2 minutes", to: "/simulation/" },
    related: [
      { to: "/solutions/solaire-thermique/", label: "Le solaire thermique en détail" },
      { to: "/solutions/systeme-solaire-combine/", label: "Le système solaire combiné (SSC)" },
    ],
  },
  {
    slug: "pompe-a-chaleur",
    title: "Aides pour la pompe à chaleur",
    family: "Aides nationales",
    tagline: "Remplacer une vieille chaudière par un chauffage efficient",
    image: "https://images.unsplash.com/photo-1776860150272-653efc74193c?crop=entropy&cs=srgb&fm=jpg&q=85",
    intro:
      "La pompe à chaleur air-eau est l'un des principaux systèmes de chauffage soutenus par les dispositifs publics et les primes CEE. Elle s'installe en remplacement d'une chaudière gaz ou fioul et peut s'associer à un apport solaire thermique.",
    conditions: [
      "Logement ancien, occupé en résidence principale (pour les aides publiques principales)",
      "Étude de dimensionnement préalable",
      "Installation par un professionnel RGE",
      "Émetteurs compatibles (radiateurs basse température, plancher chauffant)",
    ],
    demarches: [
      "Faites réaliser une étude de dimensionnement",
      "Vérifiez l'état de vos émetteurs actuels",
      "Comparez plusieurs devis RGE",
      "Déposez les demandes d'aides avant signature des devis",
    ],
    sources: [
      { label: "France Rénov' — pompe à chaleur", url: "https://www.france-renov.gouv.fr/" },
      { label: "ADEME — pompes à chaleur", url: "https://www.ademe.fr/" },
    ],
    faq: [
      { q: "Peut-on associer une PAC à un système solaire combiné ?", a: "Oui : c'est la configuration dite PAC + SSC. Elle vise à réduire le recours à l'appoint. Sa pertinence se juge à l'étude, selon la toiture, la zone climatique et le chauffage existant." },
      { q: "Les radiateurs en fonte sont-ils compatibles ?", a: "Souvent oui, mais chaque cas s'étudie : leur volume permet parfois un fonctionnement basse température satisfaisant. Un professionnel doit les évaluer." },
      { q: "L'aide dépend-elle du revenu ?", a: "Pour MaPrimeRénov', oui : les montants varient selon les revenus du foyer. Les primes CEE ont aussi des barèmes spécifiques pour les ménages modestes." },
    ],
    lastChecked: null,
    cta: { label: "Je teste mon éligibilité en 2 minutes", to: "/simulation/" },
    related: [
      { to: "/solutions/pompe-a-chaleur/", label: "La pompe à chaleur air-eau" },
      { to: "/solutions/pac-solaire-thermique/", label: "La combinaison PAC + solaire thermique" },
    ],
  },
  {
    slug: "locales",
    title: "Les aides locales",
    family: "Aides locales",
    tagline: "Régions, départements, communautés de communes : une mosaïque d'aides",
    image: "https://images.unsplash.com/photo-1779777847968-6e6ee105dcbd?crop=entropy&cs=srgb&fm=jpg&q=85",
    intro:
      "En complément des aides nationales, de nombreuses collectivités locales proposent leurs propres dispositifs : primes territoriales, accompagnement gratuit, avances de trésorerie. Ces aides varient fortement d'un territoire à l'autre.",
    conditions: [
      "Résider sur le territoire de la collectivité qui porte l'aide",
      "Conditions propres à chaque dispositif (type de travaux, ressources…)",
      "La plupart exigent un professionnel RGE",
    ],
    demarches: [
      "Contactez votre mairie ou votre conseiller France Rénov' local",
      "Consultez le site de votre région et département",
      "Vérifiez le cumul possible avec MaPrimeRénov' et les CEE",
    ],
    sources: [
      { label: "France Rénov' — trouver son conseiller local", url: "https://www.france-renov.gouv.fr/" },
      { label: "Service-Public.fr — votre collectivité", url: "https://lannulairentreprise.service-public.fr/" },
    ],
    faq: [
      { q: "Comment connaître les aides dans ma commune ?", a: "Le conseiller France Rénov' de votre territoire recense les dispositifs locaux. Les sites de la région, du département et de l'intercommunalité publient aussi leurs aides." },
      { q: "Se cumulent-elles avec les aides nationales ?", a: "Souvent oui, dans la limite de certains plafonds. Chaque dispositif précise ses règles de cumul." },
    ],
    lastChecked: null,
    cta: { label: "Je teste mon éligibilité en 2 minutes", to: "/simulation/" },
    related: [
      { to: "/aides/maprimerenov/", label: "MaPrimeRénov'" },
      { to: "/contact/", label: "Nous poser une question" },
    ],
  },
  {
    slug: "cheque-energie",
    title: "Le chèque énergie",
    family: "Aide aux factures",
    tagline: "Une aide aux factures, distincte des aides aux travaux",
    image: "https://images.unsplash.com/photo-1566838803980-56bfa5300e8c?crop=entropy&cs=srgb&fm=jpg&q=85",
    intro:
      "Le chèque énergie est une aide de l'État destinée aux ménages pour régler leurs factures d'énergie. Il est envoyé automatiquement aux foyers éligibles. Il ne s'agit pas d'une aide aux travaux : elle ne passe par aucune plateforme privée, y compris la nôtre.",
    conditions: [
      "Être destinataire de la prime d'activité ou souscrire à certaines conditions de ressources",
      "Le chèque est envoyé automatiquement par l'administration — aucune démarche à faire",
      "Chaque chèque porte un numéro unique et une date de validité",
    ],
    demarches: [
      "Aucune démarche pour le recevoir : il est envoyé au domicile",
      "Utilisez-le auprès des fournisseurs et sites partenaires officiels",
      "En cas de doute, consultez uniquement le site officiel",
    ],
    sources: [
      { label: "Service officiel du chèque énergie", url: "https://www.chequeenergie.gouv.fr/" },
      { label: "Service-Public.fr — chèque énergie", url: "https://www.service-public.fr/particuliers/vosdroits/F32393" },
    ],
    faq: [
      { q: "Dois-je m'inscrire pour recevoir le chèque énergie ?", a: "Non. Le chèque énergie est envoyé automatiquement. Méfiez-vous de tout site qui demande vos coordonnées pour « obtenir » un chèque : seul le site officiel fait foi." },
      { q: "Peut-il payer des travaux de rénovation ?", a: "Le chèque énergie sert d'abord aux factures ; son usage pour certains travaux est possible dans des cas précis définis par l'administration. Consultez le site officiel." },
      { q: "Ce site peut-il m'aider à obtenir le chèque énergie ?", a: "Non : notre plateforme ne collecte aucune demande de chèque énergie. C'est une aide automatique gérée par l'État, distincte des aides aux travaux que nous vous aidons à préparer." },
    ],
    lastChecked: null,
    cta: null,
    official: { label: "Accéder au site officiel du chèque énergie", url: "https://www.chequeenergie.gouv.fr/" },
    related: [
      { to: "/aides/maprimerenov/", label: "Les aides aux travaux (MaPrimeRénov')" },
      { to: "/actualites/cheque-energie-a-quoi-sert-il/", label: "Notre guide du chèque énergie" },
    ],
  },
];

export function findAide(slug) {
  return AIDS.find((a) => a.slug === slug);
}
