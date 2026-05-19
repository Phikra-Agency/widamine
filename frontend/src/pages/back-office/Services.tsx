import { useServicesStore } from "@/stores/servicesStore"
import { Eye, PencilSimple as Pen, Plus, Trash as Trash2, FirstAid, Clock, Stethoscope, Tag, CurrencyDollar, CaretDown } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import clsx from "clsx"
import { motion } from 'framer-motion'
import { useDebounce } from "use-debounce"
import { useCategoriesStore } from "@/stores/categoriesStore"

export default function Services() {
	const { fetchItems } = useCategoriesStore()

	useEffect(() => {
		fetchItems()
	}, [])

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
			className="bo-page"
		>
			<div className="bo-page-inner bo-section-stack">
				{/* Ambient blur circles */}
				<div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
				<div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/[0.03] rounded-full blur-3xl pointer-events-none" />
				
				<Heading />
				<Filters />
				<div className="bo-surface">
					<Table />
				</div>
			</div>
			<Modal />
			<ShowModal />
			<DeleteModal />
		</motion.div>
	)
}

function Heading() {
	const { openModal, setOperation, clearItem } = useServicesStore()
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div>
				<h3 className="bo-title">Gestion Des Services</h3>
				<p className="bo-subtitle">Gérez les services et leurs séances</p>
			</div>
			<button
				onClick={() => {
					clearItem()
					setOperation("create")
					openModal()
				}}
				className="bo-primary-btn cursor-pointer">
				<Plus weight="bold" /> Ajouter Un Service
			</button>
		</div>
	)
}

function Filters() {
	const { filters, setFilters } = useServicesStore()
	const { items: categories } = useCategoriesStore()

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
			<div className="relative flex-1 max-w-md">
				<input
					type="text"
					placeholder="Rechercher un service..."
					value={filters.term}
					onChange={(e) => setFilters({ ...filters, term: e.target.value })}
					className="bo-input"
				/>
			</div>
			<div className="relative min-w-[180px]">
				<select
					onChange={(e) => setFilters({ ...filters, categoryId: +e.target.value })}
					className="bo-select"
				>
					<option value="0">Toutes les catégories</option>
					{categories.map((cat) => (
						<option value={cat.id} key={cat.id}>{cat.category}</option>
					))}
				</select>
				<CaretDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30" />
			</div>
		</div>
	)
}

