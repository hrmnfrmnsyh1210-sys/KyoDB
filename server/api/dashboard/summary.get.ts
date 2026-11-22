import { getDbPool } from '../../services/db.service'
import { testTiDbConnection } from '../../services/db.service'
import { testR2Connection } from '../../services/storage.service'
import { getRecentAuditLogs } from '../../services/audit.service'
import type { DashboardSummary } from '~/types'

export default defineEventHandler(async (): Promise<DashboardSummary> => {
  const [tidbHealth, r2Health] = await Promise.all([
    testTiDbConnection(),
    testR2Connection()
  ])

  let totalProjects: number | null = null
  let totalDatabases: number | null = null
  let totalTables: number | null = null
  let totalFiles: number | null = null
  let r2StoredBytes: number | null = null

  const pool = getDbPool()

  if (tidbHealth.connected && pool) {
    try {
      // Real counts from TiDB metadata tables
      const [projRows] = await pool.query<any[]>(
        'SELECT COUNT(*) as count FROM projects'
      )
      totalProjects = Number(projRows[0]?.count || 0)

      const [dbRows] = await pool.query<any[]>(
        'SELECT COUNT(*) as count FROM project_databases'
      )
      totalDatabases = Number(dbRows[0]?.count || 0)

      // Total tables across user databases via information_schema
      const [tableRows] = await pool.query<any[]>(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys', 'metrics_schema')`
      )
      totalTables = Number(tableRows[0]?.count || 0)

      const [storageRows] = await pool.query<any[]>(
        'SELECT COUNT(*) as count, COALESCE(SUM(size_bytes), 0) as totalBytes FROM storage_objects'
      )
      totalFiles = Number(storageRows[0]?.count || 0)
      r2StoredBytes = Number(storageRows[0]?.totalBytes || 0)
    } catch {
      // If tables haven't been migrated yet, leave as null to indicate not available
      totalProjects = 0
      totalDatabases = 0
      totalTables = null
      totalFiles = 0
      r2StoredBytes = null
    }
  }

  const recentActivities = await getRecentAuditLogs(8)

  return {
    totalProjects,
    totalDatabases,
    totalTables,
    totalFiles,
    r2StoredBytes,
    tidbStatus: tidbHealth.connected
      ? 'connected'
      : tidbHealth.statusText === 'Not Configured'
      ? 'not_configured'
      : 'disconnected',
    r2Status: r2Health.connected
      ? 'connected'
      : r2Health.statusText === 'Not Configured'
      ? 'not_configured'
      : 'disconnected',
    recentActivities
  }
})
