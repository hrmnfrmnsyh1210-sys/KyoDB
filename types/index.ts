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
  description?: string | null
  status?: ProjectStatus
  databaseOption?: 'none' | 'create_new' | 'attach_existing'
  databaseName?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string | null
  status?: ProjectStatus
}

export interface AttachDatabasePayload {
  databaseName: string
  createNew?: boolean
}

export interface AvailableDatabase {
  databaseName: string
  isAssociated: boolean
  associatedProjectId?: string | null
  associatedProjectName?: string | null
}

export interface DatabaseInfo {
  name: string
  tablesCount: number
  sizeBytes: number
  isSystem: boolean
  charset?: string
  collation?: string
}

export interface TableColumn {
  name: string
  type: string
  nullable: boolean
  key: string
  default: string | null
  extra: string
  comment?: string
}

export interface TableIndex {
  name: string
  columnName: string
  isUnique: boolean
  type: string
}

export interface TableInfo {
  name: string
  engine: string
  rows: number
  dataLengthBytes: number
  indexLengthBytes: number
  collation: string
  comment: string
  columns?: TableColumn[]
  indexes?: TableIndex[]
}

export interface TableDataResponse {
  columns: string[]
  rows: Record<string, any>[]
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



