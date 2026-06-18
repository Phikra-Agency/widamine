export type MotifFamilyKey =
  | 'consultation'
  | 'followup'
  | 'treatment'
  | 'urgent'
  | 'other'

export interface MotifFamily {
  key: MotifFamilyKey
  label: string
  hue: string
  bookingTypes: string[]
}

export interface MotifLike {
  id: string
  name: string
  color?: string | null
  bookingType?: string | null
}

export const MOTIF_FAMILIES: MotifFamily[] = [
  {
    key: 'consultation',
    label: 'Consultation',
    hue: '#4a8fb8',
    bookingTypes: ['CONSULTATION'],
  },
  {
    key: 'followup',
    label: 'Suivi / Contrôle',
    hue: '#4a9e94',
    bookingTypes: ['FOLLOWUP'],
  },
  {
    key: 'treatment',
    label: 'Traitement',
    hue: '#c4925a',
    bookingTypes: ['TREATMENT'],
  },
  {
    key: 'urgent',
    label: 'Urgent',
    hue: '#c45a5a',
    bookingTypes: ['URGENCY'],
  },
  {
    key: 'other',
    label: 'Autre',
    hue: '#7a8a96',
    bookingTypes: ['STANDARD'],
  },
]

const bookingTypeToFamily = new Map<string, MotifFamilyKey>()
for (const family of MOTIF_FAMILIES) {
  for (const bt of family.bookingTypes) {
    bookingTypeToFamily.set(bt, family.key)
  }
}

export function getFamilyKey(bookingType?: string | null): MotifFamilyKey {
  if (!bookingType) return 'other'
  return bookingTypeToFamily.get(bookingType) ?? 'other'
}

export function getFamily(key: MotifFamilyKey): MotifFamily {
  return MOTIF_FAMILIES.find((f) => f.key === key) ?? MOTIF_FAMILIES[MOTIF_FAMILIES.length - 1]
}

export function getFamilyForMotif(motif?: { bookingType?: string | null } | null): MotifFamily {
  return getFamily(getFamilyKey(motif?.bookingType))
}

export function getEventColor(motif?: { color?: string | null; bookingType?: string | null } | null): string {
  return motif?.color || getFamilyForMotif(motif).hue
}

export interface GroupedMotifs {
  family: MotifFamily
  motifs: MotifLike[]
}

export function groupMotifsByFamily(motifs: MotifLike[]): GroupedMotifs[] {
  const buckets = new Map<MotifFamilyKey, MotifLike[]>()
  for (const family of MOTIF_FAMILIES) {
    buckets.set(family.key, [])
  }

  for (const motif of motifs) {
    const key = getFamilyKey(motif.bookingType)
    buckets.get(key)!.push(motif)
  }

  return MOTIF_FAMILIES.map((family) => ({
    family,
    motifs: (buckets.get(family.key) ?? []).sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  })).filter((g) => g.motifs.length > 0)
}

export function familyTint(hue: string, alpha = 0.12): string {
  return `${hue}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
}
