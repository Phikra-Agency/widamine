import { useCallback, useState } from 'react'
import type { ZodType } from 'zod'

type FieldErrors<T> = Partial<Record<keyof T, string>>
type Touched<T> = Partial<Record<keyof T, boolean>>

function collectErrors<T extends Record<string, unknown>>(
  issues: { path: PropertyKey[]; message: string }[],
  fields?: (keyof T)[],
): FieldErrors<T> {
  const next: FieldErrors<T> = {}

  for (const issue of issues) {
    const field = issue.path[0] as keyof T | undefined
    if (!field) continue
    if (fields && !fields.includes(field)) continue
    if (!next[field]) next[field] = issue.message
  }

  return next
}

export function useFormValidation<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  values: T,
) {
  const [touched, setTouched] = useState<Touched<T>>({})
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<T>>({})

  const validate = useCallback(
    (vals: T, fields?: (keyof T)[]) => {
      const result = schema.safeParse(vals)

      if (result.success) {
        if (fields) {
          setErrors((prev) => {
            const next = { ...prev }
            for (const field of fields) delete next[field]
            return next
          })
        } else {
          setErrors({})
        }
        return true
      }

      const fieldErrors = collectErrors<T>(result.error.issues, fields)

      if (fields) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
      } else {
        setErrors(fieldErrors)
      }

      return false
    },
    [schema],
  )

  const touch = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const shouldShow = useCallback(
    (field: keyof T) => submitted || !!touched[field],
    [submitted, touched],
  )

  const getError = useCallback(
    (field: keyof T) => (shouldShow(field) ? errors[field] : undefined),
    [shouldShow, errors],
  )

  const onFieldChange = useCallback(
    (field: keyof T, nextValues: T) => {
      if (submitted || touched[field]) {
        validate(nextValues, [field])
      } else if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    },
    [submitted, touched, validate, errors],
  )

  const onFieldBlur = useCallback(
    (field: keyof T, currentValues?: T) => {
      touch(field)
      validate(currentValues ?? values, [field])
    },
    [touch, validate, values],
  )

  const validateAll = useCallback(() => {
    setSubmitted(true)
    return validate(values)
  }, [validate, values])

  const reset = useCallback(() => {
    setTouched({})
    setSubmitted(false)
    setErrors({})
  }, [])

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: message }))
  }, [])

  return {
    errors,
    getError,
    touch,
    setFieldError,
    onFieldBlur,
    onFieldChange,
    validateAll,
    reset,
    submitted,
  }
}
