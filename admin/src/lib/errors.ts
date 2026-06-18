import axios from 'axios'

export interface ParsedApiError {
  status?: number
  message: string
  code?: string
  fieldErrors: Record<string, string>
  raw: unknown
}

const DEFAULT_MESSAGE = 'Une erreur est survenue. Réessayez.'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Requête invalide.',
  403: 'Action non autorisée.',
  404: 'Ressource introuvable.',
  409: 'Conflit — cette ressource existe déjà.',
  422: 'Données invalides.',
  500: 'Erreur serveur. Réessayez plus tard.',
  502: 'Service indisponible.',
  503: 'Service temporairement indisponible.',
}

function flattenMessage(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value)) {
    const parts = value.filter((v): v is string => typeof v === 'string' && !!v.trim())
    if (parts.length) return parts.join(' ')
  }
  return undefined
}

function extractFieldErrors(data: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {}

  for (const [key, value] of Object.entries(data)) {
    if (['statusCode', 'timestamp', 'path', 'error', 'message', 'code'].includes(key)) continue
    if (typeof value === 'string') {
      fields[key] = value
    }
  }

  return fields
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return { message: error.message, fieldErrors: {}, raw: error }
    }
    return { message: DEFAULT_MESSAGE, fieldErrors: {}, raw: error }
  }

  if (!error.response) {
    return {
      message: 'Impossible de joindre le serveur. Vérifiez que le backend est lancé.',
      fieldErrors: {},
      raw: error,
    }
  }

  const { status, data } = error.response
  const payload = (typeof data === 'object' && data !== null ? data : {}) as Record<string, unknown>
  const fieldErrors = extractFieldErrors(payload)

  const nestedMessage =
    flattenMessage(payload.message) ??
    (typeof payload.message === 'object' && payload.message !== null
      ? flattenMessage(Object.values(payload.message as Record<string, unknown>)[0])
      : undefined)

  const message =
    nestedMessage ??
    (status ? STATUS_MESSAGES[status] : undefined) ??
    DEFAULT_MESSAGE

  return {
    status,
    message,
    code: typeof payload.code === 'string' ? payload.code : undefined,
    fieldErrors,
    raw: error,
  }
}

export function getApiErrorMessage(error: unknown): string {
  return parseApiError(error).message
}
