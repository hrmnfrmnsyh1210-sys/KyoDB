import { z } from 'zod'

export const testConnectionSchema = z.object({
  host: z.string().min(1, 'TiDB Host is required').max(255),
  port: z.coerce.number().int().min(1).max(65535).default(4000),
  username: z.string().min(1, 'TiDB User is required').max(128),
  password: z.string().max(255).default(''),
  database: z.string().min(1, 'TiDB Database name is required').max(64),
  sslCa: z.string().optional(),
  connectionId: z.string().optional()
})

export const createUserConnectionSchema = z.object({
  name: z.string().min(1, 'Connection name is required').max(128),
  host: z.string().min(1, 'TiDB Host is required').max(255),
  port: z.coerce.number().int().min(1).max(65535).default(4000),
  username: z.string().min(1, 'TiDB User is required').max(128),
  password: z.string().max(255).default(''),
  database: z.string().min(1, 'TiDB Database name is required').max(64),
  sslCa: z.string().optional(),
  isDefault: z.boolean().default(true)
})

export const updateUserConnectionSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  host: z.string().min(1).max(255).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  username: z.string().min(1).max(128).optional(),
  password: z.string().max(255).optional(),
  database: z.string().min(1).max(64).optional(),
  sslCa: z.string().optional(),
  isDefault: z.boolean().optional()
})

export type TestConnectionInput = z.infer<typeof testConnectionSchema>
export type CreateUserConnectionInput = z.infer<typeof createUserConnectionSchema>
export type UpdateUserConnectionInput = z.infer<typeof updateUserConnectionSchema>
