import { listDatabasesWithStats } from '../../services/database.service'

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id || event.context.admin?.id
  const databases = await listDatabasesWithStats(userId)
  return {
    success: true,
    data: databases
  }
})
