import { useState, useEffect } from 'react'
import api from '@/lib/api'

export type DynamicService = {
  id: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  category?: string | null
  service: {
    id: string
    name: string
    slug: string
    category?: string | null
  } | null
}

export function useServices() {
  const [services, setServices] = useState<DynamicService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    api.get('public/motifs')
      .then(res => {
        if (mounted) {
          setServices(res.data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (mounted) {
          console.error('Failed to fetch services:', err)
          setError('Failed to load services')
          setLoading(false)
        }
      })

    return () => { mounted = false }
  }, [])

  // Group by category
  const byCategory = {
    visage: services.filter(s => s.category === 'visage'),
    corps: services.filter(s => s.category === 'corps'),
    techniques: services.filter(s => s.category === 'techniques'),
  }

  return { services, byCategory, loading, error }
}
