import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { EnvelopeSimple as Mail, MapPin, Phone, Clock as Clock3 } from '@phosphor-icons/react'
import Header from '@/components/Header'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/api'
import z from 'zod'

const CONTACT_CARDS = [
	{
		icon: Phone,
		title: 'Téléphone',
		lines: ['+212 (535) 624 696', '+212 (535) 930 182', '+212 (694) 722 113'],
	},
	{
		icon: Mail,
		title: 'Email',
		lines: ['info@widamineaestheticcenter.com'],
	},
	{
		icon: MapPin,
		title: 'Adresse',
		lines: ['Boulevard Slaoui, Bureaux Nour', 'En face cinéma Astor, 2ème étage', 'Fès'],
	},
	{
		icon: Clock3,
		title: 'Horaires',
		lines: ['Lundi à samedi', '9h à 19h', 'Accueil sur rendez-vous'],
	},
]

export default function Contact() {
	return (
		<div className='bg-custom-white'>
			<Header page='Contact' />
			<section className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-18'>
				<div className='grid gap-8 lg:grid-cols-[0.9fr_1.1fr]'>
					<div className='space-y-6'>
						<div className='rounded-[1.75rem] border border-secondary/10 bg-[#fffaf7] p-5 shadow-[0_24px_55px_rgba(26,54,70,0.06)] sm:rounded-[2.25rem] sm:p-8'>
							<p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>Contact</p>
							<h1 className='mt-4 max-w-lg font-amoria text-[2rem] leading-tight text-secondary sm:text-4xl md:text-5xl'>
								Contactez Widamine Aesthetic Center.
							</h1>
							<p className='mt-5 max-w-xl text-sm leading-7 text-secondary/68 sm:text-base sm:leading-8'>
								Notre équipe vous accompagne pour vos questions, votre consultation ou votre plan de traitement, dans une approche claire, douce et personnalisée.
							</p>
						</div>

						<div className='grid gap-4 sm:grid-cols-2 sm:gap-5'>
							{CONTACT_CARDS.map((card) => {
								const Icon = card.icon
								return (
									<div key={card.title} className='rounded-[1.4rem] border border-secondary/10 bg-custom-white p-4 shadow-[0_18px_40px_rgba(26,54,70,0.06)] sm:rounded-[1.75rem] sm:p-6'>
										<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
											<Icon size={20} />
										</div>
										<h2 className='mt-5 text-xl font-semibold text-secondary'>{card.title}</h2>
										<div className='mt-4 space-y-1 text-sm leading-7 text-secondary/68'>
											{card.lines.map((line) => (
												<p key={line}>{line}</p>
											))}
										</div>
									</div>
								)
							})}
						</div>

						<div className='rounded-[1.55rem] border border-secondary/10 bg-[#fffaf7] p-5 shadow-[0_18px_40px_rgba(26,54,70,0.06)] sm:rounded-[1.9rem] sm:p-6'>
							<p className='text-xs uppercase tracking-[0.28em] text-primary'>Accueil & rendez-vous</p>
							<h2 className='mt-4 text-[1.8rem] leading-tight text-secondary sm:text-3xl'>Un contact simple, un accompagnement réel.</h2>
							<p className='mt-4 max-w-xl text-sm leading-7 text-secondary/66'>
								Pour une première consultation, une question sur un protocole ou une demande d’information, notre équipe vous répond avec la même exigence de clarté que dans le centre.
							</p>
						</div>
					</div>

					<div className='flex justify-center lg:justify-end'>
						<ContactForm />
					</div>
				</div>
			</section>
		</div>
	)
}

