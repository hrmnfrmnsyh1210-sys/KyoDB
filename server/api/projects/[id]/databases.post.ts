import { attachDatabaseSchema } from '../../../validators/project.validator'
import { attachDatabaseToProject } from '../../../services/project.service'

export default defineEventHandler(async (event) => {
  if (!event.context.admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Admin session required.'
    })
  }

  const projectId = getRouterParam(event, 'id')
  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID required' })
  }

  const body = await readBody(event)
  const validation = attachDatabaseSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Validation failed'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const attached = await attachDatabaseToProject(
    projectId,
    validation.data,
    event.context.admin.id,
    clientIp
  )

  return {
    success: true,
    data: attached
  }
})
