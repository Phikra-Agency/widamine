import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { API_BASE_URL } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, CheckCircle, XCircle, Clock, CalendarBlank } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import UnavailabilityFormModal from '@/components/UnavailabilityFormModal'
import ApprovalModal from '@/components/ApprovalModal'
import { Badge } from '@/components/ui/badge'
import { DataTable, DataTableFilterPills, TanStackDataTable, useDataTable, type FilterPillOption } from '@/components/data-table'
import type { ColumnFiltersState } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

type Unavailability = {
  id: string
  practitionerId: string
  practitioner: { id: string; name: string; email: string; role: string }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  excuseType: string
  customReason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  reviewedAt?: string
  reviewedBy?: string
  createdAt: string
  updatedAt: string
  conflictingAppointmentsCount?: number
  conflictingAppointments?: any[]
}

type Statistics = {
  approvedThisMonth: number
  approvedThisYear: number
  upcomingApproved: number
  pendingRequests: number
}

const STATUS_FILTER_PILLS: FilterPillOption[] = [
  { value: 'all', label: 'Tous', color: 'mist' },
  { value: 'PENDING', label: 'En attente', color: 'sand' },
  { value: 'APPROVED', label: 'Approuvé', color: 'sage' },
  { value: 'REJECTED', label: 'Refusé', color: 'coral' },
]

function UnavailabilitiesEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg className={`${className} text-muted-foreground/20`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

const columnHelper = createColumnHelper<Unavailability>()

// Helper function for filtering with 'all' option
function equalsOrAllFilter(filterValue: any, rowValue: any) {
  if (filterValue === 'all') return true
  return rowValue === filterValue
}

export default function Unavailabilities() {
  return (
    <div className="bo-page">
      <div className="bo-page-inner bo-section-stack">
        <div className='bo-page-ambient-tr' />
        <div className='bo-page-ambient-bl' />
        <Heading />
        <Statistics />
        <Card className="bo-table-card">
          <UnavailabilitiesTable />
        </Card>
      </div>
      <Modals />
    </div>
  )
}

function Heading() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  
  function handleCreate() {
    const store = (window as any).__unavailabilitiesStore
    if (store) store.openCreateModal()
  }

  return (
    <div className="bo-page-heading">
      <div>
        <h3 className="bo-title">Indisponibilités</h3>
        <p className="mt-0.5 text-xs text-secondary/40">
          {isAdmin ? 'Gérer les demandes de tous les praticiens' : 'Gérer mes périodes d\'indisponibilité'}
        </p>
      </div>
      <Button onClick={handleCreate} className="hidden lg:inline-flex">
        <Plus weight="bold" />
        Nouvelle demande
      </Button>
    </div>
  )
}

function Statistics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const token = useAuthStore.getState().token
        if (!token) return

        const response = await fetch(`${API_BASE_URL}/unavailabilities/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setStatistics(data)
        }
      } catch (error) {
        console.error('Error loading statistics:', error)
      }
    }
    loadStats()
  }, [])

  if (!statistics) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
      <StatCard label="Ce mois" value={statistics.approvedThisMonth} hint="jours approuvés" accent="text-primary" />
      <StatCard label="Cette année" value={statistics.approvedThisYear} hint="jours approuvés" accent="text-fam-followup" />
      <StatCard label="À venir" value={statistics.upcomingApproved} hint="période(s) approuvée(s)" accent="text-success" />
      <StatCard label="En attente" value={statistics.pendingRequests} hint="demande(s)" accent="text-warning" />
    </div>
  )
}

function StatCard({ label, value, hint, accent }: { label: string; value: number; hint: string; accent: string }) {
  return (
    <div className="rounded-control bg-card p-3 ring-1 ring-border">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/60">{label}</p>
      <p className={`mt-1 font-heading text-2xl font-medium leading-8 tracking-tight ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground/70">{hint}</p>
    </div>
  )
}

