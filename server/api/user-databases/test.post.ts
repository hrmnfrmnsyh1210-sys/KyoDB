import { testConnectionSchema } from '../../validators/user-db.validator'
import { testTiDbCredentials } from '../../services/user-db.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = testConnectionSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid connection parameters'
    })
  }

  const health = await testTiDbCredentials(validation.data)
  return {
    success: health.connected,
    data: health
  }
})
