import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getDbPool } from './db.service'
import { logAudit } from './audit.service'
import { generateUUID } from '../utils/crypto'
import {
  categorizeMimeType,
  sanitizeFolderPath,
  sanitizeObjectKey,
  validateFolderName,
  validateSafeKeyPath
} from '../validators/storage.validator'
import type {
  ConnectionHealth,
  StorageItem,
  StorageListResponse,
  StorageBreadcrumb,
  PresignedUploadResponse
} from '~/types'

let r2Client: S3Client | null = null

export function getR2Client(): S3Client | null {
  const config = useRuntimeConfig()

  if (!config.r2AccessKeyId || !config.r2SecretAccessKey) {
    return null
  }

  if (!r2Client) {
    const endpoint =
      config.r2Endpoint ||
      (config.r2AccountId ? `https://${config.r2AccountId}.r2.cloudflarestorage.com` : '')

    if (!endpoint) {
      return null
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: config.r2AccessKeyId,
        secretAccessKey: config.r2SecretAccessKey
      }
    })
  }

  return r2Client
}

export async function testR2Connection(): Promise<ConnectionHealth> {
  const config = useRuntimeConfig()
  const lastChecked = new Date().toISOString()

  if (!config.r2AccessKeyId || !config.r2SecretAccessKey || (!config.r2Endpoint && !config.r2AccountId)) {
    return {
      connected: false,
      service: 'r2',
      statusText: 'Not Configured',
      error: 'R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_ACCOUNT_ID is missing',
      lastChecked
    }
  }

  const client = getR2Client()
  if (!client) {
    return {
      connected: false,
      service: 'r2',
      statusText: 'Client Init Failed',
      error: 'Unable to initialize Cloudflare R2 S3 client',
      lastChecked
    }
  }

  const startTime = Date.now()
  try {
    const bucketName = config.r2BucketName
    if (!bucketName) {
      return {
        connected: false,
        service: 'r2',
        statusText: 'Bucket Not Specified',
        error: 'R2_BUCKET_NAME is not configured',
        lastChecked
      }
    }

    await client.send(new HeadBucketCommand({ Bucket: bucketName }))
    const latencyMs = Date.now() - startTime

    return {
      connected: true,
      service: 'r2',
      statusText: 'Connected (Cloudflare R2)',
      latencyMs,
      details: {
        bucket: bucketName,
        endpoint: config.r2Endpoint || `https://${config.r2AccountId}.r2.cloudflarestorage.com`
      },
      lastChecked
    }
  } catch (err: any) {
    return {
      connected: false,
      service: 'r2',
      statusText: 'Connection Failed',
      error: err.message || 'Failed to connect to Cloudflare R2',
      latencyMs: Date.now() - startTime,
      lastChecked
    }
  }
}

/**
 * In-memory fallback storage store for offline/local development without active R2 credentials
 */
interface MockStorageObject {
  id: string
  key: string
  filename: string
  mimeType: string
  sizeBytes: number
  projectId?: string | null
  lastModified: string
}

const mockObjects: Map<string, MockStorageObject> = new Map()
const mockFolders: Set<string> = new Set()

/**
 * Generate a short-lived presigned URL for direct client-to-R2 upload
 */
export async function createPresignedUploadUrl(
  objectKey: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<{ url: string; objectKey: string }> {
  validateSafeKeyPath(objectKey)
  const config = useRuntimeConfig()
  const client = getR2Client()

  if (!client || !config.r2BucketName) {
    // If R2 is not configured, generate a simulated direct upload endpoint for offline dev
    return {
      url: `/api/storage/mock-upload?key=${encodeURIComponent(objectKey)}`,
      objectKey
    }
  }

  const command = new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: objectKey,
    ContentType: contentType
  })

  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
  return { url, objectKey }
}

/**
 * Generate a short-lived presigned URL for file download
 */
