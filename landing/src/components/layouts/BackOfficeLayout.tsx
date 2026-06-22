import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  ArrowLeft,
  CalendarDots as CalendarDays,
  SignIn as LogIn,
  SignOut as LogOut,
  SquaresFour as LayoutGrid,
  UsersThree as Users,
  Door,
  UserCircle,
  GearSix,
  List,
  X,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import PractitionerStatusBar from '@/components/PractitionerStatusBar'
import ScheduleShowModal from '@/components/ScheduleShowModal'

type LinkRole = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'PRACTITIONER'

const LINKS: {
  to: string
  label: string
  icon: Icon
  roles: LinkRole[]
}[] = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutGrid, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: 'calendar', label: 'Calendrier', icon: CalendarDays, roles: ['DOCTOR', 'PRACTITIONER'] },
  { to: 'patients', label: 'Patients', icon: UserCircle, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER'] },
  // { to: 'appointments', label: 'Rendez-vous', icon: Door, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER'] },
  { to: 'calendar', label: 'Calendrier', icon: CalendarDays, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: 'users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: 'resources', label: 'Salles & Motifs', icon: Door, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: 'settings', label: 'Paramètres', icon: GearSix, roles: ['ADMIN', 'RECEPTIONIST'] },
]

export default function BackOfficeLayout() {
  const { pathname } = useLocation()
  const isPreview = pathname.startsWith('/admin')
  const isDashboard = pathname === '/admin' || pathname.endsWith('/dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <main className='h-dvh overflow-hidden bg-custom-white text-secondary flex flex-col'>
      <div className='flex items-center justify-between border-b border-secondary/10 bg-white px-4 py-3 xl:hidden'>
        <Link to='/back-office/dashboard' className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
            <img src='/logo.png' alt='Widamine' className='h-6 w-6 object-contain' />
          </div>
          <div>
            <p className='text-xs font-medium text-secondary font-amoria tracking-wider'>Widamine</p>
            <p className='text-[10px] text-secondary/60'>Back office</p>
          </div>
        </Link>
        <button
          type='button'
          onClick={() => setSidebarOpen((open) => !open)}
          className='flex h-10 w-10 items-center justify-center rounded-xl border border-secondary/10 bg-white text-secondary'
          aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>
      <div className='flex flex-1 min-h-0 w-full'>
        <Sidebar isPreview={isPreview} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <section className='flex-1 min-w-0 overflow-hidden'>
          <div className={isDashboard ? 'h-full overflow-hidden' : 'h-full overflow-auto'}>
            <Outlet />
          </div>
        </section>
      </div>
      <PractitionerStatusBar />
      <ScheduleShowModal />
    </main>
  )
}

function Sidebar({
  isPreview,
  sidebarOpen,
  onClose,
}: {
  isPreview: boolean
  sidebarOpen: boolean
  onClose: () => void
}) {
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
    <>
      <div
        className={`fixed inset-0 z-40 bg-secondary/35 transition-opacity xl:hidden ${
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[17rem] max-w-[85vw] shrink-0 flex-col bg-white border-r border-secondary/10 shadow-[2px_0_20px_rgba(26,54,70,0.12)] transition-transform duration-200 xl:static xl:z-auto xl:w-[16rem] xl:max-w-none xl:translate-x-0 xl:shadow-[2px_0_8px_rgba(26,54,70,0.03)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex items-center justify-between gap-3 px-5 py-6 border-b border-secondary/10'>
          <Link to='/back-office/dashboard' className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
              <img src='/logo.png' alt='Widamine' className='h-6 w-6 object-contain' />
            </div>
            <div>
              <p className='text-xs font-medium text-secondary font-amoria tracking-wider'>Widamine</p>
              <p className='text-[10px] text-secondary/60'>Admin</p>
            </div>
          </Link>
          <button
            type='button'
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-lg border border-secondary/10 text-secondary xl:hidden'
            aria-label='Fermer le menu'
          >
            <X size={16} />
          </button>
        </div>

        <nav className='flex-1 overflow-y-auto px-3 py-4'>
          <div className='space-y-1'>
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.to || (link.to === '/admin' && location.pathname === '/admin') || (link.to === '/back-office/resources' && location.pathname === '/back-office/motifs')
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

        <div className={`border-t border-secondary/10 p-4 bg-secondary/5 ${user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER' ? 'xl:hidden' : ''}`}>
            <button
              onClick={() => navigate('/')}
              className='mb-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-secondary/60 transition-colors hover:text-secondary hover:bg-secondary/5'
            >
              <ArrowLeft size={14} />
              Retour au site
            </button>

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

            {user ? (
              <button
                onClick={() => logout().then(() => navigate('/login'))}
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
    </>
  )
}