function UnavailabilitiesTable() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingItem, setEditingItem] = useState<Unavailability | null>(null)
  const [approvingItem, setApprovingItem] = useState<Unavailability | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      const token = useAuthStore.getState().token
      
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch(`${API_BASE_URL}/unavailabilities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - please login again')
          return
        }
        throw new Error('Failed to load')
      }
      const data = await response.json()
      setUnavailabilities(data)
    } catch (error) {
      console.error('Error loading unavailabilities:', error)
    } finally {
      setLoading(false)
    }
  }

  // Expose functions globally for header button
  useEffect(() => {
    (window as any).__unavailabilitiesStore = {
      openCreateModal: () => setEditingItem({} as any),
      refresh: loadData,
      editingItem,
      approvingItem,
      setEditingItem,
      setApprovingItem
    }
  }, [editingItem, approvingItem])

  useEffect(() => {
    loadData()
  }, [])

  function handleEdit(item: Unavailability) {
    setEditingItem(item)
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return

    try {
      const token = useAuthStore.getState().token
      const response = await fetch(`${API_BASE_URL}/unavailabilities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to delete')
      loadData()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Erreur lors de la suppression')
    }
  }

  function handleApprove(item: Unavailability) {
    setApprovingItem(item)
  }

  async function handleReject(id: string, reason?: string) {
    try {
      const token = useAuthStore.getState().token
      const response = await fetch(`${API_BASE_URL}/unavailabilities/${id}/reject`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      })
      if (!response.ok) throw new Error('Failed to reject')
      loadData()
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Erreur lors du refus')
    }
  }

  const columns = useMemo(() => {
    const cols = []

    if (isAdmin) {
      cols.push(
        columnHelper.accessor('practitioner', {
          id: 'practitioner',
          header: 'Praticien',
          cell: ({ row }) => (
            <div className="text-sm">
              <div className="font-medium">{row.original.practitioner.name}</div>
              <div className="text-xs text-muted-foreground">{row.original.practitioner.role}</div>
            </div>
          ),
        })
      )
    }

    cols.push(
      columnHelper.accessor('startDate', {
        id: 'period',
        header: 'Période',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex items-center gap-2 text-sm">
              <CalendarBlank size={16} className="text-muted-foreground shrink-0" />
              <div>
                {format(parseISO(item.startDate), 'd MMM yyyy', { locale: fr })}
                {item.startDate !== item.endDate && (
                  <> → {format(parseISO(item.endDate), 'd MMM yyyy', { locale: fr })}</>
                )}
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('startTime', {
        id: 'hours',
        header: 'Horaires',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.startTime} - {row.original.endTime}
          </div>
        ),
      }),
      columnHelper.accessor('excuseType', {
        id: 'reason',
        header: 'Motif',
        cell: ({ row }) => {
          const item = row.original
          const labels: Record<string, string> = {
            VACATION: 'Congé',
            TRAINING: 'Formation',
            MEDICAL: 'Médical',
            PERSONAL: 'Personnel',
            OTHER: item.customReason || 'Autre'
          }
          return <div className="text-sm">{labels[item.excuseType] || item.excuseType}</div>
        },
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Statut',
        filterFn: (row, _columnId, value) => equalsOrAllFilter(value, row.original.status),
        cell: ({ row }) => {
          const item = row.original
          const variants = {
            PENDING: { icon: Clock, label: 'En attente', className: 'bg-amber-50 text-amber-600' },
            APPROVED: { icon: CheckCircle, label: 'Approuvé', className: 'bg-emerald-50 text-emerald-600' },
            REJECTED: { icon: XCircle, label: 'Refusé', className: 'bg-red-50 text-red-600' }
          }
          const config = variants[item.status as keyof typeof variants]
          if (!config) return null

          const Icon = config.icon
          return (
            <div>
              <Badge className={config.className}>
                <Icon size={14} className="mr-1" weight="fill" />
                {config.label}
              </Badge>
              {item.status === 'REJECTED' && item.rejectionReason && (
                <div className="text-xs text-red-600 mt-1">
                  {item.rejectionReason}
                </div>
              )}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="flex gap-2">
              {item.status === 'PENDING' && !isAdmin && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                    Supprimer
                  </Button>
                </>
              )}
              {item.status === 'PENDING' && isAdmin && (
                <Button size="sm" variant="default" onClick={() => handleApprove(item)}>
                  Détails
                </Button>
              )}
              {item.status !== 'PENDING' && isAdmin && (
                <Button size="sm" variant="outline" onClick={() => handleApprove(item)}>
                  Voir détails
                </Button>
              )}
            </div>
          )
        },
      })
    )

    return cols
  }, [isAdmin])

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [{ id: 'status', value: statusFilter }],
    [statusFilter]
  )

  const table = useDataTable({
    data: unavailabilities,
    columns,
    enablePagination: true,
    pageSize: 10,
    columnFilters,
    getRowId: (row) => row.id,
  })

  return (
    <DataTable.Root>
      <DataTable.Toolbar>
        <DataTableFilterPills
          options={STATUS_FILTER_PILLS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </DataTable.Toolbar>

      <TanStackDataTable
        table={table}
        loading={loading}
        emptyIllustration={UnavailabilitiesEmptyIllustration}
        emptyTitle="Aucune demande d'indisponibilité"
      />
    </DataTable.Root>
  )
}

function Modals() {
  const [editingItem, setEditingItem] = useState<Unavailability | null>(null)
  const [approvingItem, setApprovingItem] = useState<Unavailability | null>(null)

  // Listen to global store
  useEffect(() => {
    const interval = setInterval(() => {
      const store = (window as any).__unavailabilitiesStore
      if (store) {
        if (store.editingItem !== editingItem) {
          setEditingItem(store.editingItem)
        }
        if (store.approvingItem !== approvingItem) {
          setApprovingItem(store.approvingItem)
        }
      }
    }, 100)
    return () => clearInterval(interval)
  }, [editingItem, approvingItem])

  function handleCloseForm() {
    setEditingItem(null)
    const store = (window as any).__unavailabilitiesStore
    if (store) store.editingItem = null
  }

  function handleSuccessForm() {
    setEditingItem(null)
    const store = (window as any).__unavailabilitiesStore
    if (store) {
      store.editingItem = null
      store.refresh?.()
    }
  }

  function handleCloseApproval() {
    setApprovingItem(null)
    const store = (window as any).__unavailabilitiesStore
    if (store) store.approvingItem = null
  }

  function handleSuccessApproval() {
    setApprovingItem(null)
    const store = (window as any).__unavailabilitiesStore
    if (store) {
      store.approvingItem = null
      store.refresh?.()
    }
  }

  return (
    <>
      {editingItem && (
        <UnavailabilityFormModal
          item={editingItem.id ? editingItem : null}
          onClose={handleCloseForm}
          onSuccess={handleSuccessForm}
        />
      )}

      {approvingItem && (
        <ApprovalModal
          item={approvingItem}
          onClose={handleCloseApproval}
          onSuccess={handleSuccessApproval}
        />
      )}
    </>
  )
}
