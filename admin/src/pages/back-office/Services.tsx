import { useServicesStore } from "@/stores/servicesStore"
import { Eye, PencilSimple as Pen, Plus, Trash as Trash2, FirstAid, CurrencyDollar, Stethoscope, Tag, Clock } from "@phosphor-icons/react"
import { useEffect, useMemo, useState } from "react"
import { useCategoriesStore } from "@/stores/categoriesStore"
import { FormDialog, FieldError } from "@/components/bo"
import { serviceSchema, sessionSchema } from "@/lib/formSchemas"
import { useFormValidation } from "@/hooks/useFormValidation"
import { DataTable, TanStackDataTable, useDataTable } from "@/components/data-table"
import { Button, Card, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { createServicesColumns, SERVICES_EMPTY_ILLUSTRATION } from "./columns/servicesColumns"
import { globalSearchFilter } from "@/components/data-table"
import { useDebouncedGlobalSearch } from "@/hooks/useDebouncedGlobalSearch"

export default function Services() {
	const { fetchItems } = useCategoriesStore()
	const { closeModal: closeServicesModal, setOperation: setServicesOperation } = useServicesStore()

	useEffect(() => {
		fetchItems()
	}, [])

	useEffect(() => {
		return () => {
			closeServicesModal()
			setServicesOperation('create')
		}
	}, [])

	return (
		<div className="bo-page">
			<div className="bo-page-inner bo-section-stack">
				<div className="bo-page-ambient-tr" />
				<div className="bo-page-ambient-bl" />

				<Heading />
				<Card className="bo-table-card">
					<ServicesTable />
				</Card>
			</div>
			<Modal />
			<ShowModal />
			<DeleteModal />
		</div>
	)
}

function Heading() {
	const { openModal, setOperation, clearItem } = useServicesStore()
	return (
		<div className="bo-page-heading">
			<div>
				<h3 className="bo-title">Gestion Des Services</h3>
			</div>
			<Button
				onClick={() => {
					clearItem()
					setOperation("create")
					openModal()
				}}
				className="h-10 px-5"
			>
				<Plus weight="bold" /> Ajouter Un Service
			</Button>
		</div>
	)
}

function ServicesTable() {
	const { items, fetchItems, setOperation, openModal, setItem } = useServicesStore()
	const { items: categories } = useCategoriesStore()
	const [loading, setLoading] = useState(true)
	const debouncedSearch = useDebouncedGlobalSearch()

	const categoryOptions = useMemo(
		() => categories.map((cat) => ({ value: String(cat.id), label: cat.category })),
		[categories],
	)

	useEffect(() => {
		void fetchItems().finally(() => setLoading(false))
	}, [fetchItems])

	const columns = useMemo(
		() =>
			createServicesColumns({
				onShow: (item) => {
					setItem(item)
					setOperation('show')
					openModal()
				},
				onEdit: (item) => {
					setItem(item)
					setOperation('edit')
					openModal()
				},
				onDelete: (item) => {
					setItem(item)
					setOperation('delete')
					openModal()
				},
				categoryOptions,
			}),
		[categoryOptions, openModal, setItem, setOperation],
	)

	const table = useDataTable({
		data: items,
		columns,
		globalFilter: debouncedSearch,
		globalFilterFn: (row, columnId, filterValue) =>
			globalSearchFilter(row, columnId, filterValue, ['name']),
	})

	const rows = table.getRowModel().rows
	const isEmpty = !loading && rows.length === 0

  return (
    <DataTable.Root>
      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={SERVICES_EMPTY_ILLUSTRATION}
        emptyTitle="Aucun service trouvé"
      />

      <DataTable.Mobile>
        <DataTable.MobileList>
          {loading && <div className='py-8 text-center text-sm text-muted-foreground'>Chargement…</div>}
          {isEmpty && <DataTable.Empty illustration={SERVICES_EMPTY_ILLUSTRATION} title='Aucun service trouvé' />}
          {!loading &&
            rows.map((row) => {
              const item = row.original
              return (
              <DataTable.MobileCard key={row.id}>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-primary/8'>
                    <FirstAid size={20} className='text-primary' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold'>{item.name}</p>
                  </div>
                </div>
                <div className='mt-3 space-y-2 text-xs text-secondary/60'>
                  <div className='flex items-center justify-between'>
                    <span className='text-secondary/40'>Prix</span>
                    <span className='font-medium text-secondary/80'>{item.price} DH</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-secondary/40'>Séances</span>
                    <span className='font-medium text-secondary/80'>{item._count?.sessions || 0}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-secondary/40'>Médecin</span>
                    <span className='font-medium text-secondary/80'>{item.primaryDoctor?.name || '—'}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-secondary/40'>Catégorie</span>
                    <span>
                      {item.category?.name ? (
                        <span className='inline-flex items-center rounded-element border border-violet-100 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700'>
                          {item.category.name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </div>
                <div className='mt-3 flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => {
                      setItem(item)
                      setOperation('show')
                      openModal()
                    }}
                  >
                    <Eye size={14} /> Détails
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => {
                      setItem(item)
                      setOperation('edit')
                      openModal()
                    }}
                  >
                    <Pen size={14} /> Modifier
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 text-destructive hover:bg-destructive/10'
                    onClick={() => {
                      setItem(item)
                      setOperation('delete')
                      openModal()
                    }}
                  >
                    <Trash2 size={14} /> Supprimer
                  </Button>
                </div>
              </DataTable.MobileCard>
              )
            })}
        </DataTable.MobileList>
      </DataTable.Mobile>
    </DataTable.Root>
  )
}

function Modal() {
	const { operation, modalOpen, closeModal, item, setItem, saveItem, fetchDoctors, fetchResources, doctors, resources } = useServicesStore()
	const { items: categories } = useCategoriesStore()
	const isEdit = operation === 'edit'
	const isOpen = ['create', 'edit'].includes(operation) && modalOpen
	const validation = useFormValidation(serviceSchema, item)

	useEffect(() => {
		;["create", "edit"].includes(operation) && modalOpen && (fetchDoctors(), fetchResources())
	}, [modalOpen, operation])

	useEffect(() => {
		if (!isOpen) validation.reset()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen])

	const toggleDoctor = (doctorId: string) => {
		const current = item.allowedDoctorIds || []
		const updated = current.includes(doctorId)
			? current.filter(id => id !== doctorId)
			: [...current, doctorId]
		const next = { ...item, allowedDoctorIds: updated }
		setItem(next)
		validation.onFieldChange('allowedDoctorIds', next)
	}

	const toggleSalle = (salleId: string) => {
		const current = item.allowedSalleIds || []
		const updated = current.includes(salleId)
			? current.filter(id => id !== salleId)
			: [...current, salleId]
		const next = { ...item, allowedSalleIds: updated }
		setItem(next)
		validation.onFieldChange('allowedSalleIds', next)
	}

	const selectedDoctors = item.allowedDoctorIds || []
	const selectedSalles = item.allowedSalleIds || []

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModal()}
      title={isEdit ? "Modifier le service" : "Nouveau service"}
      onSubmit={(e) => {
        e.preventDefault()
        if (!validation.validateAll()) return
        saveItem()
      }}
      submitLabel={isEdit ? "Enregistrer" : "Créer le service"}
      onCancel={closeModal}
      className="sm:max-w-lg"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-control bg-primary/[0.08] flex items-center justify-center">
          <FirstAid size={32} className="text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Nom du service</Label>
        <Input
          type="text"
          value={item.name}
          onChange={(e) => {
            const next = { ...item, name: e.target.value }
            setItem(next)
            validation.onFieldChange('name', next)
          }}
          onBlur={() => validation.onFieldBlur('name')}
          placeholder="Consultation générale"
          aria-invalid={!!validation.getError('name')}
        />
        <FieldError message={validation.getError('name')} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Prix (DH)</Label>
        <Input
          type="number"
          value={item.price || ""}
          onChange={(e) => {
            const next = { ...item, price: +e.target.value }
            setItem(next)
            validation.onFieldChange('price', next)
          }}
          onBlur={() => validation.onFieldBlur('price')}
          placeholder="500"
          aria-invalid={!!validation.getError('price')}
        />
        <FieldError message={validation.getError('price')} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Catégorie</Label>
        <Select
          value={item.categoryId ?? ''}
          onValueChange={(value) => {
            const next = { ...item, categoryId: value || undefined }
            setItem(next)
            validation.onFieldChange('categoryId', next)
          }}
        >
          <SelectTrigger className="w-full" aria-invalid={!!validation.getError('categoryId')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sélectionnez une catégorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem value={String(cat.id)} key={cat.id}>{cat.category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={validation.getError('categoryId')} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Médecin principal</Label>
        <Select
          value={item.primaryDoctorId ?? ''}
          onValueChange={(value) => {
            const next = { ...item, primaryDoctorId: value || undefined }
            setItem(next)
            validation.onFieldChange('primaryDoctorId', next)
          }}
        >
          <SelectTrigger className="w-full" aria-invalid={!!validation.getError('primaryDoctorId')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sélectionnez un médecin</SelectItem>
            {doctors.map((doc) => (
              <SelectItem value={String(doc.id)} key={doc.id}>{doc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={validation.getError('primaryDoctorId')} />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Médecins habilités (plusieurs)</Label>
        <div className="flex flex-wrap gap-2">
          {doctors.map((doc) => (
            <Button
              key={doc.id}
              type="button"
              variant="outline"
              onClick={() => toggleDoctor(doc.id)}
              data-selected={selectedDoctors.includes(doc.id)}
              className="data-[selected=true]:bg-primary/[0.08] data-[selected=true]:border-primary/50 data-[selected=true]:text-primary data-[selected=false]:text-secondary/60"
            >
              {doc.name}
            </Button>
          ))}
        </div>
        <p className="text-xs text-secondary/40">Sélectionnez les médecins qui peuvent effectuer ce service</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Salles autorisées (plusieurs)</Label>
        <div className="flex flex-wrap gap-2">
          {resources.map((salle) => (
            <Button
              key={salle.id}
              type="button"
              variant="outline"
              onClick={() => toggleSalle(salle.id)}
              data-selected={selectedSalles.includes(salle.id)}
              className="data-[selected=true]:bg-secondary/[0.04] data-[selected=true]:border-secondary/50 data-[selected=true]:text-secondary data-[selected=false]:text-secondary/60"
            >
              {salle.name}
            </Button>
          ))}
        </div>
        <p className="text-xs text-secondary/40">Sélectionnez les salles où ce service peut être prodigné</p>
      </div>
    </FormDialog>
  )
}

function SessionModal({ open, onClose, editing, session, setSession }: { open: boolean; onClose: () => void; editing: boolean; session: { id?: string; session: number; duration: number }; setSession: (session: { id?: string; session: number; duration: number }) => void }) {
	const { saveSession } = useServicesStore()
	const validation = useFormValidation(sessionSchema, session)

	useEffect(() => {
		if (!open) validation.reset()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open])

	return (
    <FormDialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      title={editing ? "Modifier la séance" : "Nouvelle séance"}
      onSubmit={(e) => {
        e.preventDefault()
        if (!validation.validateAll()) return
        saveSession(session, editing)
        onClose()
      }}
      submitLabel={editing ? "Enregistrer" : "Ajouter"}
      onCancel={onClose}
      className="sm:max-w-sm"
    >
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Durée (minutes)</Label>
        <Input
          type="number"
          value={session.duration || ""}
          onChange={(e) => {
            const next = { ...session, duration: +e.target.value }
            setSession(next)
            validation.onFieldChange('duration', next)
          }}
          onBlur={() => validation.onFieldBlur('duration')}
          placeholder="60"
          aria-invalid={!!validation.getError('duration')}
        />
        <FieldError message={validation.getError('duration')} />
      </div>
    </FormDialog>
  )
}

function ShowModal() {
	const { operation, modalOpen, closeModal, fetchItem, item, deleteSession } = useServicesStore()
	const [sessionData, setSessionData] = useState<{ id?: string; session: number; duration: number }>({ session: 0, duration: 0 })
	const [openSessionModal, setOpenSessionModal] = useState(false)
	const [editingSession, setEditingSession] = useState(false)
	const isOpen = operation === "show" && modalOpen

	function clearSessionData() {
		setSessionData({ session: 0, duration: 0 })
	}

	useEffect(() => {
		;["show"].includes(operation) && modalOpen && fetchItem()
	}, [modalOpen])

	return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-border px-6 py-4 text-left">
            <DialogTitle className="text-lg font-semibold text-secondary">Détails du service</DialogTitle>
          </DialogHeader>

          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Nom du service</Label>
                  <div className="flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                    <FirstAid size={16} className="text-secondary/40" />
                    {item.name}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Prix</Label>
                  <div className="flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                    <CurrencyDollar size={16} className="text-secondary/40" />
                    {item.price} DH
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Médecin</Label>
                  <div className="flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                    <Stethoscope size={16} className="text-secondary/40" />
                    {item.primaryDoctor?.name || '—'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Catégorie</Label>
                  <div className="flex items-center gap-2 rounded-control border border-border bg-background px-4 py-2.5 text-sm text-secondary">
                    <Tag size={16} className="text-secondary/40" />
                    {item.category?.name || '—'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-secondary">Séances</h3>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingSession(false)
                      setOpenSessionModal(true)
                    }}
                    className="text-primary bg-primary/[0.08] hover:bg-primary/[0.12]"
                  >
                    <Plus size={14} /> Ajouter
                  </Button>
                </div>

                <div className="space-y-2">
                  {item.sessions?.length === 0 && (
                    <div className="rounded-control border border-border bg-background p-4 text-sm text-secondary/40 text-center">
                      Aucune séance trouvée
                    </div>
                  )}
                  {item.sessions?.map((session) => (
                    <div key={session.id} className="rounded-surface border border-border bg-background p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/[0.08] text-primary flex items-center justify-center text-sm font-medium">{session.session}</div>
                      <div className="flex items-center gap-1.5 text-sm text-secondary/60">
                        <Clock size={14} className="text-secondary/40" />
                        <span className="font-medium">{session.duration} min</span>
                      </div>
                      <div className="ml-auto flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setSessionData(session)
                            setEditingSession(true)
                            setOpenSessionModal(true)
                          }}
                          className="text-secondary/40 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Pen size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteSession(session.id)}
                          className="text-secondary/40 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="ghost" onClick={closeModal} type="button">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SessionModal
        open={openSessionModal}
        onClose={() => {
          setOpenSessionModal(false)
          clearSessionData()
        }}
        editing={editingSession}
        session={sessionData}
        setSession={setSessionData}
      />
    </>
  )
}

function DeleteModal() {
	const { operation, modalOpen, closeModal, deleteItem } = useServicesStore()
	const isOpen = operation === "delete" && modalOpen

	return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="p-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-control bg-red-50 flex items-center justify-center mb-4">
            <Trash2 size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-secondary">Supprimer ce service ?</h2>
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={closeModal}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={deleteItem}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
