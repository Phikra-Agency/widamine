import { useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  CalendarDots as CalendarDays,
  SignIn as LogIn,
  SquaresFour as LayoutGrid,
  UsersThree as Users,
  Door,
  UserCircle,
  EnvelopeSimple,
  List,
  X,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import PractitionerStatusBar from '@/components/PractitionerStatusBar'
import ScheduleShowModal from '@/components/ScheduleShowModal'
import UserAccountMenu from '@/components/UserAccountMenu'
import { useState } from 'react'

type LinkRole = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'PRACTITIONER'

const LINKS: {
  to: string
  label: string
  icon: Icon
  roles: LinkRole[]
}[] = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutGrid, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER'] },
  { to: 'calendar', label: 'Calendrier', icon: CalendarDays, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER'] },
  { to: 'patients', label: 'Patients', icon: UserCircle, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER'] },
  { to: 'users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: 'resources', label: 'Salles & Motifs', icon: Door, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: 'contacts', label: 'Contacts', icon: EnvelopeSimple, roles: ['ADMIN', 'RECEPTIONIST'] },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const { user } = useAuthStore()

  const visibleLinks = useMemo(() => {
    if (!user?.role) {
      return [{ to: '/login', label: 'Connexion', icon: LogIn }]
    }
    return LINKS.filter((link) => link.roles.includes(user.role as LinkRole)).map((link) => ({
      to: `/back-office/${link.to}`,
      label: link.label,
      icon: link.icon,
    }))
  }, [user?.role])

  return (
    <>
      <div className='flex items-center justify-between gap-3 border-b border-sidebar-border px-5 py-5'>
        <Link to='/back-office/dashboard' className='flex items-center gap-3' onClick={onNavigate}>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8'>
            <img src='/logo.svg' alt='Widamine' className='h-6 w-6 object-contain' />
          </div>
          <p className='text-sm font-medium tracking-tight text-foreground'>Widamine</p>
        </Link>
      </div>

      <nav className='flex-1 overflow-y-auto px-3 py-4'>
        <div className='space-y-0.5'>
          {visibleLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to === '/back-office/resources' && location.pathname === '/back-office/motifs')
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onNavigate}
                data-active={isActive}
                className='flex items-center gap-3 rounded-xl border-l-[3px] border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/80 hover:text-foreground data-[active=true]:border-primary data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-primary'
              >
                <link.icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className='border-t border-sidebar-border bg-sidebar-accent/50 p-4'>
        {user ? (
          <UserAccountMenu onNavigate={onNavigate} />
        ) : (
          <Link
            to='/login'
            onClick={onNavigate}
            className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-primary hover:bg-primary/8'
          >
            <LogIn size={14} />
            Se connecter
          </Link>
        )}
      </div>
    </>
  )
}

export default function BackOfficeLayout() {
  const { pathname } = useLocation()
  const isDashboard = pathname.endsWith('/dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <main className='flex h-dvh flex-col overflow-hidden bg-background text-foreground'>
      <div className='flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 xl:hidden'>
        <Link to='/back-office/dashboard' className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8'>
            <img src='/logo.svg' alt='Widamine' className='h-6 w-6 object-contain' />
          </div>
          <p className='text-sm font-medium tracking-tight text-foreground'>Widamine</p>
        </Link>
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={18} /> : <List size={18} />}
        </Button>
      </div>

      <div className='flex min-h-0 w-full flex-1'>
        <aside className='hidden h-full w-[15.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar xl:flex'>
          <SidebarContent />
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side='left' showCloseButton className='flex w-[17rem] max-w-[85vw] flex-col gap-0 p-0 xl:hidden'>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <section className='min-w-0 flex-1 overflow-hidden'>
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
