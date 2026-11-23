import { getProjectByIdOrSlug } from '../../services/project.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Project ID or slug required' })
  }

  const project = await getProjectByIdOrSlug(id)
  return {
    success: true,
    data: project
  }
})
