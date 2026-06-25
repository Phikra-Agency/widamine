import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { useAuthStore } from '@/stores/authStore'
import { Eye, CalendarBlank, EnvelopeSimple, Phone, Stethoscope, Door, User, PencilSimple as Pen, Clock, CheckCircle, XCircle, Timer } from '@phosphor-icons/react'
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
        onView: (item) => {
          setItem(item)
          toggleOpenShowModal()
        },
      }),
    [setItem, toggleOpenShowModal],
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
                    setItem(item)
                    toggleOpenShowModal()
                  }}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold'>Réservation #{item.id}</p>
                      <p className='mt-1 text-xs text-secondary/50'>
                        {scheduledDate || 'Non programmé'} · {item.motif?.name || '-'}
                      </p>
                    </div>
                    <StatusBadge status={item.status || 'PENDING'} />
                  </div>
                  <div className='mt-3 space-y-2 text-sm text-secondary/65'>
                    <div className='flex items-center gap-2'>
                      <User size={14} className='text-secondary/30' />
                      <span className='min-w-0 truncate'>{item.name}</span>
                    </div>
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
                  <div className='mt-4 flex items-center justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='text-[10px] uppercase tracking-[0.16em] text-secondary/35'>Statut</p>
                      <div className='mt-1'>
                        <StatusSelect appointmentId={item.id!} status={item.status || 'PENDING'} />
                      </div>
                    </div>
                    <span className='inline-flex items-center gap-1 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary'>
                      <Eye size={14} />
                      Voir
                    </span>
                  </div>
                </DataTable.MobileCard>
                )
              })}
          </DataTable.MobileList>
      </DataTable.Mobile>

      <div className='border-t border-border-subtle px-4 py-3'>
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
        'inline-flex items-center pl-5 pr-2 py-1 rounded-control text-xs font-medium border cursor-pointer appearance-none bg-no-repeat focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60',
        current === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
        current === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
        current === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
        current === 'COMPLETED' ? 'bg-sky-50 text-sky-700 border-sky-100' :
        current === 'EXPIRED' ? 'bg-slate-50 text-slate-700 border-slate-100' :
        current === 'NO_SHOW' ? 'bg-violet-50 text-violet-700 border-violet-100' :
        'bg-secondary/5 text-secondary/70 border-secondary/20'
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23043f50' opacity='0.4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundSize: '10px', paddingLeft: '22px' }}
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

