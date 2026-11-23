import { z } from 'zod'

export const validPermissions = [
  'databases:read',
  'databases:write',
  'storage:read',
  'storage:write',
  'queries:execute',
  'projects:read'
] as const

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(128, 'Key name too long').trim(),
  projectId: z.string().min(1, 'Project ID is required').trim(),
  permissions: z.array(z.string()).min(1, 'At least one permission must be selected'),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional()
})

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
