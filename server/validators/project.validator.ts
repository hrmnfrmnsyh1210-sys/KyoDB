import { z } from 'zod'

export const RESERVED_DATABASES = [
  'kyodb_system',
  'mysql',
  'information_schema',
  'performance_schema',
  'sys',
  'metrics_schema'
] as const

export function isReservedDatabase(name: string): boolean {
  return RESERVED_DATABASES.includes(name.toLowerCase() as any)
}

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(128, 'Project name cannot exceed 128 characters'),
    slug: z
      .string()
      .trim()
      .min(2, 'Slug must be at least 2 characters')
      .max(64, 'Slug cannot exceed 64 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must consist of lowercase letters, numbers, and single hyphens (e.g. my-ecommerce-app)'),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').nullable().optional(),
    status: z.enum(['active', 'archived', 'suspended']).default('active'),
    databaseOption: z.enum(['none', 'create_new', 'attach_existing']).default('none'),
    databaseName: z.string().trim().optional().nullable()
  })
  .superRefine((data, ctx) => {
    if (data.databaseOption === 'create_new' || data.databaseOption === 'attach_existing') {
      if (!data.databaseName || data.databaseName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['databaseName'],
          message: 'Database name is required when creating or attaching a database'
        })
        return
      }

      const dbClean = data.databaseName.trim()
      if (!/^[a-zA-Z0-9_]{1,64}$/.test(dbClean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['databaseName'],
          message: 'Database name can only contain letters, numbers, and underscores (max 64 characters)'
        })
        return
      }

      if (isReservedDatabase(dbClean)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['databaseName'],
          message: `"${dbClean}" is a protected system database and cannot be used for project association`
        })
      }
    }
  })

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(128).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(['active', 'archived', 'suspended']).optional()
})

export const attachDatabaseSchema = z
  .object({
    databaseName: z
      .string()
      .trim()
      .min(1, 'Database name is required')
      .max(64, 'Database name cannot exceed 64 characters')
      .regex(/^[a-zA-Z0-9_]{1,64}$/, 'Database name can only contain alphanumeric characters and underscores'),
    createNew: z.boolean().default(false)
  })
  .superRefine((data, ctx) => {
    if (isReservedDatabase(data.databaseName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['databaseName'],
        message: `"${data.databaseName}" is a protected system database and cannot be attached to a project`
      })
    }
  })

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type AttachDatabaseInput = z.infer<typeof attachDatabaseSchema>
