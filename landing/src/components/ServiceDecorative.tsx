function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0
  return Math.abs(h)
}

const PATTERNS = [
  // petal-like ellipses radiating from center
  (cx: number, cy: number, r: number, n: number, rot: number, color: string, op: number) => {
    const pts = Array.from({ length: n }, (_, i) => (360 / n) * i + rot)
    return (
      <g key='petals' opacity={op}>
        {pts.map((a) => (
          <ellipse key={a} cx={cx + r * Math.cos((a * Math.PI) / 180)} cy={cy + r * Math.sin((a * Math.PI) / 180)} rx={r * 0.32} ry={r * 0.18} transform={`rotate(${a + 90} ${cx + r * Math.cos((a * Math.PI) / 180)} ${cy + r * Math.sin((a * Math.PI) / 180)})`} fill={color} />
        ))}
      </g>
    )
  },
  // diamond / leaf shapes
  (cx: number, cy: number, r: number, n: number, rot: number, color: string, op: number) => {
    const pts = Array.from({ length: n }, (_, i) => (360 / n) * i + rot)
    return (
      <g key='diamonds' opacity={op}>
        {pts.map((a) => {
          const x = cx + r * Math.cos((a * Math.PI) / 180)
          const y = cy + r * Math.sin((a * Math.PI) / 180)
          const w = r * 0.2
          const h2 = r * 0.35
          return (
            <polygon key={a} points={`${x},${y - h2} ${x + w},${y} ${x},${y + h2} ${x - w},${y}`} transform={`rotate(${a} ${x} ${y})`} fill={color} />
          )
        })}
      </g>
    )
  },
  // dots / circles
  (cx: number, cy: number, r: number, n: number, rot: number, color: string, op: number) => {
    const pts = Array.from({ length: n }, (_, i) => (360 / n) * i + rot)
    return (
      <g key='dots' opacity={op}>
        {pts.map((a) => (
          <circle key={a} cx={cx + r * Math.cos((a * Math.PI) / 180)} cy={cy + r * Math.sin((a * Math.PI) / 180)} r={r * 0.1} fill={color} />
        ))}
      </g>
    )
  },
  // triangles
  (cx: number, cy: number, r: number, n: number, rot: number, color: string, op: number) => {
    const pts = Array.from({ length: n }, (_, i) => (360 / n) * i + rot)
    return (
      <g key='triangles' opacity={op}>
        {pts.map((a) => {
          const x = cx + r * Math.cos((a * Math.PI) / 180)
          const y = cy + r * Math.sin((a * Math.PI) / 180)
          const s = r * 0.18
          return (
            <polygon key={a} points={`${x},${y - s} ${x + s * 0.866},${y + s * 0.5} ${x - s * 0.866},${y + s * 0.5}`} transform={`rotate(${a} ${x} ${y})`} fill={color} />
          )
        })}
      </g>
    )
  },
]

type SVGElement = ReturnType<typeof PATTERNS[0]>

export default function ServiceDecorative({ slug = '', color, className = '' }: { slug?: string; color: string; className?: string }) {
  const h = hashStr(slug || 'default')
  const nPetals = 5 + (h % 7)
  const rot = h % 360
  const outerPattern = PATTERNS[h % PATTERNS.length]
  const innerPattern = PATTERNS[(h + 1) % PATTERNS.length]
  const hasInnerRing = (h >> 3) % 2 === 0
  const midR = hasInnerRing ? 62 : 0
  const outerR = 80

  const children: SVGElement[] = []

  children.push(<circle key='bg1' cx='100' cy='100' r='90' stroke={color} strokeWidth='0.5' opacity='0.12' />)
  children.push(<circle key='bg2' cx='100' cy='100' r='65' stroke={color} strokeWidth='0.5' opacity='0.1' />)

  children.push(outerPattern(100, 100, outerR, nPetals, rot, color, 0.14))

  if (hasInnerRing) {
    children.push(innerPattern(100, 100, midR, Math.max(4, nPetals - 2), rot + 25, color, 0.08))
  }

  const extraLayer = PATTERNS[(h + 2) % PATTERNS.length]
  children.push(extraLayer(100, 100, 35, Math.max(3, nPetals - 3), rot + 50, color, 0.06))

  children.push(<circle key='center' cx='100' cy='100' r='3' fill={color} opacity='0.25' />)

  return (
    <svg viewBox='0 0 200 200' className={className} fill='none' xmlns='http://www.w3.org/2000/svg'>
      {children}
    </svg>
  )
}
