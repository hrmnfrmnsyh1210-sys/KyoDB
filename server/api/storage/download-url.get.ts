import { createPresignedDownloadUrl } from '../../services/storage.service'
import { validateSafeKeyPath } from '../../validators/storage.validator'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const key = typeof query.key === 'string' ? query.key : ''

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Storage key is required'
    })
  }

  validateSafeKeyPath(key)

  const downloadUrl = await createPresignedDownloadUrl(key, 600)

  return {
    success: true,
    data: {
      downloadUrl,
      key
    }
  }
})
