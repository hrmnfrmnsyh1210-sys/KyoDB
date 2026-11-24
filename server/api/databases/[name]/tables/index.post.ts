import { createTableSchema } from '../../../../validators/database.validator'
import { createTable } from '../../../../services/database.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const databaseName = getRouterParam(event, 'name')
  if (!databaseName) {
    throw createError({ statusCode: 400, statusMessage: 'Database name is required' })
  }

  const body = await readBody(event)
  const validation = createTableSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Validation failed'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await createTable(
    databaseName,
    validation.data,
    user.id,
    clientIp,
    user.id
  )

  return result
})
