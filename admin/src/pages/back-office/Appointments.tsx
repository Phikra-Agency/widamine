import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { useAuthStore } from '@/stores/authStore'
import { Eye, CalendarBlank, EnvelopeSimple, Phone, Stethoscope, Door, User, PencilSimple as Pen, CheckCircle, Clock, Translate, type Icon } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { useDebounce } from 'use-debounce'
import type { ColumnFiltersState } from '@tanstack/react-table'
import { DataTable, DataTableFilterPills, DataTablePagination, TanStackDataTable, useDataTable, type FilterPillOption } from '@/components/data-table'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { APPOINTMENTS_EMPTY_ILLUSTRATION, createAppointmentsColumns } from './columns/appointmentsColumns'


const STATUS_FILTER_PILLS: FilterPillOption[] = [
  { value: 'all', label: 'Tous', color: 'mist' },
  { value: 'PENDING', label: 'En attente', color: 'sand' },
  { value: 'CONFIRMED', label: 'Confirmé', color: 'sea' },
  { value: 'COMPLETED', label: 'Terminé', color: 'sage' },
  { value: 'CANCELLED', label: 'Annulé', color: 'coral' },
  { value: 'EXPIRED', label: 'Expiré', color: 'sky' },
  { value: 'NO_SHOW', label: 'Absent', color: 'aqua' },
]

export default function Appointments() {
  return (
    <div className='bo-page'>
      <div className='bo-page-inner bo-section-stack'>
        <div className='bo-page-ambient-tr' />
        <div className='bo-page-ambient-bl' />
        <Heading />
        <Card className='bo-table-card'>
          <AppointmentsTable />
        </Card>
      </div>
      <ShowModal />
    </div>
  )
}

function Heading() {
  return (
    <div className='bo-page-heading'>
      <h3 className='bo-title'>Gestion Des Rendez-vous</h3>
    </div>
  )
}

