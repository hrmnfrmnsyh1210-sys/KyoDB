import { detachDatabaseFromProject } from '../../../../services/project.service'

export default defineEventHandler(async (event) => {
  if (!event.context.admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Admin session required.'
    })
  }

  const projectId = getRouterParam(event, 'id')
  const databaseName = getRouterParam(event, 'name')

  if (!projectId || !databaseName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID and database name required'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const result = await detachDatabaseFromProject(
    projectId,
    databaseName,
    event.context.admin.id,
    clientIp
  )

  return result
})
