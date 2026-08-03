import { useState, useEffect } from 'react'
import api from '@/lib/api'

export type DynamicService = {
  id: string
  name: string
  slug: string
  description?: string
  duration: number
  color: string
  service: {
    id: string
    name: string
    slug: string
    category: {
      id: string
      name: string
      slug: string
    }
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
    visage: services.filter(s => s.service?.category?.slug === 'visage'),
    corps: services.filter(s => s.service?.category?.slug === 'corps'),
    techniques: services.filter(s => s.service?.category?.slug === 'techniques'),
  }

  return { services, byCategory, loading, error }
}
