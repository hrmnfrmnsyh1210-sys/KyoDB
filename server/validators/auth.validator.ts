import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Username or email is required').max(191),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const bootstrapAdminSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(64).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and dashes'),
  email: z.string().email('Invalid email address').max(191),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export type LoginInput = z.infer<typeof loginSchema>
export type BootstrapAdminInput = z.infer<typeof bootstrapAdminSchema>
