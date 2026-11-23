import { createApiKey } from '../../services/apikey.service'
import { createApiKeySchema } from '../../validators/apikey.validator'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = createApiKeySchema.parse(body)
  const user = event.context.user
  const ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'

  const result = await createApiKey(parsed, user?.id, ip)

  return {
    success: true,
    data: result
  }
})
