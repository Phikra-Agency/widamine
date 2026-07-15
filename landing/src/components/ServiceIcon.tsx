import {
  Smile,
  Heart,
  Eye,
  Sparkles,
  ScanFace,
  HeartPulse,
  CircleUser,
  Hand,
  Scissors,
  Waves,
  Zap,
  ClipboardList,
  Stethoscope,
} from 'lucide-react'

const ICON_MAP: Record<string, typeof Stethoscope> = {
  'facial-aesthetics': Smile,
  'lip-aesthetics': Heart,
  'eye-aesthetics': Eye,
  'eyebrow-aesthetics': Sparkles,
  'body-aesthetics': ScanFace,
  'breast-aesthetics': HeartPulse,
  'butt-aesthetics': CircleUser,
  'arm-aesthetics': Hand,
  'liposuction': Scissors,
  'vaser-liposuction': Waves,
  'epilation-laser': Zap,
  'consultation': ClipboardList,
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
  const Icon = ICON_MAP[slug] || Stethoscope
  return <Icon size={size} strokeWidth={1.5} className={className} style={{ color: color || undefined }} />
}
