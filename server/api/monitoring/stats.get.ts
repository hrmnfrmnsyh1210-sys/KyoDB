import { getSystemResourceStats } from '../../services/monitoring.service'

export default defineEventHandler(async (event) => {
  const stats = await getSystemResourceStats()
  return {
    success: true,
    data: stats
  }
})
