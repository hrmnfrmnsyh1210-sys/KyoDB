import { dropTable } from '../../../../../services/database.service'

export default defineEventHandler(async (event) => {
  if (!event.context.admin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const databaseName = getRouterParam(event, 'name')
  const tableName = getRouterParam(event, 'table')

  if (!databaseName || !tableName) {
    throw createError({ statusCode: 400, statusMessage: 'Database and table names are required' })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await dropTable(
    databaseName,
    tableName,
    event.context.admin.id,
    clientIp
  )

  return result
})
