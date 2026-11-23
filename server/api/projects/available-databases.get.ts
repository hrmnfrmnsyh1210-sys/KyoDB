import { getAvailableClusterDatabases } from '../../services/project.service'

export default defineEventHandler(async (event) => {
  const databases = await getAvailableClusterDatabases()
  return {
    success: true,
    data: databases
  }
})
