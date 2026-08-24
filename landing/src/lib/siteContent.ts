import type { DynamicService } from '@/hooks/useServices'

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
  reelUrl?: string
}

export const SERVICE_PAGES: ServicePageContent[] = [
  {
    slug: 'epilation-laser',
    navLabel: 'Épilation laser',
    title: 'Épilation laser',
    eyebrow: 'Techniques',
    heroDescription: 'L\'épilation laser est une solution durable pour une peau lisse. Une technique moderne et efficace pour éliminer durablement les poils indésirables.',
    image: '/images/services/epilation-laser.webp',
    color: '#ec4899',
    intro: 'L\'épilation laser est une technique moderne et efficace pour éliminer durablement les poils indésirables. Contrairement aux méthodes classiques comme le rasage ou la cire, le laser agit directement à la racine du poil, en ciblant le bulbe pileux afin d\'en prévenir la repousse. Ce traitement s\'adresse à toutes les zones du corps : jambes, bras, aisselles, dos, maillot, visage… En moyenne, 8 à 10 séances sont nécessaires pour obtenir une diminution progressive et durable de la pilosité.',
    highlights: ['Épilation définitive', 'Toutes zones', 'Tous phototypes', 'Réduction 70–90%', 'Séances rapides'],
    contraindications: 'Peau bronzée ou utilisation récente d\'autobronzant. Prise de compléments alimentaires favorisant le bronzage ou la repousse des poils. Usage de certaines huiles essentielles. Hirsutisme ou troubles hormonaux non traités.',
    sections: [
      { title: 'Comment fonctionne l\'épilation laser ?', body: 'L\'épilation laser repose sur une technologie de pointe utilisée depuis plus de 40 ans. Le principe est simple : le laser émet une lumière hautement concentrée qui traverse la peau et est absorbée par la mélanine, le pigment brun contenu dans le poil. Cette énergie lumineuse se transforme alors en chaleur, détruisant le follicule pileux à la racine tout en préservant les tissus environnants. Seuls les poils en phase de croissance active sont sensibles au laser — c\'est pourquoi plusieurs séances, espacées de 6 à 8 semaines, sont nécessaires pour un résultat complet.' },
      { title: 'Les avantages du laser', body: 'Réduction durable de la pilosité — Prévention des poils incarnés et des irritations — Traitement précis, sûr et adapté à toutes les zones du corps — Confort incomparable par rapport à la cire ou au rasage. Résultat : une peau plus lisse, plus nette, et un vrai gain de liberté au quotidien.' },
      { title: 'Avant la séance', body: 'Un court questionnaire vous sera remis en salle d\'attente afin de vérifier l\'absence de contre-indication. Une première consultation est indispensable pour évaluer votre situation : type de peau et de poils, éventuels troubles hormonaux, traitements en cours. Il est important de ne pas arracher les poils durant le mois précédant la séance (pas de cire, d\'épilateur électrique ni de pince à épiler).' },
      { title: 'Pendant la séance', body: 'La zone à traiter doit être propre et soigneusement rasée. Des lunettes ou coques de protection sont portées durant toute la séance. Les paramètres du laser sont ajustés en fonction de votre type de peau et de la nature de vos poils. Au Widamine Aesthetic Center, nous utilisons le laser Clarity II de Lutronic, qui associe la puissance du laser à un système de refroidissement par air froid pour une séance quasiment indolore.' },
      { title: 'Après la séance', body: 'Une légère rougeur ou une sensation de chair de poule peuvent apparaître immédiatement après le traitement — ces réactions normales disparaissent en quelques minutes à quelques heures. Une bonne hydratation quotidienne aidera la peau à se régénérer plus vite. Une protection solaire rigoureuse est indispensable pendant les 15 jours suivant la séance. Plusieurs séances sont nécessaires pour un résultat durable.' },
    ],
    category: 'techniques',
  },
  {
    slug: 'sculpSure',
    navLabel: 'SculpSure',
    title: 'SculpSure — Bourrelets graisseux',
    eyebrow: 'Corps',
    heroDescription: 'Une solution non invasive et sans chirurgie pour redessiner votre silhouette. SculpSure, le laser qui cible les bourrelets résistants.',
    image: '/images/services/sculpsure.webp',
    color: '#2E90C0',
    intro: 'Vous avez beau faire attention à votre alimentation ou pratiquer une activité physique régulière… certains bourrelets résistent toujours. Ces zones rebelles — abdomen, hanches, cuisses ou dos — stockent la graisse de manière tenace. Grâce à une énergie laser contrôlée, SculpSure cible la graisse en profondeur sans abîmer la peau. En seulement 25 minutes par zone, dites adieu à ces bourrelets résistants.',
    highlights: ['Non invasif', '25 min par zone', 'Sans chirurgie', 'Résultats durables', 'Sans éviction sociale'],
    contraindications: 'Grossesse, maladie grave, insuffisance rénale, cancer, intolérance à la chaleur, plaie ou infection sur la zone à traiter.',
    sections: [
      { title: 'Comment ça marche ?', body: 'SculpSure utilise une technologie laser innovante pour cibler les cellules graisseuses en profondeur, sans toucher la peau ni les tissus environnants. Pendant la séance, des applicateurs sont placés sur la zone à traiter. Le laser chauffe doucement la graisse jusqu\'à environ 42–47 °C — une température suffisante pour détruire durablement les cellules graisseuses, tout en préservant votre confort grâce à un système de refroidissement intégré. Après la séance, votre corps élimine naturellement les cellules traitées au fil des semaines, pour un résultat progressif, harmonieux et naturel. Les cellules graisseuses détruites ne se reforment pas.' },
      { title: 'Les avantages du SculpSure', body: 'Non invasif, sans chirurgie ni aiguilles — Une silhouette redessinée sans anesthésie, sans cicatrice et sans temps de récupération. Séances rapides — Seulement 25 minutes par zone. Résultats naturels et progressifs — Votre corps élimine les cellules graisseuses au fil des semaines. Effet durable — Les cellules graisseuses détruites ne se reforment pas. Technologie sûre et confortable — Grâce au refroidissement continu, la séance reste agréable. Silhouette plus ferme et plus tonique.' },
      { title: 'Zones traitées', body: 'Abdomen — Pour un ventre plus plat et des contours redessinés. Hanches (poignées d\'amour) — Pour affiner la taille. Cuisses — Pour lisser l\'extérieur et l\'intérieur des cuisses. Dos (ailes d\'ange) — Pour estomper les bourrelets sous le soutien-gorge. Bras — Pour affiner la partie supérieure du bras. Sous-menton — Pour redéfinir l\'ovale du visage.' },
      { title: 'Retrouvez confiance en votre silhouette', body: 'Votre silhouette mérite toute votre attention. Avec SculpSure, vous choisissez une approche moderne, sûre et efficace pour affiner vos courbes sans chirurgie. Chaque traitement débute par une consultation personnalisée pour comprendre vos besoins et définir la stratégie la plus adaptée à votre morphologie.' },
    ],
    category: 'corps',
  },
]