function DetailCard({ icon: Icon, label, children, color }: { icon?: React.ElementType; label: string; children: React.ReactNode; color?: string }) {
  return (
    <div className='group relative overflow-hidden rounded-surface bg-card shadow-bo-card transition-all duration-200 hover:shadow-bo-elevated hover:-translate-y-0.5'>
      {color && <div className='absolute left-0 top-0 h-full w-0.5 rounded-l-sm' style={{ backgroundColor: color }} />}
      <div className='px-4 py-3.5'>
        <div className='mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
          {Icon && <Icon size={11} />}
          {label}
        </div>
        <div className='text-sm font-medium text-foreground'>{children}</div>
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, label, children }: { icon?: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className='rounded-surface bg-card shadow-bo-card'>
      <div className='flex items-center gap-2.5 border-b border-border-subtle px-4 py-3'>
        <div className='flex h-7 w-7 items-center justify-center rounded-element bg-primary/8 text-primary'>
          {Icon && <Icon size={14} />}
        </div>
        <span className='text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>{label}</span>
      </div>
      <div className='p-4'>{children}</div>
    </div>
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
  const initials = (item.name || 'N/A').slice(0, 2).toUpperCase()

  return (
    <Dialog open={openShowModal} onOpenChange={setOpenShowModal}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-4xl'>
        {loadingItem ? (
          <div className='flex items-center justify-center p-14 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2.5'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary' />
              <span>Chargement des détails…</span>
            </div>
          </div>
        ) : (
          <>
            <div className='relative overflow-hidden bg-card/60 px-6 pb-4 pt-5 shadow-[0_1px_0_0] shadow-border-subtle'>
              <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none' />
              <div className='relative flex items-start gap-4'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-sm font-bold text-white shadow-bo-card' style={{ backgroundColor: motifColor }}>
                  {initials}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[11px] font-medium text-muted-foreground/60'>Réservation</span>
                        <span className='rounded-element bg-muted/70 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground/50'>#{item.id}</span>
                      </div>
                      <h2 className='text-lg font-semibold leading-6 text-foreground'>{item.motif?.name || 'Sans motif'}</h2>
                      <p className='text-sm text-muted-foreground/70'>{item.name}</p>
                    </div>
                    <Pill status={item.status || 'PENDING'} />
                  </div>
                </div>
                <Button
                  onClick={() => setOpenShowModal(false)}
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  className='absolute right-1 top-0 text-muted-foreground/30 hover:text-foreground hover:bg-transparent'
                >
                  <XCircle size={18} />
                </Button>
              </div>
            </div>

            <ScrollArea className='max-h-[calc(100dvh-16rem)] sm:max-h-[calc(100vh-18rem)]'>
              <div className='grid grid-cols-1 gap-5 p-5 xl:grid-cols-5'>
                <div className='space-y-5 xl:col-span-3'>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <DetailCard icon={Clock} label='Date & Heure' color={motifColor}>
                      {(() => {
                        const s = item.schedules?.[0]?.datetime
                        if (!s) return <span className='text-muted-foreground/50'>Non programmé</span>
                        return new Date(s).toLocaleString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      })()}
                    </DetailCard>
                    <DetailCard icon={CalendarBlank} label='Session' color={motifColor}>
                      {item.sessionNumber ? `Séance ${item.sessionNumber}` : <span className='text-muted-foreground/50'>—</span>}
                    </DetailCard>
                    <DetailCard icon={Stethoscope} label='Praticien' color={motifColor}>
                      {item.practitioner?.name || <span className='text-muted-foreground/50'>Affectation automatique</span>}
                    </DetailCard>
                    <DetailCard icon={Door} label='Ressource' color={motifColor}>
                      {item.resource?.name || <span className='text-muted-foreground/50'>Non assignée</span>}
                    </DetailCard>
                  </div>

                  {item.context && (
                    <div className='rounded-surface bg-card shadow-bo-card'>
                      <div className='flex items-center gap-2.5 border-b border-border-subtle px-4 py-3'>
                        <div className='flex h-7 w-7 items-center justify-center rounded-element bg-primary/8 text-primary'>
                          <EnvelopeSimple size={14} />
                        </div>
                        <span className='text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Message</span>
                      </div>
                      <div className='px-4 py-3.5'>
                        <p className='text-sm leading-relaxed text-muted-foreground/75'>{item.context}</p>
                      </div>
                    </div>
                  )}

                  <SectionCard icon={User} label='Patient'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground/60 ring-2 ring-card'>
                        {initials}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium text-foreground'>{item.name}</p>
                        <div className='mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/60'>
                          <span className='inline-flex items-center gap-1'>
                            <EnvelopeSimple size={11} /> {item.email}
                          </span>
                          <span className='inline-flex items-center gap-1'>
                            <Phone size={11} /> {item.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard icon={EnvelopeSimple} label='Notifications'>
                    {(item.notifications || []).length === 0 ? (
                      <p className='text-sm text-muted-foreground/50'>Aucune notification envoyée</p>
                    ) : (
                      <div className='space-y-1.5'>
                        {(item.notifications || []).map((n) => {
                          const nStatus = n.status === 'SENT' ? 'Envoyé' : n.status === 'FAILED' ? 'Échoué' : n.status
                          const nColor = n.status === 'SENT' ? 'bg-emerald-50 text-emerald-600' : n.status === 'FAILED' ? 'bg-red-50 text-red-600' : 'bg-muted text-muted-foreground'
                          return (
                            <div key={n.id} className='flex items-center justify-between rounded-element bg-card px-3 py-2 shadow-sm ring-1 ring-border-subtle'>
                              <div className='flex items-center gap-2 text-xs'>
                                <span className='font-medium text-muted-foreground/70'>{n.channel}</span>
                                <span className='text-muted-foreground/30'>·</span>
                                <span className='text-muted-foreground/55'>{n.recipientType}</span>
                              </div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ring-transparent ${nColor}`}>
                                {nStatus}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </SectionCard>
                </div>

                <div className='xl:col-span-2'>
                  <SectionCard icon={CalendarBlank} label='Séances'>
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
                  </SectionCard>
                </div>
              </div>
            </ScrollArea>

            <div className='flex items-center justify-between border-t border-border-subtle bg-muted/20 px-5 py-3'>
              <span className='text-xs text-muted-foreground/40'>Détails de la réservation</span>
              <Button type='button' variant='ghost' size='sm' onClick={() => setOpenShowModal(false)}>
                Fermer
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
