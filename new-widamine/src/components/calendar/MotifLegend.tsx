import { useEffect, useMemo, useState } from 'react'
import { CaretDown, CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import api from '@/lib/api'
import {
  groupMotifsByFamily,
  type MotifFamilyKey,
  type MotifLike,
} from '@/lib/motifFamilies'

interface MotifLegendProps {
  expanded: boolean
  activeFamilies: Set<MotifFamilyKey>
  hiddenFamilies: Set<MotifFamilyKey>
  slotCount: number
  onToggleFamily: (key: MotifFamilyKey) => void
  onToggleHidden: (key: MotifFamilyKey) => void
  onExpandFamily: (key: MotifFamilyKey | null) => void
  expandedFamily: MotifFamilyKey | null
}

export default function MotifLegend({
  expanded,
  activeFamilies,
  hiddenFamilies,
  slotCount,
  onToggleFamily,
  onToggleHidden,
  onExpandFamily,
  expandedFamily,
}: MotifLegendProps) {
  const [motifs, setMotifs] = useState<MotifLike[]>([])

  useEffect(() => {
    api
      .get('motifs')
      .then((res) => {
        const data = res.data as (MotifLike & { bookingType?: string; isActive?: boolean })[]
        setMotifs(data.filter((m) => m.name && m.isActive !== false))
      })
      .catch(() => {})
  }, [])

  const grouped = useMemo(() => groupMotifsByFamily(motifs), [motifs])
  const familyCount = grouped.length
  const motifCount = motifs.length

  if (!expanded) {
    return (
      <p className='text-[11px] text-secondary/45'>
        {familyCount} familles · {motifCount} motifs · {slotCount} créneaux
      </p>
    )
  }

  if (motifs.length === 0) {
    return <p className='text-[12px] text-secondary/40'>Chargement des motifs…</p>
  }

  return (
    <div className='space-y-3'>
      <p className='text-[11px] text-secondary/45'>
        {familyCount} familles actives · {motifCount} motifs · {slotCount} créneaux
      </p>

      <div className='flex flex-wrap gap-2'>
        {grouped.map(({ family, motifs: familyMotifs }) => {
          const isActive = activeFamilies.has(family.key)
          const isHidden = hiddenFamilies.has(family.key)
          const isOpen = expandedFamily === family.key

          return (
            <div key={family.key} className='flex flex-col gap-1'>
              <button
                type='button'
                onClick={() => onToggleFamily(family.key)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  onToggleHidden(family.key)
                }}
                className={clsx(
                  'bo-chip',
                  isActive && 'bo-chip-active',
                  isHidden && 'opacity-40 line-through',
                )}
                style={{
                  borderColor: `${family.hue}35`,
                  backgroundColor: `${family.hue}12`,
                }}
              >
                <span
                  className='h-2 w-2 shrink-0 rounded-full'
                  style={{ backgroundColor: family.hue }}
                />
                <span>{family.label}</span>
                <span className='text-secondary/40'>· {familyMotifs.length}</span>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    onExpandFamily(isOpen ? null : family.key)
                  }}
                  className='ml-0.5 rounded p-0.5 hover:bg-black/[0.04]'
                  aria-label={`Détails ${family.label}`}
                >
                  {isOpen ? <CaretDown size={10} /> : <CaretRight size={10} />}
                </button>
              </button>

              <>
                {isOpen && (
                  <div
                    className='bo-drawer ml-1 overflow-hidden p-2'
                  >
                    <ul className='space-y-1'>
                      {familyMotifs.map((m) => (
                        <li
                          key={m.id}
                          className='flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] text-secondary/70'
                        >
                          <span
                            className='h-1.5 w-1.5 shrink-0 rounded-full'
                            style={{ backgroundColor: m.color || family.hue }}
                          />
                          {m.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            </div>
          )
        })}
      </div>

    </div>
  )
}
