import { getPaginatedAuditLogs } from '../../services/monitoring.service'
import { auditLogsQuerySchema } from '../../validators/monitoring.validator'

export default defineEventHandler(async (event) => {
  const rawQuery = getQuery(event)
  const parsed = auditLogsQuerySchema.parse(rawQuery)
  const result = await getPaginatedAuditLogs(parsed)

  return {
    success: true,
    data: result
  }
})
