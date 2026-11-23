import { getQueryHistory } from '../../../services/database.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  const database = typeof query.database === 'string' ? query.database : undefined

  const history = await getQueryHistory(limit, database)
  return {
    success: true,
    data: history
  }
})
