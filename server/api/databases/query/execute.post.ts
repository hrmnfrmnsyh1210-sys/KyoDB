import { executeSqlSchema } from '../../../validators/database.validator'
import { executeRawSql } from '../../../services/database.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = executeSqlSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid query parameters'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await executeRawSql(
    validation.data.database,
    validation.data.sql,
    validation.data.readOnly,
    user.id,
    clientIp,
    user.id
  )

  return {
    success: result.status === 'success',
    data: result
  }
})