export function getServicePage(slug: string) {
  return SERVICE_PAGES.find((item) => item.slug === slug)
}

// Fallback page built from live API motif data when no hand-written page exists.
export function serviceToContent(s: DynamicService): ServicePageContent {
  const category = (s.category as ServicePageContent['category']) ?? 'techniques'
  return {
    slug: s.slug,
    navLabel: s.name,
    title: s.name,
    eyebrow: s.category ?? '',
    heroDescription: s.description ?? `Découvrez ${s.name} au Widamine Aesthetic Center.`,
    image: ICON_MAP[s.slug] || '',
    color: s.color,
    intro: s.description ?? `Découvrez ${s.name} au Widamine Aesthetic Center.`,
    highlights: [`Séance d'environ ${s.duration} minutes`],
    contraindications: "Une consultation préalable est nécessaire pour évaluer votre éligibilité à ce traitement.",
    sections: [{ title: `À propos de ${s.name}`, body: s.description ?? `Découvrez ${s.name} au Widamine Aesthetic Center.` }],
    category,
  }
}

/* ── Service icon illustrations (generated with make-service-icons.py) ─────── */
export const ICON_MAP: Record<string, string> = {
  'consultation': '/images/services/consultation-icon.svg',
  'peeling-visage': '/images/services/peeling-visage.webp',
  'suivi': '/images/services/suivi.svg',
  'bilan': '/images/services/bilan.svg',
  'peeling': '/images/services/peeling.svg', // dedicated SVG for DB slug 'peeling'
  'sculpsure': '/images/services/sculpSure.svg',
  'sculpSure': '/images/services/sculpSure.svg', // alias — premium thin-stroke
  'epilation-laser-complete': '/images/services/epilation-laser.svg',
  'epilation-laser': '/images/services/epilation-laser.svg', // alias — premium thin-stroke
  // Sync: reservation popup fallback slugs → reuse visage/corps/techniques icons
  'facial-aesthetics': '/images/services/peeling.svg',
  'lip-aesthetics': '/images/services/consultation-icon.svg',
  'eye-aesthetics': '/images/services/bilan.svg',
  'eyebrow-aesthetics': '/images/services/suivi.svg',
  'body-aesthetics': '/images/services/sculpSure.svg',
  'breast-aesthetics': '/images/services/sculpSure.svg',
  'butt-aesthetics': '/images/services/sculpSure.svg',
  'arm-aesthetics': '/images/services/sculpSure.svg',
  'liposuction': '/images/services/sculpsure.webp',
  'vaser-liposuction': '/images/services/sculpsure.webp',
}

export const MEGA_CATEGORIES = [
  { slug: 'visage', label: 'Visage', items: SERVICE_PAGES.filter(p => p.category === 'visage').map(p => ({ label: p.title, href: `/services/${p.slug}`, slug: p.slug, icon: ICON_MAP[p.slug] || '' })) },
  { slug: 'corps', label: 'Corps', items: SERVICE_PAGES.filter(p => p.category === 'corps').map(p => ({ label: p.title, href: `/services/${p.slug}`, slug: p.slug, icon: ICON_MAP[p.slug] || '' })) },
  { slug: 'techniques', label: 'Techniques', items: SERVICE_PAGES.filter(p => p.category === 'techniques').map(p => ({ label: p.title, href: `/services/${p.slug}`, slug: p.slug, icon: ICON_MAP[p.slug] || '' })) },
] as const
