import { updateUserConnectionSchema } from '../../validators/user-db.validator'
import { updateUserConnection } from '../../services/user-db.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Connection ID required' })
  }

  const body = await readBody(event)
  const validation = updateUserConnectionSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid update data'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const connection = await updateUserConnection(user.id, id, validation.data, clientIp)

  return {
    success: true,
    data: connection
  }
})