function AppointmentsTable() {
  const { items, filters, setFilters, fetchItems, setItem, toggleOpenShowModal, setOpenShowModal } = useAppointmentsStore()
  const [loading, setLoading] = useState(true)
  const [debouncedStatus] = useDebounce(filters.status, 300)
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
      createAppointmentsColumns({
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
    columnFilters,
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
        emptyIllustration={APPOINTMENTS_EMPTY_ILLUSTRATION}
        emptyTitle='Aucun rendez-vous trouvé'
        emptyDescription='Les rendez-vous apparaîtront ici'
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
            {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
            {isEmpty && (
              <DataTable.Empty
                illustration={APPOINTMENTS_EMPTY_ILLUSTRATION}
                title='Aucun rendez-vous trouvé'
                description='Les rendez-vous apparaîtront ici'
              />
            )}
            {!loading &&
              rows.map((row) => {
                const item = row.original
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
                      <p className='text-sm font-semibold'>{item.name}</p>
                      <p className='mt-1 text-xs text-secondary/50'>{item.motif?.name || '-'}</p>
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
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé',
    EXPIRED: 'Expiré',
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
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé',
    EXPIRED: 'Expiré',
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

function initials(name: string) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function InfoRow({ icon: Icon, label, value }: { icon: Icon; label: string; value?: string }) {
  return (
    <div className='flex items-center gap-2.5'>
      <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]'>
        <Icon size={12} className='text-primary' />
      </div>
      <div>
        <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>{label}</p>
        <p className='text-sm text-foreground'>{value || '—'}</p>
      </div>
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

  return (
    <Dialog open={openShowModal} onOpenChange={setOpenShowModal}>
      <DialogContent showCloseButton className='flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
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
            <div className='flex items-start justify-between shrink-0 px-5 pt-5 pb-3'>
              <div className='flex items-start gap-3'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-sm font-bold text-primary'>
                  {initials(item.name)}
                </div>
                <div className='min-w-0 pt-0.5'>
                  <h2 className='text-base font-semibold leading-5 text-foreground'>{item.name}</h2>
                  <div className='mt-1.5'>
                    <StatusBadge status={item.status || 'PENDING'} />
                  </div>
                  <p className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/60'>
                    <EnvelopeSimple size={12} />
                    {item.email}
                    <span className='mx-1 text-muted-foreground/20'>·</span>
                    <Phone size={12} />
                    {item.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className='mx-5 h-px bg-border-subtle/40' />

            <ScrollArea className='flex-1 min-h-0'>
              <div className='grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-4'>
                <InfoRow icon={User} label='Nom' value={item.name} />
                <InfoRow icon={Stethoscope} label='Traitement' value={item.motif?.name || 'Service direct'} />
                <InfoRow icon={User} label='Praticien' value={item.practitioner?.name || 'Affectation automatique'} />
                <InfoRow icon={Door} label='Ressource' value={item.resource?.name || 'Aucune'} />
              </div>

              {item.context && (
                <>
                  <div className='mx-5 h-px bg-border-subtle/40' />
                  <div className='px-5 py-4'>
                    <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Message</p>
                    <div className='mt-2 max-h-[180px] overflow-y-auto rounded-xl bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground/60'>
                      {item.context}
                    </div>
                  </div>
                </>
              )}

              <div className='mx-5 h-px bg-border-subtle/40' />
              <div className='px-5 py-4'>
                <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Notifications</p>
                <div className='mt-2 space-y-2'>
                  {(item.notifications || []).length === 0 ? (
                    <p className='text-sm text-muted-foreground/40'>Aucune notification</p>
                  ) : (
                    (item.notifications || []).map((notification) => (
                      <div key={notification.id} className='flex items-center justify-between gap-3'>
                        <span className='text-sm text-muted-foreground/60'>{notification.channel} · {notification.recipientType}</span>
                        <StatusBadge status={notification.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className='mx-5 h-px bg-border-subtle/40' />

              <div className='px-5 py-4'>
                <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Séances</p>
                <div className='mt-2 space-y-3'>
                    {(item.motif?.sessions || []).length === 0 && (
                      <p className='text-sm text-muted-foreground/40'>Aucune séance</p>
                    )}

                    {(item.motif?.sessions || []).map((session) => (
                      <div key={session.id} className='rounded-xl bg-muted/30 p-3.5'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/[0.06] text-xs font-medium text-primary'>
                              {session.session}
                            </div>
                            <span className='text-sm font-medium text-foreground'>{session.duration} min</span>
                          </div>
                        </div>

                        {editingSessions[session.id] ? (
                          <div className='mt-3 space-y-3'>
                            <Input
                              type='datetime-local'
                              value={sessionDates[session.id] || ''}
                              onChange={(e) => setSessionDates({ ...sessionDates, [session.id]: e.target.value })}
                            />
                            <div className='flex justify-end gap-2'>
                              <Button onClick={() => {
                                  setEditingSessions({})
                                  const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                                  setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) }}
                                }}
                                type='button' variant='ghost'
                              >
                                Annuler
                              </Button>
                              <Button
                                onClick={() => {
                                  const value = sessionDates[session.id]
                                  if (!value) return
                                  saveScheduleDate({ sessionId: session.id, datetime: new Date(value).toISOString() }).then(() => setEditingSessions({}))
                                }}
                                type='button'
                                disabled={!sessionDates[session.id] || savingScheduleSessionId === session.id}
                              >
                                {savingScheduleSessionId === session.id ? 'Enregistrement...' : 'Enregistrer'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='mt-2 flex items-center justify-between'>
                            <span className='text-sm text-muted-foreground/60'>
                              {(() => {
                                const schedule = item.schedules?.find((s) => s.sessionId === session.id)
                                if (schedule?.datetime) {
                                  return new Date(schedule.datetime).toLocaleString('fr-FR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })
                                }
                                return 'Date non programmée'
                              })()}
                            </span>
                            <Button
                              onClick={() => {
                                setEditingSessions({ [session.id]: true })
                                const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                                setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) })
                              }}
                              type='button' variant='ghost' size='icon-sm'
                              className='text-muted-foreground/40 hover:text-primary hover:bg-primary/10'
                            >
                              <Pen size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
        )}

        <div className='flex shrink-0 items-center justify-end border-t border-border-subtle/40 px-5 py-3'>
          <Button type='button' variant='ghost' onClick={() => setOpenShowModal(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
