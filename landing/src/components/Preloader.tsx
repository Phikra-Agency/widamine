import { useEffect, useState } from 'react'
import WIDAMINE_ASSETS from '@/lib/widamineSource'

export default function Preloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className='fixed inset-0 z-[2000] flex items-center justify-center bg-white'>
      <figure className='animate-fade-in'>
        <img src={WIDAMINE_ASSETS.logos.alt} alt='Widamine' className='h-20 w-auto' />
      </figure>
    </div>
  )
}
