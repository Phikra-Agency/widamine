import { Link } from '@phosphor-icons/react'

export function MotifChips({
  motifs,
  emptyLabel = 'Aucun motif',
}: {
  motifs?: { id: string; name: string }[]
  emptyLabel?: string
}) {
  if (!motifs?.length) {
    return <span className='text-xs text-secondary/40'>{emptyLabel}</span>
  }
  return (
    <div className='flex flex-wrap gap-1.5'>
      {motifs.map((m) => (
        <span
          key={m.id}
          className='inline-flex items-center gap-1 rounded-md bg-secondary/3 px-2 py-0.5 text-[11px] font-medium text-secondary/60'
        >
          <Link size={10} />
          {m.name}
        </span>
      ))}
    </div>
  )
}

export function SallesMotifChips({
  assignments,
}: {
  assignments?: { id?: string; motifId?: string; motif?: { name?: string } }[]
}) {
  if (!assignments?.length) {
    return <span className='text-xs text-secondary/30'>Aucun motif</span>
  }
  return (
    <div className='flex flex-wrap gap-1.5'>
      {assignments.map((assignment) => (
        <span
          key={assignment.id || assignment.motifId}
          className='inline-flex items-center gap-1 rounded-md border border-border-subtle bg-secondary/3 px-2 py-0.5 text-[10px] font-bold text-secondary/50'
        >
          <Link size={9} />
          {assignment.motif?.name || assignment.motifId}
        </span>
      ))}
    </div>
  )
}
