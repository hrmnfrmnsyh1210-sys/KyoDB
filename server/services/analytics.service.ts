import { getDbPool } from './db.service'
import type {
  BreakdownItem,
  DashboardAnalytics,
  QueryStat,
  TrendPoint
} from '~/types/analytics'

const CATEGORY_COLORS: Record<string, string> = {
  image: '#e8882a',
  video: '#f9a84a',
  audio: '#d69a5c',
  document: '#8b6f4e',
  code: '#c47d3a',
  archive: '#6a5545',
  other: '#9a8070'
}

const EMPTY_TREND_DAYS = 7

function lastNDays(n = EMPTY_TREND_DAYS): TrendPoint[] {
  const result: TrendPoint[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({
      date: key,
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d),
      value: 0
    })
  }
  return result
}

function categoryFromMime(mime: string): string {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('text/') || mime.includes('json') || mime.includes('javascript')) return 'code'
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('sheet') || mime.includes('text')) return 'document'
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('tar') || mime.includes('gzip')) return 'archive'
  return 'other'
}

const emptyAnalytics = (): DashboardAnalytics => ({
  activityTrend: lastNDays(),
  storageBreakdown: [],
  queryStats: { total: 0, success: 0, failed: 0, avgExecutionMs: 0 },
  queryTrend: lastNDays()
})

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const pool = getDbPool()
  if (!pool) return emptyAnalytics()

  const activityTrend = lastNDays()
  const queryTrend = lastNDays()
  const activityIndex = new Map(activityTrend.map((p, i) => [p.date, i]))
  const queryIndex = new Map(queryTrend.map((p, i) => [p.date, i]))
  const storageMap = new Map<string, { files: number; bytes: number }>()
  const queryStats: QueryStat = { total: 0, success: 0, failed: 0, avgExecutionMs: 0 }

  try {
    const [activityRows] = await pool.query<any[]>(
      `SELECT DATE(created_at) AS day, COUNT(*) AS total
       FROM audit_logs
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at)`
    )
    for (const row of activityRows) {
      const key = new Date(row.day).toISOString().slice(0, 10)
      const idx = activityIndex.get(key)
      if (idx !== undefined) activityTrend[idx].value = Number(row.total)
    }
  } catch { /* table may not be migrated yet */ }

  try {
    const [storageRows] = await pool.query<any[]>(
      `SELECT mime_type, COUNT(*) AS total, COALESCE(SUM(size_bytes), 0) AS bytes
       FROM storage_objects
       GROUP BY mime_type`
    )
    for (const row of storageRows) {
      const cat = categoryFromMime(String(row.mime_type || ''))
      const current = storageMap.get(cat) || { files: 0, bytes: 0 }
      current.files += Number(row.total)
      current.bytes += Number(row.bytes)
      storageMap.set(cat, current)
    }
  } catch { /* table may not be migrated yet */ }

  try {
    const [queryRows] = await pool.query<any[]>(
      `SELECT status, execution_time_ms, DATE(executed_at) AS day
       FROM query_history
       WHERE executed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`
    )
    let totalMs = 0
    for (const row of queryRows) {
      queryStats.total++
      if (row.status === 'success') queryStats.success++
      else queryStats.failed++
      totalMs += Number(row.execution_time_ms || 0)
      const key = new Date(row.day).toISOString().slice(0, 10)
      const idx = queryIndex.get(key)
      if (idx !== undefined) queryTrend[idx].value++
    }
    queryStats.avgExecutionMs = queryStats.total
      ? Math.round(totalMs / queryStats.total)
      : 0
  } catch { /* table may not be migrated yet */ }

  const storageBreakdown: BreakdownItem[] = [...storageMap.entries()]
    .map(([label, data]) => ({
      label,
      value: data.files,
      bytes: data.bytes,
      color: CATEGORY_COLORS[label] || CATEGORY_COLORS.other
    }))
    .sort((a, b) => b.value - a.value)

  return { activityTrend, storageBreakdown, queryStats, queryTrend }
}