export async function createPresignedDownloadUrl(
  objectKey: string,
  expiresInSeconds = 300
): Promise<string> {
  validateSafeKeyPath(objectKey)
  const config = useRuntimeConfig()
  const client = getR2Client()

  if (!client || !config.r2BucketName) {
    return `/api/storage/mock-download?key=${encodeURIComponent(objectKey)}`
  }

  const command = new GetObjectCommand({
    Bucket: config.r2BucketName,
    Key: objectKey
  })

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

/**
 * Build breadcrumb structure from current prefix
 */
export function buildBreadcrumbs(prefix: string): StorageBreadcrumb[] {
  const crumbs: StorageBreadcrumb[] = [{ name: 'Root', prefix: '' }]
  if (!prefix) return crumbs

  const parts = prefix.replace(/^\/+|\/+$/g, '').split('/')
  let accumulated = ''

  for (const part of parts) {
    if (!part) continue
    accumulated += `${part}/`
    crumbs.push({
      name: part,
      prefix: accumulated
    })
  }

  return crumbs
}

/**
 * List files and virtual folders for Cloudflare R2
 */
export async function listStorageObjects(options?: {
  prefix?: string
  projectId?: string | null
  search?: string
  category?: string
}): Promise<StorageListResponse> {
  const config = useRuntimeConfig()
  const client = getR2Client()
  const bucketName = config.r2BucketName || 'mock-r2-bucket'
  const isConfigured = Boolean(client && config.r2BucketName)

  let prefix = options?.prefix ? sanitizeFolderPath(options.prefix) : ''

  // If scoped by project and prefix is empty, default prefix to `projects/${projectId}/`
  if (options?.projectId && !prefix) {
    prefix = `projects/${options.projectId}/`
  }

  const items: StorageItem[] = []
  const breadcrumbs = buildBreadcrumbs(prefix)
  let totalFiles = 0
  let totalFolders = 0
  let totalBytes = 0

  // Fetch project mapping from TiDB if available
  const pool = getDbPool()
  const projectMap = new Map<string, string>()
  const dbObjectMap = new Map<string, any>()

  if (pool) {
    try {
      const [projRows] = await pool.query<any[]>('SELECT id, name FROM projects')
      for (const p of projRows) {
        projectMap.set(p.id, p.name)
      }

      const [dbObjs] = await pool.query<any[]>('SELECT * FROM storage_objects')
      for (const obj of dbObjs) {
        dbObjectMap.set(obj.object_key, obj)
      }
    } catch {
      // Ignore if table not yet migrated
    }
  }

  if (isConfigured && client) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        Delimiter: '/'
      })

      const response = await client.send(command)

      // 1. Process Virtual Folders (CommonPrefixes)
      if (response.CommonPrefixes) {
        for (const cp of response.CommonPrefixes) {
          if (!cp.Prefix) continue
          const folderKey = cp.Prefix
          const folderName = folderKey.slice(prefix.length).replace(/\/$/, '')
          if (!folderName) continue

          items.push({
            key: folderKey,
            name: folderName,
            type: 'folder',
            sizeBytes: 0,
            category: 'other'
          })
          totalFolders++
        }
      }

      // 2. Process Files (Contents)
      if (response.Contents) {
        for (const item of response.Contents) {
          if (!item.Key) continue
          // Skip if key matches current prefix or is a folder placeholder ending with slash
          if (item.Key === prefix || item.Key.endsWith('/')) {
            continue
          }

          const filename = item.Key.split('/').pop() || item.Key
          const dbMeta = dbObjectMap.get(item.Key)
          const mimeType = dbMeta?.mime_type || 'application/octet-stream'
          const projectId = dbMeta?.project_id || null
          const projectName = projectId ? projectMap.get(projectId) || null : null
          const category = categorizeMimeType(mimeType, filename)
          const sizeBytes = item.Size || 0

          items.push({
            id: dbMeta?.id,
            key: item.Key,
            name: filename,
            type: 'file',
            sizeBytes,
            mimeType,
            category,
            lastModified: item.LastModified?.toISOString() || new Date().toISOString(),
            etag: item.ETag?.replace(/"/g, ''),
            projectId,
            projectName
          })

          totalFiles++
          totalBytes += sizeBytes
        }
      }
    } catch {
      // In case of S3 error, fall through to mock/DB store
    }
  } else {
    // OFFLINE / MOCK MODE: Generate view from mockObjects & mockFolders + DB objects
    // 1. Mock Folders
    for (const f of mockFolders) {
      if (f.startsWith(prefix) && f !== prefix) {
        const remaining = f.slice(prefix.length)
        const parts = remaining.split('/')
        if (parts.length > 0 && parts[0]) {
          const folderName = parts[0]
          const folderKey = `${prefix}${folderName}/`
          if (!items.some((i) => i.key === folderKey)) {
            items.push({
              key: folderKey,
              name: folderName,
              type: 'folder',
              sizeBytes: 0,
              category: 'other'
            })
            totalFolders++
          }
        }
      }
    }

    // 2. Mock & DB Files
    const combinedFiles = new Map<string, any>()
    for (const [key, obj] of mockObjects.entries()) {
      combinedFiles.set(key, obj)
    }
    for (const [key, obj] of dbObjectMap.entries()) {
      combinedFiles.set(key, {
        id: obj.id,
        key: obj.object_key,
        filename: obj.filename,
        mimeType: obj.mime_type,
        sizeBytes: Number(obj.size_bytes),
        projectId: obj.project_id,
        lastModified: obj.created_at
      })
    }

    for (const [key, file] of combinedFiles.entries()) {
      if (prefix && !key.startsWith(prefix)) continue

      const remaining = key.slice(prefix.length)
      if (remaining.includes('/')) {
        // Belongs to a deeper subfolder, show subfolder if not added
        const folderName = remaining.split('/')[0]
        const folderKey = `${prefix}${folderName}/`
        if (!items.some((i) => i.key === folderKey)) {
          items.push({
            key: folderKey,
            name: folderName,
            type: 'folder',
            sizeBytes: 0,
            category: 'other'
          })
          totalFolders++
        }
        continue
      }

      const filename = file.filename || key.split('/').pop() || key
      const mimeType = file.mimeType || 'application/octet-stream'
      const category = categorizeMimeType(mimeType, filename)
      const projectId = file.projectId || null
      const projectName = projectId ? projectMap.get(projectId) || null : null

      items.push({
        id: file.id,
        key,
        name: filename,
        type: 'file',
        sizeBytes: file.sizeBytes || 0,
        mimeType,
        category,
        lastModified: file.lastModified || new Date().toISOString(),
        projectId,
        projectName
      })

      totalFiles++
      totalBytes += file.sizeBytes || 0
    }
  }

  // Filter by Search Query if present
  let filteredItems = items
  if (options?.search) {
    const q = options.search.toLowerCase()
    filteredItems = filteredItems.filter(
      (item) => item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q)
    )
  }

  // Filter by Category if specified and not 'all'
  if (options?.category && options.category !== 'all') {
    filteredItems = filteredItems.filter(
      (item) => item.type === 'folder' || item.category === options.category
    )
  }

  // Sort: folders first, then alphabetically by name
  filteredItems.sort((a, b) => {
    if (a.type === 'folder' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'folder') return 1
    return a.name.localeCompare(b.name)
  })

  return {
    currentPrefix: prefix,
    breadcrumbs,
    items: filteredItems,
    totalFiles,
    totalFolders,
    totalBytes,
    bucketName,
    isConfigured
  }
}

