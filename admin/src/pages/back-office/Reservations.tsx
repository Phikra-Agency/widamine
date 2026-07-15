import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { useAuthStore } from '@/stores/authStore'
import { CalendarBlank, EnvelopeSimple, Phone, Stethoscope, Door, User, Clock, CheckCircle, XCircle, Timer, ArrowRight, UserPlus, MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGlobalSearchStore } from '@/stores/globalSearchStore'

const STATUS_FILTER_PILLS: FilterPillOption[] = [
  { value: 'all', label: 'Toutes', color: 'mist' },
  { value: 'PENDING', label: 'En attente', color: 'sand' },
  { value: 'CONFIRMED', label: 'Confirmée', color: 'sea' },
  { value: 'COMPLETED', label: 'Terminée', color: 'sage' },
  { value: 'CANCELLED', label: 'Annulée', color: 'coral' },
  { value: 'EXPIRED', label: 'Expirée', color: 'sky' },
  { value: 'NO_SHOW', label: 'Absent', color: 'aqua' },
]

const THEME_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  sand: {
    bg: 'color-mix(in srgb, var(--color-fam-treatment) 18%, white)',
    text: '#7a5a32',
    border: 'color-mix(in srgb, var(--color-fam-treatment) 35%, white)',
    dot: '#7a5a32',
  },
  sea: {
    bg: 'color-mix(in srgb, var(--color-logo-sea) 14%, white)',
    text: 'var(--color-logo-deep)',
    border: 'color-mix(in srgb, var(--color-logo-sea) 35%, var(--color-logo-deep))',
    dot: 'var(--color-logo-deep)',
  },
  coral: {
    bg: 'color-mix(in srgb, var(--color-fam-urgent) 14%, white)',
    text: '#8f4545',
    border: 'color-mix(in srgb, var(--color-fam-urgent) 30%, white)',
    dot: '#8f4545',
  },
  sage: {
    bg: 'color-mix(in srgb, var(--color-fam-followup) 16%, white)',
    text: '#2f6f66',
    border: 'color-mix(in srgb, var(--color-fam-followup) 35%, white)',
    dot: '#2f6f66',
  },
  mist: {
    bg: 'color-mix(in srgb, var(--color-logo-mist) 72%, white)',
    text: 'var(--color-logo-deep)',
    border: 'color-mix(in srgb, var(--color-logo-mist) 55%, var(--color-logo-deep))',
    dot: 'var(--color-logo-deep)',
  },
  aqua: {
    bg: 'color-mix(in srgb, var(--color-logo-aqua) 22%, white)',
    text: 'var(--color-secondary-800)',
    border: 'color-mix(in srgb, var(--color-logo-aqua) 40%, var(--color-logo-deep))',
    dot: 'var(--color-secondary-800)',
  },
}

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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { 0: debouncedStatus } = useDebounce(filters.status || 'PENDING', 300)
  const debouncedSearch = useDebouncedGlobalSearch()
  const [searchParams] = useSearchParams()
  const hasOpenedFromUrl = useRef(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchTerm = useGlobalSearchStore((s) => s.term)
  const setSearchTerm = useGlobalSearchStore((s) => s.setTerm)

  useEffect(() => {
    setColumnFilters(prev => {
      const other = prev.filter(f => f.id !== 'status')
      return debouncedStatus ? [...other, { id: 'status', value: debouncedStatus }] : other
    })
  }, [debouncedStatus])

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
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, columnId, filterValue) =>
      globalSearchFilter(row, columnId, filterValue, ['name', 'email', 'phone']),
  })

  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <DataTable.Toolbar className='max-lg:px-0'>
        <div className='hidden lg:flex flex-wrap items-center gap-1.5'>
          <DataTableFilterPills
            options={STATUS_FILTER_PILLS}
            value={filters.status || 'PENDING'}
            onChange={(value) => setFilters({ ...filters, status: value === 'PENDING' ? '' : value })}
          />
        </div>
        <div className='flex lg:hidden items-center gap-2 flex-1'>
          <Select
            value={filters.status || 'PENDING'}
            onValueChange={(value) => setFilters({ ...filters, status: value === 'PENDING' ? '' : value })}
          >
            <SelectTrigger size='sm' className='h-9 flex-1 text-xs font-medium'>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_PILLS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-transparent text-muted-foreground hover:bg-muted/35'
            aria-label='Rechercher'
          >
            <MagnifyingGlass size={16} />
          </button>
        </div>
      </DataTable.Toolbar>

      {mobileSearchOpen && (
        <div className='px-4 pb-2 lg:hidden'>
          <Input
            placeholder='Rechercher...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='h-9 text-xs'
            autoFocus
          />
        </div>
      )}

      <DataTable.Desktop>
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
      </DataTable.Desktop>

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
                <DataTable.MobileCard key={row.id}>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-element bg-primary/8'>
                      <User size={14} className='text-primary' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold'>{item.name}</p>
                      <p className='mt-0.5 text-xs text-secondary/50'>
                        {scheduledDate || 'Non programmé'} · {item.motif?.name || '-'}
                      </p>
                    </div>
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
                  <div className='mt-3 flex items-center gap-2'>
                    <StatusSelect appointmentId={item.id!} status={item.status || 'PENDING'} className='flex-1 h-9' />
                    <button
                      type='button'
                      onClick={() => useAppointmentsStore.setState({ item, openShowModal: true })}
                      className='flex shrink-0 h-9 w-9 items-center justify-center rounded-control border border-border bg-secondary/[0.04] text-secondary/50 hover:bg-secondary/[0.08] hover:text-secondary transition-colors'
                    >
                      <ArrowRight size={15} weight='bold' />
                    </button>
                  </div>
                </DataTable.MobileCard>
                )
              })}
          </DataTable.MobileList>
      </DataTable.Mobile>

      <div className='lg:hidden'>
        <DataTablePagination table={table} />
      </div>
      <div className='hidden lg:flex justify-end px-4 py-3'>
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

