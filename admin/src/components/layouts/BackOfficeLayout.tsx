import { useCallback, useEffect, useMemo, useState, type CSSProperties, type MouseEvent, type TransitionEvent } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  CalendarBlank,
  CalendarDots as CalendarDays,
  CaretDoubleLeft,
  CaretDoubleRight,
  SignIn as LogIn,
  UsersThree as Users,
  Door,
  Stethoscope,
  UserCircle,
  ChatCircleDots,
  List,
  X,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import PractitionerStatusBar from '@/components/PractitionerStatusBar'
import ScheduleShowModal from '@/components/ScheduleShowModal'
import UserAccountMenu from '@/components/UserAccountMenu'
import SidebarSearch from '@/components/layouts/SidebarSearch'
import { cn } from '@/lib/utils'

const SIDEBAR_COLLAPSED_KEY = 'widamine-sidebar-collapsed'
const SIDEBAR_EXPANDED_WIDTH = 'var(--sidebar-expanded-width)'
const SIDEBAR_COLLAPSED_WIDTH = 'var(--sidebar-collapsed-width)'
const SIDEBAR_WIDTH_TRANSITION_MS = 200

const SIDEBAR_INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [data-slot="input"], [role="menuitem"], [role="menu"]'

function isSidebarInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(SIDEBAR_INTERACTIVE_SELECTOR))
}

type LinkRole = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'PRACTITIONER'

type NavLink = {
  to: string
  label: string
  icon: Icon
  roles: LinkRole[]
}