function ContactForm() {
	const [loading, setLoading] = useState(false)
	const [contactData, setContactData] = useState({ name: '', email: '', phone: '', context: '' })

	async function submit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		try {
			if (loading) return
			setLoading(true)

			const obj = z.object({
				name: z
					.string()
					.nonempty({ error: 'Le nom est requis' })
					.min(2, { error: 'Le nom doit contenir au moins 2 caractères' })
					.max(100, { error: 'Le nom doit contenir au maximum 100 caractères' })
					.regex(/^[a-zA-Z\s\-]+$/, 'Le nom ne doit contenir que des lettres et des espaces ou des tirets'),
				email: z.email({ error: "L'email doit être valide" }).nonempty({ error: "L'email est requis" }),
				phone: z
					.string()
					.nonempty({ error: 'Le numéro de téléphone est requis' })
					.regex(/^[0-9]+$/, 'Le numéro de téléphone doit contenir uniquement des chiffres')
					.min(10, { error: 'Le numéro de téléphone doit contenir au moins 10 caractères' })
					.max(15, { error: 'Le numéro de téléphone doit contenir au maximum 15 caractères' }),
				context: z.string().max(500, { error: 'Le message doit contenir au maximum 500 caractères' }),
			})

			const parsed = obj.safeParse(contactData)
			if (!parsed.success) {
				const tree = z.treeifyError(parsed.error)
				Object.keys(tree.properties!).map((key) => {
					if (tree.properties?.[key as keyof typeof tree.properties]?.errors?.[0]) {
						toast.error(tree.properties?.[key as keyof typeof tree.properties]?.errors?.[0] as string, { id: key })
					}
				})
				return
			}

			await axios.post(API_BASE_URL + '/contacts', parsed.data)
			toast.success('Message envoyé avec succès!')
			setContactData({ name: '', email: '', phone: '', context: '' })
		} catch (err) {
			toast.error('Une erreur est survenue, veuillez réessayer plus tard.')
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form className='w-full max-w-xl rounded-[1.65rem] border border-secondary/10 bg-secondary p-4 text-white shadow-[0_28px_60px_rgba(26,54,70,0.16)] sm:rounded-[2.15rem] sm:p-6 lg:p-8' onSubmit={submit}>
			<p className='text-xs uppercase tracking-[0.28em] text-white/52'>Écrivez-nous</p>
			<h2 className='mt-4 font-amoria text-[2rem] text-white sm:text-3xl'>Votre message, notre retour.</h2>
			<p className='mt-4 text-sm leading-7 text-white/68'>
				Partagez votre besoin, votre question ou le soin qui vous intéresse. Nous vous recontacterons rapidement.
			</p>

			<div className='mt-8 space-y-4'>
				<Field label='Nom'>
					<input type='text' id='name' placeholder='Nom' className='w-full bg-transparent text-sm text-white placeholder:text-white/38 outline-none' value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} />
				</Field>
				<Field label='Email'>
					<input type='email' id='email' placeholder='Email' className='w-full bg-transparent text-sm text-white placeholder:text-white/38 outline-none' value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} />
				</Field>
				<Field label='Téléphone'>
					<input type='text' id='phone' placeholder='Téléphone' className='w-full bg-transparent text-sm text-white placeholder:text-white/38 outline-none' value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} />
				</Field>
				<label className='block rounded-[1.25rem] border border-white/14 bg-white/6 px-4 py-4 sm:rounded-[1.5rem]'>
					<span className='mb-3 block text-sm text-white/72'>Message</span>
					<textarea id='message' placeholder='Message' rows={5} className='w-full resize-none bg-transparent text-sm text-white placeholder:text-white/38 outline-none' value={contactData.context} onChange={(e) => setContactData({ ...contactData, context: e.target.value })} />
				</label>
			</div>

			<button type='submit' className='mt-6 w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-custom-white shadow-[0_14px_28px_rgba(46,144,192,0.24)] transition hover:bg-primary/90 disabled:opacity-60' disabled={loading}>
				{loading ? 'Envoi...' : 'Envoyer'}
			</button>
		</form>
	)
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<label className='block rounded-[1.1rem] border border-white/14 bg-white/6 px-4 py-3 sm:rounded-full'>
			<span className='mb-2 block text-sm text-white/72'>{label}</span>
			{children}
		</label>
	)
}