/**
 * Create a virtual folder in Cloudflare R2
 */
export async function createFolder(params: {
  folderName: string
  currentPath?: string
  projectId?: string | null
  adminId?: string | null
  ipAddress?: string | null
}): Promise<{ folderKey: string }> {
  const safeName = validateFolderName(params.folderName)
  const currentPath = params.currentPath ? sanitizeFolderPath(params.currentPath) : ''

  let basePrefix = currentPath
  if (params.projectId && !basePrefix.startsWith(`projects/${params.projectId}/`)) {
    basePrefix = `projects/${params.projectId}/${basePrefix}`
  }

  const folderKey = `${basePrefix}${safeName}/`
  validateSafeKeyPath(folderKey)

  const config = useRuntimeConfig()
  const client = getR2Client()

  if (client && config.r2BucketName) {
    await client.send(
      new PutObjectCommand({
        Bucket: config.r2BucketName,
        Key: folderKey,
        Body: '',
        ContentType: 'application/x-directory'
      })
    )
  } else {
    mockFolders.add(folderKey)
  }

  await logAudit({
    adminId: params.adminId,
    action: 'storage.folder_create',
    targetType: 'storage_folder',
    targetId: folderKey,
    metadata: {
      folderName: safeName,
      folderKey,
      projectId: params.projectId
    },
    ipAddress: params.ipAddress
  })

  return { folderKey }
}

/**
 * Record an uploaded object in the database and audit log
 */