function Table() {
	const { items, filters, fetchItems, setOperation, openModal, setItem } = useServicesStore()
	const [filtered, setFiltered] = useState(items)
	const [debouncedFilters] = useDebounce(filters, 300)

	useEffect(() => {
		fetchItems()
	}, [])

	useEffect(() => {
		setFiltered(items.filter((i) => i.name.includes(debouncedFilters.term) && (i.categoryId === debouncedFilters.categoryId || debouncedFilters.categoryId === 0)))
	}, [items, debouncedFilters])

  return (
    <>
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Service</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Prix</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Séances</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Médecin</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40">Catégorie</th>
              <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-secondary/40">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/[0.04] flex items-center justify-center">
                      <FirstAid size={32} className="text-secondary/30" />
                    </div>
                    <p className="text-sm font-medium">Aucun service trouvé</p>
                    <p className="text-xs">Ajoutez un service pour commencer</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((item) => (
              <tr className="border-b border-black/[0.04] hover:bg-secondary/[0.02] transition-colors" key={item.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                      <FirstAid size={20} className="text-primary" />
                    </div>
                    <span className="font-medium text-secondary">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-secondary/60">
                    <CurrencyDollar size={14} className="text-secondary/40" />
                    <span className="font-medium">{item.price}</span>
                    <span className="text-xs text-secondary/40">DH</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-secondary/60">
                    <Clock size={14} className="text-secondary/40" />
                    <span className="font-medium">{item._count?.sessions || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-secondary/60">{item.doctor?.name || '—'}</td>
                <td className="px-6 py-4">
                  {item.category?.category ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border bg-violet-50 text-violet-700 border-violet-100">
                      {item.category.category}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setItem(item)
                        setOperation("show")
                        openModal()
                      }}
                      className="p-2 rounded-lg text-secondary/40 hover:text-primary hover:bg-primary/[0.08] transition-all duration-200"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setItem(item)
                        setOperation("edit")
                        openModal()
                      }}
                      className="p-2 rounded-lg text-secondary/40 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
                    >
                      <Pen size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setItem(item)
                        setOperation("delete")
                        openModal()
                      }}
                      className="p-2 rounded-lg text-secondary/40 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className='lg:hidden'>
        <div className='space-y-3 p-3'>
          {filtered.length === 0 ? (
            <div className='rounded-2xl border border-black/[0.06] bg-white px-4 py-10 text-center text-secondary/40'>
              <div className='flex flex-col items-center gap-3'>
                <div className='w-16 h-16 rounded-2xl bg-secondary/[0.04] flex items-center justify-center'>
                  <FirstAid size={32} className='text-secondary/30' />
                </div>
                <p className='text-sm font-medium'>Aucun service trouvé</p>
                <p className='text-xs'>Ajoutez un service pour commencer</p>
              </div>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className='rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0'>
                      <FirstAid size={20} className='text-primary' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-secondary truncate'>{item.name}</p>
                    </div>
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
                    <span className='font-medium text-secondary/80'>{item.doctor?.name || '—'}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-secondary/40'>Catégorie</span>
                    <span>{item.category?.category ? (
                      <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border bg-violet-50 text-violet-700 border-violet-100'>
                        {item.category.category}
                      </span>
                    ) : '—'}</span>
                  </div>
                </div>

                <div className='mt-3 flex items-center gap-2'>
                  <button
                    onClick={() => {
                      setItem(item)
                      setOperation("show")
                      openModal()
                    }}
                    className='flex-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-black/[0.06] text-primary hover:bg-primary/5 transition-all'
                  >
                    <Eye size={14} className='inline mr-1' /> Détails
                  </button>
                  <button
                    onClick={() => {
                      setItem(item)
                      setOperation("edit")
                      openModal()
                    }}
                    className='flex-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-black/[0.06] text-secondary/60 hover:bg-secondary/5 hover:text-secondary transition-all'
                  >
                    <Pen size={14} className='inline mr-1' /> Modifier
                  </button>
                  <button
                    onClick={() => {
                      setItem(item)
                      setOperation("delete")
                      openModal()
                    }}
                    className='flex-1 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-black/[0.06] text-red-400 hover:bg-red-50 hover:text-red-600 transition-all'
                  >
                    <Trash2 size={14} className='inline mr-1' /> Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function Modal() {
	const { operation, modalOpen, closeModal, item, setItem, saveItem, fetchDoctors, fetchResources, doctors, resources } = useServicesStore()
	const { items: categories } = useCategoriesStore()
	const isEdit = operation === 'edit'

	useEffect(() => {
		;["create", "edit"].includes(operation) && modalOpen && (fetchDoctors(), fetchResources())
	}, [modalOpen, operation])

	// Toggle helper for multi-select arrays
	const toggleDoctor = (doctorId: number) => {
		const current = item.allowedDoctorIds || []
		const updated = current.includes(doctorId)
			? current.filter(id => id !== doctorId)
			: [...current, doctorId]
		setItem({ ...item, allowedDoctorIds: updated })
	}

	const toggleSalle = (salleId: number) => {
		const current = item.allowedSalleIds || []
		const updated = current.includes(salleId)
			? current.filter(id => id !== salleId)
			: [...current, salleId]
		setItem({ ...item, allowedSalleIds: updated })
	}

	const selectedDoctors = item.allowedDoctorIds || []
	const selectedSalles = item.allowedSalleIds || []

  return (
    <div className={clsx("fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4", ["create", "edit"].includes(operation) && modalOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
			<div className="absolute inset-0 bg-black/[0.4] backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
			<form
				onSubmit={(e) => {
					e.preventDefault()
					saveItem()
				}}
				onClick={(e) => e.stopPropagation()}
        className={clsx("relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300", ["create", "edit"].includes(operation) && modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}
      >
				<div className="sticky top-0 z-10 border-b border-black/[0.06] bg-white px-6 py-4">
					<h2 className="text-lg font-semibold text-secondary">{isEdit ? "Modifier le service" : "Nouveau service"}</h2>
					<p className="text-sm text-secondary/40 mt-0.5">{isEdit ? "Modifiez les informations du service" : "Créez un nouveau service de soins"}</p>
				</div>

				<div className="p-6 space-y-5">
					<div className="flex items-center justify-center mb-4">
						<div className="w-16 h-16 rounded-2xl bg-primary/[0.08] flex items-center justify-center">
							<FirstAid size={32} className="text-primary" />
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Nom du service</label>
						<input type="text" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })}
							className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
							placeholder="Consultation générale" />
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Prix (DH)</label>
						<input type="number" value={item.price || ""} onChange={(e) => setItem({ ...item, price: +e.target.value })}
							className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
							placeholder="500" />
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Catégorie</label>
						<div className="relative">
							<select value={item.categoryId} onChange={(e) => setItem({ ...item, categoryId: +e.target.value })}
								className="w-full rounded-xl border border-black/[0.08] bg-white pl-4 pr-10 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer appearance-none">
								<option value={0}>Sélectionnez une catégorie</option>
								{categories.map((cat) => (
									<option value={cat.id} key={cat.id}>{cat.category}</option>
								))}
							</select>
							<CaretDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30" />
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Médecin principal</label>
						<div className="relative">
							<select value={item.doctorId} onChange={(e) => setItem({ ...item, doctorId: +e.target.value })}
								className="w-full rounded-xl border border-black/[0.08] bg-white pl-4 pr-10 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer appearance-none">
								<option value={0}>Sélectionnez un médecin</option>
								{doctors.map((doc) => (
									<option value={doc.id} key={doc.id}>{doc.name}</option>
								))}
							</select>
							<CaretDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30" />
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Médecins habilités (plusieurs)</label>
						<div className="flex flex-wrap gap-2">
							{doctors.map((doc) => (
								<button
									key={doc.id}
									type="button"
									onClick={() => toggleDoctor(doc.id)}
									data-selected={selectedDoctors.includes(doc.id)}
									className="px-3 py-2 rounded-lg text-sm border transition-all data-[selected=true]:bg-primary/[0.08] data-[selected=true]:border-primary/50 data-[selected=true]:text-primary data-[selected=false]:border-black/[0.08] data-[selected=false]:bg-white data-[selected=false]:text-secondary/60 hover:border-primary/30"
								>
									{doc.name}
								</button>
							))}
						</div>
						<p className="text-xs text-secondary/40">Sélectionnez les médecins qui peuvent effectuer ce service</p>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Salles autorisées (plusieurs)</label>
						<div className="flex flex-wrap gap-2">
							{resources.map((salle) => (
								<button
									key={salle.id}
									type="button"
									onClick={() => toggleSalle(salle.id)}
									data-selected={selectedSalles.includes(salle.id)}
									className="px-3 py-2 rounded-lg text-sm border transition-all data-[selected=true]:bg-secondary/[0.04] data-[selected=true]:border-secondary/50 data-[selected=true]:text-secondary data-[selected=false]:border-black/[0.08] data-[selected=false]:bg-white data-[selected=false]:text-secondary/60 hover:border-secondary/30"
								>
									{salle.name}
								</button>
							))}
						</div>
						<p className="text-xs text-secondary/40">Sélectionnez les salles où ce service peut être prodigné</p>
					</div>
				</div>

				<div className="sticky bottom-0 border-t border-black/[0.06] bg-white px-6 py-4 flex gap-3 justify-end">
					<button onClick={closeModal} type="button"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/[0.04] transition-all duration-200">
						Annuler
					</button>
					<button type="submit"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/10 transition-all duration-200">
						{isEdit ? "Enregistrer" : "Créer le service"}
					</button>
				</div>
			</form>
		</div>
	)
}

function SessionModal({ open, onClose, editing, session, setSession }: { open: boolean; onClose: () => void; editing: boolean; session: { id: number; session: number; duration: number }; setSession: (session: { id: number; session: number; duration: number }) => void }) {
	const { saveSession } = useServicesStore()

	return (
    <div className={clsx("fixed inset-0 z-[60] flex items-start justify-center pt-8 pb-8 px-4", open ? "opacity-100" : "opacity-0 pointer-events-none")}>
			<div className="absolute inset-0 bg-black/[0.4] backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
			<form
				onSubmit={(e) => {
					e.preventDefault()
					saveSession(session, editing)
					onClose()
				}}
                className={clsx("relative w-full max-w-sm max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300", open ? "opacity-100 scale-100" : "opacity-0 scale-95")}
			>
				<div className="border-b border-black/[0.06] px-6 py-4">
					<h2 className="text-lg font-semibold text-secondary">{editing ? "Modifier la séance" : "Nouvelle séance"}</h2>
				</div>

				<div className="p-6 space-y-5">
					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Durée (minutes)</label>
						<input type="number" value={session.duration || ""} onChange={(e) => setSession({ ...session, duration: +e.target.value })}
							className="w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
							placeholder="60" />
					</div>
				</div>

				<div className="border-t border-black/[0.06] px-6 py-4 flex gap-3 justify-end">
					<button onClick={onClose} type="button"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/[0.04] transition-all duration-200">
						Annuler
					</button>
					<button type="submit"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/10 transition-all duration-200">
						{editing ? "Enregistrer" : "Ajouter"}
					</button>
				</div>
			</form>
		</div>
	)
}

function ShowModal() {
	const { operation, modalOpen, closeModal, fetchItem, item, deleteSession } = useServicesStore()
	const [sessionData, setSessionData] = useState({ id: 0, session: 0, duration: 0 })
	const [openSessionModal, setOpenSessionModal] = useState(false)
	const [editingSession, setEditingSession] = useState(false)

	function clearSessionData() {
		setSessionData({ id: 0, session: 0, duration: 0 })
	}

	useEffect(() => {
		;["show"].includes(operation) && modalOpen && fetchItem()
	}, [modalOpen])

	return (
     <div className={clsx("fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4", operation === "show" && modalOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
				<div className="absolute inset-0 bg-black/[0.4] backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
                <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: 12 }} animate={operation === "show" && modalOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className={clsx("relative w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-black/[0.08] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300", operation === "show" && modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}> 
					<div className="sticky top-0 z-10 border-b border-black/[0.06] bg-white px-6 py-4">
						<h2 className="text-lg font-semibold text-secondary">Détails du service</h2>
						<p className="text-sm text-secondary/40 mt-0.5">{item.name}</p>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Nom du service</label>
									<div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary">
										<FirstAid size={16} className="text-secondary/40" />
										{item.name}
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Prix</label>
									<div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary">
										<CurrencyDollar size={16} className="text-secondary/40" />
										{item.price} DH
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Médecin</label>
									<div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary">
										<Stethoscope size={16} className="text-secondary/40" />
										{item.doctor?.name || '—'}
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/40">Catégorie</label>
									<div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-secondary">
										<Tag size={16} className="text-secondary/40" />
										{item.category?.category || '—'}
									</div>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="font-medium text-secondary">Séances</h3>
									<button
										onClick={() => {
											setEditingSession(false)
											setOpenSessionModal(true)
										}}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/[0.08] hover:bg-primary/[0.12] transition-all duration-200"
									>
										<Plus size={14} /> Ajouter
									</button>
								</div>

								<div className="space-y-2">
									{item.sessions?.length === 0 && (
										<div className="rounded-xl border border-black/[0.08] bg-white p-4 text-sm text-secondary/40 text-center">
											Aucune séance trouvée
										</div>
									)}
									{item.sessions?.map((session) => (
										<div key={session.id} className="rounded-2xl border border-black/[0.08] bg-white p-4 flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-primary/[0.08] text-primary flex items-center justify-center text-sm font-medium">{session.session}</div>
											<div className="flex items-center gap-1.5 text-sm text-secondary/60">
												<Clock size={14} className="text-secondary/40" />
												<span className="font-medium">{session.duration} min</span>
											</div>
											<div className="ml-auto flex gap-1">
												<button
													onClick={() => {
														setSessionData(session)
														setEditingSession(true)
														setOpenSessionModal(true)
													}}
													className="p-2 rounded-lg text-secondary/40 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
												>
													<Pen size={14} />
												</button>
												<button
													onClick={() => deleteSession(session.id)}
													className="p-2 rounded-lg text-secondary/40 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="sticky bottom-0 border-t border-black/[0.06] bg-white px-6 py-4 flex justify-end">
						<button onClick={closeModal} type="button"
							className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/[0.04] transition-all duration-200">
							Fermer
						</button>
					</div>
			</motion.div>
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
            </div>
        )
}

function DeleteModal() {
	const { operation, modalOpen, closeModal, deleteItem } = useServicesStore()
	return (
    	<div className={clsx("fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4", operation === "delete" && modalOpen ? "opacity-100" : "opacity-0 pointer-events-none")}> 
			<div className="absolute inset-0 bg-black/[0.4] backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
			<div onClick={(e) => e.stopPropagation()} className={clsx("relative w-full max-w-md rounded-2xl border border-black/[0.08] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-300", operation === "delete" && modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
				<div className="p-6 text-center">
					<div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
						<Trash2 size={28} className="text-red-500" />
					</div>
					<h2 className="text-lg font-semibold text-secondary">Supprimer ce service ?</h2>
					<p className="text-sm text-secondary/40 mt-2">Cette action est irréversible. Le service sera définitivement supprimé.</p>
				</div>
				<div className="border-t border-black/[0.06] px-6 py-4 flex gap-3 justify-end">
					<button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/60 hover:text-secondary hover:bg-secondary/[0.04] transition-all duration-200">
						Annuler
					</button>
					<button onClick={deleteItem} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/10 transition-all duration-200">
						Supprimer
					</button>
				</div>
			</div>
		</div>
	)
}
