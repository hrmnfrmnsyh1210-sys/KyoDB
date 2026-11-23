import { listStorageObjects } from '../../services/storage.service'
import { listStorageSchema } from '../../validators/storage.validator'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const parsed = listStorageSchema.safeParse({
    prefix: query.prefix || '',
    projectId: query.projectId || undefined,
    search: query.search || undefined,
    category: query.category || 'all'
  })

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid storage query parameters: ' + parsed.error.issues[0]?.message
    })
  }

  const result = await listStorageObjects(parsed.data)

  return {
    success: true,
    data: result
  }
})
