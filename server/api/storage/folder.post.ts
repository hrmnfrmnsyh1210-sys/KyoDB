import { createFolder } from '../../services/storage.service'
import { createFolderSchema } from '../../validators/storage.validator'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = createFolderSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || 'Invalid folder parameters'
    })
  }

  const ipAddress = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const adminId = event.context.admin?.id

  const result = await createFolder({
    ...validation.data,
    adminId,
    ipAddress
  })

  return {
    success: true,
    data: result
  }
})
