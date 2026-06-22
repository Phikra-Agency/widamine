// @ts-nocheck
import api from '@/lib/api'
import { formatLocalDate, getMondayOfWeek } from '@/lib/date'
import { useSchedulesStore } from '@/stores/schedulesStore'
import type { NavigateFunction } from 'react-router-dom'

const RETURN_STORAGE_KEY = 'widamine-calendar-return'
const OPEN_APPOINTMENT_STORAGE_KEY = 'widamine-open-appointment'

export type CalendarReturnContext = {
  openSchedule: string
  date: string
  appointmentId?: string
}

export type DaySchedules = {
  morning: ScheduleLike[]
  afternoon: ScheduleLike[]
  evening: ScheduleLike[]
}

export type ScheduleLike = {
  id?: string
  datetime: string
  session: { id: number; session: number; duration: number }
  appointment?: {
    id?: string
    status?: string
    name?: string
    patient?: { id: string; firstName: string; lastName: string }
    practitioner?: { id: string; name: string }
    resource?: { id: string; name: string }
    motif?: { id: string; name: string; color: string; duration?: number }
  }
}

export function getScheduleKey(schedule: ScheduleLike): string {
  return schedule.id || `${schedule.datetime}-${schedule.session.id}`
}

export function normalizeAppointmentId(appt: {
  id?: string | number
  _id?: string
  schedules?: { appointmentId?: string }[]
}) {
  const raw = appt.id ?? appt._id ?? appt.schedules?.[0]?.appointmentId
  if (raw == null || raw === '') return null
  return String(raw)
}

export function getAppointmentScheduleDatetime(appt: {
  schedules?: { datetime?: string }[]
  _dt?: number
}) {
  const raw = appt.schedules?.[0]?.datetime
  if (raw) return raw
  if (appt._dt) return new Date(appt._dt).toISOString()
  return null
}

export function appointmentToScheduleLike(appt: {
  id?: string | number
  _id?: string
  status?: string
  name?: string
  motif?: { id?: string; name?: string; color?: string; duration?: number }
  patient?: { id: string; firstName: string; lastName: string }
  practitioner?: { id: string; name: string }
  resource?: { id: string; name: string }
  schedules?: { id?: string; datetime?: string; session?: { id?: number; number?: number; duration?: number } }[]
  _dt?: number
}): ScheduleLike | null {
  const appointmentId = normalizeAppointmentId(appt)
  const datetime = getAppointmentScheduleDatetime(appt)
  if (!appointmentId || !datetime) return null

  const slot = appt.schedules?.[0]
  const sessionNumber = slot?.session?.number ?? slot?.session?.session ?? 1

  return {
    id: slot?.id,
    datetime,
    session: {
      id: slot.session?.id ?? 0,
      session: sessionNumber,
      duration: appt.motif?.duration ?? slot.session?.duration ?? 30,
    },
    appointment: {
      id: appointmentId,
      status: appt.status,
      name: appt.name,
      patient: appt.patient,
      practitioner: appt.practitioner,
      resource: appt.resource,
      motif: appt.motif as { id: string; name: string; color: string; duration?: number } | undefined,
    },
  }
}

/** Upcoming row is openable when it has a scheduled datetime (confirmed or pending on calendar). */
export function isAppointmentClickable(appt: { schedules?: { datetime?: string }[]; _dt?: number }) {
  return Boolean(getAppointmentScheduleDatetime(appt))
}

/** Same semantics as isAppointmentClickable — used when opening calendar from appointment rows. */
export function canOpenOnCalendar(appt: { schedules?: { datetime?: string }[]; _dt?: number; id?: string }) {
  return isAppointmentClickable(appt)
}

export function openCalendarForAppointment(
  navigate: NavigateFunction,
  appt: Parameters<typeof appointmentToScheduleLike>[0] & { _dt?: number; scheduleDate?: Date | null },
) {
  const appointmentId = normalizeAppointmentId(appt)
  if (!appointmentId || !getAppointmentScheduleDatetime(appt)) return

  const payload = { ...appt, id: appointmentId }
  clearCalendarReturnContext()
  stashAppointmentForCalendarOpen(payload)

  const opened = useSchedulesStore.getState().openAppointmentFromPatientDrawer(payload)
  if (!opened) return

  navigate('/calendar')
}

