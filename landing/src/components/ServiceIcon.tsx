import { ICON_MAP } from '@/lib/siteContent'

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
  
  // Fallback to a default icon if not found
  if (!iconSrc) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
    )
  }

  // If color is provided, use CSS mask to apply dynamic color
  if (color) {
    return (
      <div
        className={`${className}`}
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
    )
  }

  // Default: use img tag
  return (
    <img 
      src={iconSrc} 
      alt=""
      className={`object-cover ${className}`}
      style={{ 
        width: size, 
        height: size,
      }}
    />
  )
}