function StatusSelect({ appointmentId, status, className }: { appointmentId: number; status: string; className?: string }) {
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

  const currentMeta = STATUS_META[current] || STATUS_META.PENDING
  const currentTc = THEME_COLORS[currentMeta.theme]

  return (
    <Select value={current} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger
        className={cn('h-9 min-w-[140px] text-xs font-medium', className)}
        style={{
          backgroundColor: currentTc.bg,
          color: currentTc.text,
          borderColor: currentTc.border,
        }}
      >
        <span className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: currentTc.dot }} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(labels).map(([key, label]) => {
          const tc = THEME_COLORS[STATUS_META[key]?.theme || 'sand']
          return (
            <SelectItem key={key} value={key}>
              <span className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: tc.dot }} />
                {label}
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

const STATUS_META: Record<string, { label: string; theme: string; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', theme: 'sand', icon: Timer },
  CONFIRMED: { label: 'Confirmée', theme: 'sea', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', theme: 'coral', icon: XCircle },
  COMPLETED: { label: 'Terminée', theme: 'sage', icon: CheckCircle },
  EXPIRED: { label: 'Expirée', theme: 'mist', icon: Timer },
  NO_SHOW: { label: 'Absent', theme: 'aqua', icon: XCircle },
}

function Pill({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.PENDING
  const tc = THEME_COLORS[m.theme]
  const I = m.icon
  return (
    <span
      className='inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ring-transparent'
      style={{ backgroundColor: tc.bg, color: tc.text }}
    >
      <I size={12} weight='fill' />
      {m.label}
    </span>
  )
}





function ShowModal() {
  const { openShowModal, setOpenShowModal, item, fetchItem, loadingItem } = useAppointmentsStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!openShowModal || !item.id) return
    fetchItem(item.id)
  }, [openShowModal])

  const motifColor = item.motif?.color || '#009fd6'
  const initials = (item.name || 'N/A').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const schedDate = item.schedules?.[0]?.datetime
  const schedFormatted = schedDate
    ? new Date(schedDate).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null

  // ponytail: assumes returning patient if email matches an existing patient record
  const hasPatient = !!(item as any).patient?.id
  const patientId = hasPatient ? (item as any).patient.id : null

  const goToPatient = () => {
    setOpenShowModal(false)
    if (patientId) {
      navigate(`/patients?patientId=${patientId}`)
    } else if (item.email) {
      navigate(`/patients?search=${encodeURIComponent(item.email)}`)
    }
  }

  return (
    <Dialog open={openShowModal} onOpenChange={setOpenShowModal}>
      <DialogContent showCloseButton className='flex flex-col gap-0 p-0 sm:max-w-lg rounded-2xl'>
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
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white' style={{ backgroundColor: motifColor }}>
                  {initials}
                </div>
                <div className='min-w-0 pt-0.5'>
                  <div className='flex items-center gap-2'>
                    <h2 className='text-base font-semibold text-foreground leading-5'>{item.name}</h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${hasPatient ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {hasPatient ? <User size={10} /> : <UserPlus size={10} />}
                      {hasPatient ? 'Existant' : 'Nouveau'}
                    </span>
                  </div>
                  <div className='mt-1 flex items-center gap-2'>
                    {item.id && (
                      <StatusSelect appointmentId={item.id} status={item.status || 'PENDING'} />
                    )}
                  </div>
                  <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/50'>
                    {item.email && <span className='inline-flex items-center gap-1'><EnvelopeSimple size={10} />{item.email}</span>}
                    {item.phone && <span className='inline-flex items-center gap-1'><Phone size={10} />{item.phone}</span>}
                  </div>
                  {schedFormatted && (
                    <p className='mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground/45'>
                      <Clock size={11} />
                      {schedFormatted}
                    </p>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                {hasPatient && (
                  <button onClick={goToPatient} className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/30 transition-colors hover:bg-primary/[0.08] hover:text-primary' title='Voir le patient'>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className='mx-5 h-px bg-border-subtle/40' />

            {/* Content */}
            <ScrollArea className='min-h-0 flex-1'>
              <div className='px-5 py-4 space-y-4'>
                {/* Info grid */}
                <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
                  {[
                    { icon: CalendarBlank, label: 'Traitement', value: item.motif?.name || '—' },
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



                {/* Context */}
                {item.context && (
                  <div className='space-y-1.5'>
                    <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/45'>Message</p>
                    <div className='max-h-[180px] overflow-y-auto rounded-xl bg-muted/30 p-3.5'>
                      <p className='text-sm leading-relaxed text-foreground/65'>{item.context}</p>
                    </div>
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
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className='flex items-center justify-end shrink-0 border-t border-border-subtle/40 px-5 py-3'>
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
