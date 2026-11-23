import { z } from 'zod'

export const auditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  action: z.string().max(64).optional(),
  targetType: z.string().max(64).optional(),
  search: z.string().max(100).optional()
})

export const queryHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  databaseName: z.string().max(64).optional(),
  status: z.enum(['success', 'error']).optional(),
  queryType: z.string().max(32).optional()
})

export type AuditLogsQuery = z.infer<typeof auditLogsQuerySchema>
export type QueryHistoryQuery = z.infer<typeof queryHistoryQuerySchema>
