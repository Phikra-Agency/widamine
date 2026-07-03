import { useEffect, useState } from 'react'
import { ICON_MAP } from '@/lib/siteContent'

interface TintedIconProps {
  slug: string
  color: string
  className?: string
}

export default function TintedIcon({ slug, color, className = '' }: TintedIconProps) {
  const src = ICON_MAP[slug]
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src || error) return
    let cancelled = false
    fetch(src)
      .then(r => r.text())
      .then(text => {
        if (!cancelled) {
          const converted = text
            .replace(/fill="(#[^"]*)"/g, 'fill="currentColor"')
            .replace(/fill:([^;"]+)/g, 'fill:currentColor')
          setSvgContent(converted)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => { cancelled = true }
  }, [src, error])

  if (error || !svgContent) {
    return src ? (
      <div className={`relative ${className}`} style={{ color }}>
        <img src={src} alt='' className='h-full w-full object-contain' loading='lazy' />
      </div>
    ) : null
  }

  return (
    <div className={`relative ${className}`} style={{ color }} dangerouslySetInnerHTML={{ __html: svgContent }} />
  )
}