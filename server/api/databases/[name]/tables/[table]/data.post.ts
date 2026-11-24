import { insertRowSchema } from '../../../../../validators/database.validator'
import { insertTableRow } from '../../../../../services/database.service'

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
  const validation = insertRowSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid row data'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await insertTableRow(
    databaseName,
    tableName,
    validation.data.data,
    user.id,
    clientIp,
    user.id
  )

  return result
})
