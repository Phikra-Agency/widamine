import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { useAuthStore } from '@/stores/authStore'
import { CalendarBlank, EnvelopeSimple, Phone, Stethoscope, Door, User, PencilSimple as Pen, Clock, CheckCircle, XCircle, Timer } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { useDebounce } from 'use-debounce'
import type { ColumnFiltersState } from '@tanstack/react-table'
import { DataTable, DataTableFilterPills, DataTablePagination, globalSearchFilter, TanStackDataTable, useDataTable, type FilterPillOption } from '@/components/data-table'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RESERVATIONS_EMPTY_ILLUSTRATION, createReservationsColumns } from './columns/reservationsColumns'
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'

const STATUS_FILTER_PILLS: FilterPillOption[] = [
  { value: 'all', label: 'Toutes', color: 'mist' },
  { value: 'PENDING', label: 'En attente', color: 'sand' },
  { value: 'CONFIRMED', label: 'Confirmée', color: 'sea' },
  { value: 'COMPLETED', label: 'Terminée', color: 'sage' },
  { value: 'CANCELLED', label: 'Annulée', color: 'coral' },
  { value: 'EXPIRED', label: 'Expirée', color: 'sky' },
  { value: 'NO_SHOW', label: 'Absent', color: 'aqua' },
]

export default function Reservations() {
  return (
    <div className='bo-page'>
      <div className='bo-page-inner bo-section-stack'>
        <div className='bo-page-ambient-tr' />
        <div className='bo-page-ambient-bl' />
        <Heading />
        <Card className='bo-table-card'>
          <ReservationsTable />
        </Card>
      </div>
      <ShowModal />
    </div>
  )
}

function Heading() {
  return (
    <div className='bo-page-heading'>
      <div>
        <h3 className='bo-title'>Gestion Des Réservations</h3>
      </div>
    </div>
  )
}

