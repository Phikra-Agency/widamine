import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  ArrowLeft,
  CalendarDots as CalendarDays,
  ClipboardText as ClipboardCheck,
  SignIn as LogIn,
  SignOut as LogOut,
  SquaresFour as LayoutGrid,
  UsersThree as Users,
  Stethoscope,
  Door,
  UserCircle,
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
  { to: 'appointments', label: 'Rendez-vous', icon: ClipboardCheck, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'calendar', label: 'Calendrier', icon: CalendarDays, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'patients', label: 'Patients', icon: UserCircle, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
  { to: 'users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN'] },
  { to: 'resources', label: 'Salles', icon: Door, roles: ['ADMIN'] },
  { to: 'motifs', label: 'Motifs', icon: Stethoscope, roles: ['ADMIN'] },
]

export default function BackOfficeLayout() {
  const { pathname } = useLocation()
  const isPreview = pathname.startsWith('/admin')
  const isDashboard = pathname === '/admin' || pathname.endsWith('/dashboard')

  return (
    <main className='h-dvh overflow-hidden bg-custom-white text-secondary'>
      <div className='flex h-full w-full'>
        <Sidebar isPreview={isPreview} />
        <section className='flex-1 overflow-hidden'>
          <div className={`h-full p-4 ${isDashboard ? 'overflow-hidden' : 'overflow-auto'}`}>
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  )
}

function Sidebar({ isPreview }: { isPreview: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

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
    <aside className='flex w-[16rem] shrink-0 flex-col bg-white border-r border-secondary/10 shadow-[4px_0_24px_rgba(26,54,70,0.06)]'>
      {/* Logo */}
      <div className='flex items-center gap-3 px-5 py-6 border-b border-secondary/10'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
          <img src='/logo.png' alt='Widamine' className='h-6 w-6 object-contain' />
        </div>
        <div>
          <p className='text-xs font-medium text-secondary font-amoria tracking-wider'>Widamine</p>
          <p className='text-[10px] text-secondary/60'>Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 py-4'>
        <div className='space-y-1'>
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to === '/admin' && location.pathname === '/admin')
            return (
              <Link
                key={link.to}
                to={link.to}
                data-active={isActive}
                className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-secondary/70 transition-colors hover:bg-secondary/5 hover:text-secondary data-[active=true]:bg-primary/10 data-[active=true]:text-primary'
              >
                <link.icon size={18} className={isActive ? 'text-primary' : 'text-secondary/40'} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section - Profile & Logout */}
      <div className='border-t border-secondary/10 p-4 bg-secondary/5'>
        {/* Back to site link */}
        <button
          onClick={() => navigate('/')}
          className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-secondary/60 transition-colors hover:text-secondary hover:bg-secondary/5 mb-3'
        >
          <ArrowLeft size={14} />
          Retour au site
        </button>

        {/* Profile */}
        {user && (
          <div className='mb-3 rounded-lg bg-white border border-secondary/10 px-3 py-2.5 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium'>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-medium text-secondary truncate'>{user.name}</p>
                <p className='text-[10px] text-secondary/50 uppercase'>{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        {user ? (
          <button
            onClick={() => logout().then(() => navigate('/'))}
            className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-600'
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        ) : (
          <Link
            to='/login'
            className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/10'
          >
            <LogIn size={14} />
            Se connecter
          </Link>
        )}
      </div>
    </aside>
  )
}

