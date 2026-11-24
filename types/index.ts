export interface AdminUser {
  id: string
  username: string
  email: string
  role?: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserDatabaseConnection {
  id: string
  userId: string
  name: string
  host: string
  port: number
  username: string
  database: string
  sslCa?: string | null
  isDefault: boolean
  hasPassword?: boolean
  createdAt: string
  updatedAt: string
}

export interface UserDatabaseConnectionPayload {
  name: string
  host: string
  port?: number
  username: string
  password: string
  database: string
  sslCa?: string
  isDefault?: boolean
}

export interface TestConnectionPayload {
  host: string
  port?: number
  username: string
  password?: string
  database: string
  sslCa?: string
  connectionId?: string
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

export type ProjectStatus = 'active' | 'archived' | 'suspended'

export interface ProjectDatabase {
  id: string
  projectId: string
  databaseName: string
  status: 'connected' | 'disconnected' | 'error'
  createdAt: string
  tablesCount?: number
}

export interface ProjectStorageSummary {
  filesCount: number
  totalBytes: number
}

export interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  databasesCount?: number
  databases?: ProjectDatabase[]
  storage?: ProjectStorageSummary
}

export interface ProjectDetail extends Project {
  databases: ProjectDatabase[]
  storage: ProjectStorageSummary
  recentActivity: AuditLogEntry[]
}

export interface CreateProjectPayload {
  name: string
  slug: string
  description?: string
  status?: ProjectStatus
  databaseOption?: 'none' | 'create_new' | 'attach_existing'
  databaseName?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string | null
  status?: ProjectStatus
}

export interface AvailableDatabase {
  databaseName: string
  isAssociated: boolean
  associatedProjectId?: string | null
  associatedProjectName?: string | null
}

export interface DatabaseSummary {
  name: string
  tablesCount: number
  isSystem: boolean
  charset?: string
  collation?: string
}

export interface TableSummary {
  name: string
  rowCount: number
  dataSize: number
  indexSize: number
  comment?: string
  createdAt?: string
}

export interface TableColumn {
  name: string
  type: string
  nullable: boolean
  key: string
  default: any
  extra: string
  comment?: string
}

export interface TableIndex {
  name: string
  columnName: string
  nonUnique: boolean
  seqInIndex: number
}

export interface TableDetail {
  name: string
  databaseName: string
  columns: TableColumn[]
  indexes: TableIndex[]
  rowCount: number
  dataSizeBytes: number
  engine: string
}

export interface TableRowsResult {
  rows: Record<string, any>[]
  columns: TableColumn[]
  totalRows: number
  page: number
  pageSize: number
  primaryKey?: string | null
}

export interface QueryExecutionResult {
  query: string
  columns: string[]
  rows: Record<string, any>[]
  affectedRows?: number
  executionTimeMs: number
  status: 'success' | 'error'
  error?: string
  readOnly: boolean
}

export interface QueryHistoryRecord {
  id: string
  databaseName: string
  query: string
  queryType: string
  executionTimeMs: number
  status: 'success' | 'error'
  executedAt: string
}

export type StorageItemType = 'file' | 'folder'
export type FileCategory = 'all' | 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'other'

export interface StorageItem {
  id?: string
  key: string
  name: string
  type: StorageItemType
  sizeBytes: number
  mimeType?: string
  category?: FileCategory
  lastModified?: string
  etag?: string
  projectId?: string | null
  projectName?: string | null
  downloadUrl?: string
  previewUrl?: string
}

export interface StorageBreadcrumb {
  name: string
  prefix: string
}

export interface StorageListResponse {
  currentPrefix: string
  breadcrumbs: StorageBreadcrumb[]
  items: StorageItem[]
  totalFiles: number
  totalFolders: number
  totalBytes: number
  bucketName: string
  isConfigured: boolean
}

export interface PresignedUploadRequest {
  filename: string
  contentType?: string
  folder?: string
  projectId?: string | null
  sizeBytes?: number
}

export interface PresignedUploadResponse {
  uploadUrl: string
  objectKey: string
  filename: string
  bucketName: string
  expiresInSeconds: number
}

export interface ConfirmUploadPayload {
  objectKey: string
  filename: string
  mimeType: string
  sizeBytes: number
  projectId?: string | null
  checksum?: string | null
}

export interface CreateFolderPayload {
  folderName: string
  currentPath?: string
  projectId?: string | null
}

export interface DeleteStoragePayload {
  keys: string[]
  projectId?: string | null
}

// ═══════════════════════════════════════════════════════
// Phase 5: Resource Monitoring & Telemetry Types
// ═══════════════════════════════════════════════════════

export interface SystemResourceStats {
  uptimeSeconds: number
  uptimeFormatted: string
  nodeVersion: string
  platform: string
  arch: string
  pid: number
  memory: {
    heapUsedBytes: number
    heapTotalBytes: number
    rssBytes: number
    heapUsedMb: number
    heapTotalMb: number
    rssMb: number
    heapPercent: number
  }
  cpuUsage: {
    userMicros: number
    systemMicros: number
  }
  tidb: ConnectionHealth
  r2: ConnectionHealth
  counts: {
    totalProjects: number
    totalDatabases: number
    totalTables: number
    totalFiles: number
    totalAuditLogs: number
    totalQueriesExecuted: number
    avgQueryTimeMs: number
  }
}

export interface AuditLogListResponse {
  items: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryHistoryListResponse {
  items: QueryHistoryRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ═══════════════════════════════════════════════════════
// Phase 6: API Keys & Security Management Types
// ═══════════════════════════════════════════════════════

export interface ApiKey {
  id: string
  projectId: string
  projectName?: string
  name: string
  keyPrefix: string
  permissions: string[]
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
  isRevoked: boolean
  isExpired: boolean
}

export interface CreateApiKeyPayload {
  name: string
  projectId: string
  permissions: string[]
  expiresInDays?: number | null
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey
  plainKey: string
}
