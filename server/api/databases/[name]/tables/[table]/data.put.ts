import { updateRowSchema } from '../../../../../validators/database.validator'
import { updateTableRow } from '../../../../../services/database.service'

export default defineEventHandler(async (event) => {
  if (!event.context.admin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const databaseName = getRouterParam(event, 'name')
  const tableName = getRouterParam(event, 'table')

  if (!databaseName || !tableName) {
    throw createError({ statusCode: 400, statusMessage: 'Database and table names required' })
  }

  const body = await readBody(event)
  const validation = updateRowSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid update parameters'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await updateTableRow(
    databaseName,
    tableName,
    validation.data.primaryKey,
    validation.data.primaryKeyValue,
    validation.data.data,
    event.context.admin.id,
    clientIp
  )

  return result
})