export function buildCalendarUrl(ctx: { openAppointment: string; date: string; openSchedule?: string }) {
  const params = new URLSearchParams({
    openAppointment: ctx.openAppointment,
    date: ctx.date,
  })
  if (ctx.openSchedule) params.set('openSchedule', ctx.openSchedule)
  return `/calendar?${params.toString()}`
}

export function buildCalendarUrlFromAppointment(
  appt: Parameters<typeof appointmentToScheduleLike>[0] & { _dt?: number },
) {
  const datetime = getAppointmentScheduleDatetime(appt)
  const appointmentId = normalizeAppointmentId(appt)
  if (!datetime || !appointmentId) return null
  const slot = appt.schedules?.[0]
  return buildCalendarUrl({
    openAppointment: appointmentId,
    date: formatLocalDate(new Date(datetime)),
    openSchedule: slot?.id,
  })
}

export function stashAppointmentForCalendarOpen(appt: Parameters<typeof appointmentToScheduleLike>[0]) {
  sessionStorage.setItem(OPEN_APPOINTMENT_STORAGE_KEY, JSON.stringify(appt))
}

export function readStashedAppointment(): Parameters<typeof appointmentToScheduleLike>[0] | null {
  try {
    const raw = sessionStorage.getItem(OPEN_APPOINTMENT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearStashedAppointment() {
  sessionStorage.removeItem(OPEN_APPOINTMENT_STORAGE_KEY)
}

export function saveCalendarReturnContext(schedule: ScheduleLike) {
  if (!schedule.appointment?.id) return
  sessionStorage.setItem(
    RETURN_STORAGE_KEY,
    JSON.stringify({
      openSchedule: getScheduleKey(schedule),
      date: formatLocalDate(new Date(schedule.datetime)),
      appointmentId: schedule.appointment.id,
    } satisfies CalendarReturnContext),
  )
}

export function readCalendarReturnContext(): CalendarReturnContext | null {
  try {
    const raw = sessionStorage.getItem(RETURN_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CalendarReturnContext
  } catch {
    return null
  }
}

export function clearCalendarReturnContext() {
  sessionStorage.removeItem(RETURN_STORAGE_KEY)
}

export function buildCalendarReturnUrl(ctx: CalendarReturnContext) {
  if (ctx.appointmentId) {
    return buildCalendarUrl({
      openAppointment: ctx.appointmentId,
      date: ctx.date,
      openSchedule: ctx.openSchedule,
    })
  }
  const params = new URLSearchParams({ openSchedule: ctx.openSchedule, date: ctx.date })
  return `/calendar?${params.toString()}`
}

export function findScheduleInItems(items: DaySchedules[], key: string): ScheduleLike | null {
  for (const day of items) {
    for (const period of ['morning', 'afternoon', 'evening'] as const) {
      for (const schedule of day[period]) {
        if (schedule.id === key) return schedule
        if (getScheduleKey(schedule) === key) return schedule
        if (schedule.appointment?.id === key) return schedule
      }
    }
  }
  return null
}

export function getMobileDayIndexForDate(dateStr: string, weekMonday: string): number {
  const target = new Date(dateStr + 'T12:00:00')
  const monday = new Date(weekMonday + 'T12:00:00')
  const diff = Math.round((target.getTime() - monday.getTime()) / (24 * 60 * 60 * 1000))
  return Math.min(5, Math.max(0, diff))
}

export async function resolveScheduleForOpen(
  items: DaySchedules[],
  appointmentId: string,
  scheduleKey?: string | null,
): Promise<ScheduleLike | null> {
  const fromGrid =
    findScheduleInItems(items, appointmentId) ||
    (scheduleKey ? findScheduleInItems(items, scheduleKey) : null)
  if (fromGrid) return fromGrid

  const stashed = readStashedAppointment()
  if (stashed?.id === appointmentId) {
    return appointmentToScheduleLike(stashed)
  }

  try {
    const res = await api.get(`appointments/${appointmentId}`)
    return appointmentToScheduleLike(res.data)
  } catch {
    return null
  }
}

export type PendingCalendarOpen = {
  appointmentId: string
  date: string
  scheduleKey?: string | null
}

export function parsePendingCalendarOpen(params: URLSearchParams): PendingCalendarOpen | null {
  const appointmentId = params.get('openAppointment')
  const date = params.get('date')
  if (!appointmentId || !date) return null
  return {
    appointmentId,
    date,
    scheduleKey: params.get('openSchedule'),
  }
}

export function getWeekMondayForPending(pending: PendingCalendarOpen) {
  return getMondayOfWeek(pending.date)
}
