import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useStatsStore } from '@/stores/statsStore'
import type { AppointmentItem } from '@/stores/statsStore'
import { useSchedulesStore } from '@/stores/schedulesStore'
import { ArrowRight, CaretDown } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import UserAccountMenu from '@/components/UserAccountMenu'

function parseSchedule(datetime?: string): Date | null {
  if (!datetime) return null
  const date = new Date(datetime)
  return Number.isNaN(date.getTime()) ? null : date
}

function enrichAppts(items: AppointmentItem[]) {
  return items
    .map((item) => ({ ...item, scheduleDate: parseSchedule(item.schedules?.[0]?.datetime) }))
    .sort((a, b) => {
      if (!a.scheduleDate) return 1
      if (!b.scheduleDate) return -1
      return a.scheduleDate.getTime() - b.scheduleDate.getTime()
    })
}

export default function PractitionerStatusBar() {
  const { user } = useAuthStore()
  const { stats, setStats } = useStatsStore()

  const isPractitioner = user?.role === 'DOCTOR' || user?.role === 'PRACTITIONER'

  useEffect(() => {
    if (!isPractitioner) return
    if (stats) return
    api.get('dashboard/stats', { skipGlobalErrorHandler: true } as any).then(res => setStats(res.data)).catch(() => {})
  }, [isPractitioner, stats, setStats])

  const { current, next, todayTotal } = useMemo(() => {
    const running = enrichAppts(stats?.currentlyRunning || [])
    const upcoming = enrichAppts(stats?.nextHour || [])
    const confirmed = enrichAppts(stats?.confirmedToday || [])

    const currentAppt = running[0] || null

    const nextAppt = upcoming.find(item => {
      if (!item.scheduleDate || !currentAppt?.scheduleDate) return true
      return item.scheduleDate.getTime() !== currentAppt.scheduleDate.getTime()
    }) || confirmed.find(item => {
      if (!item.scheduleDate || !currentAppt?.scheduleDate) return true
      return item.scheduleDate.getTime() !== currentAppt.scheduleDate.getTime()
    }) || null

    return {
      current: currentAppt,
      next: nextAppt,
      todayTotal: stats?.todayTotal ?? 0,
    }
  }, [stats])

  const openScheduleModal = (appt: AppointmentItem & { scheduleDate?: Date | null }) => {
    const scheduleLike = {
      datetime: appt.schedules?.[0]?.datetime || new Date().toISOString(),
      session: {
        id: 0,
        session: 1,
        duration: 30,
        motif: { id: '0', name: appt.motif?.name || '-' },
      },
      appointment: {
        id: appt.id,
        status: appt.status,
        patient: appt.patient,
        practitionerId: appt.practitioner?.id,
        practitioner: appt.practitioner,
        resource: appt.resource,
        motif: appt.motif,
      },
    }
    useSchedulesStore.getState().setItem(scheduleLike as any)
    useSchedulesStore.getState().toggleOpenShowModal()
  }

  if (!isPractitioner) return null

  return (
    <div className='shrink-0 border-t border-secondary/10 bg-secondary/[0.03] px-3 py-2 sm:px-4 sm:py-3'>
      <div className='flex flex-col md:grid md:grid-cols-[minmax(160px,auto)_minmax(0,1fr)_minmax(0,1fr)_minmax(160px,auto)_auto] md:items-stretch'>
        {/* Mobile: compact carousel-like bar */}
        <MobileBottomBar
          todayTotal={todayTotal}
          current={current}
          next={next}
          openScheduleModal={openScheduleModal}
        />

        {/* Desktop layout */}
        <div className='hidden min-w-0 items-center md:flex md:border-r md:border-secondary/8 md:px-5 md:py-0'>
          <UserAccountMenu variant='compact' />
        </div>

        <button
          type='button'
          onClick={() => current && openScheduleModal(current)}
          className='hidden group relative min-w-0 items-center gap-3 md:flex md:border-r md:border-secondary/8 md:px-5 md:py-0 text-left w-full'
        >
          <div className='h-2 w-2 rounded-full bg-emerald-500 shrink-0' />
          <div className='min-w-0'>
            <p className='text-[10px] uppercase tracking-[0.18em] text-secondary/40 font-semibold'>Maintenant</p>
            {current ? (
              <div className='flex items-center gap-2 mt-0.5 px-1 -ml-1'>
                <MotifPill name={current.motif?.name || 'Traitement'} color={current.motif?.color} />
                <span className='text-xs text-secondary/60 font-medium'>Salle {current.resource?.name || '1'}</span>
                <span className='text-xs text-secondary/40'>·</span>
                <span className='text-xs text-secondary/80 font-medium truncate'>{current.patient?.firstName || current.name || 'Patient'}</span>
              </div>
            ) : (
              <p className='text-xs text-secondary/35 mt-0.5'>Aucun rendez-vous</p>
            )}
          </div>
          {current && (
            <div className='pointer-events-none absolute -top-2 left-5 opacity-0 group-hover:-top-[52px] group-hover:opacity-100 transition-all duration-200 z-50'>
              <div className='rounded-control px-3 py-2 text-white text-[11px] leading-snug whitespace-nowrap shadow-md' style={{ backgroundColor: current.motif?.color || '#3b82f6' }}>
                <p className='font-semibold'>{current.motif?.name || 'Rendez-vous'}</p>
                <p className='text-white/70 mt-0.5'>{current.resource?.name || '—'} · {current.practitioner?.name || '—'}</p>
              </div>
              <div className='mx-auto h-1.5 w-1.5 rotate-45 -mt-0.5' style={{ backgroundColor: current.motif?.color || '#3b82f6' }} />
            </div>
          )}
        </button>

        <button
          type='button'
          onClick={() => next && openScheduleModal(next)}
          className='hidden group relative min-w-0 items-center gap-3 md:flex md:border-r md:border-secondary/8 md:px-5 md:py-0 text-left w-full'
        >
          <div className='h-2 w-2 rounded-full bg-primary shrink-0' />
          <div className='min-w-0'>
            <p className='text-[10px] uppercase tracking-[0.18em] text-secondary/40 font-semibold'>Suivant</p>
            {next ? (
              <div className='flex items-center gap-2 mt-0.5 px-1 -ml-1'>
                <MotifPill name={next.motif?.name || 'Traitement'} color={next.motif?.color} />
                <span className='text-xs text-secondary/60 font-medium'>Salle {next.resource?.name || '2'}</span>
                <span className='text-xs text-secondary/40'>·</span>
                <span className='text-xs text-secondary/80 font-medium truncate'>{next.patient?.firstName || next.name || 'Patient'}</span>
              </div>
            ) : (
              <p className='text-xs text-secondary/35 mt-0.5'>Aucun rendez-vous</p>
            )}
          </div>
          {next && (
            <div className='pointer-events-none absolute -top-2 left-5 opacity-0 group-hover:-top-[52px] group-hover:opacity-100 transition-all duration-200 z-50'>
              <div className='rounded-control px-3 py-2 text-white text-[11px] leading-snug whitespace-nowrap shadow-md' style={{ backgroundColor: next.motif?.color || '#3b82f6' }}>
                <p className='font-semibold'>{next.motif?.name || 'Rendez-vous'}</p>
                <p className='text-white/70 mt-0.5'>{next.resource?.name || '—'} · {next.practitioner?.name || '—'}</p>
              </div>
              <div className='mx-auto h-1.5 w-1.5 rotate-45 -mt-0.5' style={{ backgroundColor: next.motif?.color || '#3b82f6' }} />
            </div>
          )}
        </button>

        <div className='hidden group relative min-w-0 items-center gap-3 md:flex md:px-5 md:py-0'>
          <div className='flex items-center justify-center w-9 h-9 rounded-control bg-primary/10 shrink-0'>
            <span className='text-base font-bold text-primary'>{todayTotal}</span>
          </div>
          <div>
            <p className='text-[10px] uppercase tracking-[0.18em] text-secondary/40 font-semibold'>Aujourd'hui</p>
            <p className='text-xs text-secondary/60 mt-0.5'>Rendez-vous</p>
          </div>
          <div className='pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:-top-9 group-hover:opacity-100 transition-all duration-200 z-50'>
            <div className='rounded-control bg-secondary px-3 py-1.5 text-white text-[11px] leading-snug whitespace-nowrap shadow-md'>
              {todayTotal} rendez-vous aujourd'hui
            </div>
            <div className='mx-auto h-1.5 w-1.5 rotate-45 bg-secondary -mt-0.5' />
          </div>
        </div>

        <div className='hidden items-center justify-end px-4 md:flex'>
          <Link
            to='/patients'
            className='flex w-full items-center justify-center gap-1.5 rounded-control border border-primary/15 bg-primary/5 px-4 py-3 text-xs font-semibold text-primary/80 transition-colors hover:text-primary md:w-auto md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0'
          >
            Voir tous <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function MobileBottomBar({
  todayTotal, current, next, openScheduleModal,
}: {
  todayTotal: number; current: any; next: any;
  openScheduleModal: (appt: any) => void;
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const tabs = [
    {
      id: 'now',
      label: 'Maintenant',
      data: current,
      empty: 'Aucun rendez-vous',
    },
    {
      id: 'next',
      label: 'Suivant',
      data: next,
      empty: 'Aucun rendez-vous',
    },
  ]
  const active = tabs[tab]

  return (
    <div className='md:hidden'>
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-2'>
          <UserAccountMenu variant='compact' className='max-w-[140px]' />
          {open && (
            <span className='text-[10px] font-medium text-secondary/40'>{todayTotal} aujourd'hui</span>
          )}
        </div>
        <div className='flex items-center gap-1'>
          {open && (
            <Link
              to='/patients'
              className='mr-1 flex items-center gap-0.5 rounded-control bg-primary/8 px-2 py-1 text-[9px] font-semibold text-primary/70'
            >
              Patients <ArrowRight size={8} />
            </Link>
          )}
          <button
            type='button'
            onClick={() => setOpen(prev => !prev)}
            className='flex h-6 w-6 items-center justify-center rounded-element text-secondary/40 hover:text-secondary hover:bg-black/[0.04] transition-all'
          >
            <CaretDown size={12} className={`transition-transform duration-200 ${open ? '' : '-rotate-180'}`} />
          </button>
        </div>
      </div>

      <>
        {open && (
          <div
            key='mobile-bar-content'
            className='overflow-hidden'
          >
            <div className='pt-2 space-y-1.5'>
          <div className='flex gap-2'>
            {tabs.map((t, i) => {
              const isNow = t.id === 'now'
              const isActive = i === tab
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(i)}
                  className={`flex-1 flex items-center gap-2 rounded-control border px-2.5 py-2 transition-all duration-200 min-w-0 ${
                    isActive
                      ? 'border-primary/25 bg-card shadow-sm'
                      : 'border-border-subtle bg-card/50 text-secondary/40'
                  }`}
                >
                  <div className={`h-2 w-2 shrink-0 rounded-full ${isNow ? 'bg-emerald-500' : 'bg-primary'}`} />
                  <span className='text-[9px] uppercase tracking-[0.12em] font-semibold truncate'>{t.label}</span>
                </button>
              )
            })}
          </div>

          <div>
            {active.data ? (
              <button
                type='button'
                onClick={() => openScheduleModal(active.data)}
                className='w-full rounded-control border border-border-subtle bg-card/70 px-3 py-2 text-left transition hover:border-primary/20'
              >
                <div className='flex items-center gap-2'>
                  <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${active.id === 'now' ? 'bg-emerald-500' : 'bg-primary'}`} />
                  <span className='text-[10px] uppercase tracking-[0.12em] text-secondary/40 font-semibold'>{active.label}</span>
                  <span className='text-[10px] text-secondary/30'>·</span>
                  <span className='text-[10px] text-secondary/50'>{active.data.resource?.name || 'Salle 1'}</span>
                  {active.data.motif?.name && (
                    <>
                      <span className='text-[10px] text-secondary/30'>·</span>
                      <MotifPill name={active.data.motif.name} color={active.data.motif.color} />
                    </>
                  )}
                </div>
                <p className='text-[12px] font-semibold text-secondary mt-1'>
                  {active.data.patient?.firstName || active.data.name || 'Patient'}
                </p>
              </button>
            ) : (
              <div className='rounded-control border border-dashed border-border bg-card/40 px-3 py-2.5 text-center'>
                <p className='text-[10px] text-secondary/30'>{active.empty}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </>
    </div>
  )
}

function MotifPill({ name, color }: { name: string; color?: string }) {
  const finalColor = color || '#3b82f6'
  return (
    <span 
      className='inline-flex items-center px-1.5 py-0.5 rounded-element text-[10px] font-semibold leading-none border shadow-sm'
      style={{ 
        backgroundColor: `${finalColor}15`,
        color: finalColor, 
        borderColor: `${finalColor}30`
      }}
    >
      <div className='w-1 h-1 rounded-full mr-1' style={{ backgroundColor: finalColor }} />
      {name}
    </span>
  )
}
