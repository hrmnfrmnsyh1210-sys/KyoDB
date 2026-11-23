import { deleteDatabase } from '../../../services/database.service'

export default defineEventHandler(async (event) => {
  if (!event.context.admin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Database name is required' })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await deleteDatabase(
    name,
    event.context.admin.id,
    clientIp
  )

  return result
})
