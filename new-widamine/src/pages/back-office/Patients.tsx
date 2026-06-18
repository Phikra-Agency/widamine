import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import { useSchedulesStore } from '@/stores/schedulesStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, EnvelopeSimple, Phone, MapPin, CalendarBlank, MagnifyingGlass, CaretDown, X, ArrowRight, CalendarDots as CalendarClock } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import clsx from 'clsx'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import FormDialog from '@/components/bo/FormDialog'
import { DataTable, DataTablePagination, TanStackDataTable, useDataTable } from '@/components/data-table'
import type { ColumnFiltersState } from '@tanstack/react-table'
import {
  createPatientsColumns,
  getAppointmentStats,
  GENDER_CONFIG,
  PATIENTS_EMPTY_ICON,
} from './columns/patientsColumns'
import {
  buildCalendarReturnUrl,
  buildCalendarUrlFromAppointment,
  clearCalendarReturnContext,
  normalizeAppointmentId,
  readCalendarReturnContext,
  stashAppointmentForCalendarOpen,
} from '@/lib/scheduleNavigation'
import { useDebounce } from 'use-debounce'

export default function Patients() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPatient, setDrawerPatient] = useState<any>(null)
  const items = usePatientStore(state => state.items)
  const [searchParams] = useSearchParams()
  const hasOpenedFromUrl = useRef(false)

  const openDrawer = useCallback((patient: any) => {
    setDrawerPatient(patient)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setDrawerPatient(null)
  }, [])

  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (!patientId || hasOpenedFromUrl.current) return
    if (items.length === 0) return
    hasOpenedFromUrl.current = true
    const patient = items.find(item => String(item.id) === patientId)
    if (patient) openDrawer(patient)
  }, [searchParams, items, openDrawer])

  return (
    <div
      className='bo-page'
    >
      <div className='bo-page-inner bo-page-stack'>
        {/* Ambient background */}
        <div className='pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-logo-sky/5 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl' />

        <div className='bo-section-stack flex-shrink-0'>
          <Heading />
        </div>
        <Card className='bo-table-card mt-0 flex-1 min-h-0 flex flex-col'>
          <PatientsTable openDrawer={openDrawer} />
        </Card>
      </div>
      <Modal />
      <DeleteModal />
      <PatientDrawer open={drawerOpen} patient={drawerPatient} onClose={closeDrawer} />
    </div>
  )
}

function Heading() {
  const { openCreateModal } = usePatientStore()
  const { user } = useAuthStore()
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <h3 className='bo-title'>Gestion Des Patients</h3>
      </div>
      {!isPractitioner && (
        <Button onClick={openCreateModal} className='hidden lg:inline-flex'>
          <Plus weight='bold' /> Ajouter Un Patient
        </Button>
      )}
    </div>
  )
}