export async function recordStorageObject(params: {
  objectKey: string
  filename: string
  mimeType: string
  sizeBytes: number
  projectId?: string | null
  checksum?: string | null
  adminId?: string | null
  ipAddress?: string | null
}): Promise<StorageItem> {
  validateSafeKeyPath(params.objectKey)
  const config = useRuntimeConfig()
  const bucketName = config.r2BucketName || 'kyodb-r2'
  const id = generateUUID()

  // Save in mock store
  mockObjects.set(params.objectKey, {
    id,
    key: params.objectKey,
    filename: params.filename,
    mimeType: params.mimeType,
    sizeBytes: params.sizeBytes,
    projectId: params.projectId,
    lastModified: new Date().toISOString()
  })

  // Persist to TiDB database if available
  const pool = getDbPool()
  if (pool) {
    try {
      await pool.execute(
        `INSERT INTO storage_objects 
          (id, project_id, bucket_name, object_key, filename, mime_type, size_bytes, checksum, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
          filename = VALUES(filename),
          mime_type = VALUES(mime_type),
          size_bytes = VALUES(size_bytes),
          checksum = VALUES(checksum)`,
        [
          id,
          params.projectId || null,
          bucketName,
          params.objectKey,
          params.filename,
          params.mimeType,
          params.sizeBytes,
          params.checksum || null
        ]
      )
    } catch {
      // Ignore if table not present
    }
  }

  await logAudit({
    adminId: params.adminId,
    action: 'storage.upload',
    targetType: 'storage_object',
    targetId: params.objectKey,
    metadata: {
      filename: params.filename,
      sizeBytes: params.sizeBytes,
      mimeType: params.mimeType,
      projectId: params.projectId
    },
    ipAddress: params.ipAddress
  })

  return {
    id,
    key: params.objectKey,
    name: params.filename,
    type: 'file',
    sizeBytes: params.sizeBytes,
    mimeType: params.mimeType,
    category: categorizeMimeType(params.mimeType, params.filename),
    lastModified: new Date().toISOString(),
    projectId: params.projectId || null
  }
}

/**
 * Delete one or multiple storage objects / folders
 */
export async function deleteStorageItems(params: {
  keys: string[]
  projectId?: string | null
  adminId?: string | null
  ipAddress?: string | null
}): Promise<{ deletedCount: number }> {
  if (!params.keys || params.keys.length === 0) {
    return { deletedCount: 0 }
  }

  const config = useRuntimeConfig()
  const client = getR2Client()
  const bucketName = config.r2BucketName

  let deletedCount = 0

  for (const rawKey of params.keys) {
    const key = rawKey.trim()
    validateSafeKeyPath(key)

    if (client && bucketName) {
      if (key.endsWith('/')) {
        // For folder deletion, list and delete all nested objects
        const listCmd = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: key
        })
        const listed = await client.send(listCmd)
        if (listed.Contents && listed.Contents.length > 0) {
          await client.send(
            new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: listed.Contents.map((obj) => ({ Key: obj.Key! }))
              }
            })
          )
          deletedCount += listed.Contents.length
        }
        // Also delete the folder marker itself
        await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }))
        deletedCount++
      } else {
        await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }))
        deletedCount++
      }
    } else {
      mockObjects.delete(key)
      mockFolders.delete(key)
      deletedCount++
    }

    // Delete from TiDB storage_objects table if available
    const pool = getDbPool()
    if (pool) {
      try {
        if (key.endsWith('/')) {
          await pool.execute('DELETE FROM storage_objects WHERE object_key LIKE ?', [`${key}%`])
        } else {
          await pool.execute('DELETE FROM storage_objects WHERE object_key = ?', [key])
        }
      } catch {
        // Ignore table errors
      }
    }
  }

  await logAudit({
    adminId: params.adminId,
    action: 'storage.delete',
    targetType: 'storage_objects',
    targetId: params.keys[0] || 'bulk',
    metadata: {
      keys: params.keys,
      deletedCount,
      projectId: params.projectId
    },
    ipAddress: params.ipAddress
  })

  return { deletedCount }
}

/**
 * Prepare presigned upload info with safe scoping
 */
export async function preparePresignedUpload(params: {
  filename: string
  contentType?: string
  folder?: string
  projectId?: string | null
}): Promise<PresignedUploadResponse> {
  const config = useRuntimeConfig()
  const bucketName = config.r2BucketName || 'kyodb-r2'
  const contentType = params.contentType || 'application/octet-stream'

  let targetFolder = params.folder ? sanitizeFolderPath(params.folder) : ''
  if (params.projectId && !targetFolder.startsWith(`projects/${params.projectId}/`)) {
    targetFolder = `projects/${params.projectId}/${targetFolder}`
  }

  const objectKey = sanitizeObjectKey(targetFolder, params.filename)
  const expiresInSeconds = 600

  const { url } = await createPresignedUploadUrl(objectKey, contentType, expiresInSeconds)

  return {
    uploadUrl: url,
    objectKey,
    filename: params.filename,
    bucketName,
    expiresInSeconds
  }
}
