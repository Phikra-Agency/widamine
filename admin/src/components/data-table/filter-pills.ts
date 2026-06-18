export type FilterPillColor = 'mist' | 'sky' | 'sea' | 'aqua' | 'sage' | 'sand' | 'coral'

export type FilterPillOption = {
  value: string
  label: string
  color: FilterPillColor
}

export const FILTER_PILL_COLOR_CLASS: Record<FilterPillColor, string> = {
  mist: 'bo-filter-pill-mist',
  sky: 'bo-filter-pill-sky',
  sea: 'bo-filter-pill-sea',
  aqua: 'bo-filter-pill-aqua',
  sage: 'bo-filter-pill-sage',
  sand: 'bo-filter-pill-sand',
  coral: 'bo-filter-pill-coral',
}
