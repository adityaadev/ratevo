import { z } from 'zod'

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100),
  category: z.string().min(1, 'Category is required').max(50),
  address: z.string().min(1, 'Address is required').max(200),
  phone: z.string().max(30).optional().nullable(),
  google_review_url: z.string().min(1, 'Google Review URL is required').url('Invalid URL'),
})

export const updateBusinessSchema = createBusinessSchema.partial()

export const startReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  selected_feedback: z.array(z.string()).optional(),
  customer_text: z.string().max(500).optional(),
})

export const generateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  selected_feedback: z.array(z.string()).optional(),
  customer_text: z.string().max(500).optional(),
})

export const trackEventSchema = z.object({
  business_id: z.string().uuid(),
  session_id: z.string().uuid(),
  event_type: z.enum(['qr_scan', 'rating_submitted', 'feedback_submitted', 'review_generated', 'google_review_clicked']),
  rating: z.number().int().min(1).max(5).optional(),
  metadata: z.record(z.any()).optional(),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const createOrderSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  plan_id: z.enum(['monthly', 'yearly'], { errorMap: () => ({ message: 'Plan must be monthly or yearly' }) }),
})