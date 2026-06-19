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
  401: 'Session expirée. Veuillez vous reconnecter.',
  403: 'Action non autorisée.',
  404: 'Ressource introuvable.',
  406: 'Action impossible dans ce contexte.',
  409: 'Conflit — cette ressource existe déjà.',
  422: 'Données invalides.',
  500: 'Erreur serveur. Réessayez plus tard.',
  502: 'Service indisponible.',
  503: 'Service temporairement indisponible.',
}

/** Machine codes from API → French user-facing copy */
export const ERROR_CATALOG: Record<string, string> = {
  // Network / system
  database_unavailable: 'Service indisponible. Réessayez dans un instant.',
  database_error: 'Erreur de base de données.',
  internal_error: 'Erreur serveur. Réessayez plus tard.',
  prisma_validation: 'Données invalides.',

  // Prisma
  unique_constraint: 'Cette ressource existe déjà.',
  not_found: 'Ressource introuvable.',
  foreign_key: 'Élément lié manquant ou contrainte non respectée.',

  // Auth
  no_auth_header: 'Authentification requise.',
  invalid_token: 'Session expirée. Veuillez vous reconnecter.',
  invalid_refresh_token: 'Session expirée. Veuillez vous reconnecter.',
  no_refresh_token: 'Session expirée. Veuillez vous reconnecter.',
  not_authenticated: 'Vous devez être connecté.',
  insufficient_permissions: 'Vous n’avez pas les droits pour cette action.',

  // Users
  user_not_found: 'Utilisateur introuvable.',
  user_email_taken: 'Un utilisateur avec cet e-mail existe déjà.',
  cannot_change_last_admin_role:
    'Impossible de modifier le rôle du dernier administrateur.',
  cannot_delete_last_admin:
    'Impossible de supprimer le dernier administrateur.',
  receptionist_cannot_change_role:
    'Les réceptionnistes ne peuvent pas modifier les rôles.',

  // Domain
  category_has_services:
    'Impossible de supprimer une catégorie qui contient encore des services.',
  motif_service_required: 'Un service est requis pour ce motif.',
  non_working_day: 'Ce jour n’est pas un jour ouvré.',
  not_your_appointment: 'Ce rendez-vous ne vous appartient pas.',
  not_your_patient: 'Ce patient ne vous est pas attribué.',
}

/** Field-level codes (auth forms, validation) */
export const FIELD_ERROR_CATALOG: Record<string, string> = {
  email_not_found: 'Aucun compte ne correspond à cet e-mail.',
  wrong_password: 'Mot de passe incorrect.',
}

function extractFieldErrors(data: Record<string, unknown>): Record<string, string> {
  const fields: Record<string, string> = {}

  for (const [key, value] of Object.entries(data)) {
    if (['statusCode', 'timestamp', 'path', 'error', 'message', 'code', 'fields'].includes(key))
      continue
    if (typeof value === 'string') {
      fields[key] = value
    }
  }

  return fields
}

function resolveMessage(
  code: string | undefined,
  fieldErrors: Record<string, string>,
  status: number | undefined,
): string {
  if (code && ERROR_CATALOG[code]) {
    return ERROR_CATALOG[code]
  }

  const fieldValues = Object.values(fieldErrors)
  if (fieldValues.length === 1) {
    const fieldCode = fieldValues[0]
    if (FIELD_ERROR_CATALOG[fieldCode]) {
      return FIELD_ERROR_CATALOG[fieldCode]
    }
  }

  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status]
  }

  return DEFAULT_MESSAGE
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return { message: DEFAULT_MESSAGE, fieldErrors: {}, raw: error }
    }
    return { message: DEFAULT_MESSAGE, fieldErrors: {}, raw: error }
  }

  if (!error.response) {
    return {
      message: 'Impossible de joindre le serveur. Vérifiez que l’API est lancée.',
      fieldErrors: {},
      raw: error,
    }
  }

  const { status, data } = error.response
  const payload = (typeof data === 'object' && data !== null ? data : {}) as Record<string, unknown>
  const fieldErrors = extractFieldErrors(payload)
  const code = typeof payload.code === 'string' ? payload.code : undefined

  const message = resolveMessage(code, fieldErrors, status)

  return {
    status,
    message,
    code,
    fieldErrors,
    raw: error,
  }
}

export function getApiErrorMessage(error: unknown): string {
  return parseApiError(error).message
}

/** Map a single field-error code to French copy */
export function getFieldErrorMessage(code: string): string {
  return FIELD_ERROR_CATALOG[code] ?? DEFAULT_MESSAGE
}

/** Resolve field error from parsed API error for a specific field key */
export function getFieldErrorForKey(
  parsed: ParsedApiError,
  fieldKey: string,
): string | undefined {
  const code = parsed.fieldErrors[fieldKey]
  if (!code) return undefined
  return FIELD_ERROR_CATALOG[code] ?? undefined
}
