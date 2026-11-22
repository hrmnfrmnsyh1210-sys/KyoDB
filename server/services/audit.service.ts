import { getDbPool } from './db.service'
import { generateUUID } from '../utils/crypto'
import type { AuditLogEntry } from '~/types'

// In-memory audit fallback when DB is not yet connected
const inMemoryAuditLogs: AuditLogEntry[] = []

export async function logAudit(params: {
  adminId?: string | null
  action: string
  targetType: string
  targetId?: string | null
  metadata?: Record<string, any> | null
  ipAddress?: string | null
}): Promise<void> {
  const entry: AuditLogEntry = {
    id: generateUUID(),
    adminId: params.adminId || null,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId || null,
    metadata: params.metadata || null,
    ipAddress: params.ipAddress || null,
    createdAt: new Date().toISOString()
  }

  // Prepend to in-memory fallback log (keep up to 100)
  inMemoryAuditLogs.unshift(entry)
  if (inMemoryAuditLogs.length > 100) {
    inMemoryAuditLogs.pop()
  }

  // Persist to TiDB if available
  const pool = getDbPool()
  if (pool) {
    try {
      await pool.execute(
        `INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          entry.id,
          entry.adminId,
          entry.action,
          entry.targetType,
          entry.targetId,
          entry.metadata ? JSON.stringify(entry.metadata) : null,
          entry.ipAddress
        ]
      )
    } catch (err) {
      // Safe logging failure fallback
      console.warn('[AuditLog] Failed to persist to TiDB:', err)
    }
  }
}

export async function getRecentAuditLogs(limit = 10): Promise<AuditLogEntry[]> {
  const pool = getDbPool()
  if (pool) {
    try {
      const [rows] = await pool.query<any[]>(
        `SELECT a.id, a.admin_id as adminId, u.username as adminUsername, a.action, a.target_type as targetType,
                a.target_id as targetId, a.metadata, a.ip_address as ipAddress, a.created_at as createdAt
         FROM audit_logs a
         LEFT JOIN admin_users u ON a.admin_id = u.id
         ORDER BY a.created_at DESC
         LIMIT ?`,
        [limit]
      )
      return rows.map((r) => ({
        ...r,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
        createdAt: new Date(r.createdAt).toISOString()
      }))
    } catch {
      // Return in-memory fallback if table not yet migrated
      return inMemoryAuditLogs.slice(0, limit)
    }
  }

  return inMemoryAuditLogs.slice(0, limit)
}
