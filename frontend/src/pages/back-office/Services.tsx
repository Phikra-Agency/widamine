import { useServicesStore } from "@/stores/servicesStore"
import { Eye, PencilSimple as Pen, Plus, Trash as Trash2, FirstAid, Clock, Stethoscope, Tag, CurrencyDollar } from "@phosphor-icons/react"
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
			transition={{ duration: 0.45 }}
			className="h-full"
		>
			<div className="space-y-5 relative">
				<Heading />
				<Filters />
				<div className="relative overflow-hidden rounded-[2rem] border border-secondary/10 bg-white/60 shadow-[0_20px_60px_rgba(10,31,47,0.08)] backdrop-blur-xl">
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
		<div className="flex items-center justify-between">
			<div>
				<h3 className="font-semibold text-2xl text-secondary tracking-tight">Gestion Des Services</h3>
				<p className="text-sm text-secondary/60 mt-1">Gérez les services et leurs séances</p>
			</div>
			<button
				onClick={() => {
					clearItem()
					setOperation("create")
					openModal()
				}}
				className="flex gap-2 items-center cursor-pointer bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25">
				<Plus weight="bold" /> Ajouter Un Service
			</button>
		</div>
	)
}

function Filters() {
	const { filters, setFilters } = useServicesStore()
	const { items: categories } = useCategoriesStore()

	return (
		<div className="flex gap-4">
			<div className="relative flex-1 max-w-md">
				<input
					type="text"
					placeholder="Rechercher un service..."
					value={filters.term}
					onChange={(e) => setFilters({ ...filters, term: e.target.value })}
					className="w-full bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm transition-all"
				/>
			</div>
			<select
				onChange={(e) => setFilters({ ...filters, categoryId: +e.target.value })}
				className="bg-white/80 border border-secondary/10 rounded-xl px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-sm cursor-pointer min-w-[180px]"
			>
				<option value="0">Toutes les catégories</option>
				{categories.map((cat) => (
					<option value={cat.id} key={cat.id}>{cat.category}</option>
				))}
			</select>
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
		<table className="w-full text-sm">
			<thead>
				<tr className="border-b border-secondary/10">
					<th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Service</th>
					<th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Prix</th>
					<th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Séances</th>
					<th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Médecin</th>
					<th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60">Catégorie</th>
					<th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary/60 text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{filtered.length === 0 && (
					<tr>
						<td colSpan={6} className="px-6 py-12 text-center">
							<div className="flex flex-col items-center gap-3 text-secondary/50">
								<div className="w-16 h-16 rounded-2xl bg-secondary/5 flex items-center justify-center">
									<FirstAid size={32} className="text-secondary/30" />
								</div>
								<p className="text-sm font-medium">Aucun service trouvé</p>
								<p className="text-xs">Ajoutez un service pour commencer</p>
							</div>
						</td>
					</tr>
				)}
				{filtered.map((item) => (
					<tr className="border-b border-secondary/5 hover:bg-white/40 transition-colors" key={item.id}>
						<td className="px-6 py-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<FirstAid size={20} className="text-primary" />
								</div>
								<span className="font-medium text-secondary">{item.name}</span>
							</div>
						</td>
						<td className="px-6 py-4">
							<div className="flex items-center gap-1.5 text-secondary/70">
								<CurrencyDollar size={14} className="text-secondary/40" />
								<span className="font-medium">{item.price}</span>
								<span className="text-xs text-secondary/50">DH</span>
							</div>
						</td>
						<td className="px-6 py-4">
							<div className="flex items-center gap-1.5 text-secondary/70">
								<Clock size={14} className="text-secondary/40" />
								<span className="font-medium">{item._count?.sessions || 0}</span>
							</div>
						</td>
						<td className="px-6 py-4 text-secondary/70">{item.doctor?.name || '—'}</td>
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
									className="p-2 rounded-lg text-secondary/60 hover:text-primary hover:bg-primary/10 transition-all duration-200"
								>
									<Eye size={18} />
								</button>
								<button
									onClick={() => {
										setItem(item)
										setOperation("edit")
										openModal()
									}}
									className="p-2 rounded-lg text-secondary/60 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
								>
									<Pen size={18} />
								</button>
								<button
									onClick={() => {
										setItem(item)
										setOperation("delete")
										openModal()
									}}
									className="p-2 rounded-lg text-secondary/60 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
								>
									<Trash2 size={18} />
								</button>
							</div>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}

function Modal() {
	const { operation, modalOpen, closeModal, item, setItem, saveItem, fetchDoctors, doctors } = useServicesStore()
	const { items: categories } = useCategoriesStore()
	const isEdit = operation === 'edit'

	useEffect(() => {
		;["create", "edit"].includes(operation) && modalOpen && fetchDoctors()
	}, [modalOpen, operation])

  return (
    <div className={clsx("fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4", ["create", "edit"].includes(operation) && modalOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
			<div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
			<form
				onSubmit={(e) => {
					e.preventDefault()
					saveItem()
				}}
        className={clsx("relative w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300", ["create", "edit"].includes(operation) && modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95")}
      >
				<div className="sticky top-0 z-10 border-b border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4">
					<h2 className="text-lg font-semibold text-secondary">{isEdit ? "Modifier le service" : "Nouveau service"}</h2>
					<p className="text-sm text-secondary/60 mt-0.5">{isEdit ? "Modifiez les informations du service" : "Créez un nouveau service de soins"}</p>
				</div>

				<div className="p-6 space-y-5">
					<div className="flex items-center justify-center mb-4">
						<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
							<FirstAid size={32} className="text-primary" />
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/60">Nom du service</label>
						<input type="text" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })}
							className="w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
							placeholder="Consultation générale" />
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/60">Prix (DH)</label>
						<input type="number" value={item.price || ""} onChange={(e) => setItem({ ...item, price: +e.target.value })}
							className="w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
							placeholder="500" />
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/60">Médecin</label>
						<select value={item.doctorId} onChange={(e) => setItem({ ...item, doctorId: +e.target.value })}
							className="w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer">
							<option value={0}>Sélectionnez un médecin</option>
							{doctors.map((doc) => (
								<option value={doc.id} key={doc.id}>{doc.name}</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/60">Catégorie</label>
						<select value={item.categoryId} onChange={(e) => setItem({ ...item, categoryId: +e.target.value })}
							className="w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer">
							<option value={0}>Sélectionnez une catégorie</option>
							{categories.map((cat) => (
								<option value={cat.id} key={cat.id}>{cat.category}</option>
							))}
						</select>
					</div>
				</div>

				<div className="sticky bottom-0 border-t border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4 flex gap-3 justify-end">
					<button onClick={closeModal} type="button"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200">
						Annuler
					</button>
					<button type="submit"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02]">
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
			<div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
			<form
				onSubmit={(e) => {
					e.preventDefault()
					saveSession(session, editing)
					onClose()
				}}
                className={clsx("relative w-full max-w-sm max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300", open ? "opacity-100 scale-100" : "opacity-0 scale-95")}
			>
				<div className="border-b border-secondary/10 px-6 py-4">
					<h2 className="text-lg font-semibold text-secondary">{editing ? "Modifier la séance" : "Nouvelle séance"}</h2>
				</div>

				<div className="p-6 space-y-5">
					<div className="space-y-2">
						<label className="text-xs font-semibold uppercase tracking-wider text-secondary/60">Durée (minutes)</label>
						<input type="number" value={session.duration || ""} onChange={(e) => setSession({ ...session, duration: +e.target.value })}
							className="w-full rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
							placeholder="60" />
					</div>
				</div>

				<div className="border-t border-secondary/10 px-6 py-4 flex gap-3 justify-end">
					<button onClick={onClose} type="button"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200">
						Annuler
					</button>
					<button type="submit"
						className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02]">
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
				<div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
                <motion.div initial={{ opacity: 0, y: 12 }} animate={operation === "show" && modalOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={{ duration: 0.32 }} className={clsx("relative w-full max-w-3xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300", operation === "show" && modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95")}> 
					<div className="sticky top-0 z-10 border-b border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4">
						<h2 className="text-lg font-semibold text-secondary">Détails du service</h2>
						<p className="text-sm text-secondary/60 mt-0.5">{item.name}</p>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/50">Nom du service</label>
									<div className="flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary">
										<FirstAid size={16} className="text-secondary/40" />
										{item.name}
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/50">Prix</label>
									<div className="flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary">
										<CurrencyDollar size={16} className="text-secondary/40" />
										{item.price} DH
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/50">Médecin</label>
									<div className="flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary">
										<Stethoscope size={16} className="text-secondary/40" />
										{item.doctor?.name || '—'}
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-semibold uppercase tracking-wider text-secondary/50">Catégorie</label>
									<div className="flex items-center gap-2 rounded-xl border border-secondary/10 bg-white/80 px-4 py-2.5 text-sm text-secondary">
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
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all duration-200"
									>
										<Plus size={14} /> Ajouter
									</button>
								</div>

								<div className="space-y-2">
									{item.sessions?.length === 0 && (
										<div className="rounded-xl border border-secondary/10 bg-white/80 p-4 text-sm text-secondary/50 text-center">
											Aucune séance trouvée
										</div>
									)}
									{item.sessions?.map((session) => (
										<div key={session.id} className="rounded-2xl border border-secondary/10 bg-white/80 p-4 flex items-center gap-3 backdrop-blur-md">
											<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">{session.session}</div>
											<div className="flex items-center gap-1.5 text-sm text-secondary/70">
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
													className="p-2 rounded-lg text-secondary/60 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
												>
													<Pen size={14} />
												</button>
												<button
													onClick={() => deleteSession(session.id)}
													className="p-2 rounded-lg text-secondary/60 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
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

					<div className="sticky bottom-0 border-t border-secondary/10 bg-white/80 backdrop-blur-xl px-6 py-4 flex justify-end">
						<button onClick={closeModal} type="button"
							className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200">
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
			<div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
			<div className={clsx("relative w-full max-w-md rounded-[2rem] border border-white/20 bg-white/95 shadow-[0_40px_100px_rgba(10,31,47,0.25)] backdrop-blur-xl transition-all duration-300", operation === "delete" && modalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
				<div className="p-6 text-center">
					<div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
						<Trash2 size={28} className="text-red-500" />
					</div>
					<h2 className="text-lg font-semibold text-secondary">Supprimer ce service ?</h2>
					<p className="text-sm text-secondary/60 mt-2">Cette action est irréversible. Le service sera définitivement supprimé.</p>
				</div>
				<div className="border-t border-secondary/10 px-6 py-4 flex gap-3 justify-end">
					<button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-secondary/70 hover:text-secondary hover:bg-secondary/5 transition-all duration-200">
						Annuler
					</button>
					<button onClick={deleteItem} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 hover:scale-[1.02]">
						Supprimer
					</button>
				</div>
			</div>
		</div>
	)
}
