import { deleteProject } from '../../services/project.service'

export default defineEventHandler(async (event) => {
  if (!event.context.admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Admin session required.'
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID required' })
  }

  const query = getQuery(event)
  const dropDatabases = query.dropDatabases === 'true' || query.dropDatabases === '1'

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await deleteProject(
    id,
    { dropDatabases },
    event.context.admin.id,
    clientIp
  )

  return result
})
