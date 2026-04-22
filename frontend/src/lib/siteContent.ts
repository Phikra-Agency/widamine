export type ServicePageContent = {
  slug: string
  navLabel: string
  title: string
  eyebrow: string
  heroDescription: string
  image: string
  intro: string
  highlights: string[]
  sections: { title: string; body: string }[]
}

export const SERVICE_PAGES: ServicePageContent[] = [
  {
    slug: 'consultation',
    navLabel: 'Consultation',
    title: 'Consultation',
    eyebrow: 'Diagnostic',
    heroDescription:
      'Consultation générale et urgence dermatologique dans une prise en charge claire, réactive et personnalisée.',
    image: '/hero.png',
    intro:
      'La consultation permet d’établir un diagnostic précis, de comprendre votre besoin réel et de construire le parcours de soin le plus cohérent avec votre situation.',
    highlights: ['Consultation générale', 'Urgence dermatologique', 'Orientation thérapeutique', 'Plan de traitement personnalisé'],
    sections: [
      {
        title: 'Consultation générale',
        body: 'Une première lecture complète de la peau, des préoccupations du patient et de la meilleure stratégie thérapeutique ou esthétique à envisager.',
      },
      {
        title: 'Urgence dermatologique',
        body: 'Une réponse rapide pour les situations qui nécessitent un avis spécialisé et une prise en charge structurée sans délai inutile.',
      },
    ],
  },
  {
    slug: 'dermatologie-esthetique',
    navLabel: 'Dermatologie esthétique',
    title: 'Dermatologie esthétique',
    eyebrow: 'Esthétique médicale',
    heroDescription:
      'Injections, peeling, anti-âge et soins du visage portés par une lecture médicale précise et des résultats naturels.',
    image: '/page-header.jpg',
    intro:
      'La dermatologie esthétique chez Widamine repose sur une approche mesurée, où chaque geste vise à révéler, corriger ou harmoniser sans alourdir le visage.',
    highlights: ['Botox', 'Acide hyaluronique', 'Peeling', 'Traitement anti-âge', 'Soins du visage'],
    sections: [
      {
        title: 'Injections',
        body: 'Botox et acide hyaluronique sont utilisés selon l’indication, la morphologie et l’objectif recherché, avec une recherche constante de naturel.',
      },
      {
        title: 'Peeling et qualité de peau',
        body: 'Les peelings et protocoles de soin du visage sont choisis pour améliorer l’éclat, la texture, l’uniformité et la vitalité globale de la peau.',
      },
    ],
  },
  {
    slug: 'seances-laser',
    navLabel: 'Séances laser',
    title: 'Séances laser',
    eyebrow: 'Technologies',
    heroDescription:
      'Des protocoles laser ajustés à l’indication, à la peau et à l’objectif thérapeutique ou esthétique du patient.',
    image: '/page-header.jpg',
    intro:
      'Les séances laser sont pensées comme des traitements ciblés, progressifs et personnalisés, avec une vraie lecture de la peau avant chaque indication.',
    highlights: ['Épilation laser', 'Traitement des taches', 'Cicatrices / acné', 'Détatouage'],
    sections: [
      {
        title: 'Épilation et taches',
        body: 'Une stratégie adaptée à la zone, au phototype et au comportement pilaire ou pigmentaire pour une prise en charge efficace et cohérente.',
      },
      {
        title: 'Cicatrices, acné et détatouage',
        body: 'Des indications techniques qui nécessitent un suivi sérieux, une régularité dans le protocole et une adaptation fine au profil du patient.',
      },
    ],
  },
  {
    slug: 'amincissement-remodelage',
    navLabel: 'Amincissement & remodelage',
    title: 'Amincissement & remodelage',
    eyebrow: 'Silhouette',
    heroDescription:
      'Des packs silhouette multi-machines pour le renforcement musculaire, le raffermissement, la cellulite et le body contouring.',
    image: '/services/service_1.png',
    intro:
      'Cette famille de programmes regroupe les protocoles à volume élevé, pensés pour agir sur la silhouette, la tonicité cutanée et le remodelage corporel.',
    highlights: ['Renforcement musculaire', 'Raffermissement de peau', 'Cellulite', 'Body contouring', 'Forfaits I Model'],
    sections: [
      {
        title: 'Packs signature',
        body: 'Les packs combinent I Model, Stimsure, Diasculpt, Tempsure Firm, EMS, ondes de choc, lifting colombien ou drainage dans des protocoles intensifs.',
      },
      {
        title: 'Forfaits modulables',
        body: 'Le patient peut aussi s’orienter vers des forfaits ciblés comme I Model seul, selon le besoin, le rythme et l’objectif de transformation.',
      },
    ],
  },
  {
    slug: 'soins-therapeutiques-post-operatoires',
    navLabel: 'Post-op & thérapeutique',
    title: 'Soins thérapeutiques & post-opératoires',
    eyebrow: 'Suivi',
    heroDescription:
      'Des parcours avec intervalles stricts pour le post-opératoire, la rééducation ciblée et certaines indications thérapeutiques.',
    image: '/services/service_1.png',
    intro:
      'Ces protocoles exigent une organisation précise dans le temps. Le calendrier et la régularité de suivi sont essentiels à leur efficacité.',
    highlights: ['Liposuccion post-op', 'Abdominoplastie post-op', 'Tendinite', 'Fasciite plantaire', 'Kiné sportive'],
    sections: [
      {
        title: 'Post-opératoire',
        body: 'Liposuccion et abdominoplastie demandent des rythmes de séances stricts, avec drainage, LED et accompagnement dès les premiers jours.',
      },
      {
        title: 'Thérapeutique ciblée',
        body: 'Tendinite, fasciite plantaire, déchirures, transit intestinal ou kiné sportive s’inscrivent dans des fréquences précises, définies selon l’indication.',
      },
    ],
  },
  {
    slug: 'soins-visage-esthetique',
    navLabel: 'Soins visage & esthétique',
    title: 'Soins visage & esthétique',
    eyebrow: 'Visage',
    heroDescription:
      'Une offre orientée visage entre séances unitaires, cures Iface Esthetic, injections et indications évolutives.',
    image: '/hero.png',
    intro:
      'Cette catégorie regroupe les soins du visage, les traitements esthétiques et les cures qui peuvent être proposées en séance unique ou en protocole suivi.',
    highlights: ['Pack Iface Esthetic', 'Botox', 'Acide hyaluronique', 'Skinbooster', 'Épilation laser selon besoin'],
    sections: [
      {
        title: 'Cures et séances unitaires',
        body: 'Le pack Iface Esthetic peut être envisagé en séance simple ou en cure de 12 séances selon l’objectif recherché.',
      },
      {
        title: 'Traitements évolutifs',
        body: 'Les injections et l’épilation laser ne répondent pas à un nombre fixe de séances : elles s’adaptent au besoin réel, à la zone et à la réponse clinique.',
      },
    ],
  },
]

export function getServicePage(slug: string) {
  return SERVICE_PAGES.find((item) => item.slug === slug)
}
