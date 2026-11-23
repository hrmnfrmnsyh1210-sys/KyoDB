import { listDatabasesWithStats } from '../../services/database.service'

export default defineEventHandler(async () => {
  const databases = await listDatabasesWithStats()
  return {
    success: true,
    data: databases
  }
})
