import { getDashboardAnalytics } from '../../services/analytics.service'
import type { DashboardAnalytics } from '~/types/analytics'

export default defineEventHandler(async (): Promise<DashboardAnalytics> => {
  return getDashboardAnalytics()
})
