import { z } from 'zod'

const required = 'Ce champ est requis.'
const invalidEmail = 'Adresse e-mail invalide.'

export const loginEmailSchema = z.object({
  email: z.string().trim().min(1, "L'e-mail est requis.").email(invalidEmail),
})

export const loginPasswordSchema = z.object({
  password: z.string().trim().min(1, 'Le mot de passe est requis.'),
})

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis.'),
  email: z.string().trim().min(1, "L'e-mail est requis.").email(invalidEmail),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  role: z.string().min(1, required),
})

export const userEditSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis.'),
  email: z.string().trim().min(1, "L'e-mail est requis.").email(invalidEmail),
  password: z
    .string()
    .refine((v) => !v || v.length >= 6, {
      message: 'Le mot de passe doit contenir au moins 6 caractères.',
    }),
  role: z.string().min(1, required),
})

export const patientSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z
    .string()
    .refine((v) => !v?.trim() || z.string().email().safeParse(v.trim()).success, {
      message: invalidEmail,
    }),
  phone: z.string().trim().min(1, 'Le téléphone est requis.'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  medicalHistory: z.string().optional(),
})

export const resourceSchema = z.object({
  name: z.string().trim().min(1, 'Le nom de la salle est requis.'),
  priority: z.number().min(1).max(4),
  motifIds: z.array(z.string()).optional(),
})

export const motifSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du motif est requis.'),
  duration: z.coerce.number().min(5, 'La durée minimale est de 5 minutes.').optional(),
  color: z.string().optional(),
  numberOfSessions: z.coerce.number().min(1, 'Minimum 1 séance').optional(),
  isOnlineBookable: z.boolean().optional(),
  requiresPractitionerChoice: z.boolean().optional(),
  pendingTtlHours: z.coerce.number().min(1, 'Minimum 1 heure').optional(),
  practitionerIds: z.array(z.string()).optional(),
})
