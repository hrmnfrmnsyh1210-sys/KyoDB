import { tableDataQuerySchema } from '../../../../../validators/database.validator'
import { getTableData } from '../../../../../services/database.service'

export default defineEventHandler(async (event) => {
  const databaseName = getRouterParam(event, 'name')
  const tableName = getRouterParam(event, 'table')

  if (!databaseName || !tableName) {
    throw createError({ statusCode: 400, statusMessage: 'Database and table names required' })
  }

  const query = getQuery(event)
  const validation = tableDataQuerySchema.safeParse(query)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid query parameters'
    })
  }

  const userId = event.context.user?.id || event.context.admin?.id
  const result = await getTableData(databaseName, tableName, validation.data, userId)
  return {
    success: true,
    data: result
  }
})
