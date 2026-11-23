export interface TrendPoint {
  label: string
  date: string
  value: number
}

export interface BreakdownItem {
  label: string
  value: number
  bytes: number
  color: string
}

export interface QueryStat {
  total: number
  success: number
  failed: number
  avgExecutionMs: number
}

export interface DashboardAnalytics {
  activityTrend: TrendPoint[]
  storageBreakdown: BreakdownItem[]
  queryStats: QueryStat
  queryTrend: TrendPoint[]
}
