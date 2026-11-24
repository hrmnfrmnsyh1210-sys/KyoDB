import { deleteRowSchema } from '../../../../../validators/database.validator'
import { deleteTableRow } from '../../../../../services/database.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const databaseName = getRouterParam(event, 'name')
  const tableName = getRouterParam(event, 'table')

  if (!databaseName || !tableName) {
    throw createError({ statusCode: 400, statusMessage: 'Database and table names required' })
  }

  const body = await readBody(event)
  const validation = deleteRowSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid delete parameters'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await deleteTableRow(
    databaseName,
    tableName,
    validation.data.primaryKey,
    validation.data.primaryKeyValue,
    user.id,
    clientIp,
    user.id
  )

  return result
})
