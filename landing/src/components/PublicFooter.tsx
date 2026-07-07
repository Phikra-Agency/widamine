import { Link } from 'react-router-dom'
import type React from 'react'
import { EnvelopeSimple, Heart, MapPin, PhoneCall, Sparkle, FacebookLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from '@phosphor-icons/react'
import { C, TYPE } from '@/lib/theme'

const FOOTER_DECOR = {
  topRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af35669264ecc82de0caaa_header-top-right.avif',
  bottomLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af332e5a631306c40e224a_intro-top-left.avif',
}

const SOCIAL = [
  { name: 'Facebook', href: 'https://facebook.com/widaminecenter' },
  { name: 'Instagram', href: 'https://instagram.com/widaminecenter' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/widaminecenter' },
  { name: 'TikTok', href: 'https://tiktok.com/@widaminecenter' },
  { name: 'YouTube', href: 'https://youtube.com/@widaminecenter' },
]

const SOCIAL_ICONS: Record<string, React.ComponentType<{size?: number}>> = {
  Facebook: () => <FacebookLogo size={20} />,
  Instagram: () => <InstagramLogo size={20} />,
  LinkedIn: () => <LinkedinLogo size={20} />,
  TikTok: () => (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M16.6 5.82S15.5 4.5 15.5 2H12v13.31a2.25 2.25 0 0 1-2.25 2.19C8.56 17.5 7.5 16.44 7.5 15.12c0-1.46 1.2-2.64 2.64-2.64.4 0 .78.1 1.11.26V9.42c-3.72-.32-6.72 2.7-6.72 6.45a6.46 6.46 0 0 0 6.47 6.45c3.56 0 6.46-2.89 6.46-6.45v-3.8c1.3.94 2.88 1.5 4.54 1.5V9.72c-.9.02-1.75-.2-2.5-.57' fill='currentColor'/>
    </svg>
  ),
  YouTube: () => <YoutubeLogo size={20} />,
}

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
          src={FOOTER_DECOR.topRight}
          alt=''
          className='pointer-events-none absolute right-0 top-0 w-24 select-none opacity-90 widamine-tint sm:w-32'
          loading='lazy'
        />
        <img
          src={FOOTER_DECOR.bottomLeft}
          alt=''
          className='pointer-events-none absolute bottom-0 left-0 w-28 select-none opacity-80 widamine-tint sm:w-40'
          loading='lazy'
        />

        <div className='relative grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.35fr] lg:gap-16'>
          <div className='flex flex-col items-start'>
            <img src='/logo-widamine.svg' alt='Widamine' className='h-auto w-44 object-contain' />
            <p
              className='mt-5 max-w-xs text-sm leading-7'
              style={{ color: 'rgba(30,30,30,0.68)', fontFamily: TYPE.bodyFamily, fontWeight: 500 }}
            >
              Centre médical de Dermato-Esthétique, Bodycontouring et Lasers à Fès.
            </p>
          </div>

          <FooterColumn title='Widamine Center'>
            <FooterLink to='/contact' icon={<Sparkle size={18} />}>Le concept</FooterLink>
            <FooterLink to='/services/consultation' icon={<Heart size={18} />}>Consultation</FooterLink>
          </FooterColumn>

          <FooterColumn title='Services'>
            {serviceLinks.map((link) => (
              <FooterLink key={link.href} to={link.href} icon={<Sparkle size={18} />}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title='Coordonnées'>
            <FooterExternal href='https://maps.google.com/?q=Boulevard+Slaoui+Bureaux+Nour+Fes' icon={<MapPin size={20} />}>
              Boulevard Slaoui, Bureaux Nour, Fès
            </FooterExternal>
            <FooterExternal href='mailto:info@widamineaestheticcenter.com' icon={<EnvelopeSimple size={20} />}>
              info@widamineaestheticcenter.com
            </FooterExternal>
            <FooterExternal href='tel:+212535624696' icon={<PhoneCall size={20} />}>
              +212 (535) 624 696
            </FooterExternal>
          </FooterColumn>
        </div>

        <div className='relative mt-12 border-t pt-8' style={{ borderColor: C.orange }}>
          <div className='flex flex-col gap-5 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between'>
            <p style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
              Widamine Center - Tous droits réservés - {year}
            </p>
            <div className='flex items-center gap-6'>
              <Link to='/mentions-legales' className='transition hover:opacity-70' style={{ color: C.secondary }}>
                Mentions légales
              </Link>
              <div className='flex items-center gap-3'>
                {SOCIAL.map((social) => {
                  const Icon = SOCIAL_ICONS[social.name]
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={social.name}
                      className='flex h-10 w-10 items-center justify-center rounded-xl transition hover:-translate-y-0.5 hover:opacity-80'
                      style={{ background: `${C.primary}12`, color: C.primary }}
                    >
                      {Icon ? <Icon /> : null}
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
      <h3 className='text-base font-bold' style={{ color: C.secondary, fontFamily: TYPE.headingFamily }}>
        {title}
      </h3>
      <div className='mt-7 grid gap-6'>{children}</div>
    </div>
  )
}

function FooterLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link to={to} className='group grid grid-cols-[28px_1fr] items-center gap-4 text-sm font-medium transition hover:opacity-75' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
      <span className='flex justify-center' style={{ color: C.primary }}>{icon}</span>
      <span>{children}</span>
    </Link>
  )
}

function FooterExternal({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <a href={href} className='group grid grid-cols-[28px_1fr] items-center gap-4 text-sm font-medium transition hover:opacity-75' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
      <span className='flex justify-center' style={{ color: C.primary }}>{icon}</span>
      <span>{children}</span>
    </a>
  )
}