type NavGroup = {
  id: string
  label: string
  links: NavLink[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'cabinet',
    label: 'Cabinet',
    links: [
      { to: 'calendar', label: 'Calendrier', icon: CalendarDays, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER'] },
      { to: 'patients', label: 'Patients', icon: UserCircle, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PRACTITIONER'] },
      { to: 'contacts', label: 'Messages', icon: ChatCircleDots, roles: ['ADMIN', 'RECEPTIONIST'] },
      { to: 'reservations', label: 'Réservations', icon: CalendarBlank, roles: ['ADMIN', 'RECEPTIONIST'] },
    ],
  },
  {
    id: 'internal',
    label: 'Administration',
    links: [
      { to: 'users', label: 'Utilisateurs', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
      { to: 'resources', label: 'Salles', icon: Door, roles: ['ADMIN', 'RECEPTIONIST'] },
      { to: 'motifs', label: 'Motifs', icon: Stethoscope, roles: ['ADMIN', 'RECEPTIONIST'] },
    ],
  },
]

function SidebarNavIcon({ icon: IconComponent, active }: { icon: Icon; active: boolean }) {
  return (
    <IconComponent
      size={20}
      weight='duotone'
      aria-hidden
      className={cn('bo-nav-icon', active && 'bo-nav-icon-active')}
    />
  )
}

function visibleNavGroups(role: LinkRole | undefined) {
  if (!role) {
    return [{ id: 'auth', label: '', links: [{ to: '/login', label: 'Connexion', icon: LogIn, roles: [] as LinkRole[] }] }]
  }

  return NAV_GROUPS.map((group) => ({
    ...group,
    links: group.links
      .filter((link) => link.roles.includes(role))
      .map((link) => ({
        to: `/${link.to}`,
        label: link.label,
        icon: link.icon,
      })),
  })).filter((group) => group.links.length > 0)
}

function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const location = useLocation()
  const { user } = useAuthStore()

  const navGroups = useMemo(() => visibleNavGroups(user?.role as LinkRole | undefined), [user?.role])

  function handleSidebarEmptyClick(e: MouseEvent<HTMLDivElement>) {
    if (!onToggleCollapse || isSidebarInteractiveTarget(e.target)) return
    onToggleCollapse()
  }

  return (
    <div
      className={cn(
        'bo-sidebar flex h-full min-h-0 flex-col',
        onToggleCollapse && 'cursor-pointer',
      )}
      onClick={handleSidebarEmptyClick}
    >
      <div className='bo-sidebar-header'>
        <div className='bo-sidebar-brand-row'>
          <div className='bo-sidebar-brand'>
            <Link to='/calendar' onClick={onNavigate} aria-label='Widamine' className='bo-sidebar-brand-mark'>
              <img
                src='/assets/icon.svg'
                alt=''
                className='h-10 w-10 object-contain'
              />
            </Link>
          </div>
        </div>

        <SidebarSearch
          collapsed={collapsed}
          onExpand={() => {
            if (collapsed) onToggleCollapse?.()
          }}
        />
      </div>

      <nav className={cn('flex-1 overflow-y-auto py-2', collapsed ? 'px-2' : 'px-3')}>
        <div className={cn(collapsed ? 'space-y-3' : 'space-y-4')}>
          {navGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {group.label && !collapsed && (
                <p className='bo-sidebar-group-label'>{group.label}</p>
              )}
              {collapsed && groupIndex > 0 && (
                <div className='mx-auto mb-2 h-px w-6 bg-border-subtle' aria-hidden='true' />
              )}
              <div className='space-y-0.5'>
                {group.links.map((link) => {
            const isActive = location.pathname === link.to
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={onNavigate}
                      data-active={isActive}
                      title={collapsed ? link.label : undefined}
                      className={cn('bo-nav-link', collapsed && 'bo-nav-link-collapsed')}
                    >
                      <SidebarNavIcon icon={link.icon} active={isActive} />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className={cn('shrink-0 p-4 pt-2', collapsed && 'px-2')}>
        {user ? (
          <UserAccountMenu onNavigate={onNavigate} collapsed={collapsed} />
        ) : (
          <Link
            to='/login'
            onClick={onNavigate}
            title={collapsed ? 'Se connecter' : undefined}
            className={cn('bo-nav-link text-xs', collapsed && 'bo-nav-link-collapsed')}
          >
            <LogIn size={18} weight='duotone' className='bo-nav-icon' />
            Se connecter
          </Link>
        )}
      </div>
    </div>
  )
}

export default function BackOfficeLayout() {
  const { pathname } = useLocation()
  const isFullBleedPage = pathname.endsWith('/calendar')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [sidebarTransitioning, setSidebarTransitioning] = useState(false)

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarTransitioning(true)
    setSidebarCollapsed((value) => !value)
  }, [])

  const handleSidebarWidthTransitionEnd = useCallback((event: TransitionEvent<HTMLElement>) => {
    if (event.propertyName === 'width') {
      setSidebarTransitioning(false)
    }
  }, [])

  useEffect(() => {
    if (!sidebarTransitioning) return

    const timeoutId = window.setTimeout(() => {
      setSidebarTransitioning(false)
    }, SIDEBAR_WIDTH_TRANSITION_MS + 50)

    return () => window.clearTimeout(timeoutId)
  }, [sidebarTransitioning, sidebarCollapsed])

  useEffect(() => {
    if (!sidebarTransitioning) return

    const { documentElement } = document
    const previousOverflowX = documentElement.style.overflowX
    documentElement.style.overflowX = 'hidden'

    return () => {
      documentElement.style.overflowX = previousOverflowX
    }
  }, [sidebarTransitioning])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
    } catch {
      // ignore storage errors
    }
  }, [sidebarCollapsed])

  return (
    <main className='flex h-dvh flex-col overflow-hidden bg-sidebar text-foreground'>
      <div className='flex items-center justify-between border-b border-border-subtle bg-sidebar px-4 py-3 xl:hidden'>
        <Link to='/calendar' aria-label='Widamine'>
          <img src='/logo.svg' alt='Widamine' className='h-7 w-auto object-contain' />
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

      <div
        className={cn('bo-desktop-shell relative flex h-full min-h-0 flex-1 min-w-0')}
        data-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}
        data-sidebar-transitioning={sidebarTransitioning ? 'true' : 'false'}
        style={
          {
            '--sidebar-width': sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
          } as CSSProperties
        }
      >
        <aside
          className='relative z-0 hidden h-full shrink-0 flex-col overflow-x-hidden overflow-y-visible transition-[width] duration-200 ease-out xl:flex'
          style={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
          onTransitionEnd={handleSidebarWidthTransitionEnd}
        >
          <SidebarContent
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapsed}
          />
        </aside>

        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={toggleSidebarCollapsed}
          aria-label={sidebarCollapsed ? 'Développer le menu' : 'Réduire le menu'}
          className='bo-sidebar-collapse-btn hidden xl:inline-flex'
        >
          {sidebarCollapsed ? <CaretDoubleRight size={14} /> : <CaretDoubleLeft size={14} />}
        </Button>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side='left' showCloseButton className='flex w-[17rem] max-w-[85vw] flex-col gap-0 border-border-subtle bg-sidebar p-0 xl:hidden'>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <section className='relative z-10 flex h-full min-h-0 min-w-0 flex-1 flex-col p-2 pr-3 pb-3 pt-2 xl:pl-1'>
          <div className='bo-content-shell'>
            <div
              className={
                isFullBleedPage
                  ? 'flex h-full min-h-0 flex-col overflow-hidden'
                  : 'h-full min-h-0 overflow-auto'
              }
            >
              <Outlet />
            </div>
          </div>
        </section>
      </div>

      <PractitionerStatusBar />
      <ScheduleShowModal />
    </main>
  )
}
