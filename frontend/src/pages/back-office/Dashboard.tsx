import { useAppointmentsStore } from '@/stores/appointmentsStore'
import { ArrowRight, CalendarBlank, CalendarDots as CalendarClock, Clock as Clock3, EnvelopeSimple as Mail, Phone, Sparkle as Sparkles } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

function getPrimarySchedule(datetime?: string) {
  if (!datetime) return null
  const value = new Date(datetime)
  return Number.isNaN(value.getTime()) ? null : value
}

function formatDate(datetime?: string) {
  const date = getPrimarySchedule(datetime)
  if (!date) return 'Date à confirmer'

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export default function Dashboard() {
  const { items, fetchItems } = useAppointmentsStore()

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const sortedItems = [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  const today = new Date()
  const todayKey = today.toDateString()

  const upcoming = sortedItems.filter((item) => {
    const schedule = getPrimarySchedule(item.schedules?.[0]?.datetime)
    return schedule ? schedule >= new Date(today.getTime() - 60_000) : false
  })

  const todayAppointments = sortedItems.filter((item) => {
    const schedule = getPrimarySchedule(item.schedules?.[0]?.datetime)
    return schedule ? schedule.toDateString() === todayKey : false
  })

  const withEmail = sortedItems.filter((item) => item.email?.trim()).length
  const withPhone = sortedItems.filter((item) => item.phone?.trim()).length
  const featured = upcoming[0] ?? sortedItems[0]
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() + index)

    const count = upcoming.filter((item) => {
      const schedule = getPrimarySchedule(item.schedules?.[0]?.datetime)
      return schedule ? schedule.toDateString() === date.toDateString() : false
    }).length

    return {
      key: date.toISOString(),
      date,
      count,
      isToday: date.toDateString() === todayKey,
    }
  })

  return (
    <div className='flex h-full flex-col gap-4 overflow-hidden text-slate-800 lg:gap-5'>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className='overflow-hidden rounded-[2rem] border border-[#e7d7cf] bg-gradient-to-br from-[#0d2234] via-[#16344e] to-[#1c4965] p-5 text-white shadow-[0_30px_80px_rgba(10,31,47,0.18)] lg:p-6'
      >
        <div className='grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-6'>
          <div className='space-y-4'>
            <p className='text-xs uppercase tracking-[0.34em] text-white/55'>Administration</p>
            <div className='space-y-2'>
              <h1 className='max-w-3xl text-2xl leading-tight text-white lg:text-[2.5rem]'>
                Tableau de bord des réservations et du rythme quotidien du centre.
              </h1>
              <p className='max-w-2xl text-sm leading-6 text-white/70'>
                Une lecture rapide des demandes reçues, des prochains rendez-vous et du niveau d’activité pour garder le back-office dans la même ligne premium que le site public.
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-3'>
              <StatCard label='Réservations totales' value={sortedItems.length} note='Demandes enregistrées' />
              <StatCard label='Aujourd’hui' value={todayAppointments.length} note='Créneaux à suivre' />
              <StatCard label='À venir' value={upcoming.length} note='Planning futur' />
            </div>
          </div>

          <div className='rounded-[1.8rem] border border-white/12 bg-white/8 p-4 backdrop-blur-sm'>
            <div className='flex items-center gap-2 text-sm text-white/72'>
              <Sparkles size={16} className='text-[#8bd8ff]' />
              Vue prioritaire
            </div>
            <div className='mt-4 space-y-3'>
              <div className='rounded-[1.4rem] border border-white/10 bg-white/8 p-4'>
                <p className='text-xs uppercase tracking-[0.28em] text-white/42'>Prochaine réservation</p>
                <p className='mt-2 text-lg text-white'>{featured?.name ?? 'Aucune demande récente'}</p>
                <p className='mt-1 text-sm text-white/62'>{featured?.service?.name ?? 'Service non défini'}</p>
                <div className='mt-3 flex items-center gap-2 text-sm text-white/70'>
                  <CalendarClock size={16} className='text-[#8bd8ff]' />
                  {formatDate(featured?.schedules?.[0]?.datetime)}
                </div>
              </div>

              <div className='grid gap-3 sm:grid-cols-2'>
                <MiniStat icon={Mail} label='Emails fournis' value={withEmail} />
                <MiniStat icon={Phone} label='Téléphones fournis' value={withPhone} />
              </div>

              <Link
                to='/back-office/appointments'
                className='inline-flex items-center gap-2 rounded-full border border-white/12 bg-white px-4 py-2.5 text-sm font-medium text-[#15344d] transition duration-300 hover:translate-x-0.5 hover:bg-[#f8f4f1]'
              >
                Ouvrir la liste complète
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <div className='grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:gap-5'>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className='flex min-h-0 flex-col overflow-hidden rounded-[1.8rem] border border-[#e7d7cf] bg-white shadow-[0_24px_60px_rgba(10,31,47,0.08)]'
        >
          <div className='flex items-center justify-between border-b border-[#efe3dc] px-5 py-4'>
            <div>
              <p className='text-xs uppercase tracking-[0.28em] text-[#90a0ae]'>Réservations</p>
              <h2 className='mt-1 text-xl text-[#10293f]'>Dernières demandes reçues</h2>
            </div>
            <Link to='/back-office/appointments' className='text-sm text-[#2ea9df] transition hover:text-[#0d7fb3]'>
              Voir tout
            </Link>
          </div>

          <div className='min-h-0 flex-1 divide-y divide-[#f1e7e1] overflow-auto'>
            {sortedItems.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.id ?? `${item.email}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.05 * index }}
                className='grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)_auto]'
              >
                <div className='min-w-0'>
                  <p className='text-base text-[#17324a]'>{item.name}</p>
                  <p className='mt-1 text-sm text-slate-500'>{item.service?.name ?? 'Service non défini'}</p>
                  {item.context ? <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-500'>{item.context}</p> : null}
                </div>
                <div className='space-y-2 text-sm text-slate-500'>
                  <div className='flex items-center gap-2'>
                    <Mail size={15} className='text-[#2ea9df]' />
                    <span className='truncate'>{item.email}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone size={15} className='text-[#2ea9df]' />
                    <span>{item.phone}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock3 size={15} className='text-[#2ea9df]' />
                    <span>{formatDate(item.schedules?.[0]?.datetime)}</span>
                  </div>
                </div>
                <div className='flex items-center'>
                  <Link
                    to='/back-office/appointments'
                    className='inline-flex items-center rounded-full border border-[#dce9f0] px-4 py-2 text-sm text-[#15344d] transition hover:border-[#9ed7ef] hover:text-[#0f7cac]'
                  >
                    Détails
                  </Link>
                </div>
              </motion.div>
            ))}

            {sortedItems.length === 0 ? (
              <div className='px-6 py-16 text-center text-slate-500'>
                Aucune réservation pour le moment.
              </div>
            ) : null}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className='flex min-h-0 flex-col gap-4 overflow-auto pr-1'
        >
          <div className='rounded-[1.8rem] border border-[#e7d7cf] bg-white p-5 shadow-[0_20px_50px_rgba(10,31,47,0.06)]'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs uppercase tracking-[0.28em] text-[#90a0ae]'>Semaine</p>
                <h3 className='mt-2 text-xl text-[#10293f]'>Calendrier rapide</h3>
              </div>
              <div className='flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <CalendarBlank size={18} />
              </div>
            </div>
            <p className='mt-3 text-sm leading-6 text-slate-500'>{formatMonthLabel(today)}</p>
            <div className='mt-4 -mx-5 px-5 overflow-x-auto pb-2'>
              <div className='grid grid-cols-7 gap-2 min-w-[320px]'>
                {weekDays.map((day) => (
                  <div
                    key={day.key}
                    className={`rounded-[1.15rem] border px-2 py-3 text-center transition min-w-[72px] ${
                      day.isToday ? 'border-primary/24 bg-primary/10 shadow-[0_14px_28px_rgba(46,144,192,0.10)]' : 'border-[#ecdfd7] bg-[#fcfaf8]'
                    }`}
                  >
                    <p className={`text-[10px] uppercase tracking-[0.22em] ${day.isToday ? 'text-primary' : 'text-slate-400'}`}>
                      {formatDayLabel(day.date)}
                    </p>
                    <p className='mt-2 text-lg text-[#10293f]'>{day.date.getDate()}</p>
                    <p className={`mt-2 text-[11px] ${day.isToday ? 'text-primary/90' : 'text-slate-500'}`}>
                      {day.count > 0 ? `${day.count} rdv` : 'Libre'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='rounded-[1.8rem] border border-[#e7d7cf] bg-[#fff7f2] p-5 shadow-[0_20px_50px_rgba(10,31,47,0.06)]'>
            <p className='text-xs uppercase tracking-[0.28em] text-[#90a0ae]'>Cadence</p>
            <h3 className='mt-2 text-xl text-[#10293f]'>Point de contrôle rapide</h3>
            <div className='mt-4 space-y-3'>
              <InsightRow label='Demandes avec horaire déjà fixé' value={sortedItems.filter((item) => item.schedules?.[0]?.datetime).length} />
              <InsightRow label='Demandes à traiter aujourd’hui' value={todayAppointments.length} />
              <InsightRow label='Demandes futures disponibles' value={upcoming.length} />
            </div>
          </div>

          <div className='rounded-[1.8rem] border border-[#e7d7cf] bg-white p-5 shadow-[0_20px_50px_rgba(10,31,47,0.06)]'>
            <p className='text-xs uppercase tracking-[0.28em] text-[#90a0ae]'>Navigation</p>
            <h3 className='mt-2 text-xl text-[#10293f]'>Accès direct</h3>
            <div className='mt-4 space-y-3'>
              <QuickLink to='/back-office/appointments' title='Rendez-vous' text='Ouvrir la gestion détaillée des réservations.' />
              <QuickLink to='/back-office/calendar' title='Calendrier' text='Vérifier les séances planifiées et le rythme hebdomadaire.' />
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className='rounded-[1.45rem] border border-white/12 bg-white/8 px-4 py-3.5 backdrop-blur-sm'>
      <p className='text-xs uppercase tracking-[0.24em] text-white/42'>{label}</p>
      <p className='mt-2 text-[1.75rem] text-white'>{value}</p>
      <p className='mt-1.5 text-sm text-white/58'>{note}</p>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: number
}) {
  return (
    <div className='rounded-[1.35rem] border border-white/10 bg-white/8 p-3.5'>
      <div className='flex items-center gap-2 text-sm text-white/70'>
        <Icon size={15} className='text-[#8bd8ff]' />
        {label}
      </div>
      <p className='mt-2 text-xl text-white'>{value}</p>
    </div>
  )
}

function InsightRow({ label, value }: { label: string; value: number }) {
  return (
    <div className='flex items-center justify-between rounded-[1.25rem] border border-[#ecdfd7] bg-white px-4 py-3.5'>
      <p className='max-w-[16rem] text-sm leading-6 text-slate-600'>{label}</p>
      <p className='text-xl text-[#10293f]'>{value}</p>
    </div>
  )
}

function QuickLink({ to, title, text }: { to: string; title: string; text: string }) {
  return (
    <Link
      to={to}
      className='block rounded-[1.35rem] border border-[#ecdfd7] bg-[#fcfaf8] px-4 py-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-[#b7e2f4] hover:bg-white'
    >
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-[15px] text-[#17324a]'>{title}</p>
          <p className='mt-1 text-sm leading-5 text-slate-500'>{text}</p>
        </div>
        <ArrowRight size={16} className='shrink-0 text-[#2ea9df]' />
      </div>
    </Link>
  )
}
