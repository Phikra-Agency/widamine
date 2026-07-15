export type ServicePageContent = {
  slug: string
  navLabel: string
  title: string
  eyebrow: string
  heroDescription: string
  image: string
  color: string
  intro: string
  highlights: string[]
  contraindications: string
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
    color: '#14B8A6',
    intro: 'Nos soins du visage combinent technologies avancées et expertise médicale pour traiter les rides, les taches, le relâchement cutané et améliorer l\'éclat de votre peau.',
    highlights: ['Rides et ridules', 'Taches pigmentaires', 'Relâchement cutané', 'Éclat du teint', 'Rajeunissement'],
    contraindications: 'Peau très bronzée, infection cutanée active, grossesse, allergie connue aux produits utilisés.',
    sections: [
      { title: 'Que faire ?', body: 'Les signes de l\'âge, les taches pigmentaires et le relâchement cutané peuvent être traités efficacement grâce à nos technologies de pointe. Chaque peau est unique et mérite une approche personnalisée. Nos dermatologues établissent un diagnostic précis de votre peau avant de recommander le protocole le plus adapté.' },
      { title: 'Préparation avant la séance', body: 'Avant votre séance, évitez l\'exposition au soleil et l\'auto-bronzant pendant au moins deux semaines. Suspendez l\'utilisation de rétinoïdes et d\'acides exfoliants quelques jours avant le traitement. Venez avec une peau propre, sans maquillage.' },
      { title: 'Déroulement de la séance', body: 'La séance commence par un nettoyage en profondeur de la peau. Selon le protocole choisi, nous appliquons le traitement laser, la radiofréquence ou le peeling. La durée varie de 30 à 60 minutes. La sensation est généralement bien tolérée, sans besoin d\'anesthésie.' },
      { title: 'Suites de la séance', body: 'Des rougeurs temporaires peuvent apparaître et disparaissent en quelques heures à quelques jours. Appliquez une protection solaire élevée et hydratez votre peau quotidiennement. Évitez le sport intense et la chaleur pendant 48 heures.' },
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
    color: '#EC4899',
    intro: 'L\'esthétique des lèvres permet de corriger les volumes, redessiner le contour et hydrater en profondeur pour des lèvres plus pulpeuses et rajeunies.',
    highlights: ['Volume des lèvres', 'Redéfinition du contour', 'Hydratation profonde', 'Correction des asymétries', 'Rajeunissement du sourire'],
    contraindications: 'Infection herpétique active, grossesse et allaitement, allergie à l\'acide hyaluronique, troubles de la coagulation.',
    sections: [
      { title: 'Que faire ?', body: 'Des lèvres fines, asymétriques ou déshydratées peuvent être facilement corrigées avec des injections d\'acide hyaluronique. Le résultat est immédiatement visible et naturel, car l\'acide hyaluronique est une substance naturellement présente dans notre peau.' },
      { title: 'Préparation avant la séance', body: 'Évitez l\'aspirine, les anti-inflammatoires et les compléments alimentaires à base de ginkgo ou de vitamine E une semaine avant. Si vous avez un antécédent d\'herpès labial, un traitement préventif vous sera prescrit.' },
      { title: 'Déroulement de la séance', body: 'La séance dure environ 30 minutes. Une crème anesthésiante est appliquée 20 minutes avant. Le médecin injecte l\'acide hyaluronique en plusieurs points précis pour un résultat harmonieux, puis masse délicatement pour répartir le produit.' },
      { title: 'Suites de la séance', body: 'Un gonflement et des rougeurs sont normaux pendant 24 à 48 heures. Évitez le sport intense, la chaleur, l\'alcool et les baisers pendant 24 heures. Le résultat final est visible après une semaine, une fois l\'œdème résorbé.' },
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
    color: '#0EA5E9',
    intro: 'Le regard est le premier signe de vieillissement. Nos solutions ciblées permettent de retrouver un regard frais et reposé sans chirurgie.',
    highlights: ['Paupières tombantes', 'Poches sous les yeux', 'Rides de la patte d\'oie', 'Cernes', 'Rajeunissement du regard'],
    contraindications: 'Infection oculaire active, glaucome non contrôlé, sécheresse oculaire sévère, grossesse.',
    sections: [
      { title: 'Que faire ?', body: 'Les paupières tombantes, les poches sous les yeux et les rides de la patte d\'oie peuvent être traités efficacement sans chirurgie. La radiofréquence micro-needling et les injections ciblées permettent de raffermir la peau et de lisser les ridules autour de l\'œil.' },
      { title: 'Préparation avant la séance', body: 'Évitez les anticoagulants et les compléments alimentaires une semaine avant. Ne portez pas de lentilles de contact le jour de la séance. Venez sans maquillage des yeux.' },
      { title: 'Déroulement de la séance', body: 'La séance dure 30 à 45 minutes selon les zones traitées. Une crème anesthésiante est appliquée pour votre confort. Le traitement est réalisé avec précision à l\'aide de canules fines ou de micro-aiguilles.' },
      { title: 'Suites de la séance', body: 'Un gonflement léger et de petites ecchymoses peuvent apparaître et disparaissent en 3 à 5 jours. Appliquez des compresses froides les premières heures. Évitez le maquillage des yeux pendant 24 heures.' },
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
    color: '#10B981',
    intro: 'L\'esthétique des sourcils redessine l\'arcade sourcilière pour un regard plus expressif et harmonieux.',
    highlights: ['Redessin des sourcils', 'Volume et densité', 'Correction des asymétries', 'Rajeunissement', 'Harmonie du visage'],
    contraindications: 'Infection cutanée locale, grossesse, allergie aux pigments, diabète non contrôlé.',
    sections: [
      { title: 'Que faire ?', body: 'Des sourcils clairsemés, asymétriques ou mal dessinés peuvent être corrigés par microblading, maquillage semi-permanent ou injections de comblement. Chaque technique est adaptée à votre type de peau et à vos attentes.' },
      { title: 'Préparation avant la séance', body: 'Évitez la caféine et l\'alcool 24 heures avant. Ne faites pas d\'épilation des sourcils une semaine avant. Évitez les rétinoïdes et les acides exfoliants sur la zone.' },
      { title: 'Déroulement de la séance', body: 'La séance dure environ 1h30. Après un dessin préparatoire validé avec vous, le pigment est appliqué à l\'aide de micro-lames ou d\'aiguilles fines sous anesthésie locale.' },
      { title: 'Suites de la séance', body: 'Des petites croûtes peuvent apparaître pendant 5 à 7 jours. Ne grattez pas. Évitez l\'eau, le sauna et la transpiration excessive pendant une semaine. Une séance de retouche est recommandée à 4 semaines.' },
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
    color: '#2E90C0',
    intro: 'Nos protocoles de remodelage corporel combinent plusieurs technologies pour traiter la cellulite, le relâchement cutané et les bourrelets graisseux.',
    highlights: ['Remodelage corporel', 'Traitement de la cellulite', 'Raffermissement cutané', 'Réduction des bourrelets', 'Programmes silhouette'],
    contraindications: 'Grossesse et allaitement, infections cutanées, troubles de la coagulation, pacemaker.',
    sections: [
      { title: 'Que faire ?', body: 'La cellulite, le relâchement cutané et les bourrelets graisseux peuvent être traités efficacement sans chirurgie. Nous combinons cryolipolyse, radiofréquence, ondes de choc et ultrasons pour un remodelage complet et personnalisé.' },
      { title: 'Préparation avant la séance', body: 'Hydratez-vous bien la veille. Évitez l\'alcool et les repas lourds avant la séance. Portez des vêtements confortables. Une photo sera prise avant le traitement pour suivre les résultats.' },
      { title: 'Déroulement de la séance', body: 'La séance dure 45 à 60 minutes selon les zones traitées. Vous ressentez une sensation de froid intense (cryolipolyse) ou de chaleur (radiofréquence), mais la procédure est bien tolérée. Vous pouvez reprendre vos activités immédiatement.' },
      { title: 'Suites de la séance', body: 'Des rougeurs et une sensation de chaleur locale sont normales pendant quelques heures. Un massage de la zone traitée est recommandé pour optimiser les résultats. Les résultats sont visibles après 2 à 3 séances.' },
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
    color: '#F472B6',
    intro: 'L\'esthétique mammaire regroupe les techniques d\'augmentation, de lifting et de réduction pour une poitrine en harmonie avec votre morphologie.',
    highlights: ['Augmentation mammaire', 'Lifting des seins', 'Réduction mammaire', 'Correction des asymétries', 'Résultats naturels'],
    contraindications: 'Cancer du sein actif ou traité récemment, infection, grossesse et allaitement, troubles de la coagulation, diabète non contrôlé.',
    sections: [
      { title: 'Que faire ?', body: 'Une poitrine jugée trop petite, trop volumineuse, ou qui a perdu de sa fermeté après une grossesse ou une perte de poids peut être corrigée par chirurgie esthétique. Augmentation par prothèses ou lipogreffe, lifting ou réduction : chaque solution est adaptée à votre morphologie.' },
      { title: 'Préparation avant l\'intervention', body: 'Un bilan pré-opératoire complet est obligatoire : mammographie, prise de sang et consultation d\'anesthésie. Arrêtez le tabac au moins 4 semaines avant. Évitez l\'aspirine et les anti-inflammatoires.' },
      { title: 'Déroulement de l\'intervention', body: 'L\'intervention dure 1h30 à 3h sous anesthésie générale. Les incisions sont placées discrètement dans le pli sous-mammaire ou autour de l\'aréole. Vous rentrez chez vous le jour même ou le lendemain.' },
      { title: 'Suites opératoires', body: 'Un gonflement et des ecchymoses sont normaux pendant 2 à 3 semaines. Portez un soutien-gorge de maintien jour et nuit pendant 6 semaines. Évitez les efforts physiques et le port de charges lourdes pendant 4 à 6 semaines.' },
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
    color: '#F59E0B',
    intro: 'Le BBL est une technique de lipogreffe qui utilise votre propre graisse pour remodeler et augmenter le volume des fesses de manière naturelle.',
    highlights: ['Brazilian Butt Lift', 'Lipogreffe', 'Augmentation des fesses', 'Remodelage harmonieux', 'Résultats durables'],
    contraindications: 'IMC inférieur à 18,5 ou supérieur à 30, tabagisme actif, diabète non contrôlé, troubles de la coagulation.',
    sections: [
      { title: 'Que faire ?', body: 'Des fesses plates ou manquant de volume peuvent être remodelées grâce au Brazilian Butt Lift (BBL). Cette technique utilise votre propre graisse, prélevée par liposuccion douce sur les zones excédentaires, puis réinjectée dans les fesses pour un galbe naturel.' },
      { title: 'Préparation avant l\'intervention', body: 'Arrêtez le tabac au moins 4 semaines avant. Un bilan pré-opératoire complet est requis. Évitez l\'aspirine et les anti-inflammatoires. Maintenez un poids stable.' },
      { title: 'Déroulement de l\'intervention', body: 'L\'intervention dure 2 à 3 heures sous anesthésie générale. La graisse est prélevée par micro-canules (abdomen, cuisses, dos), purifiée, puis réinjectée dans les fesses pour créer le volume et la forme désirés.' },
      { title: 'Suites opératoires', body: 'Évitez de vous asseoir directement sur les fesses pendant 2 à 4 semaines (utilisez un coussin spécial). Portez un vêtement de compression pendant 6 semaines. Une partie de la graisse injectée peut être résorbée naturellement.' },
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
    color: '#A855F7',
    intro: 'Le relâchement des bras et l\'excès de graisse peuvent être traités par des techniques ciblées pour des bras plus fermes et harmonieux.',
    highlights: ['Liposuccion des bras', 'Raffermissement cutané', 'Brachioplastie', 'Traitement du relâchement', 'Tonicité'],
    contraindications: 'Infection cutanée, lymphœdème, troubles de la coagulation, grossesse, diabète non contrôlé.',
    sections: [
      { title: 'Que faire ?', body: 'Le relâchement cutané des bras et les excès de graisse localisés peuvent être traités par liposuccion, brachioplastie (lifting des bras) ou techniques de raffermissement cutané comme la radiofréquence.' },
      { title: 'Préparation avant la séance', body: 'Arrêtez le tabac 4 semaines avant si une intervention chirurgicale est prévue. Évitez l\'aspirine et les anti-inflammatoires. Un bilan médical est nécessaire avant toute chirurgie.' },
      { title: 'Déroulement de la séance', body: 'Pour la liposuccion des bras, l\'intervention dure 1 à 2 heures sous anesthésie locale ou générale. Les incisions sont placées discrètement dans le creux du coude ou l\'aisselle.' },
      { title: 'Suites de la séance', body: 'Portez un vêtement de compression pendant 4 à 6 semaines. Évitez les mouvements répétitifs et le port de charges lourdes pendant 3 à 4 semaines. Les résultats sont visibles après la disparition de l\'œdème.' },
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
    color: '#EF4444',
    intro: 'La liposuccion est une intervention chirurgicale qui retire les amas graisseux résistants au régime et au sport, pour un corps mieux dessiné.',
    highlights: ['Liposuccion classique', 'Vaser liposuccion', 'Traitement ciblé', 'Résultats durables', 'Reprise rapide'],
    contraindications: 'Obésité importante (IMC > 35), diabète non contrôlé, troubles cardiaques, troubles de la coagulation, infection cutanée.',
    sections: [
      { title: 'Que faire ?', body: 'Les amas graisseux localisés résistants au régime et au sport peuvent être éliminés durablement par liposuccion. Cette intervention permet de redessiner la silhouette en retirant définitivement les cellules graisseuses des zones ciblées.' },
      { title: 'Préparation avant l\'intervention', body: 'Arrêtez le tabac 4 semaines avant. Un bilan pré-opératoire complet (prise de sang, ECG, consultation d\'anesthésie) est obligatoire. Évitez l\'aspirine et les anti-inflammatoires.' },
      { title: 'Déroulement de l\'intervention', body: 'L\'intervention dure 1 à 3 heures selon les zones traitées, sous anesthésie locale ou générale. De petites incisions sont pratiquées pour insérer les canules qui aspirent la graisse.' },
      { title: 'Suites opératoires', body: 'Portez un vêtement de compression pendant 4 à 6 semaines. Des ecchymoses et un gonflement sont normaux pendant 2 à 3 semaines. Les résultats définitifs sont visibles après 3 à 6 mois.' },
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
    color: '#E11D48',
    intro: 'La Vaser liposuccion utilise les ultrasons pour fragmenter la graisse avant de l\'aspirer, permettant un traitement plus précis et une récupération plus rapide.',
    highlights: ['Ultrasons ciblés', 'Précision chirurgicale', 'Récupération rapide', 'Moins invasif', 'Résultats naturels'],
    contraindications: 'Obésité (IMC > 35), diabète non contrôlé, troubles cardiaques, troubles de la coagulation, infection cutanée, grossesse.',
    sections: [
      { title: 'Que faire ?', body: 'La Vaser liposuccion est idéale pour les zones difficiles comme l\'abdomen, les cuisses, les bras et le dos. Les ultrasons fragmentent sélectivement les cellules graisseuses en préservant les tissus environnants pour moins d\'ecchymoses et une récupération plus rapide.' },
      { title: 'Préparation avant l\'intervention', body: 'Arrêtez le tabac 4 semaines avant. Un bilan pré-opératoire complet est obligatoire. Évitez l\'aspirine et les anti-inflammatoires. Hydratez-vous bien.' },
      { title: 'Déroulement de l\'intervention', body: 'L\'intervention dure 1 à 3 heures selon les zones. Les ultrasons émulsionnent la graisse avant de l\'aspirer, ce qui permet un traitement plus précis et moins traumatique que la liposuccion classique.' },
      { title: 'Suites opératoires', body: 'Portez un vêtement de compression pendant 4 semaines. La récupération est généralement plus rapide qu\'avec une liposuccion classique, avec moins d\'ecchymoses et de douleur.' },
    ],
    category: 'corps',
  },
  {
    slug: 'epilation-laser',
    navLabel: 'Épilation laser',
    title: 'Épilation laser',
    eyebrow: 'Techniques',
    heroDescription: 'L\'épilation laser définitive pour une peau douce et sans poils. Une solution durable pour toutes les zones du corps et du visage.',
    image: '/services/epilation.jpg',
    color: '#ec4899',
    intro: 'L\'épilation laser est une méthode définitive d\'élimination des poils. Rapide, efficace et sécurisée, elle convient à toutes les zones et tous les phototypes.',
    highlights: ['Épilation définitive', 'Toutes zones', 'Tous phototypes', 'Résultats durables', 'Séances rapides'],
    contraindications: 'Peau bronzée ou auto-bronzante, infection cutanée, grossesse, épilation à la cire récente (moins de 3 semaines), traitement photosensibilisant.',
    sections: [
      { title: 'Que faire ?', body: 'Les poils indésirables peuvent être éliminés définitivement grâce au laser. Le laser émet une lumière ciblée absorbée par la mélanine du poil. La chaleur détruit le bulbe sans endommager la peau environnante. Résultats durables après 6 à 8 séances.' },
      { title: 'Préparation avant la séance', body: 'Rasez la zone 24h avant la séance. Évitez l\'exposition au soleil et l\'auto-bronzant pendant 4 semaines. Ne faites pas d\'épilation à la cire ou à la pince 3 semaines avant.' },
      { title: 'Déroulement de la séance', body: 'La séance dure de 15 minutes (petite zone) à 45 minutes (grande zone). Vous portez des lunettes de protection. La sensation est comparable à des petits claquements d\'élastique sur la peau.' },
      { title: 'Suites de la séance', body: 'Des rougeurs et de petits gonflements autour des follicules sont normaux et disparaissent en quelques heures. Appliquez une crème apaisante. Évitez le soleil, la chaleur et les frottements pendant 48 heures.' },
    ],
    category: 'techniques',
  },
  {
    slug: 'consultation',
    navLabel: 'Consultation',
    title: 'Consultation',
    eyebrow: 'Diagnostic',
    heroDescription: 'Une consultation personnalisée pour établir un diagnostic précis et construire le parcours de soin le plus cohérent avec votre situation.',
    image: '/services/consultation.jpg',
    color: '#3b82f6',
    intro: 'La consultation permet d\'établir un diagnostic précis, de comprendre votre besoin réel et de construire le parcours de soin le plus cohérent avec votre situation.',
    highlights: ['Consultation personnalisée', 'Diagnostic précis', 'Plan de traitement', 'Visio-consultation', 'Suivi personnalisé'],
    contraindications: 'Aucune contre-indication spécifique.',
    sections: [
      { title: 'Que faire ?', body: 'Vous avez une préoccupation esthétique ou dermatologique et vous ne savez pas quel traitement est le plus adapté ? La consultation permet de faire le point complet sur votre peau et vos attentes, et d\'établir un plan de traitement personnalisé.' },
      { title: 'Préparation avant la consultation', body: 'Venez avec une peau propre et sans maquillage si possible. Apportez vos traitements en cours et vos antécédents médicaux. Notez vos questions à l\'avance pour ne rien oublier.' },
      { title: 'Déroulement de la consultation', body: 'La consultation dure 30 à 45 minutes. Le médecin analyse votre peau, discute de vos attentes et vous propose les options les mieux adaptées. Une visio-consultation est également possible.' },
      { title: 'Suites de la consultation', body: 'Vous repartez avec un plan de traitement personnalisé et un devis détaillé. Aucun temps d\'arrêt nécessaire. Vous pouvez prendre rendez-vous pour votre premier traitement dès le jour même.' },
    ],
    category: 'visage',
  },
]

export function getServicePage(slug: string) {
  return SERVICE_PAGES.find((item) => item.slug === slug)
}

/* ── Unique vector per service (square-moncey CDN icons) ─────── */
export const ICON_MAP: Record<string, string> = {
  /* Visage */
  'facial-aesthetics': '/assets/icons/facial-aesthetics.svg',
  'lip-aesthetics': '/assets/icons/lip-aesthetics.svg',
  'eye-aesthetics': '/assets/icons/eye-aesthetics.svg',
  'eyebrow-aesthetics': '/assets/icons/eyebrow-aesthetics.svg',
  /* Corps */
  'body-aesthetics': '/assets/icons/body-aesthetics.svg',
  'breast-aesthetics': '/assets/icons/breast-aesthetics.svg',
  'butt-aesthetics': '/assets/icons/butt-aesthetics.svg',
  'arm-aesthetics': '/assets/icons/arm-aesthetics.svg',
  'liposuction': '/assets/icons/liposuction.svg',
  'vaser-liposuction': '/assets/icons/vaser-liposuction.svg',
  /* Techniques */
  'epilation-laser': '/assets/icons/epilation-laser.svg',
  /* Diagnostic */
  'consultation': '/assets/icons/consultation.svg',
}

export const MEGA_CATEGORIES = [
  { slug: 'visage', label: 'Visage', items: SERVICE_PAGES.filter(p => p.category === 'visage').map(p => ({ label: p.title, href: `/services/${p.slug}`, slug: p.slug, icon: ICON_MAP[p.slug] || '' })) },
  { slug: 'corps', label: 'Corps', items: SERVICE_PAGES.filter(p => p.category === 'corps').map(p => ({ label: p.title, href: `/services/${p.slug}`, slug: p.slug, icon: ICON_MAP[p.slug] || '' })) },
  { slug: 'techniques', label: 'Techniques', items: SERVICE_PAGES.filter(p => p.category === 'techniques').map(p => ({ label: p.title, href: `/services/${p.slug}`, slug: p.slug, icon: ICON_MAP[p.slug] || '' })) },
] as const
