# Prompt for AI Partner — Widamine Admin

You are implementing changes to the Widamine admin dashboard (React 19, Tailwind 4, shadcn/ui with base-ui, TanStack Table, zustand, TypeScript with `verbatimModuleSyntax: true`).

## Task 1: Decouple sidebar search from all tables

**Problem:** `SidebarSearch.tsx` writes to a global zustand store via `setGlobalTerm()`. Every CRUD page reads from the same store via `useDebouncedGlobalSearch()` and passes the value as TanStack Table's `globalFilter`. This means typing in the sidebar search accidentally filters whatever table is currently visible (Contacts, Calendar, Users, etc.).

**Files to modify (A): `admin/src/components/layouts/SidebarSearch.tsx`**

Remove the global store entirely:
```tsx
// DELETE these imports:
import { useGlobalSearchStore } from '@/stores/globalSearchStore'

// DELETE this variable:
const setGlobalTerm = useGlobalSearchStore((state) => state.setTerm)

// In handleChange(value): remove setGlobalTerm(value)
// In clear(): remove setGlobalTerm('')
```

The sidebar should keep its own local `term` state for calling the `/api/search` endpoint — it just must not write to the global store anymore.

**Files to modify (B): Delete store and hook**

- `admin/src/stores/globalSearchStore.ts` — delete the entire file (contains create() zustand store)
- `admin/src/hooks/useDebouncedGlobalSearch.ts` — delete the entire file

**Files to modify (C): All pages that import global search**

Use grep to find all usages first:
```
grep -rn "useGlobalSearchStore\|useDebouncedGlobalSearch\|globalSearchStore" admin/src --include="*.tsx" --include="*.ts"
```

For each file, remove the global search import and usage. Rules per page:

- If the page has a local search input in its toolbar, replace the global `debouncedSearch` with a local `useDebounce` hook:
  ```tsx
  import { useDebounce } from 'use-debounce'
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch] = useDebounce(searchInput, 300)
  ```

- If the page has NO search input and only used the global store for `globalFilter`, just remove the `globalFilter` line entirely from `useDataTable()`.

- If the page reads the store for a mobile search input (like `Contacts.tsx`), convert that mobile input to use local state instead.

- `verbatimModuleSyntax: true` — use `import type` for type-only imports.

Affected pages (verify with grep after deleting files):
- `admin/src/pages/back-office/Contacts.tsx`
- `admin/src/pages/back-office/Motifs.tsx`
- `admin/src/pages/back-office/Resources.tsx`
- `admin/src/pages/back-office/Users.tsx`
- `admin/src/pages/back-office/Appointments.tsx`
- `admin/src/pages/back-office/Calendar.tsx`
- `admin/src/pages/back-office/Reservations.tsx`
- `admin/src/pages/back-office/Patients.tsx`

**Test:**
1. Open Contacts page. Type "nad" in sidebar search. Sidebar shows navigation results. Contacts table must NOT be filtered.
2. Clear sidebar. Type in Contacts toolbar search. Only Contacts table filters.

---

## Task 2: Tableau analytics — practitioner selection + detail/compare mode

**Component to modify:** `admin/src/components/calendar/PractitionerAnalytics.tsx`
**Column defs file:** `admin/src/pages/back-office/columns/practitionerAnalyticsColumns.tsx`

### Current Architecture

A single table with 3 columns (Praticien, Réservations, Charge). All practitioners appear sorted by count descending. The top one gets a "Meilleur" badge. Hovering a row shows a popover with motif breakdown.

### Target Architecture

Add two new states to `PractitionerAnalytics`:

```
[Table mode] --select 1--> [Detail mode]
[Table mode] --select 2--> [Compare mode]
[Detail/Compare] --"Back"--> [Table mode]
```

### Step 1: Add selection column

In `practitionerAnalyticsColumns.tsx`, add a new first column with checkboxes:

```tsx
{
  id: 'select',
  header: ({ table }) => (
    <input
      type='checkbox'
      checked={table.getIsAllRowsSelected()}
      onChange={() => {
        const rows = table.getRowModel().rows
        const allSelected = table.getIsAllRowsSelected()
        if (allSelected) {
          onSelectionChange([])
          table.toggleAllRowsSelected(false)
        } else if (rows.length <= 2) {
          onSelectionChange(rows.map(r => r.original.id))
          table.toggleAllRowsSelected(true)
        }
      }}
    />
  ),
  cell: ({ row }) => {
    const selected = selectedPractitioners || []
    const isDisabled = selected.length >= 2 && !selected.includes(row.original.id)
    return (
      <input
        type='checkbox'
        checked={selected.includes(row.original.id)}
        disabled={isDisabled}
        onChange={() => {
          if (selected.includes(row.original.id)) {
            onSelectionChange(selected.filter(id => id !== row.original.id))
          } else if (selected.length < 2) {
            onSelectionChange([...selected, row.original.id])
          }
        }}
      />
    )
  },
  meta: { width: 'narrow' },
  enableSorting: false,
  enableHiding: false,
}
```

