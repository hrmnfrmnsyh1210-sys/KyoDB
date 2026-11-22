export interface AdminUser {
  id: string
  username: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminSession {
  id: string
  userId: string
  tokenHash: string
  ipAddress?: string | null
  userAgent?: string | null
  expiresAt: string
  createdAt: string
}

export interface ConnectionHealth {
  connected: boolean
  service: 'tidb' | 'r2'
  statusText: string
  latencyMs?: number
  version?: string
  details?: Record<string, any>
  error?: string
  lastChecked: string
}

export interface SystemHealthSummary {
  tidb: ConnectionHealth
  r2: ConnectionHealth
  system: {
    nodeVersion: string
    platform: string
    uptimeSeconds: number
    environment: string
  }
}

export interface DashboardSummary {
  totalProjects: number | null
  totalDatabases: number | null
  totalTables: number | null
  totalFiles: number | null
  r2StoredBytes: number | null
  tidbStatus: 'connected' | 'disconnected' | 'not_configured'
  r2Status: 'connected' | 'disconnected' | 'not_configured'
  recentActivities: AuditLogEntry[]
}

export interface AuditLogEntry {
  id: string
  adminId?: string | null
  adminUsername?: string | null
  action: string
  targetType: string
  targetId?: string | null
  metadata?: Record<string, any> | null
  ipAddress?: string | null
  createdAt: string
}
