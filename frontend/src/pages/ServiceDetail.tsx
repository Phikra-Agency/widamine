import Header from '@/components/Header'
import { getServicePage } from '@/lib/siteContent'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { Link, useParams } from 'react-router-dom'

export default function ServiceDetail() {
  const { slug = '' } = useParams()
  const service = getServicePage(slug)

  if (!service) {
    return (
      <div className='bg-custom-white'>
        <Header page='Service' />
        <section className='mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16'>
          <div className='rounded-[2rem] border border-secondary/10 bg-[#fffaf7] p-8 text-secondary shadow-[0_18px_40px_rgba(26,54,70,0.06)]'>
            Service introuvable.
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className='bg-custom-white'>
      <Header page={service.title} />
      <section className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-18'>
        <div className='grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start'>
          <div className='space-y-6'>
            <div className='rounded-[1.75rem] border border-secondary/10 bg-[#fffaf7] p-5 shadow-[0_24px_55px_rgba(26,54,70,0.06)] sm:rounded-[2.25rem] sm:p-8'>
              <p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>{service.eyebrow}</p>
              <h1 className='mt-4 max-w-lg font-amoria text-[2rem] leading-tight text-secondary sm:text-4xl md:text-5xl'>{service.title}</h1>
              <p className='mt-5 max-w-xl text-sm leading-7 text-secondary/68 sm:text-base sm:leading-8'>{service.intro}</p>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 sm:gap-5'>
              {service.highlights.map((item) => (
                <div key={item} className='rounded-[1.45rem] border border-secondary/10 bg-custom-white p-4 shadow-[0_18px_40px_rgba(26,54,70,0.06)] sm:rounded-[1.7rem] sm:p-5'>
                  <div className='flex items-start gap-3'>
                    <span className='mt-2 h-2 w-2 shrink-0 rounded-full bg-primary' />
                    <p className='text-sm leading-7 text-secondary/72'>{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-6'>
            <div className='overflow-hidden rounded-[1.85rem] border border-secondary/10 bg-custom-white shadow-[0_24px_55px_rgba(26,54,70,0.06)] sm:rounded-[2.25rem]'>
              <img src={service.image} alt={service.title} className='h-[15rem] w-full object-cover sm:h-[23rem]' />
              <div className='space-y-4 p-5 sm:p-6'>
                <p className='text-[11px] uppercase tracking-[0.26em] text-primary/72'>Approche Widamine</p>
                <p className='text-base leading-8 text-secondary/68'>{service.heroDescription}</p>
                <Link to='/appointment' className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-custom-white shadow-[0_14px_28px_rgba(46,144,192,0.24)] transition hover:bg-primary/90 sm:w-auto'>
                  Réserver une consultation
                  <ArrowUpRightIcon size={18} />
                </Link>
              </div>
            </div>

            <div className='grid gap-5'>
              {service.sections.map((section) => (
                <div key={section.title} className='rounded-[1.45rem] border border-secondary/10 bg-[#fffaf7] p-5 shadow-[0_18px_40px_rgba(26,54,70,0.06)] sm:rounded-[1.9rem] sm:p-6'>
                  <h2 className='text-[1.55rem] text-secondary sm:text-2xl'>{section.title}</h2>
                  <p className='mt-4 text-sm leading-8 text-secondary/68'>{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
