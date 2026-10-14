import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('auth.invalidEmail'),
  password: z.string().min(6, 'auth.passwordMin'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'common.required'),
  email: z.string().email('auth.invalidEmail'),
  password: z.string().min(6, 'auth.passwordMin'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('auth.invalidEmail'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'auth.passwordMin'),
})

export const jobSchema = z.object({
  title: z.string().min(5, 'common.required'),
  description: z.string().min(10, 'common.required'),
  category_id: z.string().uuid('common.required'),
  city: z.string().min(2, 'common.required'),
  district: z.string().optional(),
  price: z.coerce.number().positive('common.required'),
  price_type: z.enum(['fixed', 'negotiable', 'per_day']),
  workers_needed: z.coerce.number().int().min(1).default(1),
  date_needed: z.string().optional(),
})

export const applicationSchema = z.object({
  message: z.string().min(5, 'common.required'),
  proposed_price: z.coerce.number().positive('common.required'),
})

export const workerAdSchema = z.object({
  title: z.string().min(5, 'common.required'),
  description: z.string().min(10, 'common.required'),
  category_id: z.string().uuid('common.required'),
  city: z.string().min(2, 'common.required'),
  district: z.string().optional(),
  price: z.coerce.number().nonnegative().default(0),
  price_type: z.enum(['per_hour', 'per_day', 'fixed', 'negotiable']),
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'common.required'),
  phone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  bio: z.string().optional(),
  hourly_rate: z.coerce.number().nonnegative().optional(),
})
