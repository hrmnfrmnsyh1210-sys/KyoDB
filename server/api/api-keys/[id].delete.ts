import { deleteApiKey } from '../../services/apikey.service'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'API Key ID is required' })
  }

  const user = event.context.user
  const ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'

  await deleteApiKey(id, user?.id, ip)

  return {
    success: true,
    message: 'API Key deleted successfully'
  }
})
