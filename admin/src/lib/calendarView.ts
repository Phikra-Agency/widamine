import { formatLocalDate, getMondayOfWeek, parseLocalDate } from '@/lib/date'

export type CalendarViewMode = 'week' | 'day' | 'month'
export type PeriodKey = 'morning' | 'afternoon' | 'evening'

export const CALENDAR_VIEW_OPTIONS: {
  value: CalendarViewMode
  label: string
  hint: string
  hintTitle: string
}[] = [
  {
    value: 'day',
    label: 'Jour',
    hint: '24h',
    hintTitle: 'Une journée complète',
  },
  {
    value: 'week',
    label: 'Semaine',
    hint: '7j',
    hintTitle: 'Six jours ouvrés de la semaine',
  },
  {
    value: 'month',
    label: 'Mois',
    hint: '30j',
    hintTitle: 'Vue mensuelle',
  },
]

export const PERIOD_OPTIONS: { value: PeriodKey; label: string; shortLabel: string }[] = [
  { value: 'morning', label: 'Matinée', shortLabel: 'Mat.' },
  { value: 'afternoon', label: 'Après-midi', shortLabel: 'A-M.' },
  { value: 'evening', label: 'Soirée', shortLabel: 'Soir.' },
]

export function getWeekDates(date: string) {
  const monday = parseLocalDate(getMondayOfWeek(date))
  return Array.from({ length: 6 }, (_, index) => {
    const next = new Date(monday)
    next.setDate(monday.getDate() + index)
    return next
  })
}

export function getDayIndexInWeek(date: string) {
  const monday = parseLocalDate(getMondayOfWeek(date))
  const target = parseLocalDate(date)
  const diff = Math.round((target.getTime() - monday.getTime()) / 86_400_000)
  return Math.max(0, Math.min(5, diff))
}

export function formatWeekLabel(date: string) {
  const monday = parseLocalDate(getMondayOfWeek(date))
  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5)
  return `${monday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} → ${saturday.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })}`
}

export function formatViewRangeLabel(viewMode: CalendarViewMode, date: string) {
  const parsed = parseLocalDate(date)
  switch (viewMode) {
    case 'day':
      return parsed.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    case 'month':
      return parsed.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    default:
      return formatWeekLabel(date)
  }
}

export function shouldShowTodayButton(viewMode: CalendarViewMode, date: string) {
  const today = formatLocalDate(new Date())
  const parsed = parseLocalDate(date)
  switch (viewMode) {
    case 'day':
      return date !== today
    case 'month':
      return (
        parsed.getMonth() !== new Date().getMonth() ||
        parsed.getFullYear() !== new Date().getFullYear()
      )
    default:
      return getMondayOfWeek(date) !== getMondayOfWeek(today)
  }
}

/** Past view → today btn left; future view → right. */
export function getTodayButtonPlacement(viewMode: CalendarViewMode, date: string): 'left' | 'right' {
  const today = formatLocalDate(new Date())
  const parsed = parseLocalDate(date)
  const todayParsed = parseLocalDate(today)

  switch (viewMode) {
    case 'day':
      return parsed < todayParsed ? 'left' : 'right'
    case 'month': {
      const viewMonth = parsed.getFullYear() * 12 + parsed.getMonth()
      const todayMonth = todayParsed.getFullYear() * 12 + todayParsed.getMonth()
      return viewMonth < todayMonth ? 'left' : 'right'
    }
    default:
      return getMondayOfWeek(date) < getMondayOfWeek(today) ? 'left' : 'right'
  }
}

export function getTodayLinkLabel(placement: 'left' | 'right') {
  return placement === 'left' ? "Revenir à aujourd'hui" : "Aller à aujourd'hui"
}

export function navigateCalendarDate(date: string, viewMode: CalendarViewMode, direction: -1 | 1) {
  const next = parseLocalDate(date)
  if (viewMode === 'day') {
    next.setDate(next.getDate() + direction)
  } else if (viewMode === 'month') {
    next.setMonth(next.getMonth() + direction)
  } else {
    next.setDate(next.getDate() + 7 * direction)
  }
  return formatLocalDate(next)
}

export function formatCalendarPickerLabel(date: string, viewMode: CalendarViewMode) {
  const parsed = parseLocalDate(date)
  if (viewMode === 'day') {
    return parsed.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  return parsed.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export function getMonthGridDates(date: string) {
  const anchor = parseLocalDate(date)
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const gridStart = parseLocalDate(getMondayOfWeek(formatLocalDate(new Date(year, month, 1))))
  return Array.from({ length: 42 }, (_, index) => {
    const cell = new Date(gridStart)
    cell.setDate(gridStart.getDate() + index)
    return cell
  })
}

export function getMonthFetchMondays(date: string) {
  const cells = getMonthGridDates(date)
  const mondays = new Set<string>()
  cells.forEach((cell) => {
    mondays.add(getMondayOfWeek(formatLocalDate(cell)))
  })
  return [...mondays]
}

export function isSameMonth(date: Date, anchor: string) {
  const ref = parseLocalDate(anchor)
  return date.getMonth() === ref.getMonth() && date.getFullYear() === ref.getFullYear()
}
