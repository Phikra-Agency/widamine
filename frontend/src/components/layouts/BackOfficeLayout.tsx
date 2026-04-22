import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  ArrowLeft,
  CalendarDots as CalendarDays,
  ClipboardText as ClipboardCheck,
  SignIn as LogIn,
  SignOut as LogOut,
  ShieldCheck,
  SquaresFour as LayoutGrid,
  UsersThree as Users,
  Stethoscope,
  Door,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

type LinkRole = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR'

const LINKS: {
  to: string
  label: string
  icon: Icon
  roles: LinkRole[]
}[] = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutGrid, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN'] },
  { to: 'motifs', label: 'Motifs', icon: Stethoscope, roles: ['ADMIN'] },
  { to: 'resources', label: 'Salles', icon: Door, roles: ['ADMIN'] },
  { to: 'appointments', label: 'Rendez-vous', icon: ClipboardCheck, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'calendar', label: 'Calendrier', icon: CalendarDays, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
]

export default function BackOfficeLayout() {
  const { pathname } = useLocation()
  const isPreview = pathname.startsWith('/admin')
  const isDashboard = pathname === '/admin' || pathname.endsWith('/dashboard')

  return (
    <main className='h-dvh overflow-hidden bg-[linear-gradient(180deg,#f8f4f1_0%,#f3efe9_42%,#eef3f6_100%)] text-secondary'>
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-primary/12 blur-3xl' />
        <div className='absolute right-[-7rem] top-24 h-80 w-80 rounded-full bg-[#f3d8c8]/45 blur-3xl' />
        <div className='absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-secondary/6 blur-3xl' />
      </div>

      <div className='relative mx-auto flex h-full w-full max-w-[1720px] flex-col gap-3 p-2 lg:flex-row lg:gap-4 lg:p-3'>
        <Sidebar isPreview={isPreview} />
        <div className='flex min-h-0 flex-1 flex-col gap-4'>
          <TopBar isPreview={isPreview} />
          <section className='relative flex-1 overflow-hidden rounded-[2rem] border border-secondary/10 bg-white/78 shadow-[0_30px_90px_rgba(10,31,47,0.08)] backdrop-blur-[18px]'>
            <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/16 to-transparent' />
            <div className={`h-full p-3 sm:p-4 lg:p-5 ${isDashboard ? 'overflow-hidden' : 'overflow-auto'}`}>
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function Sidebar({ isPreview }: { isPreview: boolean }) {
  const location = useLocation()
  const { user } = useAuthStore()

  const visibleLinks = useMemo(() => {
    if (!user?.role) {
      return [{ to: isPreview ? '/admin' : '/login', label: 'Dashboard', icon: LayoutGrid }]
    }

    return LINKS.filter((link) => link.roles.includes(user.role as LinkRole)).map((link) => ({
      to: `/back-office/${link.to}`,
      label: link.label,
      icon: link.icon,
    }))
  }, [isPreview, user?.role])

  return (
    <aside className='flex w-full shrink-0 flex-col overflow-hidden rounded-[2rem] border border-secondary/10 bg-[linear-gradient(180deg,rgba(15,38,58,0.96),rgba(10,27,43,0.94))] p-5 text-white shadow-[0_24px_70px_rgba(10,31,47,0.18)] lg:h-full lg:w-[18.5rem]'>
      <div className='flex items-center gap-4 border-b border-white/10 pb-5'>
        <div className='flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-white/92 shadow-[0_16px_26px_rgba(0,0,0,0.14)]'>
          <img src='/logo.png' alt='Widamine' className='h-9 w-9 object-contain' />
        </div>
        <div>
          <p className='text-[10px] uppercase tracking-[0.34em] text-white/46'>Widamine</p>
          <p className='mt-1 font-amoria text-2xl tracking-[0.08em] text-white'>Admin</p>
          <p className='mt-1 text-sm text-white/52'>Pilotage des demandes et du centre</p>
        </div>
      </div>

      <div className='mt-6 rounded-[1.6rem] border border-white/10 bg-white/6 p-4'>
        <p className='text-[10px] uppercase tracking-[0.28em] text-[#8bd8ff]'>
          {user ? 'Session active' : isPreview ? 'Mode apercu' : 'Acces prive'}
        </p>
        <p className='mt-3 text-lg text-white'>
          {user ? `${user.name} • ${user.role}` : isPreview ? 'Dashboard visible sans connexion' : 'Connectez-vous pour tout gerer'}
        </p>
        <p className='mt-2 text-sm leading-6 text-white/58'>
          {user
            ? 'Utilisateurs, contacts, rendez-vous et calendrier restent accessibles depuis une interface plus cohérente avec le site.'
            : 'Le tableau de bord reste visible pour test, mais les autres modules demandent toujours une connexion admin.'}
        </p>
      </div>

      <nav className='mt-6 flex flex-1 flex-col gap-2'>
        {visibleLinks.map((link) => {
          const isActive = location.pathname === link.to || (link.to === '/admin' && location.pathname === '/admin')
          return (
            <Link
              key={link.to}
              to={link.to}
              data-active={isActive}
              className='group flex items-center gap-3 rounded-[1.15rem] border border-transparent px-4 py-3 text-sm text-white/72 transition-all duration-200 hover:border-white/10 hover:bg-white/8 hover:text-white data-[active=true]:border-white/10 data-[active=true]:bg-white data-[active=true]:text-secondary'
            >
              <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white/8 transition-colors duration-200 group-data-[active=true]:bg-primary/14'>
                <link.icon size={17} />
              </span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function TopBar({ isPreview }: { isPreview: boolean }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const pageLabel = useMemo(() => {
    if (pathname === '/admin' || pathname.endsWith('/dashboard')) return 'Dashboard'
    const current = LINKS.find((link) => pathname.endsWith(`/${link.to}`))
    return current?.label ?? 'Back Office'
  }, [pathname])

  return (
    <div className='rounded-[2rem] border border-secondary/10 bg-white/68 p-4 shadow-[0_18px_50px_rgba(10,31,47,0.05)] backdrop-blur-[18px] sm:p-5'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex flex-wrap items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-white/82 px-4 py-2 text-sm text-secondary/80 transition hover:border-primary/20 hover:text-secondary'
          >
            <ArrowLeft size={16} />
            Retour au site
          </button>
          <div className='inline-flex items-center gap-2 rounded-full border border-primary/14 bg-primary/8 px-4 py-2 text-sm text-secondary/76'>
            <ShieldCheck size={16} className='text-primary' />
            {isPreview && !user ? 'Mode test /admin' : 'Espace de gestion'}
          </div>
        </div>

        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-[10px] uppercase tracking-[0.3em] text-secondary/42'>Back Office</p>
            <p className='mt-2 text-2xl text-secondary'>{pageLabel}</p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='rounded-[1.2rem] border border-secondary/10 bg-white/78 px-4 py-3'>
              <p className='text-[10px] uppercase tracking-[0.28em] text-secondary/38'>Profil</p>
              <p className='mt-2 text-sm text-secondary'>
                {user ? `${user.name} • ${user.role}` : 'Aucun compte connecte'}
              </p>
            </div>
            {user ? (
              <button
                type='button'
                onClick={() => {
                  logout().then(() => navigate('/'))
                }}
                className='inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm text-white transition hover:bg-secondary/92'
              >
                <LogOut size={16} />
                Deconnexion
              </button>
            ) : (
              <Link
                to='/login'
                className='inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm text-white shadow-[0_14px_28px_rgba(46,144,192,0.24)] transition hover:bg-primary/92'
              >
                <LogIn size={16} />
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
