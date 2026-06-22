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
  category: 'visage' | 'corps' | 'techniques'
}

export const SERVICE_PAGES: ServicePageContent[] = [
  {
    slug: 'facial-aesthetics',
    navLabel: 'Facial Aesthetics',
    title: 'Facial Aesthetics',
    eyebrow: 'Visage',
    heroDescription: 'Dévoilez la beauté naturelle de votre peau grâce à nos soins dermatologiques innovants. Des technologies de pointe pour révéler l\'éclat de votre visage.',
    image: '/services/facial.jpg',
    intro: 'Nos soins du visage combinent technologies avancées et expertise médicale pour traiter les rides, les taches, le relâchement cutané et améliorer l\'éclat de votre peau.',
    highlights: ['Rides et ridules', 'Taches pigmentaires', 'Relâchement cutané', 'Éclat du teint', 'Rajeunissement'],
    sections: [
      { title: 'Consultation personnalisée', body: 'Chaque traitement commence par un diagnostic précis de votre peau. Nous analysons vos besoins et établissons un plan sur mesure pour des résultats naturels et durables.' },
      { title: 'Technologies avancées', body: 'Nous utilisons des équipements de dernière génération : laser fractionné, radiofréquence, ultrasons, peelings et bien plus, pour des résultats optimaux avec un minimum de temps d\'arrêt.' },
    ],
    category: 'visage',
  },
  {
    slug: 'lip-aesthetics',
    navLabel: 'Esthétique des lèvres',
    title: 'Esthétique des lèvres',
    eyebrow: 'Visage',
    heroDescription: 'Redessinez vos lèvres avec des injections d\'acide hyaluronique pour un résultat harmonieux, naturel et sur mesure.',
    image: '/services/lip.jpg',
    intro: 'L\'esthétique des lèvres permet de corriger les volumes, redessiner le contour et hydrater en profondeur pour des lèvres plus pulpeuses et rajeunies.',
    highlights: ['Volume des lèvres', 'Redéfinition du contour', 'Hydratation profonde', 'Correction des asymétries', 'Rajeunissement du sourire'],
    sections: [
      { title: 'Injection d\'acide hyaluronique', body: 'L\'acide hyaluronique est le produit de référence pour augmenter le volume des lèvres tout en préservant un résultat naturel. Le dosage est adapté à votre morphologie.' },
      { title: 'Suivi personnalisé', body: 'Nous vous accompagnons avant et après le soin pour garantir votre satisfaction. Des séances de suivi sont proposées pour ajuster le résultat si nécessaire.' },
    ],
    category: 'visage',
  },
  {
    slug: 'eye-aesthetics',
    navLabel: 'Esthétique de l\'œil',
    title: 'Esthétique de l\'œil',
    eyebrow: 'Visage',
    heroDescription: 'Rajeunissez votre regard avec nos traitements non-invasifs : paupières tombantes, poches sous les yeux, rides de la patte d\'oie.',
    image: '/services/eye.jpg',
    intro: 'Le regard est le premier signe de vieillissement. Nos solutions ciblées permettent de retrouver un regard frais et reposé sans chirurgie.',
    highlights: ['Paupières tombantes', 'Poches sous les yeux', 'Rides de la patte d\'oie', 'Cernes', 'Rajeunissement du regard'],
    sections: [
      { title: 'Traitements non-invasifs', body: 'Radiofréquence micro-needling, lasers et injections ciblées permettent de traiter le contour de l\'œil avec précision et sans cicatrice.' },
      { title: 'Résultats naturels', body: 'Notre approche privilégie la subtilité et l\'harmonie. Chaque traitement est adapté à l\'anatomie unique de votre visage.' },
    ],
    category: 'visage',
  },
  {
    slug: 'eyebrow-aesthetics',
    navLabel: 'Esthétique des sourcils',
    title: 'Esthétique des sourcils',
    eyebrow: 'Visage',
    heroDescription: 'Des sourcils parfaitement dessinés qui encadrent votre regard et subliment vos traits.',
    image: '/services/eyebrow.jpg',
    intro: 'L\'esthétique des sourcils redessine l\'arcade sourcilière pour un regard plus expressif et harmonieux.',
    highlights: ['Redessin des sourcils', 'Volume et densité', 'Correction des asymétries', 'Rajeunissement', 'Harmonie du visage'],
    sections: [
      { title: 'Techniques adaptées', body: 'Microblading, maquillage semi-permanent ou injections : nous choisissons la technique la mieux adaptée à vos attentes et à votre type de peau.' },
      { title: 'Résultat sur mesure', body: 'Chaque visage est unique. Nous prenons le temps d\'étudier vos proportions pour créer des sourcils qui vous ressemblent.' },
    ],
    category: 'visage',
  },
  {
    slug: 'body-aesthetics',
    navLabel: 'Body Aesthetics',
    title: 'Body Aesthetics',
    eyebrow: 'Corps',
    heroDescription: 'Redessinez votre silhouette avec nos traitements de body contouring non-invasifs et nos programmes silhouette.',
    image: '/services/body.jpg',
    intro: 'Nos protocoles de remodelage corporel combinent plusieurs technologies pour traiter la cellulite, le relâchement cutané et les bourrelets graisseux.',
    highlights: ['Remodelage corporel', 'Traitement de la cellulite', 'Raffermissement cutané', 'Réduction des bourrelets', 'Programmes silhouette'],
    sections: [
      { title: 'Technologies combinées', body: 'Cryolipolyse, radiofréquence, ondes de choc et ultrasons sont associés pour un traitement complet et personnalisé de votre silhouette.' },
      { title: 'Suivi et résultats', body: 'Nos programmes sont conçus avec un suivi régulier pour mesurer les progrès et adapter le protocole à votre évolution.' },
    ],
    category: 'corps',
  },
  {
    slug: 'breast-aesthetics',
    navLabel: 'Breast Aesthetics',
    title: 'Breast Aesthetics',
    eyebrow: 'Corps',
    heroDescription: 'Augmentation mammaire et lifting des seins pour retrouver une poitrine ferme et harmonieuse.',
    image: '/services/breast.jpg',
    intro: 'L\'esthétique mammaire regroupe les techniques d\'augmentation, de lifting et de réduction pour une poitrine en harmonie avec votre morphologie.',
    highlights: ['Augmentation mammaire', 'Lifting des seins', 'Réduction mammaire', 'Correction des asymétries', 'Résultats naturels'],
    sections: [
      { title: 'Consultation pré-opératoire', body: 'Une évaluation complète de votre morphologie et de vos attentes permet de définir le traitement le plus adapté pour un résultat harmonieux.' },
      { title: 'Techniques personnalisées', body: 'Chaque intervention est unique. Nous utilisons des techniques avancées pour minimiser les cicatrices et optimiser les résultats.' },
    ],
    category: 'corps',
  },
  {
    slug: 'butt-aesthetics',
    navLabel: 'Butt Aesthetics',
    title: 'Butt & BBL Aesthetics',
    eyebrow: 'Corps',
    heroDescription: 'Le Brazilian Butt Lift (BBL) pour des fesses galbées et harmonieuses grâce à votre propre graisse.',
    image: '/services/butt.jpg',
    intro: 'Le BBL est une technique de lipogreffe qui utilise votre propre graisse pour remodeler et augmenter le volume des fesses de manière naturelle.',
    highlights: ['Brazilian Butt Lift', 'Lipogreffe', 'Augmentation des fesses', 'Remodelage harmonieux', 'Résultats durables'],
    sections: [
      { title: 'La technique BBL', body: 'La graisse est prélevée par liposuccion douce sur les zones excédentaires (abdomen, cuisses) puis réinjectée dans les fesses pour un galbe naturel.' },
      { title: 'Résultats naturels', body: 'L\'utilisation de votre propre graisse garantit un résultat à la fois naturel et durable, sans risque de rejet. Le suivi post-opératoire est essentiel.' },
    ],
    category: 'corps',
  },
  {
    slug: 'arm-aesthetics',
    navLabel: 'Arm Aesthetics',
    title: 'Arm Aesthetics',
    eyebrow: 'Corps',
    heroDescription: 'Retrouvez des bras fermes et toniques avec nos traitements de raffermissement et liposuccion des bras.',
    image: '/services/arm.jpg',
    intro: 'Le relâchement des bras et l\'excès de graisse peuvent être traités par des techniques ciblées pour des bras plus fermes et harmonieux.',
    highlights: ['Liposuccion des bras', 'Raffermissement cutané', 'Brachioplastie', 'Traitement du relâchement', 'Tonicité'],
    sections: [
      { title: 'Liposuccion des bras', body: 'La liposuccion des bras permet de retirer l\'excès de graisse localisé pour redessiner le contour du bras.' },
      { title: 'Raffermissement', body: 'En complément, des techniques de raffermissement cutané (radiofréquence, laser) aident à resserrer la peau pour un résultat optimal.' },
    ],
    category: 'corps',
  },
  {
    slug: 'liposuction',
    navLabel: 'Liposuccion',
    title: 'Liposuccion',
    eyebrow: 'Corps',
    heroDescription: 'La liposuccion pour éliminer les excès de graisse localisés et retrouver une silhouette harmonieuse.',
    image: '/services/liposuction.jpg',
    intro: 'La liposuccion est une intervention chirurgicale qui retire les amas graisseux résistants au régime et au sport, pour un corps mieux dessiné.',
    highlights: ['Liposuccion classique', 'Vaser liposuccion', 'Traitement ciblé', 'Résultats durables', 'Reprise rapide'],
    sections: [
      { title: 'Techniques de liposuccion', body: 'Liposuccion classique, Vaser ou laser : nous choisissons la technique la mieux adaptée à votre cas pour des résultats optimaux.' },
      { title: 'Zones traitables', body: 'Abdomen, cuisses, hanches, dos, bras, genoux, menton : la liposuccion peut traiter de nombreuses zones du corps.' },
    ],
    category: 'corps',
  },
  {
    slug: 'vaser-liposuction',
    navLabel: 'Vaser Liposuccion',
    title: 'Vaser Liposuccion',
    eyebrow: 'Corps',
    heroDescription: 'La Vaser liposuccion, une technique de liposuccion assistée par ultrasons pour un résultat plus doux et précis.',
    image: '/services/vaser.jpg',
    intro: 'La Vaser liposuccion utilise les ultrasons pour fragmenter la graisse avant de l\'aspirer, permettant un traitement plus précis et une récupération plus rapide.',
    highlights: ['Ultrasons ciblés', 'Précision chirurgicale', 'Récupération rapide', 'Moins invasif', 'Résultats naturels'],
    sections: [
      { title: 'Technologie Vaser', body: 'Les ultrasons sélectionnent et fragmentent uniquement les cellules graisseuses, préservant les tissus environnants pour moins d\'ecchymoses et de douleur.' },
      { title: 'Zones éligibles', body: 'La Vaser liposuccion est particulièrement adaptée aux zones difficiles comme l\'abdomen, les cuisses, les bras et le dos.' },
    ],
    category: 'corps',
  },
  {
    slug: 'epilation-laser',
    navLabel: 'Épilation laser',
    title: 'Épilation laser',
    eyebrow: 'Corps',
    heroDescription: 'L\'épilation laser définitive pour une peau douce et sans poils. Une solution durable pour toutes les zones du corps et du visage.',
    image: '/services/epilation.jpg',
    intro: 'L\'épilation laser est une méthode définitive d\'élimination des poils. Rapide, efficace et sécurisée, elle convient à toutes les zones et tous les phototypes.',
    highlights: ['Épilation définitive', 'Toutes zones', 'Tous phototypes', 'Résultats durables', 'Séances rapides'],
    sections: [
      { title: 'Comment ça marche ?', body: 'Le laser émet une lumière ciblée qui est absorbée par la mélanine du poil. La chaleur détruit le bulbe sans endommager la peau environnante.' },
      { title: 'Nombre de séances', body: 'Le nombre de séances varie selon la zone et votre type de poils. En moyenne, 6 à 8 séances espacées de 4 à 6 semaines sont nécessaires.' },
    ],
    category: 'corps',
  },
  {
    slug: 'consultation',
    navLabel: 'Consultation',
    title: 'Consultation',
    eyebrow: 'Diagnostic',
    heroDescription: 'Une consultation personnalisée pour établir un diagnostic précis et construire le parcours de soin le plus cohérent avec votre situation.',
    image: '/services/consultation.jpg',
    intro: 'La consultation permet d\'établir un diagnostic précis, de comprendre votre besoin réel et de construire le parcours de soin le plus cohérent avec votre situation.',
    highlights: ['Consultation personnalisée', 'Diagnostic précis', 'Plan de traitement', 'Visio-consultation', 'Suivi personnalisé'],
    sections: [
      { title: 'Consultation en présentiel', body: 'Une première lecture complète de la peau et des préoccupations du patient pour déterminer la meilleure stratégie thérapeutique ou esthétique.' },
      { title: 'Visio-consultation', body: 'Une solution pratique pour réduire les délais d\'attente. Envoyez vos photos et nous vous conseillons à distance.' },
    ],
    category: 'visage',
  },
]

export function getServicePage(slug: string) {
  return SERVICE_PAGES.find((item) => item.slug === slug)
}

export const MEGA_CATEGORIES = [
  { slug: 'visage', label: 'Visage', items: SERVICE_PAGES.filter(p => p.category === 'visage').map(p => ({ label: p.title, href: `/services/${p.slug}`, icon: '' })) },
  { slug: 'corps', label: 'Corps', items: SERVICE_PAGES.filter(p => p.category === 'corps').map(p => ({ label: p.title, href: `/services/${p.slug}`, icon: '' })) },
  { slug: 'techniques', label: 'Techniques', items: [] },
] as const
