import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'
import { API_BASE_URL } from '@/lib/api'

type Unavailability = {
  id: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  excuseType: string
  customReason?: string
}

type Props = {
  item: Unavailability | null
  onClose: () => void
  onSuccess: () => void
}

export default function UnavailabilityFormModal({ item, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    excuseType: 'VACATION',
    customReason: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conflictWarning, setConflictWarning] = useState<any>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    if (item) {
      setFormData({
        startDate: format(new Date(item.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(item.endDate), 'yyyy-MM-dd'),
        startTime: item.startTime,
        endTime: item.endTime,
        excuseType: item.excuseType,
        customReason: item.customReason || ''
      })
    }
  }, [item])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setConflictWarning(null)

    // Validate custom reason if OTHER
    if (formData.excuseType === 'OTHER' && !formData.customReason.trim()) {
      setError('Veuillez saisir une raison')
      return
    }

    try {
      setLoading(true)
      const token = useAuthStore.getState().token

      const url = item
        ? `${API_BASE_URL}/unavailabilities/${item.id}`
        : pendingId
        ? `${API_BASE_URL}/unavailabilities/${pendingId}`
        : `${API_BASE_URL}/unavailabilities`

      const response = await fetch(url, {
        method: item || pendingId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
      }

      const result = await response.json()

      // Show conflict warning if exists
      if (result.conflictingAppointmentsCount > 0) {
        setConflictWarning(result)
        if (!item && !pendingId) setPendingId(result.id)
        return
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleConfirmWithConflict() {
    setConflictWarning(null)
    setPendingId(null)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">
            {item ? 'Modifier la demande' : 'Nouvelle demande d\'indisponibilité'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          {conflictWarning && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 font-semibold">
                  ⚠️ Attention
                </div>
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    Vous avez <strong>{conflictWarning.conflictingAppointmentsCount} rendez-vous</strong> pendant cette période.
                  </p>
                  {conflictWarning.conflictingAppointments && (
                    <ul className="mt-2 text-xs text-yellow-700 space-y-1">
                      {conflictWarning.conflictingAppointments.map((apt: any, i: number) => (
                        <li key={i}>
                          • {apt.patientName} - {apt.motifName} - {format(new Date(apt.datetime), 'dd/MM/yyyy HH:mm')}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button type="button" size="sm" variant="outline" onClick={() => setConflictWarning(null)}>
                      Modifier
                    </Button>
                    <Button type="button" size="sm" onClick={handleConfirmWithConflict}>
                      Continuer quand même
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date de début *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de fin *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Heure de début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heure de fin *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Excuse Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Type d'excuse *</label>
            <select
              required
              value={formData.excuseType}
              onChange={(e) => setFormData({ ...formData, excuseType: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="VACATION">Congé</option>
              <option value="TRAINING">Formation</option>
              <option value="MEDICAL">Médical</option>
              <option value="PERSONAL">Personnel</option>
              <option value="OTHER">Autre (Saisir)</option>
            </select>
          </div>

          {/* Custom Reason (if OTHER) */}
          {formData.excuseType === 'OTHER' && (
            <div>
              <label className="block text-sm font-medium mb-1">Saisir la raison *</label>
              <input
                type="text"
                required
                value={formData.customReason}
                onChange={(e) => setFormData({ ...formData, customReason: e.target.value })}
                placeholder="Ex: Déplacement professionnel"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'En cours...' : (item ? 'Mettre à jour' : 'Soumettre')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
