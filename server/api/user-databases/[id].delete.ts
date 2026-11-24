import { deleteUserConnection } from '../../services/user-db.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Connection ID required' })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  await deleteUserConnection(user.id, id, clientIp)

  return {
    success: true,
    message: 'TiDB connection deleted successfully.'
  }
})
