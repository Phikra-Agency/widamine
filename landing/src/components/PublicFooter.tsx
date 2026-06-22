import { Link } from 'react-router-dom'

const SOCIAL = [
  { name: 'Facebook', href: 'https://facebook.com/widaminecenter', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { name: 'Instagram', href: 'https://instagram.com/widaminecenter', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { name: 'YouTube', href: '#', icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
]

export default function PublicFooter() {
  return (
    <footer className='bg-[#1a3646] pb-6 pt-14 text-white sm:pt-20'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-8'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-sm'>
                <img src='/logo.png' alt='Widamine' className='h-7 w-7 object-contain' />
              </div>
              <div>
                <p className='font-amoria text-lg tracking-[0.14em] text-white sm:text-xl'>WIDAMINE</p>
                <p className='mt-0.5 text-[9px] uppercase tracking-[0.3em] text-white/50'>Dermato-Esthétique & Lasers</p>
              </div>
            </div>
            <p className='mt-5 max-w-xs text-sm leading-7 text-white/60'>
              1er centre médical de Dermato-Esthétique, Bodycontouring et Lasers au Maroc.
            </p>
          </div>

          <div>
            <p className='text-[10px] uppercase tracking-[0.28em] text-white/40'>Widamine Center</p>
            <div className='mt-4 space-y-2.5 text-sm text-white/65'>
              <Link to='/contact' className='block transition hover:text-white'>Contact</Link>
              <Link to='/services/consultation' className='block transition hover:text-white'>Consultation</Link>
            </div>
          </div>

          <div>
            <p className='text-[10px] uppercase tracking-[0.28em] text-white/40'>Prestations</p>
            <div className='mt-4 space-y-2.5 text-sm text-white/65'>
              <Link to='/services/facial-aesthetics' className='block transition hover:text-white'>Facial Aesthetics</Link>
              <Link to='/services/body-aesthetics' className='block transition hover:text-white'>Body Aesthetics</Link>
              <Link to='/services/epilation-laser' className='block transition hover:text-white'>Épilation laser</Link>
            </div>
          </div>

          <div>
            <p className='text-[10px] uppercase tracking-[0.28em] text-white/40'>Coordonnées</p>
            <div className='mt-4 space-y-3 text-sm text-white/65'>
              <p className='leading-6'>Boulevard Slaoui, Bureaux Nour<br />2ème étage, Fès</p>
              <a href='mailto:info@widamineaestheticcenter.com' className='block transition hover:text-white'>info@widamineaestheticcenter.com</a>
              <a href='tel:+212535624696' className='block transition hover:text-white'>+212 (535) 624 696</a>
            </div>
          </div>
        </div>

        <div className='mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between'>
          <p>Widamine Center - Tous droits réservés - {new Date().getFullYear()}</p>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3'>
              {SOCIAL.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name} className='text-white/40 transition hover:text-white'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
            <span className='text-white/20'>|</span>
            <Link to='/mentions-legales' className='transition hover:text-white/70'>Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
