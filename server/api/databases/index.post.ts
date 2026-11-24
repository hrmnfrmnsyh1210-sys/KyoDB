import { createDatabaseSchema } from '../../validators/database.validator'
import { createDatabase } from '../../services/database.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = createDatabaseSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Validation failed'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await createDatabase(
    validation.data.name,
    validation.data.charset,
    validation.data.collation,
    user.id,
    clientIp,
    user.id
  )

  return result
})
