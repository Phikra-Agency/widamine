import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { useAuthStore } from '@/stores/authStore'
import { Eye, CalendarBlank, EnvelopeSimple, Phone, Stethoscope, Door, User, PencilSimple as Pen } from '@phosphor-icons/react'
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
import { useDebouncedGlobalSearch } from '@/hooks/useDebouncedGlobalSearch'

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
                      <p className='mt-1 text-xs text-secondary/50'>{item.motif?.name || item.service?.name}</p>
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

function ShowModal() {
  const { openShowModal, setOpenShowModal, item, fetchItem, loadingItem, saveScheduleDate, savingScheduleSessionId } = useAppointmentsStore()
  const [sessionDates, setSessionDates] = useState<Record<number, string>>({})
  const [editingSessions, setEditingSessions] = useState<Record<number, boolean>>({})

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
    const dates = (item.service?.sessions || []).reduce((acc: Record<number, string>, session) => {
      const schedule = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)
      acc[session.id] = toDateTimeLocal(schedule?.datetime)
      return acc
    }, {} as Record<number, string>)

    setSessionDates(dates)
    setEditingSessions({})
  }, [item])

  return (
    <Dialog open={openShowModal} onOpenChange={setOpenShowModal}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden p-0 sm:max-w-4xl'>
        <DialogHeader className='border-b border-border px-4 py-4 text-left sm:px-6'>
          <DialogTitle className='text-lg font-semibold text-secondary'>Détails du rendez-vous</DialogTitle>
        </DialogHeader>

        {loadingItem ? (
          <div className='flex items-center justify-center p-6 text-secondary/60'>
            Chargement...
          </div>
        ) : (
          <ScrollArea className='max-h-[calc(100dvh-12rem)] sm:max-h-[calc(100vh-14rem)]'>
            <div className='p-4 sm:p-6'>
              <div className='mb-6 flex flex-col gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-center'>
                <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-control bg-secondary/[0.04]'>
                  <User size={26} className='text-secondary/50' />
                </div>
                <div className='min-w-0'>
                  <h3 className='text-lg font-semibold text-secondary'>{item.name}</h3>
                  <p className='text-sm text-secondary/50'>{item.motif?.name || item.service?.name}</p>
                </div>
                <div className='sm:ml-auto'>
                  <StatusBadge status={item.status || 'PENDING'} />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
                <div className='space-y-5'>
                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom complet</Label>
                    <div className='flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary'>
                      <User size={15} className='text-secondary/30' />
                      {item.name}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</Label>
                    <div className='flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary'>
                      <EnvelopeSimple size={15} className='text-secondary/30' />
                      {item.email}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Téléphone</Label>
                    <div className='flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary'>
                      <Phone size={15} className='text-secondary/30' />
                      {item.phone}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Service</Label>
                    <div className='flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary'>
                      <CalendarBlank size={15} className='text-secondary/30' />
                      {item.service?.name || '—'}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Motif</Label>
                    <div className='flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary'>
                      <Stethoscope size={15} className='text-secondary/30' />
                      {item.motif?.name || 'Service direct'}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Praticien</Label>
                    <div className='flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary'>
                      <Stethoscope size={15} className='text-secondary/30' />
                      {item.practitioner?.name || 'Affectation automatique'}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Ressource</Label>
                    <div className='flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary'>
                      <Door size={15} className='text-secondary/30' />
                      {item.resource?.name || 'Aucune ressource dédiée'}
                    </div>
                  </div>

                  {item.context && (
                    <div className='space-y-2'>
                      <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Message</Label>
                      <div className='max-h-32 overflow-y-auto rounded-control border border-border bg-background px-4 py-3 text-sm text-secondary/70'>
                        {item.context}
                      </div>
                    </div>
                  )}

                  <div className='space-y-2'>
                    <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Notifications</Label>
                    <div className='max-h-32 space-y-2 overflow-y-auto rounded-control border border-border bg-background p-3'>
                      {(item.notifications || []).length === 0 ? (
                        <p className='text-sm text-secondary/40'>Aucune notification</p>
                      ) : (
                        (item.notifications || []).map((notification) => (
                          <div key={notification.id} className='flex items-center justify-between gap-3 border-b border-border-subtle pb-2 last:border-0 last:pb-0'>
                            <span className='text-sm text-secondary/60'>{notification.channel} · {notification.recipientType}</span>
                            <StatusBadge status={notification.status} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h3 className='font-medium text-secondary'>Séances du service</h3>
                  <div className='space-y-3'>
                    {(item.service?.sessions || []).length === 0 && (
                      <div className='rounded-control border border-border bg-background p-4 text-center text-sm text-secondary/40'>
                        Aucune séance trouvée
                      </div>
                    )}

                    {(item.service?.sessions || []).map((session) => (
                      <div key={session.id} className='space-y-3 rounded-control border border-border bg-background p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-secondary/[0.04] text-sm font-medium text-secondary'>{session.session}</div>
                            <span className='text-sm font-medium text-secondary'>{session.duration} min</span>
                          </div>
                        </div>

                        {editingSessions[session.id] ? (
                          <div className='space-y-3'>
                            <Input
                              type='datetime-local'
                              value={sessionDates[session.id] || ''}
                              onChange={(e) => setSessionDates({ ...sessionDates, [session.id]: e.target.value })}
                            />
                            <div className='flex justify-end gap-2'>
                              <Button
                                onClick={() => {
                                  setEditingSessions({})
                                  const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                                  setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) })
                                }}
                                type='button'
                                variant='ghost'
                              >
                                Annuler
                              </Button>
                              <Button
                                onClick={async () => {
                                  const value = sessionDates[session.id]
                                  if (!value) return
                                  await saveScheduleDate({ sessionId: session.id, datetime: new Date(value).toISOString() })
                                  setEditingSessions({})
                                }}
                                type='button'
                                disabled={!sessionDates[session.id] || savingScheduleSessionId === session.id}
                              >
                                {savingScheduleSessionId === session.id ? 'Enregistrement...' : 'Enregistrer'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                            <span className='text-sm text-secondary/60'>
                              {(() => {
                                const schedule = item.schedules?.find((s) => s.sessionId === session.id)
                                if (schedule?.datetime) {
                                  return new Date(schedule.datetime).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                }
                                return 'Date non programmée'
                              })()}
                            </span>
                            <div className='flex justify-end sm:block'>
                              <Button
                                onClick={() => {
                                  setEditingSessions({ [session.id]: true })
                                  const currentDate = item.schedules?.find((currentSchedule) => currentSchedule.sessionId === session.id)?.datetime
                                  setSessionDates({ ...sessionDates, [session.id]: toDateTimeLocal(currentDate) })
                                }}
                                type='button'
                                variant='ghost'
                                size='icon-sm'
                                className='text-secondary/40 hover:text-primary hover:bg-primary/10'
                              >
                                <Pen size={14} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter className='border-t border-border px-4 py-4 sm:px-6'>
          <Button type='button' variant='ghost' onClick={() => setOpenShowModal(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
