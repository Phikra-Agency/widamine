import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, CheckCircle, Warning } from '@phosphor-icons/react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuthStore } from '@/stores/authStore'
import { API_BASE_URL } from '@/lib/api'

type Unavailability = {
  id: string
  practitioner: { name: string; email: string; role: string }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  excuseType: string
  customReason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
  reviewedAt?: string
  conflictingAppointmentsCount?: number
  conflictingAppointments?: any[]
}

type Props = {
  item: Unavailability
  onClose: () => void
  onSuccess: () => void
}

export default function ApprovalModal({ item, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [conflictingAppointments, setConflictingAppointments] = useState<any[]>([])
  const [loadingConflicts, setLoadingConflicts] = useState(true)
  const [justification, setJustification] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const isPending = item.status === 'PENDING'
  const isRejected = item.status === 'REJECTED'

  useEffect(() => {
    loadConflicts()
  }, [item.id])

  async function loadConflicts() {
    try {
      setLoadingConflicts(true)
      const token = useAuthStore.getState().token
      const response = await fetch(`${API_BASE_URL}/unavailabilities/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      
      // Check for conflicts
      if (data.conflictingAppointments) {
        setConflictingAppointments(data.conflictingAppointments)
      }
    } catch (error) {
      console.error('Error loading conflicts:', error)
    } finally {
      setLoadingConflicts(false)
    }
  }

  async function handleApprove() {
    try {
      setLoading(true)
      const token = useAuthStore.getState().token
      const response = await fetch(`${API_BASE_URL}/unavailabilities/${item.id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to approve')
      onSuccess()
    } catch (error) {
      console.error('Error approving:', error)
      alert('Erreur lors de l\'approbation')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!justification.trim() && !showRejectInput) {
      setShowRejectInput(true)
      return
    }

    if (showRejectInput && !justification.trim()) {
      alert('Veuillez saisir une raison de refus')
      return
    }

    try {
      setLoading(true)
      const token = useAuthStore.getState().token
      const response = await fetch(`${API_BASE_URL}/unavailabilities/${item.id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: justification })
      })
      if (!response.ok) throw new Error('Failed to reject')
      onSuccess()
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Erreur lors du refus')
    } finally {
      setLoading(false)
    }
  }

  function getExcuseLabel(type: string, customReason?: string) {
    const labels: Record<string, string> = {
      VACATION: 'Congé',
      TRAINING: 'Formation',
      MEDICAL: 'Médical',
      PERSONAL: 'Personnel',
      OTHER: customReason || 'Autre'
    }
    return labels[type] || type
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">
            {isPending ? 'Approuver la demande' : 'Détails de la demande'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Badge */}
          {!isPending && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Statut:</span>
              {item.status === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle size={14} weight="fill" />
                  Approuvé
                </span>
              )}
              {item.status === 'REJECTED' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  <X size={14} weight="bold" />
                  Refusé
                </span>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {isRejected && item.rejectionReason && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <div className="text-sm text-red-600 font-medium">Raison du refus:</div>
              <div className="text-sm text-red-800 mt-1">{item.rejectionReason}</div>
            </div>
          )}

          {/* Practitioner Info */}
          <div className="bg-blue-50 p-4 rounded">
            <div className="font-semibold text-blue-900">{item.practitioner.name}</div>
            <div className="text-sm text-blue-700">{item.practitioner.email}</div>
            <div className="text-xs text-blue-600 mt-1">{item.practitioner.role}</div>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Période</div>
              <div className="font-medium">
                {format(parseISO(item.startDate), 'd MMM yyyy', { locale: fr })}
                {' '} → {' '}
                {format(parseISO(item.endDate), 'd MMM yyyy', { locale: fr })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Horaires</div>
              <div className="font-medium">{item.startTime} - {item.endTime}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Motif</div>
            <div className="font-medium">{getExcuseLabel(item.excuseType, item.customReason)}</div>
          </div>

          {/* Conflicts Warning */}
          {loadingConflicts ? (
            <div className="text-center text-gray-500 py-4">
              Vérification des conflits...
            </div>
          ) : conflictingAppointments.length > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <div className="flex items-start gap-3">
                <Warning size={24} className="text-yellow-600 flex-shrink-0" weight="fill" />
                <div className="flex-1">
                  <div className="font-semibold text-yellow-900">
                    ⚠️ Ce praticien a {conflictingAppointments.length} rendez-vous pendant cette période
                  </div>
                  <ul className="mt-2 text-sm text-yellow-800 space-y-1 max-h-40 overflow-y-auto">
                    {conflictingAppointments.slice(0, 10).map((apt: any, i: number) => (
                      <li key={i}>
                        • {apt.patientName} - {apt.motifName} - {format(new Date(apt.datetime), 'dd/MM/yyyy HH:mm')}
                      </li>
                    ))}
                    {conflictingAppointments.length > 10 && (
                      <li className="font-medium">... et {conflictingAppointments.length - 10} autre(s)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle size={20} weight="fill" />
                <span className="font-medium">Aucun conflit détecté</span>
              </div>
            </div>
          )}

          {/* Justification Input (for rejection) */}
          {isPending && showRejectInput && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Raison du refus <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Expliquez pourquoi cette demande est refusée..."
                rows={4}
                className="w-full"
              />
              {conflictingAppointments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setJustification(`Vous avez ${conflictingAppointments.length} rendez-vous existants pendant cette période.`)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Utiliser le motif de conflit
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {isPending ? 'Annuler' : 'Fermer'}
            </Button>
            {isPending && (
              <>
                {!showRejectInput ? (
                  <>
                    <Button variant="outline" onClick={() => setShowRejectInput(true)} disabled={loading}>
                      Refuser
                    </Button>
                    <Button onClick={handleApprove} disabled={loading}>
                      {loading ? 'En cours...' : 'Approuver'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setShowRejectInput(false)} disabled={loading}>
                      Retour
                    </Button>
                    <Button variant="destructive" onClick={handleReject} disabled={loading || !justification.trim()}>
                      {loading ? 'En cours...' : 'Confirmer le refus'}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
