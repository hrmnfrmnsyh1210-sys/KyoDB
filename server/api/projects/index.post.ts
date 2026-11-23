import { createProjectSchema } from '../../validators/project.validator'
import { createProject } from '../../services/project.service'

export default defineEventHandler(async (event) => {
  if (!event.context.admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Admin session required.'
    })
  }

  const body = await readBody(event)
  const validation = createProjectSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Validation failed'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const project = await createProject(
    validation.data,
    event.context.admin.id,
    clientIp
  )

  return {
    success: true,
    data: project
  }
})
