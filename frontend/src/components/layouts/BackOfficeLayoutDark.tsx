import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDots as CalendarDays,
  ClipboardText as ClipboardCheck,
  SquaresFour as LayoutGrid,
  UsersThree as Users,
  Stethoscope,
  Door,
  UserCircle,
  List,
  X,
} from '@phosphor-icons/react'
import { useAuthStore } from '@/stores/authStore'

const LINKS: { to: string; label: string; icon: React.ElementType; roles: string[] }[] = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutGrid, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'appointments', label: 'Rendez-vous', icon: ClipboardCheck, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'calendar', label: 'Calendrier', icon: CalendarDays, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'patients', label: 'Patients', icon: UserCircle, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN'] },
  { to: 'resources', label: 'Salles', icon: Door, roles: ['ADMIN'] },
  { to: 'motifs', label: 'Motifs', icon: Stethoscope, roles: ['ADMIN'] },
]

type LinkRole = (typeof LINKS)[number]['roles'][number]

export default function BackOfficeLayoutDark() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/admin1' || pathname.endsWith('/dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <main className='min-h-dvh bg-[#0a1628] text-slate-100'>
      <div className='flex items-center justify-between border-b border-white/10 bg-[#0f2031] px-4 py-3 xl:hidden'>
        <div>
          <p className='text-[10px] uppercase tracking-[0.34em] text-white/46'>Widamine</p>
          <p className='mt-1 font-amoria text-lg tracking-[0.08em] text-white'>Admin</p>
        </div>
        <button
          type='button'
          onClick={() => setSidebarOpen((open) => !open)}
          className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white'
          aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>
      <div className='flex min-h-dvh w-full xl:h-dvh'>
        <SidebarDark sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <section className='flex-1 min-w-0 overflow-hidden'>
          <div className={`h-full px-3 py-3 sm:px-4 sm:py-4 ${isDashboard ? 'overflow-y-auto overflow-x-hidden' : 'overflow-auto'}`}>
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  )
}

function SidebarDark({ sidebarOpen, onClose }: { sidebarOpen: boolean; onClose: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const visibleLinks = useMemo(() => {
    if (!user?.role) {
      return [{ to: '/admin1', label: 'Dashboard', icon: LayoutGrid }]
    }
    return LINKS.filter((link) => link.roles.includes(user.role as LinkRole)).map((link) => ({
      to: `/back-office/${link.to}`,
      label: link.label,
      icon: link.icon,
    }))
  }, [user?.role])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity xl:hidden ${
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[19rem] max-w-[88vw] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(15,38,58,0.98),rgba(10,27,43,0.96))] p-5 text-white shadow-[0_24px_70px_rgba(10,31,47,0.24)] transition-transform duration-200 xl:static xl:z-auto xl:w-[18.5rem] xl:max-w-none xl:translate-x-0 xl:rounded-[2rem] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      <div className='flex items-center gap-4 border-b border-white/10 pb-5'>
        <div className='flex min-w-0 items-center gap-4'>
          <div className='flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-white/92 shadow-[0_16px_26px_rgba(0,0,0,0.14)]'>
            <img src='/logo.png' alt='Widamine' className='h-9 w-9 object-contain' />
          </div>
          <div className='min-w-0'>
            <p className='text-[10px] uppercase tracking-[0.34em] text-white/46'>Widamine</p>
            <p className='mt-1 font-amoria text-2xl tracking-[0.08em] text-white'>Admin</p>
            <p className='mt-1 text-sm text-white/52'>Pilotage des demandes et du centre</p>
          </div>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white xl:hidden'
          aria-label='Fermer le menu'
        >
          <X size={16} />
        </button>
      </div>

      <div className='mt-6 rounded-[1.6rem] border border-white/10 bg-white/6 p-4'>
        <p className='text-[10px] uppercase tracking-[0.28em] text-[#8bd8ff]'>
          {user ? 'Session active' : 'Mode apercu'}
        </p>
        <p className='mt-3 text-lg text-white'>
          {user ? `${user.name} • ${user.role}` : 'Dashboard visible sans connexion'}
        </p>
        <p className='mt-2 text-sm leading-6 text-white/58'>
          {user
            ? 'Utilisateurs, contacts, rendez-vous et calendrier restent accessibles.'
            : 'Le tableau de bord reste visible pour test, mais les autres modules demandent une connexion.'}
        </p>
      </div>

      <nav className='mt-6 flex flex-1 flex-col gap-2 overflow-y-auto'>
        {visibleLinks.map((link) => {
          const isActive = location.pathname === link.to || (link.to === '/admin1' && location.pathname === '/admin1')
          return (
            <Link
              key={link.to}
              to={link.to}
              data-active={isActive}
              className='group flex items-center gap-3 rounded-[1.15rem] border border-transparent px-4 py-3 text-sm text-white/72 transition-all duration-200 hover:border-white/10 hover:bg-white/8 hover:text-white data-[active=true]:border-white/10 data-[active=true]:bg-[#2e90c0]/20'
            >
              <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white/8 transition-colors duration-200 group-data-[active=true]:bg-[#2e90c0]/20'>
                <link.icon size={17} />
              </span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => navigate('/')}
        className='flex w-full items-center gap-2 rounded-[1.15rem] px-4 py-3 text-sm text-white/60 transition-all hover:bg-white/8 hover:text-white'
      >
        <ArrowLeft size={16} />
        Retour au site
      </button>
      </aside>
    </>
  )
}
