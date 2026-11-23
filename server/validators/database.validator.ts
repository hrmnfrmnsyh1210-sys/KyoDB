import { z } from 'zod'
import { RESERVED_DATABASES, isReservedDatabase } from './project.validator'

export const SAFE_SQL_IDENTIFIER_REGEX = /^[a-zA-Z0-9_]{1,64}$/

export function validateSqlIdentifier(name: string, type = 'Identifier'): string {
  const trimmed = name?.trim() || ''
  if (!SAFE_SQL_IDENTIFIER_REGEX.test(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${type} "${trimmed}" is invalid. Only alphanumeric characters and underscores are allowed (1-64 characters).`
    })
  }
  return trimmed
}

export function isDestructiveOrWriteQuery(sql: string): boolean {
  // Strip comments and strings to prevent bypass
  const cleanSql = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '')
    .replace(/#.*$/gm, '')
    .trim()

  const writePatterns = [
    /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|REPLACE|RENAME|GRANT|REVOKE)\b/i,
    /\b(SET|CALL|FLUSH|KILL|SHUTDOWN|LOCK|UNLOCK)\b/i
  ]

  return writePatterns.some((pattern) => pattern.test(cleanSql))
}

export const createDatabaseSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Database name is required')
      .max(64, 'Database name cannot exceed 64 characters')
      .regex(SAFE_SQL_IDENTIFIER_REGEX, 'Only alphanumeric characters and underscores are allowed'),
    charset: z.string().default('utf8mb4'),
    collation: z.string().default('utf8mb4_unicode_ci')
  })
  .superRefine((data, ctx) => {
    if (isReservedDatabase(data.name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: `"${data.name}" is a protected system database and cannot be created`
      })
    }
  })

export const columnDefinitionSchema = z.object({
  name: z.string().trim().regex(SAFE_SQL_IDENTIFIER_REGEX, 'Column name must be alphanumeric'),
  type: z.string().trim().toUpperCase(),
  length: z.union([z.string(), z.number()]).optional(),
  nullable: z.boolean().default(true),
  primaryKey: z.boolean().default(false),
  autoIncrement: z.boolean().default(false),
  defaultValue: z.string().nullable().optional()
})

export const createTableSchema = z.object({
  tableName: z
    .string()
    .trim()
    .min(1, 'Table name is required')
    .max(64, 'Table name cannot exceed 64 characters')
    .regex(SAFE_SQL_IDENTIFIER_REGEX, 'Only alphanumeric characters and underscores are allowed'),
  columns: z.array(columnDefinitionSchema).min(1, 'At least one column is required'),
  comment: z.string().max(255).optional()
})

export const executeSqlSchema = z.object({
  database: z
    .string()
    .trim()
    .min(1, 'Database name is required')
    .max(64)
    .regex(SAFE_SQL_IDENTIFIER_REGEX, 'Invalid database name'),
  sql: z.string().trim().min(1, 'SQL query cannot be empty').max(50000, 'Query exceeds 50KB limit'),
  readOnly: z.boolean().default(false)
})

export const tableDataQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(250).default(50),
  sortColumn: z.string().regex(SAFE_SQL_IDENTIFIER_REGEX).optional(),
  sortDirection: z.enum(['ASC', 'DESC']).default('ASC'),
  filterColumn: z.string().regex(SAFE_SQL_IDENTIFIER_REGEX).optional(),
  filterValue: z.string().optional()
})

export const insertRowSchema = z.object({
  data: z.record(z.any())
})

export const updateRowSchema = z.object({
  primaryKey: z.string().regex(SAFE_SQL_IDENTIFIER_REGEX),
  primaryKeyValue: z.any(),
  data: z.record(z.any())
})

export const deleteRowSchema = z.object({
  primaryKey: z.string().regex(SAFE_SQL_IDENTIFIER_REGEX),
  primaryKeyValue: z.any()
})

export type CreateDatabaseInput = z.infer<typeof createDatabaseSchema>
export type CreateTableInput = z.infer<typeof createTableSchema>
export type ExecuteSqlInput = z.infer<typeof executeSqlSchema>
export type TableDataQueryInput = z.infer<typeof tableDataQuerySchema>