function ReservationsTable() {
  const { items, filters, setFilters, fetchItems, setItem, toggleOpenShowModal, setOpenShowModal } = useAppointmentsStore()
  const [loading, setLoading] = useState(true)
  const [debouncedStatus] = useDebounce(filters.status, 300)
  const debouncedSearch = useDebouncedGlobalSearch()
  const [searchParams] = useSearchParams()
  const hasOpenedFromUrl = useRef(false)

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  useEffect(() => {
    const id = searchParams.get('id')
    if (id && !hasOpenedFromUrl.current) {
      hasOpenedFromUrl.current = true
      const checkAndOpen = () => {
        const appointment = items.find(item => String(item.id) === id)
        if (appointment) {
          setItem(appointment)
          setOpenShowModal(true)
        }
      }
      if (items.length > 0) {
        checkAndOpen()
      } else {
        const timer = setTimeout(checkAndOpen, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [items, searchParams, setItem, setOpenShowModal])

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [{ id: 'status', value: debouncedStatus || 'all' }],
    [debouncedStatus],
  )

  const columns = useMemo(
    () =>
      createReservationsColumns({
        StatusSelect,
      }),
    [],
  )

  const table = useDataTable({
    data: items,
    columns,
    enablePagination: true,
    pageSize: 10,
    globalFilter: debouncedSearch,
    columnFilters,
    globalFilterFn: (row, columnId, filterValue) =>
      globalSearchFilter(row, columnId, filterValue, ['name', 'email', 'phone']),
  })

  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <DataTable.Toolbar>
        <DataTableFilterPills
          options={STATUS_FILTER_PILLS}
          value={filters.status || 'all'}
          onChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
        />
      </DataTable.Toolbar>

      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={RESERVATIONS_EMPTY_ILLUSTRATION}
        emptyTitle='Aucune réservation trouvée'
        emptyDescription='Les réservations apparaîtront ici'
        stopClickOnColumns={['status']}
        onRowClick={(appointment) => {
          useAppointmentsStore.setState({ item: appointment, openShowModal: true })
        }}
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
            {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
            {isEmpty && (
              <DataTable.Empty
                illustration={RESERVATIONS_EMPTY_ILLUSTRATION}
                title='Aucune réservation trouvée'
                description='Les réservations apparaîtront ici'
              />
            )}
              {!loading &&
              rows.map((row) => {
                const item = row.original
                const firstSchedule = item.schedules?.[0]
                const scheduledDate = firstSchedule?.datetime
                  ? new Date(firstSchedule.datetime).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                  : null
                return (
                <DataTable.MobileCard
                  key={row.id}
                  onClick={() => {
                    useAppointmentsStore.setState({ item, openShowModal: true })
                  }}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-element bg-primary/8'>
                          <User size={14} className='text-primary' />
                        </div>
                        <p className='text-sm font-semibold'>{item.name}</p>
                      </div>
                      <p className='mt-1 text-xs text-secondary/50 ml-9'>
                        {scheduledDate || 'Non programmé'} · {item.motif?.name || '-'}
                      </p>
                    </div>
                    <StatusBadge status={item.status || 'PENDING'} />
                  </div>
                  <div className='mt-3 space-y-2 text-sm text-secondary/65'>
                    <div className='flex items-center gap-2'>
                      <EnvelopeSimple size={14} className='text-secondary/30' />
                      <span className='min-w-0 truncate'>{item.email}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone size={14} className='text-secondary/30' />
                      <span>{item.phone}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Stethoscope size={14} className='text-secondary/30' />
                      <span>{item.practitioner?.name || 'Auto'}</span>
                    </div>
                    {item.resource?.name && (
                      <div className='flex items-center gap-2'>
                        <Door size={14} className='text-secondary/30' />
                        <span>{item.resource.name}</span>
                      </div>
                    )}
                  </div>
                  <div className='mt-3'>
                    <StatusSelect appointmentId={item.id!} status={item.status || 'PENDING'} />
                  </div>
                </DataTable.MobileCard>
                )
              })}
          </DataTable.MobileList>
      </DataTable.Mobile>

      <div className='flex justify-end px-4 py-3'>
        <DataTablePagination table={table} />
      </div>
    </DataTable.Root>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-600',
    CONFIRMED: 'bg-emerald-50 text-emerald-600',
    CANCELLED: 'bg-red-50 text-red-600',
    COMPLETED: 'bg-sky-50 text-sky-600',
    EXPIRED: 'bg-gray-50 text-gray-600',
    NO_SHOW: 'bg-violet-50 text-violet-600',
    SENT: 'bg-emerald-50 text-emerald-600',
    FAILED: 'bg-red-50 text-red-600',
    SKIPPED: 'bg-gray-50 text-gray-600',
  }

  const labels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    CANCELLED: 'Annulée',
    COMPLETED: 'Terminée',
    EXPIRED: 'Expirée',
    NO_SHOW: 'Absent',
    SENT: 'Envoyé',
    FAILED: 'Échoué',
    SKIPPED: 'Ignoré',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-element text-xs font-medium ${styles[status] || styles.PENDING}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'CONFIRMED' ? 'bg-emerald-500' : status === 'PENDING' ? 'bg-amber-500' : status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-400'}`} />
      {labels[status] || status}
    </span>
  )
}

function StatusSelect({ appointmentId, status }: { appointmentId: number; status: string }) {
  const { fetchItems } = useAppointmentsStore()
  const { user } = useAuthStore()
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const [current, setCurrent] = useState(status)
  const [saving, setSaving] = useState(false)

  const allLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    CANCELLED: 'Annulée',
    COMPLETED: 'Terminée',
    EXPIRED: 'Expirée',
    NO_SHOW: 'Absent',
  }

  const labels = isPractitioner
    ? { CONFIRMED: allLabels.CONFIRMED, COMPLETED: allLabels.COMPLETED, NO_SHOW: allLabels.NO_SHOW }
    : allLabels

  async function handleChange(newStatus: string) {
    if (newStatus === current) return
    setSaving(true)
    try {
      await api.put(`appointments/${appointmentId}`, { status: newStatus })
      setCurrent(newStatus)
      fetchItems()
    } catch {
      setCurrent(current)
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className={clsx(
        'min-w-[140px] py-1 rounded-control text-xs font-medium border cursor-pointer appearance-none bg-no-repeat focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60',
        current === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
        current === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
        current === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
        current === 'COMPLETED' ? 'bg-sky-50 text-sky-700 border-sky-100' :
        current === 'EXPIRED' ? 'bg-slate-50 text-slate-700 border-slate-100' :
        current === 'NO_SHOW' ? 'bg-violet-50 text-violet-700 border-violet-100' :
        'bg-secondary/5 text-secondary/70 border-secondary/20'
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23043f50' opacity='0.4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 10px center', backgroundSize: '10px', paddingLeft: '16px', paddingRight: '34px' }}
    >
      {Object.entries(labels).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  )
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-50', icon: Timer },
  CONFIRMED: { label: 'Confirmée', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
  COMPLETED: { label: 'Terminée', color: 'text-sky-700', bg: 'bg-sky-50', icon: CheckCircle },
  EXPIRED: { label: 'Expirée', color: 'text-gray-700', bg: 'bg-gray-50', icon: Timer },
  NO_SHOW: { label: 'Absent', color: 'text-violet-700', bg: 'bg-violet-50', icon: XCircle },
}

function Pill({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.PENDING
  const I = m.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${m.bg} ${m.color} px-3 py-1 text-xs font-medium ring-1 ring-inset ring-transparent`}>
      <I size={12} weight='fill' />
      {m.label}
    </span>
  )
}



function SessionTimeline({ sessions, schedules, onEdit, onSave, editingSessions, sessionDates, onDateChange, savingId, onCancel }: {
  sessions: { id: string; session: number; duration: number }[]
  schedules?: { id: string; datetime: string; sessionId: string }[]
  onEdit: (id: string) => void
  onSave: (id: string) => Promise<void>
  editingSessions: Record<string, boolean>
  sessionDates: Record<string, string>
  onDateChange: (id: string, value: string) => void
  savingId: string | null
  onCancel: (id: string) => void
}) {
  if (sessions.length === 0) {
    return (
      <div className='rounded-element border border-dashed border-border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground'>
        Aucune séance configurée
      </div>
    )
  }

  return (
    <div className='relative'>
      {sessions.map((session, idx) => {
        const schedule = schedules?.find((s) => s.sessionId === session.id)
        const isEditing = editingSessions[session.id]
        const isLast = idx === sessions.length - 1
        const hasDate = !!schedule?.datetime

        return (
          <div key={session.id} className='relative flex gap-4 pb-5 last:pb-0'>
            <div className='flex flex-col items-center'>
              <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-card transition-colors duration-200 ${
                hasDate ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {session.session}
              </div>
              {!isLast && <div className='mt-0.5 h-full w-px bg-border-subtle' />}
            </div>
            <div className='min-w-0 flex-1 pt-0.5'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-foreground'>Séance {session.session}</span>
                  <span className='rounded-element bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>{session.duration} min</span>
                </div>
                {!isEditing && (
                  <Button onClick={() => onEdit(session.id)} type='button' variant='ghost' size='icon-xs' className='text-muted-foreground/40 hover:text-primary hover:bg-primary/8'>
                    <Pen size={12} />
                  </Button>
                )}
              </div>
              {isEditing ? (
                <div className='mt-2.5 space-y-2.5 rounded-element border border-border bg-muted/30 p-3'>
                  <Input
                    type='datetime-local'
                    value={sessionDates[session.id] || ''}
                    onChange={(e) => onDateChange(session.id, e.target.value)}
                    className='h-8 text-xs'
                  />
                  <div className='flex gap-2'>
                    <Button onClick={() => onCancel(session.id)} type='button' variant='ghost' size='xs'>
                      Annuler
                    </Button>
                    <Button
                      onClick={() => onSave(session.id)}
                      type='button'
                      size='xs'
                      disabled={!sessionDates[session.id] || savingId === session.id}
                    >
                      {savingId === session.id ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className='mt-0.5 text-xs text-muted-foreground/70'>
                  {hasDate
                    ? new Date(schedule.datetime).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : <span className='italic text-muted-foreground/40'>Date non programmée</span>}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ShowModal() {
  const { openShowModal, setOpenShowModal, item, fetchItem, loadingItem, saveScheduleDate, savingScheduleSessionId } = useAppointmentsStore()
  const [sessionDates, setSessionDates] = useState<Record<string, string>>({})
  const [editingSessions, setEditingSessions] = useState<Record<string, boolean>>({})

  function toDateTimeLocal(value?: string) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  useEffect(() => {
    if (!openShowModal || !item.id) return
    fetchItem(item.id)
  }, [openShowModal])

  useEffect(() => {
    const dates = (item.motif?.sessions || []).reduce((acc: Record<string, string>, session) => {
      const schedule = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)
      acc[session.id] = toDateTimeLocal(schedule?.datetime)
      return acc
    }, {} as Record<string, string>)
    setSessionDates(dates)
    setEditingSessions({})
  }, [item])

  const motifColor = item.motif?.color || '#009fd6'
  const initials = (item.name || 'N/A').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const schedDate = item.schedules?.[0]?.datetime
  const schedFormatted = schedDate
    ? new Date(schedDate).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <Dialog open={openShowModal} onOpenChange={setOpenShowModal}>
      <DialogContent showCloseButton={false} className='sm:max-w-lg rounded-2xl overflow-hidden p-0 gap-0'>
        {loadingItem ? (
          <div className='flex items-center justify-center p-14 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2.5'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary' />
              <span>Chargement…</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className='flex items-start justify-between px-5 pt-5 pb-3'>
              <div className='flex items-start gap-3'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white' style={{ backgroundColor: motifColor }}>
                  {initials}
                </div>
                <div className='min-w-0 pt-0.5'>
                  <h2 className='text-base font-semibold text-foreground leading-5'>{item.name}</h2>
                  <div className='mt-1.5 flex items-center gap-2'>
                    <Pill status={item.status || 'PENDING'} />
                  </div>
                  {schedFormatted && (
                    <p className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/55'>
                      <Clock size={11} />
                      {schedFormatted}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setOpenShowModal(false)} className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/30 transition-colors hover:bg-muted/40 hover:text-foreground -mt-0.5 -mr-0.5'>
                <XCircle size={16} />
              </button>
            </div>

            <div className='mx-5 h-px bg-border-subtle/40' />

            {/* Content */}
            <ScrollArea className='max-h-[calc(100dvh-12rem)]'>
              <div className='px-5 py-4 space-y-4'>
                {/* Info grid */}
                <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
                  {[
                    { icon: CalendarBlank, label: 'Motif', value: item.motif?.name || '—' },
                    { icon: Stethoscope, label: 'Praticien', value: item.practitioner?.name || 'Auto' },
                    { icon: Door, label: 'Salle', value: item.resource?.name || '—' },
                    { icon: Timer, label: 'Durée', value: item.motif?.duration ? `${item.motif.duration} min` : '—' },
                  ].map(({ icon: I, label, value }) => (
                    <div key={label} className='flex items-center gap-2.5'>
                      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]'>
                        <I size={13} className='text-primary/60' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>{label}</p>
                        <p className='text-sm font-medium text-foreground/85 truncate'>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Patient */}
                <div className='rounded-xl bg-muted/30 p-3.5'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground/60'>
                      {initials}
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm font-medium text-foreground/85'>{item.name}</p>
                      <div className='mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/50'>
                        {item.email && <span className='inline-flex items-center gap-1'><EnvelopeSimple size={10} />{item.email}</span>}
                        {item.phone && <span className='inline-flex items-center gap-1'><Phone size={10} />{item.phone}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context */}
                {item.context && (
                  <div className='space-y-1.5'>
                    <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Message</p>
                    <p className='text-sm leading-relaxed text-foreground/65 rounded-xl bg-muted/30 p-3.5'>{item.context}</p>
                  </div>
                )}

                {/* Notifications */}
                {item.notifications && item.notifications.length > 0 && (
                  <div className='space-y-1.5'>
                    <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Notifications</p>
                    <div className='space-y-1.5'>
                      {item.notifications.map((n) => (
                        <div key={n.id} className='flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2.5'>
                          <span className='text-xs text-muted-foreground/55'>{n.channel} · {n.recipientType}</span>
                          <StatusBadge status={n.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Séances */}
                <div className='space-y-1.5'>
                  <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Séances</p>
                  <div className='rounded-xl bg-muted/30 p-3.5'>
                    <SessionTimeline
                      sessions={item.motif?.sessions || []}
                      schedules={item.schedules}
                      editingSessions={editingSessions}
                      sessionDates={sessionDates}
                      onEdit={(id) => {
                        setEditingSessions({ [id]: true })
                        const currentDate = item.schedules?.find((s) => s.sessionId === id)?.datetime
                        setSessionDates({ ...sessionDates, [id]: toDateTimeLocal(currentDate) })
                      }}
                      onCancel={(id) => {
                        setEditingSessions({})
                        const currentDate = item.schedules?.find((s) => s.sessionId === id)?.datetime
                        setSessionDates({ ...sessionDates, [id]: toDateTimeLocal(currentDate) })
                      }}
                      onDateChange={(id, value) => setSessionDates({ ...sessionDates, [id]: value })}
                      onSave={async (id) => {
                        const value = sessionDates[id]
                        if (!value) return
                        await saveScheduleDate({ sessionId: id, datetime: new Date(value).toISOString() })
                        setEditingSessions({})
                      }}
                      savingId={savingScheduleSessionId}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className='flex items-center justify-end border-t border-border-subtle/40 px-5 py-3'>
              <Button type='button' variant='ghost' size='sm' onClick={() => setOpenShowModal(false)} className='text-xs font-medium text-muted-foreground/45 hover:text-foreground'>
                Fermer
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
