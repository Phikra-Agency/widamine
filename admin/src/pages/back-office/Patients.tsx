import { usePatientStore } from '@/stores/patientsStore'
import { useAuthStore } from '@/stores/authStore'
import { useSchedulesStore } from '@/stores/schedulesStore'
import { PencilSimple as Pen, Plus, Trash as Trash2, User, EnvelopeSimple, Phone, MapPin, CalendarBlank, X, ArrowRight, CalendarDots as CalendarClock } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
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
import { FormDialog, FieldError } from '@/components/bo'
import { patientSchema } from '@/lib/formSchemas'
import { useFormValidation } from '@/hooks/useFormValidation'
import { DataTable, DataTablePagination, TanStackDataTable, useDataTable } from '@/components/data-table'
import type { ColumnFiltersState, OnChangeFn } from '@tanstack/react-table'
import {
  createPatientsColumns,
  getAppointmentStats,
  GENDER_CONFIG,
  PATIENTS_EMPTY_ILLUSTRATION,
} from './columns/patientsColumns'
import {
  buildCalendarReturnUrl,
  buildCalendarUrlFromAppointment,
  clearCalendarReturnContext,
  normalizeAppointmentId,
  readCalendarReturnContext,
  stashAppointmentForCalendarOpen,
} from '@/lib/scheduleNavigation'


export default function Patients() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerPatient, setDrawerPatient] = useState<any>(null)
  const items = usePatientStore(state => state.items)
  const [searchParams] = useSearchParams()
  const hasOpenedFromUrl = useRef(false)
  const drawerReturnRef = useRef<any>(null)

  const openDrawer = useCallback((patient: any) => {
    setDrawerPatient(patient)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setDrawerPatient(null)
  }, [])

  const editFromDrawer = useCallback((patient: any) => {
    drawerReturnRef.current = patient
    setDrawerOpen(false)
  }, [])

  const reopenDrawerIfNeeded = useCallback(() => {
    const p = drawerReturnRef.current
    if (p) {
      drawerReturnRef.current = null
      const fresh = items.find(i => i.id === p.id) ?? p
      setDrawerPatient(fresh)
      setDrawerOpen(true)
    }
  }, [items])

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
      <div className='bo-page-inner bo-section-stack'>
        <div className='bo-page-ambient-tr' />
        <div className='bo-page-ambient-bl' />
        <Heading />
        <Card className='bo-table-card'>
          <PatientsTable openDrawer={openDrawer} />
        </Card>
      </div>
      <Modal onAfterSave={reopenDrawerIfNeeded} />
      <DeleteModal />
      <PatientDrawer open={drawerOpen} patient={drawerPatient} onClose={closeDrawer} onEdit={editFromDrawer} />
    </div>
  )
}

function Heading() {
  const { openCreateModal } = usePatientStore()
  const { user } = useAuthStore()
  const items = usePatientStore(state => state.items)
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  return (
    <div className='bo-page-heading'>
      <div>
        <h3 className='bo-title'>Gestion Des Patients</h3>
        <p className='mt-0.5 text-xs text-secondary/40'>{items.length} patient{items.length !== 1 ? 's' : ''}</p>
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

  const cityOptions = useMemo(
    () => cities.map((city) => ({ value: city, label: city })),
    [cities],
  )

  const cityFilterValue = filters.city === 'null' || !filters.city ? 'all' : filters.city

  const [extraColumnFilters, setExtraColumnFilters] = useState<ColumnFiltersState>([])

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      { id: 'gender', value: filters.gender || 'all' },
      { id: 'city', value: cityFilterValue },
      ...extraColumnFilters,
    ],
    [filters.gender, cityFilterValue, extraColumnFilters],
  )

  const handleColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater
      const genderVal = String(next.find((f) => f.id === 'gender')?.value ?? 'all')
      const cityVal = String(next.find((f) => f.id === 'city')?.value ?? 'all')
      const extras = next.filter(
        (f) => f.id !== 'gender' && f.id !== 'city',
      )
      setFilters({
        gender: genderVal === 'all' ? '' : genderVal,
        city: cityVal === 'all' ? 'all' : cityVal,
      })
      setExtraColumnFilters(extras)
    },
    [columnFilters, setFilters],
  )

  const columns = useMemo(
    () =>
      createPatientsColumns({
        isPractitioner,
        onEdit: openEditModal,
        onDelete: openDeleteModal,
        cityOptions,
      }),
    [cityOptions, isPractitioner, openDeleteModal, openEditModal],
  )

  const table = useDataTable({
    data: items,
    columns,
    enablePagination: true,
    pageSize: 10,
    columnFilters,
    onColumnFiltersChange: handleColumnFiltersChange,
    initialColumnVisibility: { gender: false, city: false },
  })

  const rows = table.getRowModel().rows
  const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={PATIENTS_EMPTY_ILLUSTRATION}
        emptyTitle='Aucun patient trouvé'
        onRowClick={openDrawer}
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && (
            <DataTable.Empty illustration={PATIENTS_EMPTY_ILLUSTRATION} title='Aucun patient trouvé' />
          )}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              const stats = getAppointmentStats(item)
              return (
                <DataTable.MobileCard
                  key={row.id}
                  onClick={() => openDrawer(item)}
                >
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary/40'>
                        <User size={18} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold'>{item.firstName} {item.lastName}</p>
                        <div className='mt-0.5 flex items-center gap-1.5 text-[11px] text-secondary/50'>
                          {item.phone && <span className='truncate'>{item.phone}</span>}
                          {item.phone && stats.count > 0 && <span className='text-secondary/20'>·</span>}
                          {stats.count > 0 && <span className='shrink-0'>{stats.count} RDV</span>}
                        </div>
                        <div className='mt-0.5 flex items-center gap-1.5 text-[10px] text-secondary/35'>
                          {item.email && <span className='truncate'>{item.email}</span>}
                          {item.email && stats.nextDate && <span className='text-secondary/20'>·</span>}
                          {stats.nextDate && (
                            <span className='shrink-0 text-primary/60'>
                              {stats.nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
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
            className='fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-bo-fab lg:hidden'
            aria-label='Ajouter un patient'
          >
            <Plus size={24} weight='bold' />
          </Button>
        )}
      </DataTable.Mobile>

      <div className='flex justify-end px-4 py-3'>
        <DataTablePagination table={table} />
      </div>
    </DataTable.Root>
  )
}

