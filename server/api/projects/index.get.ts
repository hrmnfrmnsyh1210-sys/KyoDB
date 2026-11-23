import { listProjects } from '../../services/project.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search : undefined
  const status = typeof query.status === 'string' ? query.status : undefined

  const projects = await listProjects({ search, status })
  return {
    success: true,
    data: projects
  }
})
