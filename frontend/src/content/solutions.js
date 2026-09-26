export const SOLUTIONS = [
  {
    slug: "solaire-thermique",
    title: "Solaire thermique",
    tagline: "Captez la chaleur du soleil pour votre eau chaude",
    image: "https://images.unsplash.com/photo-1655300283247-6b1924b1d152?crop=entropy&cs=srgb&fm=jpg&q=85",
    fonctionnement: [
      "Des capteurs thermiques posés en toiture absorbent le rayonnement du soleil.",
      "Un circuit caloporteur transfère cette chaleur vers un ballon de stockage.",
      "L'énergie solaire chauffe l'eau chaude sanitaire, avec un appoint qui prend le relais quand le soleil ne suffit pas.",
    ],
    pourQui: [
      "Propriétaires d'une maison individuelle avec toiture exploitable",
      "Foyers souhaitant réduire la part d'énergie fossile consacrée à l'eau chaude",
      "Logements avec une consommation d'eau chaude régulière tout au long de l'année",
    ],
    vigilance: [
      "L'appoint reste indispensable en hiver et par temps couvert",
      "L'état de la toiture doit être vérifié avant installation",
      "Le dimensionnement du ballon doit suivre la taille du foyer",
    ],
    faq: [
      { q: "Quel entretien prévoir ?", a: "Un contrôle annuel du circuit et de l'appoint est recommandé ; la opération de maintenance est simple et encadrée par l'installateur." },
      { q: "Est-ce la même chose que le photovoltaïque ?", a: "Non : le thermique produit de la chaleur, le photovoltaïque de l'électricité." },
    ],
  },
  {
    slug: "systeme-solaire-combine",
    title: "Système solaire combiné (SSC)",
    tagline: "Le solaire qui chauffe la maison et l'eau sanitaire",
    image: "https://images.unsplash.com/flagged/photo-1566838616631-f2618f74a6a2?crop=entropy&cs=srgb&fm=jpg&q=85",
    fonctionnement: [
      "Des capteurs solaires couvrent une partie des besoins de chauffage et d'eau chaude sanitaire.",
      "La chaleur est stockée dans un ballon tampon puis diffusée par un plancher chauffant ou des émetteurs basse température.",
      "Un appoint (PAC, chaudière, électrique) complète la production solaire lorsque c'est nécessaire.",
    ],
    pourQui: [
      "Maisons individuelles avec une toiture bien exposée (sud de préférence, est/ouest possibles)",
      "Logements d'au moins 2 ans avec une surface de toiture exploitable d'au moins 16 m²",
      "Projets où un espace technique adapté existe (hauteur ≥ 2 m et accès de porte ≥ 70 cm)",
    ],
    vigilance: [
      "Une toiture uniquement orientée au nord n'offre pas un rendement satisfaisant",
      "Le dimensionnement doit être calculé selon le nombre d'occupants et la surface chauffée",
      "Les émetteurs en fonte demandent une étude au cas par cas",
    ],
    faq: [
      { q: "Le SSC remplace-t-il totalement mon chauffage ?", a: "Non : il couvre une partie des besoins avec un appoint. Le bon dimensionnement limite le recours à cet appoint." },
      { q: "Comment est déterminée la taille du système ?", a: "Selon le nombre d'occupants et la surface chauffée, dans la zone climatique du logement. Un pré-dimensionnement est proposé lors de l'étude gratuite, à confirmer par l'étude technique." },
    ],
  },
  {
    slug: "pompe-a-chaleur",
    title: "Pompe à chaleur air-eau",
    tagline: "Un chauffage efficient qui remplace la chaudière",
    image: "https://images.unsplash.com/photo-1776860150272-653efc74193c?crop=entropy&cs=srgb&fm=jpg&q=85",
    fonctionnement: [
      "L'unité extérieure prélève les calories de l'air ambiant.",
      "La chaleur est transférée au circuit d'eau qui alimente radiateurs ou plancher chauffant.",
      "Elle fournit aussi l'eau chaude sanitaire selon la configuration retenue.",
    ],
    pourQui: [
      "Propriétaires souhaitant remplacer une chaudière gaz ou fioul",
      "Logements disposant d'un emplacement extérieur pour l'unité",
      "Maisons dont les émetteurs sont compatibles ou adaptables",
    ],
    vigilance: [
      "Un mauvais dimensionnement dégrade le confort et la durée de vie du matériel",
      "Les radiateurs en fonte doivent être évalués au cas par cas",
      "Le bruit et l'emplacement de l'unité extérieure se choisissent avec soin",
    ],
    faq: [
      { q: "Une PAC fonctionne-t-elle en hiver ?", a: "Oui, jusqu'à des températures très basses ; un appoint peut prendre le relais lors des froids les plus intenses." },
      { q: "Faut-il changer mes radiateurs ?", a: "Pas forcément : l'étude vérifie leur compatibilité avec un fonctionnement basse température." },
    ],
  },
  {
    slug: "pac-solaire-thermique",
    title: "PAC + solaire thermique",
    tagline: "La combinaison qui réduit l'appoint",
    image: "https://images.unsplash.com/photo-1614636935264-1f15247173a5?crop=entropy&cs=srgb&fm=jpg&q=85",
    fonctionnement: [
      "La pompe à chaleur assure le chauffage principal du logement.",
      "Les capteurs solaires thermiques contribuent à l'eau chaude sanitaire et soutiennent le chauffage.",
      "La combinaison réduit la consommation de l'appoint par rapport à chaque solution seule.",
    ],
    pourQui: [
      "Maisons individuelles remplaçant une chaudière, avec toiture exploitable",
      "Foyers cherchant à réduire durablement la facture de chauffage et d'eau chaude",
      "Projets validés par une étude technique complète",
    ],
    vigilance: [
      "Projet plus complexe : deux technologies à dimensionner ensemble",
      "Investissement initial supérieur, à mettre en regard des économies visées",
      "Nécessite une toiture exploitable et un espace technique adapté",
    ],
    faq: [
      { q: "Pourquoi associer les deux ?", a: "La PAC couvre le chauffage, le solaire soutient l'eau chaude : la combinaison vise à minimiser l'appoint, surtout hors période de chauffage." },
      { q: "Ce projet donne-t-il droit à des aides ?", a: "Les deux équipements peuvent être concernés par les dispositifs d'aides aux travaux, selon les barèmes en vigueur. Vérifiez chaque dispositif avant de signer vos devis." },
    ],
  },
  {
    slug: "isolation",
    title: "Isolation",
    tagline: "Réduire d'abord les besoins, avant de produire autrement",
    image: "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?crop=entropy&cs=srgb&fm=jpg&q=85",
    fonctionnement: [
      "Les travaux d'isolation (combles, murs, planchers) réduisent les déperditions de chaleur.",
      "Moins de besoins de chauffage : les équipements peuvent être mieux dimensionnés.",
      "L'isolation des combles est souvent le premier poste à traiter.",
    ],
    pourQui: [
      "Maisons construites avant les exigences thermiques récentes",
      "Logements dont les combles ne sont pas ou peu isolés",
      "Projets de rénovation pensés globalement",
    ],
    vigilance: [
      "Une bonne ventilation doit accompagner l'isolation pour préserver la qualité de l'air",
      "La performance dépend autant de la pose que du matériau",
      "Faites appel à des professionnels certifiés RGE",
    ],
    faq: [
      { q: "Par où commencer ?", a: "Par un diagnostic : il identifie les déperditions prioritaires et évite les travaux mal ciblés." },
      { q: "L'isolation donne-t-elle droit à des aides ?", a: "Oui, plusieurs dispositifs soutiennent l'isolation, avec des conditions propres à chacun. Consultez France Rénov' pour les barèmes à jour." },
    ],
  },
  {
    slug: "chauffage",
    title: "Chauffage",
    tagline: "Choisir le bon système pour son logement",
    image: "https://images.unsplash.com/flagged/photo-1566838803980-56bfa5300e8c?crop=entropy&cs=srgb&fm=jpg&q=85",
    fonctionnement: [
      "Le choix du chauffage dépend du bâti, des émetteurs existants et du profil d'occupation.",
      "Les systèmes efficients (PAC, solaire thermique associé) réduisent la consommation d'énergie fossile.",
      "Un projet cohérent commence par limiter les besoins (isolation) puis choisit l'équipement adapté.",
    ],
    pourQui: [
      "Propriétaires dont le système de chauffage est en fin de vie",
      "Foyers chauffant au fioul ou au gaz souhaitant changer d'énergie",
      "Projets de rénovation d'ensemble",
    ],
    vigilance: [
      "Ne changez pas d'équipement sans étude de dimensionnement",
      "Vérifiez la compatibilité de vos émetteurs actuels",
      "Attention aux démarchages promettant des travaux « gratuits »",
    ],
    faq: [
      { q: "Quelle est la première étape ?", a: "Une étude du logement : besoins, émetteurs, espace technique. C'est la base d'un devis sérieux." },
      { q: "Faut-il isoler avant de changer de chauffage ?", a: "Souvent oui : réduire les besoins permet de dimensionner l'équipement au juste niveau." },
    ],
  },
];

export function findSolution(slug) {
  return SOLUTIONS.find((s) => s.slug === slug);
}
