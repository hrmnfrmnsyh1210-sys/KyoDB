import { getPaginatedQueryHistory } from '../../services/monitoring.service'
import { queryHistoryQuerySchema } from '../../validators/monitoring.validator'

export default defineEventHandler(async (event) => {
  const rawQuery = getQuery(event)
  const parsed = queryHistoryQuerySchema.parse(rawQuery)
  const result = await getPaginatedQueryHistory(parsed)

  return {
    success: true,
    data: result
  }
})
