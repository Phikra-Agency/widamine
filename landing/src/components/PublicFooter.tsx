import { Link } from 'react-router-dom'
import type React from 'react'
import { EnvelopeSimple, Heart, MapPin, PhoneCall, Sparkle } from '@phosphor-icons/react'
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

const FacebookIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
  </svg>
)
const InstagramIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
  </svg>
)
const LinkedInIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
  </svg>
)
const TikTokIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' />
  </svg>
)
const YouTubeIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
  </svg>
)
const SOCIAL_ICONS: Record<string, React.ComponentType> = {
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  TikTok: TikTokIcon,
  YouTube: YouTubeIcon,
}

const serviceLinks = [
  { label: 'Traitement du visage', href: '/category/visage' },
  { label: 'Traitement du corps', href: '/category/corps' },
  { label: 'Nos techniques', href: '/category/techniques' },
]

export default function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className='relative overflow-hidden px-3 pb-6 pt-10 sm:px-6 sm:pb-8' style={{ background: '#FFF4F1' }}>
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
          <div className='grid gap-5 text-sm font-semibold lg:grid-cols-3 lg:items-center'>
            <p style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
              Widamine Center - Tous droits réservés - {year}
            </p>
            <p className='text-center' style={{ color: C.secondary, fontFamily: TYPE.bodyFamily }}>
              Réalisé avec passion par <strong>phikra</strong>
            </p>
            <div className='flex items-center gap-6 lg:justify-end'>
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
                      className='flex h-9 w-9 items-center justify-center rounded-full transition hover:-translate-y-0.5 hover:opacity-80'
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
