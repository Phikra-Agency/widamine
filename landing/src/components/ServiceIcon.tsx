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

  return (
    <img 
      src={iconSrc} 
      alt=""
      className={`object-cover ${className}`}
      style={{ 
        width: size, 
        height: size,
        filter: color ? 'none' : undefined
      }}
    />
  )
}
