import { useState } from 'react'
import { ICON_MAP } from '@/lib/siteContent'

function FallbackIcon({
  size,
  className = '',
  color,
}: {
  size: number
  className?: string
  color?: string
}) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke={color || 'currentColor'} strokeWidth='1.5'>
        <circle cx='12' cy='12' r='10' />
        <path d='M12 6v6l4 2' />
      </svg>
    </div>
  )
}

export function ServiceIcon({
  slug,
  size = 20,
  className = '',
  color,
}: {
  slug: string
  size?: number
  className?: string
  color?: string
}) {
  const iconSrc = ICON_MAP[slug]
  const [failed, setFailed] = useState(false)

  if (!iconSrc || failed) {
    return <FallbackIcon size={size} className={className} color={color} />
  }

  // If color is provided, use CSS mask to apply dynamic color
  if (color) {
    return (
      <span className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            maskImage: `url(${iconSrc})`,
            WebkitMaskImage: `url(${iconSrc})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
        {/* ponytail: invisible probe — mask-image can't signal load failure, so a hidden img
            swaps to the fallback icon instead of showing a raw color square */}
        <img
          src={iconSrc}
          alt=''
          onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: size, height: size, opacity: 0, pointerEvents: 'none' }}
        />
      </span>
    )
  }

  // Default: use img tag
  return (
    <img
      src={iconSrc}
      alt=''
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  )
}