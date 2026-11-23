import { recordStorageObject } from '../../services/storage.service'
import { confirmUploadSchema } from '../../validators/storage.validator'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = confirmUploadSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || 'Invalid upload confirmation parameters'
    })
  }

  const ipAddress = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const adminId = event.context.admin?.id

  const item = await recordStorageObject({
    ...validation.data,
    adminId,
    ipAddress
  })

  return {
    success: true,
    data: item
  }
})