- Max 2 selections at a time.
- When 2 are selected, disable remaining checkboxes.
- When 1 or 2 are selected, show a "Voir détails" button or auto-switch to detail/compare view.

### Step 2: Add selection state and view modes to PractitionerAnalytics

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([])
const [detailView, setDetailView] = useState<'table' | 'detail' | 'compare'>('table')

// derived: when exactly 1 is selected and user clicks "Détails", or when 2 are selected
const selectedPractitioners = stats.filter(p => selectedIds.includes(p.id))
```

### Step 3: Detail mode (1 practitioner selected)

When a single practitioner is selected and user activates detail view, replace the DataTable with a detail card:

```tsx
{detailView === 'detail' && selectedPractitioners.length === 1 && (
  <PractitionerDetail 
    practitioner={selectedPractitioners[0]}
    appointments={appointments.filter(a => a.practitionerId === selectedPractitioners[0].id)}
    onBack={() => { setDetailView('table'); setSelectedIds([]) }}
  />
)}
```

The `PractitionerDetail` component should show:
- Practitioner name + avatar + "Meilleur" badge if applicable
- Total reservations count + charge percentage (large numbers)
- Full motif distribution (ALL motifs, not just top 5) — use a bar chart or stacked horizontal bars showing count per motif

```tsx
function PractitionerDetail({ practitioner, appointments, onBack }: {
  practitioner: PractitionerStatsRow
  appointments: ScheduleAppointment[]
  onBack: () => void
}) {
  const sortedMotifs = Object.entries(practitioner.motifCounts)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className='p-4 space-y-4'>
      <button onClick={onBack} className='text-xs text-primary hover:underline flex items-center gap-1'>
        ← Retour au tableau
      </button>
      
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10'>
          <UserCircle size={22} className='text-secondary/50' />
        </div>
        <div>
          <h2 className='text-base font-bold'>{practitioner.name}</h2>
          <p className='text-xs text-muted-foreground'>{practitioner.count} RDV · {practitioner.percentage.toFixed(1)}% charge</p>
        </div>
        {practitioner.isTop && <span className='text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 ring-1 ring-amber-300/40'>Meilleur</span>}
      </div>

      {/* Full motif breakdown */}
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground/60'>Répartition par Motif</p>
        {sortedMotifs.map(([motif, count]) => (
          <div key={motif} className='flex items-center gap-3'>
            <span className='w-32 truncate text-xs text-secondary/70'>{motif}</span>
            <div className='flex-1 h-5 rounded-full bg-muted overflow-hidden'>
              <div className='h-full rounded-full bg-primary' style={{ width: `${(count / practitioner.count) * 100}%` }} />
            </div>
            <span className='w-8 text-right text-xs font-semibold text-foreground'>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Step 4: Compare mode (2 practitioners selected)

```tsx
{detailView === 'compare' && selectedPractitioners.length === 2 && (
  <PractitionerCompare
    practitioners={selectedPractitioners as [PractitionerStatsRow, PractitionerStatsRow]}
    allMotifs={/* union of all motif names from both */}  
    onBack={() => { setDetailView('table'); setSelectedIds([]) }}
  />
)}
```

Layout: side-by-side columns. Each column shows one practitioner's stats. A middle column shows the comparison metric.

```tsx
function PractitionerCompare({ practitioners, onBack }: {
  practitioners: [PractitionerStatsRow, PractitionerStatsRow]
  onBack: () => void
}) {
  const [p1, p2] = practitioners
  const allMotifs = [...new Set([...Object.keys(p1.motifCounts), ...Object.keys(p2.motifCounts)])]

  return (
    <div className='p-4 space-y-4'>
      <button onClick={onBack} className='text-xs text-primary hover:underline'>← Retour au tableau</button>
      
      {/* Side-by-side header */}
      <div className='grid grid-cols-2 gap-4'>
        {[p1, p2].map((p, i) => (
          <div key={p.id} className='text-center p-4 rounded-lg border border-border bg-card'>
            <p className='text-sm font-bold'>{p.name}</p>
            <div className='mt-2 grid grid-cols-2 gap-2'>
              <div>
                <p className='text-2xl font-bold text-foreground'>{p.count}</p>
                <p className='text-[10px] text-muted-foreground'>RDV</p>
              </div>
              <div>
                <p className='text-2xl font-bold text-foreground'>{p.percentage.toFixed(1)}%</p>
                <p className='text-[10px] text-muted-foreground'>Charge</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motif comparison */}
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground/60'>Comparaison par Motif</p>
        {allMotifs.map(motif => (
          <div key={motif} className='space-y-1'>
            <p className='text-xs text-secondary/70'>{motif}</p>
            <div className='grid grid-cols-2 gap-2'>
              <div className='h-4 rounded-full bg-muted overflow-hidden'>
                <div className='h-full rounded-full bg-primary' style={{ width: `${(p1.motifCounts[motif] || 0) / p1.count * 100}%` }} />
              </div>
              <div className='h-4 rounded-full bg-muted overflow-hidden'>
                <div className='h-full rounded-full bg-secondary' style={{ width: `${(p2.motifCounts[motif] || 0) / p2.count * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Step 5: Wire up view switching

In the table toolbar area (between `DataTable.Root` and the table), add a confirmation when 1-2 practitioners are selected:

```tsx
{selectedIds.length === 1 && (
  <div className='flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg'>
    <span className='text-xs text-muted-foreground'>1 praticien sélectionné</span>
    <Button size='sm' onClick={() => setDetailView('detail')}>
      Voir les détails
    </Button>
  </div>
)}
{selectedIds.length === 2 && (
  <div className='flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg'>
    <span className='text-xs text-muted-foreground'>2 praticiens sélectionnés</span>
    <Button size='sm' onClick={() => setDetailView('compare')}>
      Comparer
    </Button>
  </div>
)}
```

### Step 6: Update createPractitionerColumns to accept onSelectionChange

The columns function needs a new callback:

```tsx
interface CellCallbacks {
  onHover: (p: PractitionerStatsRow, rect: DOMRect) => void
  onLeave: () => void
  onSelectionChange?: (ids: string[]) => void
  selectedIds?: string[]
}
```

### Data flow summary

```
Calendar.tsx
  └─ PractitionerAnalytics (gets all appointments + practitioners)
       ├─ state: selectedIds, detailView
       ├─ PractitionerCell (uses onHover/onLeave for popover)
       ├─ DataTable (toggles selectedIds via checkbox column)
       ├─ [detailView='detail'] → PractitionerDetail (1 practitioner + raw appointments)
       ├─ [detailView='compare'] → PractitionerCompare (2 practitioners, side by side)
       └─ [detailView='table'] → DataTable (default view)
```

### Mobile considerations

- On mobile, the checkbox column should be hidden (it's only useful for desktop analysis)
- The detail and compare views should stack vertically on mobile
- Add `hidden lg:table-cell` to the select column header/cell

### Styling guidelines

- Use existing design tokens: `bg-card`, `border-border`, `text-muted-foreground`, `text-foreground`
- Use `rounded-surface`, `shadow-bo-elevated`, `ring-1 ring-border` for cards
- Use `@phosphor-icons/react` icons (already imported in the codebase)
- Follow the existing pattern of `bo-page-inner bo-section-stack > Card.bo-table-card`

---

## Build & Verify

After changes:
```bash
cd admin && npm run build
```

Check for:
- No TypeScript errors (`verbatimModuleSyntax: true` — watch for `import type`)
- No missing imports
- The sidebar search doesn't filter tables
- The analytics table has checkboxes, selection works, detail/compare views render

## Files to touch (complete list)

| File | Changes |
|------|---------|
| `admin/src/components/layouts/SidebarSearch.tsx` | Remove global store write |
| `admin/src/stores/globalSearchStore.ts` | DELETE |
| `admin/src/hooks/useDebouncedGlobalSearch.ts` | DELETE |
| `admin/src/pages/back-office/*.tsx` (8 files) | Remove imports, replace with local state |
| `admin/src/components/calendar/PractitionerAnalytics.tsx` | Add selection state, detail/compare views |
| `admin/src/pages/back-office/columns/practitionerAnalyticsColumns.tsx` | Add checkbox column, pass selection callbacks |

## Do NOT touch

- Landing page files (`landing/`)
- API backend files (`api/`)
- Any file not listed above
- CSS/index.css (unless specifically needed)
