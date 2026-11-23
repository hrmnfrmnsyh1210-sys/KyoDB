import { preparePresignedUpload } from '../../services/storage.service'
import { presignedUploadSchema } from '../../validators/storage.validator'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = presignedUploadSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || 'Invalid upload parameters'
    })
  }

  const result = await preparePresignedUpload(validation.data)

  return {
    success: true,
    data: result
  }
})