function PatientsTable({ openDrawer }: { openDrawer: (patient: any) => void }) {
  const { items, filters, setFilters, fetchItems, openEditModal, openDeleteModal, openCreateModal } = usePatientStore()
  const { user } = useAuthStore()
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const [loading, setLoading] = useState(true)
  const [showExtra, setShowExtra] = useState(false)
  const [debouncedFilters] = useDebounce(filters, 300)

  const cities = useMemo(() => {
    const norm = (s: string) => s.trim().charAt(0).toUpperCase() + s.trim().slice(1).toLowerCase()
    const map = new Map<string, string>()
    items.forEach((i) => {
      if (!i.city) return
      const key = i.city.trim().toLowerCase()
      map.set(key, norm(i.city))
    })
    return [...map.values()].sort()
  }, [items])

  useEffect(() => {
    void fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const cityFilterValue = debouncedFilters.city === 'null' || !debouncedFilters.city ? 'all' : debouncedFilters.city

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      { id: 'gender', value: debouncedFilters.gender || 'all' },
      { id: 'city', value: cityFilterValue },
    ],
    [debouncedFilters.gender, cityFilterValue],
  )

  const columns = useMemo(
    () =>
      createPatientsColumns({
        isPractitioner,
        onEdit: openEditModal,
        onDelete: openDeleteModal,
      }),
    [isPractitioner, openDeleteModal, openEditModal],
  )

  const table = useDataTable({
    data: items,
    columns,
    enablePagination: true,
    pageSize: 10,
    globalFilter: debouncedFilters.term,
    columnFilters,
    initialColumnVisibility: { gender: false, city: false },
    globalFilterFn: (row, _columnId, filterValue) => {
      const term = String(filterValue).trim().toLowerCase()
      if (!term) return true
      const p = row.original
      return (
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      )
    },
  })

  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <div className='flex h-full flex-col'>
      <DataTable.Root className='flex min-h-0 flex-1 flex-col'>
        <DataTable.Toolbar>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <div className='relative min-w-0 flex-1'>
                <MagnifyingGlass size={15} className='absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/50' />
                <Input
                  type='text'
                  placeholder='Rechercher par nom ou email...'
                  value={filters.term}
                  onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                  className='h-9 bg-background pl-9'
                />
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowExtra(!showExtra)}
                className='h-9 shrink-0 px-3 lg:hidden'
                aria-label='Filtres supplémentaires'
              >
                <CaretDown size={14} className={showExtra ? 'rotate-180' : ''} />
              </Button>
            </div>
            <div className={`flex-col gap-2 sm:flex-row ${showExtra ? 'flex' : 'hidden lg:flex'}`}>
              <Select
                value={filters.gender || 'all'}
                onValueChange={(value) => setFilters({ ...filters, gender: !value || value === 'all' ? '' : value })}
              >
                <SelectTrigger className='h-9 w-full bg-background sm:w-[160px]'>
                  <SelectValue placeholder='Tous les genres' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tous les genres</SelectItem>
                  <SelectItem value='MALE'>Homme</SelectItem>
                  <SelectItem value='FEMALE'>Femme</SelectItem>
                  <SelectItem value='OTHER'>Autre</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.city === 'null' || !filters.city ? 'all' : filters.city}
                onValueChange={(value) => setFilters({ ...filters, city: !value || value === 'all' ? 'all' : value })}
              >
                <SelectTrigger className='h-9 w-full min-w-[140px] flex-1 bg-background'>
                  <SelectValue placeholder='Toutes les villes' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Toutes les villes</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DataTable.Toolbar>

        <TanStackDataTable
          table={table}
          loading={loading}
          emptyIcon={PATIENTS_EMPTY_ICON}
          emptyTitle='Aucun patient trouvé'
          onRowClick={openDrawer}
          className='min-h-0 flex-1 overflow-auto'
        />

        <DataTable.Mobile className='min-h-0 flex-1 overflow-auto'>
          <DataTable.MobileList className='space-y-0 divide-y divide-border-subtle p-0'>
            {loading && <div className='px-3 py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
            {isEmpty && (
              <div className='p-3'>
                <DataTable.Empty icon={PATIENTS_EMPTY_ICON} title='Aucun patient trouvé' />
              </div>
            )}
            {!loading &&
              rows.map((row) => {
                const item = row.original
                const stats = getAppointmentStats(item)
                return (
                  <DataTable.MobileCard
                    key={row.id}
                    className='rounded-none border-0 border-b border-border-subtle shadow-none'
                    onClick={() => openDrawer(item)}
                  >
                    <div className='flex items-center gap-2'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/5'>
                        <User size={15} className='text-secondary/40' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>{item.firstName} {item.lastName}</p>
                        <div className='mt-0.5 flex items-center gap-2'>
                          {item.phone && (
                            <span className='truncate text-[11px] text-secondary/50'>{item.phone}</span>
                          )}
                          {stats.nextDate && (
                            <>
                              {item.phone && <span className='text-[9px] text-secondary/30'>·</span>}
                              <span className='shrink-0 text-[11px] text-primary/70'>
                                {stats.nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className='flex shrink-0 items-center' onClick={(e) => e.stopPropagation()}>
                        {!isPractitioner && (
                          <>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon-sm'
                              onClick={() => openEditModal(item)}
                              className='h-7 w-7 text-secondary/30 hover:bg-amber-50 hover:text-amber-600'
                            >
                              <Pen size={12} />
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon-sm'
                              onClick={() => openDeleteModal(item)}
                              className='h-7 w-7 text-secondary/30 hover:bg-red-50 hover:text-red-600'
                            >
                              <Trash2 size={12} />
                            </Button>
                          </>
                        )}
                        <div className='ml-1 flex h-5 w-5 items-center justify-center text-secondary/20'>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </DataTable.MobileCard>
                )
              })}
          </DataTable.MobileList>
          {!isPractitioner && (
            <Button
              type='button'
              size='icon'
              onClick={openCreateModal}
              className='fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-bo-fab'
              aria-label='Ajouter un patient'
            >
              <Plus size={24} weight='bold' />
            </Button>
          )}
        </DataTable.Mobile>
      </DataTable.Root>
      <div className='shrink-0 border-t border-border-subtle bg-background/90 px-4 py-3 backdrop-blur-sm'>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

function Modal() {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = usePatientStore()
  const isEdit = operation === 'edit'
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => { if (!open) closeModal() }}
      title={isEdit ? 'Modifier le patient' : 'Nouveau patient'}
      onSubmit={(e) => {
        e.preventDefault()
        saveItem()
      }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer le patient'}
      className='sm:max-w-2xl'
      contentClassName='max-h-[calc(100vh-10rem)]'
    >
      <div className='flex items-center justify-center mb-2'>
        <div className='w-14 h-14 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
          <User size={28} className='text-secondary/50' />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Prénom</Label>
          <Input type='text' value={item.firstName} onChange={(e) => setItem({ ...item, firstName: e.target.value })}
            placeholder='Ahmed' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom</Label>
          <Input type='text' value={item.lastName} onChange={(e) => setItem({ ...item, lastName: e.target.value })}
            placeholder='Benali' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</Label>
          <Input type='email' value={item.email} onChange={(e) => setItem({ ...item, email: e.target.value })}
            placeholder='ahmed@example.com' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Téléphone</Label>
          <Input type='text' value={item.phone} onChange={(e) => setItem({ ...item, phone: e.target.value })}
            placeholder='+212600000000' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Date de naissance</Label>
          <Input type='date' value={item.dateOfBirth} onChange={(e) => setItem({ ...item, dateOfBirth: e.target.value })} />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Genre</Label>
          <Select
            value={item.gender || ''}
            onValueChange={(value) => {
              if (value == null) return
              setItem({ ...item, gender: value as 'MALE' | 'FEMALE' | 'OTHER' })
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Sélectionner' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='MALE'>Homme</SelectItem>
              <SelectItem value='FEMALE'>Femme</SelectItem>
              <SelectItem value='OTHER'>Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='col-span-1 sm:col-span-2 space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Adresse</Label>
          <Input type='text' value={item.address} onChange={(e) => setItem({ ...item, address: e.target.value })}
            placeholder='123 Rue Mohammed V' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Ville</Label>
          <Input type='text' value={item.city} onChange={(e) => setItem({ ...item, city: e.target.value })}
            placeholder='Casablanca' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Code postal</Label>
          <Input type='text' value={item.postalCode} onChange={(e) => setItem({ ...item, postalCode: e.target.value })}
            placeholder='20000' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Pays</Label>
          <Input type='text' value={item.country} onChange={(e) => setItem({ ...item, country: e.target.value })}
            placeholder='Maroc' />
        </div>

        <div className='col-span-1 sm:col-span-2 space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Antécédents médicaux</Label>
          <Textarea value={item.medicalHistory || ''} onChange={(e) => setItem({ ...item, medicalHistory: e.target.value })}
            placeholder='Notes sur les antécédents médicaux...'
            rows={3} />
        </div>
      </div>
    </FormDialog>
  )
}

function DeleteModal() {
  const { operation, modalOpen, closeModal, deleteItem } = usePatientStore()
  const isOpen = operation === 'delete' && modalOpen

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal() }}>
      <DialogContent showCloseButton={false} className='sm:max-w-md'>
        <DialogHeader>
          <div className='mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4'>
            <Trash2 size={26} className='text-red-500' />
          </div>
          <DialogTitle className='text-center text-lg font-semibold text-secondary'>Supprimer ce patient ?</DialogTitle>
        </DialogHeader>
        <DialogFooter className='border-t border-border-subtle sm:justify-end'>
          <Button type='button' variant='ghost' onClick={closeModal}>
            Annuler
          </Button>
          <Button type='button' variant='destructive' onClick={deleteItem}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UpcomingAppointmentRow({
  appt,
  onOpenCalendar,
}: {
  appt: any
  onOpenCalendar: (appt: any) => void
}) {
  const hasSlot = appt._dt > 0
  const appointmentId = normalizeAppointmentId(appt)
  const isClickable = hasSlot && appointmentId

  const motifName = appt.motif?.name || appt.service?.name || ''

  if (!isClickable) {
    return (
      <div className='flex w-full items-center gap-3 rounded-lg bg-secondary/[0.02] px-3 py-2'>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-secondary truncate'>{appt.name}</p>
          <div className='mt-0.5 flex items-center gap-2 text-[11px] text-secondary/40'>
            {motifName && <span>{motifName}</span>}
            <StatusBadge status={appt.status} />
          </div>
        </div>
        <span className='shrink-0 text-xs font-medium text-secondary/40'>—</span>
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={() => onOpenCalendar({ ...appt, id: appointmentId })}
      className='relative z-20 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-secondary/[0.02] px-3 py-2.5 text-left hover:border-primary/20 hover:bg-primary/[0.06] hover:shadow-[0_2px_12px_rgba(0,159,214,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.99]'
    >
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium text-secondary truncate'>{appt.name}</p>
        <div className='mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-secondary/40'>
          {motifName && <span>{motifName}</span>}
          <StatusBadge status={appt.status} />
          <span className='font-medium text-primary/70'>Voir au calendrier →</span>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-1.5'>
        <span className='text-xs font-semibold text-primary'>
          {new Date(appt._dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}{' '}
          {new Date(appt._dt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <CalendarClock size={15} className='shrink-0 text-primary/40' />
      </div>
    </button>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const className = clsx(
    'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
    status === 'CONFIRMED'
      ? 'bg-emerald-50 text-emerald-600'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-600'
        : status === 'CANCELLED'
          ? 'bg-rose-50 text-rose-600'
          : 'bg-secondary/[0.04] text-secondary/40',
  )
  const label = status === 'CONFIRMED'
    ? 'Confirmé'
    : status === 'PENDING'
      ? 'En attente'
      : status === 'CANCELLED'
        ? 'Annulé'
        : status || '—'

  return <Badge variant='outline' className={className}>{label}</Badge>
}

function PatientDrawer({ open, patient, onClose }: { open: boolean; patient: any; onClose: () => void }) {
  const { openEditModal } = usePatientStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const openAppointmentFromPatientDrawer = useSchedulesStore(state => state.openAppointmentFromPatientDrawer)
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const calendarReturn = useMemo(() => (open ? readCalendarReturnContext() : null), [open])
  const calendarTo = calendarReturn ? buildCalendarReturnUrl(calendarReturn) : '/back-office/calendar'

  const openOnCalendar = useCallback(
    (appt: any) => {
      const appointmentId = normalizeAppointmentId(appt)
      if (!appointmentId || !appt._dt) return

      const payload = { ...appt, id: appointmentId }
      clearCalendarReturnContext()
      stashAppointmentForCalendarOpen(payload)

      const opened = openAppointmentFromPatientDrawer(payload)
      if (!opened) return

      onClose()
      navigate('/back-office/calendar')
    },
    [navigate, onClose, openAppointmentFromPatientDrawer],
  )

  const appts = useMemo(() => {
    if (!patient?.appointments) return { upcoming: [], past: [] }
    const now = new Date().getTime()
    const list = patient.appointments.map((a: any) => {
      const dt = a.schedules?.[0]?.datetime ? new Date(a.schedules[0].datetime).getTime() : 0
      return { ...a, _dt: dt }
    }).sort((a: any, b: any) => b._dt - a._dt)
    return {
      upcoming: list.filter((a: any) => a._dt >= now),
      past: list.filter((a: any) => a._dt < now),
    }
  }, [patient])

  if (typeof document === 'undefined') return null

  return (
    <Sheet open={open && !!patient} onOpenChange={(next) => { if (!next) onClose() }}>
      <SheetContent side='right' showCloseButton={false} className='w-full max-w-[520px] gap-0 p-0 shadow-[-8px_0_32px_rgba(26,54,70,0.08)]'>
        {patient && (
          <>
            <div className='shrink-0 px-5 py-4 border-b border-border flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <p className='text-[11px] uppercase tracking-[0.22em] text-secondary/40'>Dossier patient</p>
                <p className='text-base font-medium text-secondary truncate'>
                  {patient.firstName} {patient.lastName}
                </p>
                <div className='flex items-center gap-2 mt-0.5'>
                  <Badge variant='outline' className={clsx('text-[10px] font-medium', (GENDER_CONFIG[patient.gender] || GENDER_CONFIG.OTHER).color)}>
                    {(GENDER_CONFIG[patient.gender] || GENDER_CONFIG.OTHER).label}
                  </Badge>
                  {patient.dateOfBirth && (
                    <span className='text-xs text-secondary/50'>
                      Né(e) le {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
              <Button
                type='button'
                variant='outline'
                size='icon-sm'
                onClick={onClose}
                className='shrink-0'
              >
                <X size={16} className='text-secondary/60' />
              </Button>
            </div>

            <div className='flex-1 min-h-0 overflow-auto px-4 py-3 space-y-3 sm:px-5 sm:py-4 sm:space-y-4'>
              {/* Contact */}
              <div className='rounded-xl border border-border p-4 space-y-2'>
                <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Contact</p>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-secondary/40 flex items-center gap-1.5'><EnvelopeSimple size={12} /> Email</span>
                  <span className='text-xs text-secondary/70'>{patient.email || '—'}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-secondary/40 flex items-center gap-1.5'><Phone size={12} /> Téléphone</span>
                  <span className='text-xs text-secondary/70'>{patient.phone || '—'}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-secondary/40 flex items-center gap-1.5'><MapPin size={12} /> Adresse</span>
                  <span className='text-xs text-secondary/70 text-right truncate max-w-[55%]'>{[patient.address, patient.city, patient.postalCode, patient.country].filter(Boolean).join(', ') || '—'}</span>
                </div>
              </div>

              {/* Medical history */}
              {patient.medicalHistory && (
                <div className='rounded-xl border border-border p-4'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Antécédents médicaux</p>
                  <p className='text-sm text-secondary/70 leading-relaxed'>{patient.medicalHistory}</p>
                </div>
              )}

              {/* Upcoming appointments */}
              {appts.upcoming.length > 0 && (
                <div className='rounded-xl border border-border p-4'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Rendez-vous à venir ({appts.upcoming.length})</p>
                  <div className='space-y-2'>
                    {appts.upcoming.map((a: any) => (
                      <UpcomingAppointmentRow
                        key={normalizeAppointmentId(a) ?? `upcoming-${a._dt}-${a.name}`}
                        appt={a}
                        onOpenCalendar={openOnCalendar}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past appointments */}
              {appts.past.length > 0 && (
                <div className='rounded-xl border border-border p-4'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Historique ({appts.past.length})</p>
                  <div className='space-y-2'>
                    {appts.past.slice(0, 8).map((a: any) => (
                      <UpcomingAppointmentRow
                        key={normalizeAppointmentId(a) ?? `past-${a._dt}-${a.name}`}
                        appt={a}
                        onOpenCalendar={openOnCalendar}
                      />
                    ))}
                    {appts.past.length > 8 && (
                      <p className='text-xs text-secondary/40 text-center pt-1'>+ {appts.past.length - 8} résultats précédents</p>
                    )}
                  </div>
                </div>
              )}

              {appts.upcoming.length === 0 && appts.past.length === 0 && (
                <div className='rounded-xl border border-border p-6 text-center'>
                  <p className='text-sm text-secondary/40'>Aucun rendez-vous lié à ce patient</p>
                </div>
              )}

              {/* Actions */}
              <div className='pt-2 flex items-center gap-2'>
                {!isPractitioner && (
                  <Button
                    onClick={() => { onClose(); openEditModal(patient); }}
                    className='flex-1'
                  >
                    Modifier
                  </Button>
                )}
                <Button
                  variant='outline'
                  className={clsx(
                    'flex-1',
                    calendarReturn && 'border-primary/20 bg-primary/[0.04] text-primary hover:bg-primary/[0.08]',
                  )}
                  render={<Link to={calendarTo} />}
                >
                  {calendarReturn ? 'Retour au créneau' : 'Calendrier'} <ArrowRight size={12} />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
