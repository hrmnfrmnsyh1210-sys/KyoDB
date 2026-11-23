import { deleteStorageItems } from '../../services/storage.service'
import { deleteStorageSchema } from '../../validators/storage.validator'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = deleteStorageSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || 'Invalid delete parameters'
    })
  }

  const ipAddress = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const adminId = event.context.admin?.id

  const result = await deleteStorageItems({
    keys: validation.data.keys,
    projectId: validation.data.projectId,
    adminId,
    ipAddress
  })

  return {
    success: true,
    data: result
  }
})
