import { listApiKeys } from '../../services/apikey.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = query.projectId ? String(query.projectId) : undefined
  const items = await listApiKeys(projectId)

  return {
    success: true,
    data: items
  }
})
