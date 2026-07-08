import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import api from '@/lib/api'
import { formatLocalDate, getMondayOfWeek } from '@/lib/date'

function getCalendarDateRange(view: string | null): { from: string; to: string } {
  const today = new Date()
  const todayStr = formatLocalDate(today)

  if (view === 'week') {
    const monday = parseLocalDate(getMondayOfWeek(todayStr))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { from: formatLocalDate(monday), to: formatLocalDate(sunday) }
  }

  if (view === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { from: formatLocalDate(first), to: formatLocalDate(last) }
  }

  return { from: todayStr, to: todayStr }
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export interface SidebarCounts {
  patientsCount: number | null
  messagesCount: number | null
  calendarCount: number | null
  reservationsCount: number | null
  usersCount: number | null
  resourcesCount: number | null
  motifsCount: number | null
}

const EMPTY_COUNTS: SidebarCounts = {
  patientsCount: null,
  messagesCount: null,
  calendarCount: null,
  reservationsCount: null,
  usersCount: null,
  resourcesCount: null,
  motifsCount: null,
}

export function useSidebarCounts(): SidebarCounts {
  const location = useLocation()
  const [patientsCount, setPatientsCount] = useState<number | null>(null)
  const [messagesCount, setMessagesCount] = useState<number | null>(null)
  const [calendarCount, setCalendarCount] = useState<number | null>(null)
  const [reservationsCount, setReservationsCount] = useState<number | null>(null)
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [resourcesCount, setResourcesCount] = useState<number | null>(null)
  const [motifsCount, setMotifsCount] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const path = location.pathname
  const searchParams = new URLSearchParams(location.search)
  const view = searchParams.get('view')

  useEffect(() => {
    const fetch = () => {
      if (path === '/patients') {
        api.get('patients/count').then((r) => setPatientsCount(r.data.count ?? r.data)).catch(() => {})
      }
      if (path === '/contacts') {
        api.get('contacts/unread-count').then((r) => setMessagesCount(r.data.count ?? r.data)).catch(() => {})
      }
      if (path === '/calendar') {
        const { from, to } = getCalendarDateRange(view)
        api.get('appointments/count', { params: { from, to } }).then((r) => setCalendarCount(r.data.count ?? r.data)).catch(() => {})
      }
      if (path === '/reservations') {
        api.get('appointments/reservations-count').then((r) => setReservationsCount(r.data.count ?? r.data)).catch(() => {})
      }
      if (path === '/users') {
        api.get('users/count').then((r) => setUsersCount(r.data.count ?? r.data)).catch(() => {})
      }
      if (path === '/resources') {
        api.get('resources/count').then((r) => setResourcesCount(r.data.count ?? r.data)).catch(() => {})
      }
      if (path === '/motifs') {
        api.get('motifs/count').then((r) => setMotifsCount(r.data.count ?? r.data)).catch(() => {})
      }
    }

    fetch()

    intervalRef.current = setInterval(fetch, 30000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [path, view])

  return { patientsCount, messagesCount, calendarCount, reservationsCount, usersCount, resourcesCount, motifsCount }
}
