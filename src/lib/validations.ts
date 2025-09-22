import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

// Post schemas
export const createPostSchema = z.object({
  title: z.string().min(1, 'Judul tidak boleh kosong').max(100, 'Judul maksimal 100 karakter'),
  content: z.string().min(1, 'Konten tidak boleh kosong'),
  published: z.boolean().default(false),
})

export const updatePostSchema = createPostSchema.partial()

// User schemas
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  email: z.string().email('Email tidak valid').optional(),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>