function Modal({ onAfterSave }: { onAfterSave?: () => void }) {
  const { operation, modalOpen, closeModal, item, setItem, saveItem } = usePatientStore()
  const isEdit = operation === 'edit'
  const isOpen = ['create', 'edit'].includes(operation) && modalOpen
  const validation = useFormValidation(patientSchema, item)

  useEffect(() => {
    if (!isOpen) validation.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function patchItem(patch: Partial<typeof item>) {
    const next = { ...item, ...patch }
    setItem(next)
    const validKeys = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'postalCode', 'country', 'medicalHistory'] as const
    for (const key of Object.keys(patch) as (keyof typeof item)[]) {
      if (validKeys.includes(key as never)) {
        validation.onFieldChange(key as never, next)
      }
    }
    return next
  }

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => { if (!open) { closeModal(); onAfterSave?.() } }}
      title={isEdit ? 'Modifier le patient' : 'Nouveau patient'}
      onSubmit={async (e) => {
        e.preventDefault()
        if (!validation.validateAll()) return
        await saveItem()
        onAfterSave?.()
      }}
      submitLabel={isEdit ? 'Enregistrer' : 'Créer le patient'}
      className='sm:max-w-2xl'
      contentClassName='max-h-[calc(100vh-10rem)]'
    >
      <div className='flex items-center justify-center mb-2'>
        <div className='w-14 h-14 rounded-control bg-secondary/[0.04] flex items-center justify-center'>
          <User size={28} className='text-secondary/50' />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Prénom</Label>
          <Input type='text' value={item.firstName} onChange={(e) => patchItem({ firstName: e.target.value })}
            onBlur={() => validation.onFieldBlur('firstName')}
            placeholder='Ahmed' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Nom</Label>
          <Input type='text' value={item.lastName} onChange={(e) => patchItem({ lastName: e.target.value })}
            onBlur={() => validation.onFieldBlur('lastName')}
            placeholder='Benali' />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Email</Label>
          <Input type='email' value={item.email} onChange={(e) => patchItem({ email: e.target.value })}
            onBlur={() => validation.onFieldBlur('email')}
            placeholder='ahmed@example.com' aria-invalid={!!validation.getError('email')} />
          <FieldError message={validation.getError('email')} />
        </div>

        <div className='space-y-2'>
          <Label className='text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary/40'>Téléphone</Label>
          <Input type='text' value={item.phone} onChange={(e) => patchItem({ phone: e.target.value })}
            onBlur={() => validation.onFieldBlur('phone')}
            placeholder='+212600000000' aria-invalid={!!validation.getError('phone')} />
          <FieldError message={validation.getError('phone')} />
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
          <div className='mx-auto w-14 h-14 rounded-control bg-red-50 flex items-center justify-center mb-4'>
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

  const motifName = appt.motif?.name || ''

  if (!isClickable) {
    return (
      <div className='flex w-full items-center gap-3 rounded-control bg-secondary/[0.02] px-3 py-2'>
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
      className='relative z-20 flex w-full cursor-pointer items-center gap-3 rounded-control border border-transparent bg-secondary/[0.02] px-3 py-2.5 text-left hover:border-primary/20 hover:bg-primary/[0.06] hover:shadow-[0_2px_12px_rgba(0,159,214,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.99]'
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

function PatientDrawer({ open, patient, onClose, onEdit }: { open: boolean; patient: any; onClose: () => void; onEdit: (patient: any) => void }) {
  const { openEditModal } = usePatientStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const openAppointmentFromPatientDrawer = useSchedulesStore(state => state.openAppointmentFromPatientDrawer)
  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'
  const calendarReturn = useMemo(() => (open ? readCalendarReturnContext() : null), [open])
  const calendarTo = calendarReturn ? buildCalendarReturnUrl(calendarReturn) : '/calendar'

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
      navigate('/calendar')
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
    <Dialog open={open && !!patient} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent showCloseButton={false} className='max-h-[90vh] w-[95vw] max-w-[560px] gap-0 overflow-y-auto p-0 shadow-bo-elevated'>
        {patient && (
          <>
            <div className='flex items-start justify-between gap-3 border-b border-border px-5 py-4 shrink-0'>
              <div className='flex items-center gap-3 min-w-0'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.08]'>
                  <User size={18} className='text-primary/60' />
                </div>
                <div className='min-w-0'>
                  <p className='text-[11px] uppercase tracking-[0.22em] text-secondary/40'>Dossier patient</p>
                  <p className='text-sm font-semibold text-secondary truncate'>
                    {patient.firstName} {patient.lastName}
                  </p>
                  <div className='flex items-center gap-2 mt-0.5'>
                    <Badge variant='outline' className={clsx('text-[10px] font-medium', (GENDER_CONFIG[patient.gender] || GENDER_CONFIG.OTHER).color)}>
                      {(GENDER_CONFIG[patient.gender] || GENDER_CONFIG.OTHER).label}
                    </Badge>
                    {patient.dateOfBirth && (
                      <span className='text-[10px] text-secondary/40'>
                        {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={onClose}
                className='shrink-0 text-secondary/30 hover:text-secondary/60'
              >
                <X size={16} />
              </Button>
            </div>

            <div className='flex-1 min-h-0 overflow-auto px-4 py-3 space-y-3 sm:px-5 sm:py-4 sm:space-y-4'>
              {/* Contact */}
              <div className='rounded-surface border border-border p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40'>Contact</p>
                  {!isPractitioner && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-xs'
                      onClick={() => { onEdit(patient); openEditModal(patient); }}
                      className='text-secondary/30 hover:text-primary'
                      title='Modifier les informations'
                    >
                      <Pen size={12} />
                    </Button>
                  )}
                </div>
                <div className='space-y-2.5'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-primary/[0.06]'>
                      <EnvelopeSimple size={12} className='text-primary/50' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[10px] text-secondary/35'>Email</p>
                      <p className='text-xs text-secondary/70 truncate'>{patient.email || '—'}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-primary/[0.06]'>
                      <Phone size={12} className='text-primary/50' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[10px] text-secondary/35'>Téléphone</p>
                      <p className='text-xs text-secondary/70 truncate'>{patient.phone || '—'}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-primary/[0.06]'>
                      <MapPin size={12} className='text-primary/50' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[10px] text-secondary/35'>Adresse</p>
                      <p className='text-xs text-secondary/70 truncate'>{[patient.address, patient.city, patient.postalCode, patient.country].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical history */}
              {patient.medicalHistory && (
                <div className='rounded-surface border border-border p-4'>
                  <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40 mb-2'>Antécédents médicaux</p>
                  <p className='text-xs text-secondary/60 leading-relaxed'>{patient.medicalHistory}</p>
                </div>
              )}

              {/* Upcoming appointments */}
              {appts.upcoming.length > 0 && (
                <div className='rounded-surface border border-border p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <CalendarClock size={13} className='text-primary/50' />
                    <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40'>À venir ({appts.upcoming.length})</p>
                  </div>
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
                <div className='rounded-surface border border-border p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <CalendarBlank size={13} className='text-secondary/30' />
                    <p className='text-[10px] uppercase tracking-[0.22em] text-secondary/40'>Historique ({appts.past.length})</p>
                  </div>
                  <div className='space-y-2'>
                    {appts.past.slice(0, 8).map((a: any) => (
                      <UpcomingAppointmentRow
                        key={normalizeAppointmentId(a) ?? `past-${a._dt}-${a.name}`}
                        appt={a}
                        onOpenCalendar={openOnCalendar}
                      />
                    ))}
                    {appts.past.length > 8 && (
                      <p className='text-xs text-secondary/30 text-center pt-1'>+ {appts.past.length - 8} précédents</p>
                    )}
                  </div>
                </div>
              )}

              {appts.upcoming.length === 0 && appts.past.length === 0 && (
                <div className='rounded-surface border border-dashed border-border p-6 text-center'>
                  <CalendarBlank size={20} className='mx-auto text-secondary/20 mb-2' />
                  <p className='text-xs text-secondary/35'>Aucun rendez-vous lié à ce patient</p>
                </div>
              )}

              {/* Actions */}
              <div className='pt-1 pb-1 flex items-center gap-2'>
                {!isPractitioner && (
                  <Button
                    onClick={() => { onEdit(patient); openEditModal(patient); }}
                    variant='outline'
                    className='flex-1'
                  >
                    <Pen size={13} /> Modifier
                  </Button>
                )}
                <Button
                  variant='outline'
                  nativeButton={false}
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
      </DialogContent>
    </Dialog>
  )
}
