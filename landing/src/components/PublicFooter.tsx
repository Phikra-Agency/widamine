import { Link } from 'react-router-dom'
import type React from 'react'
import { EnvelopeSimple, MapPin, PhoneCall, FacebookLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from '@phosphor-icons/react'
import { C, TYPE } from '@/lib/theme'

const DECOR_TOP = '/assets/square-moncey/header-top-right.avif'
const DECOR_BOTTOM = '/assets/square-moncey/intro-top-left.avif'

const SOCIAL = [
  { name: 'Facebook', icon: FacebookLogo, href: 'https://facebook.com/widaminecenter' },
  { name: 'Instagram', icon: InstagramLogo, href: 'https://instagram.com/widaminecenter' },
  { name: 'LinkedIn', icon: LinkedinLogo, href: 'https://linkedin.com/company/widaminecenter' },
  { name: 'TikTok', icon: null, href: 'https://tiktok.com/@widaminecenter' },
  { name: 'YouTube', icon: YoutubeLogo, href: 'https://youtube.com/@widaminecenter' },
]

const serviceLinks = [
  { label: 'Traitement du visage', href: '/category/visage' },
  { label: 'Traitement du corps', href: '/category/corps' },
  { label: 'Nos techniques', href: '/category/techniques' },
]

export default function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className='relative overflow-hidden px-3 pb-6 pt-10 sm:px-6 sm:pb-8' style={{ background: C.bg }}>
      <div className='relative mx-auto max-w-[1540px] overflow-hidden rounded-[20px] bg-white px-8 py-12 sm:px-12 lg:px-16 lg:py-16'>
        <img
          src={DECOR_TOP}
          alt=''
          className='pointer-events-none absolute right-0 top-0 w-24 select-none opacity-90 widamine-tint sm:w-32'
          loading='lazy'
        />
        <img
          src={DECOR_BOTTOM}
          alt=''
          className='pointer-events-none absolute bottom-0 left-0 w-28 select-none opacity-80 widamine-tint sm:w-40'
          loading='lazy'
        />

        <div className='relative grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr] lg:gap-12'>
          <div className='flex flex-col items-start'>
            <img src='/logo-widamine.svg' alt='Widamine' className='h-auto w-44 object-contain' />
            <p
              className='mt-5 max-w-xs text-sm leading-7 font-semibold'
              style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}
            >
              Centre médical de Dermato-Esthétique, Bodycontouring et Lasers à Fès.
            </p>
          </div>

          <FooterColumn title='Widamine Center'>
            <FooterLink to='/contact'>Le concept</FooterLink>
            <FooterLink to='/about-us'>Dr. Widad Slaoui</FooterLink>
            <FooterLink to='/services/consultation'>Consultation</FooterLink>
          </FooterColumn>

          <FooterColumn title='Services'>
            {serviceLinks.map((link) => (
              <FooterLink key={link.href} to={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title='Coordonnées'>
            <FooterExternal href='https://maps.google.com/?q=Boulevard+Slaoui+Bureaux+Nour+Fes' icon={<MapPin size={18} />}>
              Boulevard Slaoui, Bureaux Nour, Fès
            </FooterExternal>
            <FooterExternal href='mailto:info@widamineaestheticcenter.com' icon={<EnvelopeSimple size={18} />}>
              info@widamineaestheticcenter.com
            </FooterExternal>
            <FooterExternal href='tel:+212535624696' icon={<PhoneCall size={18} />}>
              +212 (535) 624 696
            </FooterExternal>
            <p className='text-xs font-semibold' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
              Lun–Sam : 9h00 – 18h00
            </p>
          </FooterColumn>
        </div>

        <div className='relative mt-12 border-t pt-6' style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div className='flex flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-xs font-semibold pl-1' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
              Widamine Center — Tous droits réservés — {year}
            </p>
            <div className='flex items-center gap-5'>
              <a href='/mentions-legales' className='text-xs font-semibold transition hover:opacity-70' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
                Mentions légales
              </a>
              <span className='text-xs' style={{ color: `${C.secondary}30` }}>·</span>
              <span className='text-xs font-semibold' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
                Réalisé avec ❤️
              </span>
              <div className='flex items-center gap-2'>
                {SOCIAL.map((s) => {
                  const Icon = s.icon
                  return (
                    <a
                      key={s.name}
                      href={s.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={s.name}
                      className='flex h-8 w-8 items-center justify-center rounded-lg transition hover:-translate-y-0.5'
                      style={{ color: C.accent }}
                    >
                      {Icon ? <Icon size={16} /> : (
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path d='M16.6 5.82S15.5 4.5 15.5 2H12v13.31a2.25 2.25 0 0 1-2.25 2.19C8.56 17.5 7.5 16.44 7.5 15.12c0-1.46 1.2-2.64 2.64-2.64.4 0 .78.1 1.11.26V9.42c-3.72-.32-6.72 2.7-6.72 6.45a6.46 6.46 0 0 0 6.47 6.45c3.56 0 6.46-2.89 6.46-6.45v-3.8c1.3.94 2.88 1.5 4.54 1.5V9.72c-.9.02-1.75-.2-2.5-.57' fill='currentColor'/>
                        </svg>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className='text-base font-semibold' style={{ color: C.secondary, fontFamily: TYPE.headingFamily }}>
        {title}
      </h3>
      <div className='mt-5 grid gap-4'>{children}</div>
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className='text-sm font-semibold transition hover:opacity-70' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
      {children}
    </Link>
  )
}

function FooterExternal({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <a href={href} className='group grid grid-cols-[18px_1fr] items-center gap-3 text-sm font-semibold transition hover:opacity-70' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
      <span className='flex justify-center' style={{ color: C.secondary }}>{icon}</span>
      <span>{children}</span>
    </a>
  )
}
