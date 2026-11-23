import { getDbPool, testTiDbConnection } from './db.service'
import { testR2Connection } from './storage.service'
import { getRecentAuditLogs } from './audit.service'
import type {
  SystemResourceStats,
  AuditLogListResponse,
  QueryHistoryListResponse,
  QueryHistoryRecord
} from '~/types'
import type { AuditLogsQuery, QueryHistoryQuery } from '../validators/monitoring.validator'

// In-memory query history fallback
const inMemoryQueryHistory: QueryHistoryRecord[] = []

export function recordQueryExecution(record: Omit<QueryHistoryRecord, 'id' | 'executedAt'>): void {
  const item: QueryHistoryRecord = {
    ...record,
    id: `qh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    executedAt: new Date().toISOString()
  }
  inMemoryQueryHistory.unshift(item)
  if (inMemoryQueryHistory.length > 200) {
    inMemoryQueryHistory.pop()
  }
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

export async function getSystemResourceStats(): Promise<SystemResourceStats> {
  const uptimeSeconds = Math.floor(process.uptime())
  const uptimeFormatted = formatUptime(uptimeSeconds)
  const mem = process.memoryUsage()
  const cpu = process.cpuUsage()

  const [tidb, r2] = await Promise.all([
    testTiDbConnection(),
    testR2Connection()
  ])

  let totalProjects = 0
  let totalDatabases = 0
  let totalTables = 0
  let totalFiles = 0
  let totalAuditLogs = 0
  let totalQueriesExecuted = inMemoryQueryHistory.length
  let avgQueryTimeMs = 0

  const pool = getDbPool()
  if (tidb.connected && pool) {
    try {
      const [projRows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM projects')
      totalProjects = Number(projRows[0]?.count || 0)

      const [dbRows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM project_databases')
      totalDatabases = Number(dbRows[0]?.count || 0)

      const [tableRows] = await pool.query<any[]>(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys', 'metrics_schema')`
      )
      totalTables = Number(tableRows[0]?.count || 0)

      const [fileRows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM storage_objects')
      totalFiles = Number(fileRows[0]?.count || 0)

      const [auditRows] = await pool.query<any[]>('SELECT COUNT(*) as count FROM audit_logs')
      totalAuditLogs = Number(auditRows[0]?.count || 0)

      const [queryRows] = await pool.query<any[]>(
        'SELECT COUNT(*) as count, COALESCE(AVG(execution_time_ms), 0) as avgTime FROM query_history'
      )
      totalQueriesExecuted = Number(queryRows[0]?.count || inMemoryQueryHistory.length)
      avgQueryTimeMs = Math.round(Number(queryRows[0]?.avgTime || 0))
    } catch {
      // Fallback if metadata tables not yet initialized
    }
  }

  const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024 * 10) / 10
  const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024 * 10) / 10
  const rssMb = Math.round(mem.rss / 1024 / 1024 * 10) / 10
  const heapPercent = heapTotalMb > 0 ? Math.round((heapUsedMb / heapTotalMb) * 100) : 0

  return {
    uptimeSeconds,
    uptimeFormatted,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    memory: {
      heapUsedBytes: mem.heapUsed,
      heapTotalBytes: mem.heapTotal,
      rssBytes: mem.rss,
      heapUsedMb,
      heapTotalMb,
      rssMb,
      heapPercent
    },
    cpuUsage: {
      userMicros: cpu.user,
      systemMicros: cpu.system
    },
    tidb,
    r2,
    counts: {
      totalProjects,
      totalDatabases,
      totalTables,
      totalFiles,
      totalAuditLogs,
      totalQueriesExecuted,
      avgQueryTimeMs
    }
  }
}

export async function getPaginatedAuditLogs(query: AuditLogsQuery): Promise<AuditLogListResponse> {
  const page = query.page || 1
  const pageSize = query.pageSize || 20
  const offset = (page - 1) * pageSize

  const pool = getDbPool()
  if (pool) {
    try {
      const conditions: string[] = []
      const params: any[] = []

      if (query.action) {
        conditions.push('a.action = ?')
        params.push(query.action)
      }
      if (query.targetType) {
        conditions.push('a.target_type = ?')
        params.push(query.targetType)
      }
      if (query.search) {
        conditions.push('(a.action LIKE ? OR a.target_id LIKE ? OR a.metadata LIKE ?)')
        const wildcard = `%${query.search}%`
        params.push(wildcard, wildcard, wildcard)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const [countRows] = await pool.query<any[]>(
        `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`,
        params
      )
      const total = Number(countRows[0]?.total || 0)

      const [rows] = await pool.query<any[]>(
        `SELECT a.id, a.admin_id as adminId, u.username as adminUsername, a.action, a.target_type as targetType,
                a.target_id as targetId, a.metadata, a.ip_address as ipAddress, a.created_at as createdAt
         FROM audit_logs a
         LEFT JOIN admin_users u ON a.admin_id = u.id
         ${whereClause}
         ORDER BY a.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, pageSize, offset]
      )

      const items = rows.map((r) => ({
        ...r,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
        createdAt: new Date(r.createdAt).toISOString()
      }))

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1
      }
    } catch {
      // Fallback to in-memory
    }
  }

  const allLogs = await getRecentAuditLogs(100)
  const filtered = allLogs.filter((l) => {
    if (query.action && l.action !== query.action) return false
    if (query.targetType && l.targetType !== query.targetType) return false
    if (query.search) {
      const s = query.search.toLowerCase()
      const match = l.action.toLowerCase().includes(s) || (l.targetId && l.targetId.toLowerCase().includes(s))
      if (!match) return false
    }
    return true
  })

  const total = filtered.length
  const items = filtered.slice(offset, offset + pageSize)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1
  }
}

export async function getPaginatedQueryHistory(query: QueryHistoryQuery): Promise<QueryHistoryListResponse> {
  const page = query.page || 1
  const pageSize = query.pageSize || 20
  const offset = (page - 1) * pageSize

  const pool = getDbPool()
  if (pool) {
    try {
      const conditions: string[] = []
      const params: any[] = []

      if (query.databaseName) {
        conditions.push('database_name = ?')
        params.push(query.databaseName)
      }
      if (query.status) {
        conditions.push('status = ?')
        params.push(query.status)
      }
      if (query.queryType) {
        conditions.push('query_type = ?')
        params.push(query.queryType)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const [countRows] = await pool.query<any[]>(
        `SELECT COUNT(*) as total FROM query_history ${whereClause}`,
        params
      )
      const total = Number(countRows[0]?.total || 0)

      const [rows] = await pool.query<any[]>(
        `SELECT id, database_name as databaseName, query_type as queryType,
                execution_time_ms as executionTimeMs, status, executed_at as executedAt
         FROM query_history
         ${whereClause}
         ORDER BY executed_at DESC
         LIMIT ? OFFSET ?`,
        [...params, pageSize, offset]
      )

      const items: QueryHistoryRecord[] = rows.map((r) => ({
        id: r.id,
        databaseName: r.databaseName,
        query: r.queryType,
        queryType: r.queryType,
        executionTimeMs: r.executionTimeMs,
        status: r.status,
        executedAt: new Date(r.executedAt).toISOString()
      }))

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1
      }
    } catch {
      // Fallback to in-memory
    }
  }

  const filtered = inMemoryQueryHistory.filter((q) => {
    if (query.databaseName && q.databaseName !== query.databaseName) return false
    if (query.status && q.status !== query.status) return false
    if (query.queryType && q.queryType !== query.queryType) return false
    return true
  })

  const total = filtered.length
  const items = filtered.slice(offset, offset + pageSize)

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1
  }
}
