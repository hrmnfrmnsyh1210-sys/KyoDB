import { randomBytes, createHash } from 'node:crypto'
import { getDbPool } from './db.service'
import { logAudit } from './audit.service'
import { generateUUID } from '../utils/crypto'
import type { ApiKey, CreateApiKeyPayload, CreateApiKeyResponse } from '~/types'

// In-memory fallback store for API keys
const inMemoryApiKeys: (ApiKey & { keyHash: string })[] = []

export function hashApiKey(plainKey: string): string {
  return createHash('sha256').update(plainKey).digest('hex')
}

export function generatePlainApiKey(): string {
  return `kyo_live_${randomBytes(24).toString('hex')}`
}

export async function createApiKey(
  payload: CreateApiKeyPayload,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<CreateApiKeyResponse> {
  const plainKey = generatePlainApiKey()
  const keyHash = hashApiKey(plainKey)
  const id = generateUUID()
  const keyPrefix = `${plainKey.slice(0, 12)}...${plainKey.slice(-4)}`

  let expiresAt: string | null = null
  if (payload.expiresInDays && payload.expiresInDays > 0) {
    const d = new Date()
    d.setDate(d.getDate() + payload.expiresInDays)
    expiresAt = d.toISOString()
  }

  const now = new Date().toISOString()
  const apiKeyRecord: ApiKey = {
    id,
    projectId: payload.projectId,
    name: payload.name.trim(),
    keyPrefix,
    permissions: payload.permissions,
    expiresAt,
    revokedAt: null,
    createdAt: now,
    isRevoked: false,
    isExpired: false
  }

  const pool = getDbPool()
  if (pool) {
    try {
      await pool.execute(
        `INSERT INTO api_keys (id, project_id, name, key_hash, permissions, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          id,
          payload.projectId,
          payload.name.trim(),
          keyHash,
          JSON.stringify(payload.permissions),
          expiresAt ? new Date(expiresAt) : null
        ]
      )
    } catch (err) {
      console.warn('[ApiKeyService] Failed to insert to TiDB, falling back to memory:', err)
      inMemoryApiKeys.push({ ...apiKeyRecord, keyHash })
    }
  } else {
    inMemoryApiKeys.push({ ...apiKeyRecord, keyHash })
  }

  await logAudit({
    adminId,
    action: 'apikey.create',
    targetType: 'api_key',
    targetId: id,
    metadata: { name: payload.name, projectId: payload.projectId, keyPrefix },
    ipAddress
  })

  return {
    apiKey: apiKeyRecord,
    plainKey
  }
}

export async function listApiKeys(projectId?: string): Promise<ApiKey[]> {
  const now = new Date()
  const pool = getDbPool()

  if (pool) {
    try {
      let query = `
        SELECT k.id, k.project_id as projectId, p.name as projectName, k.name,
               k.key_hash as keyHash, k.permissions, k.expires_at as expiresAt,
               k.revoked_at as revokedAt, k.created_at as createdAt
        FROM api_keys k
        LEFT JOIN projects p ON k.project_id = p.id
      `
      const params: any[] = []
      if (projectId) {
        query += ' WHERE k.project_id = ?'
        params.push(projectId)
      }
      query += ' ORDER BY k.created_at DESC'

      const [rows] = await pool.query<any[]>(query, params)

      return rows.map((r) => {
        const expiresAtStr = r.expiresAt ? new Date(r.expiresAt).toISOString() : null
        const revokedAtStr = r.revokedAt ? new Date(r.revokedAt).toISOString() : null
        const isRevoked = !!revokedAtStr
        const isExpired = !!expiresAtStr && new Date(expiresAtStr) < now
        const perms = typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions || []

        return {
          id: r.id,
          projectId: r.projectId,
          projectName: r.projectName || 'Unassigned',
          name: r.name,
          keyPrefix: `kyo_...${r.keyHash.slice(-4)}`,
          permissions: perms,
          expiresAt: expiresAtStr,
          revokedAt: revokedAtStr,
          createdAt: new Date(r.createdAt).toISOString(),
          isRevoked,
          isExpired
        }
      })
    } catch {
      // Fallback to in-memory
    }
  }

  return inMemoryApiKeys
    .filter((k) => (!projectId ? true : k.projectId === projectId))
    .map((k) => ({
      id: k.id,
      projectId: k.projectId,
      name: k.name,
      keyPrefix: k.keyPrefix,
      permissions: k.permissions,
      expiresAt: k.expiresAt,
      revokedAt: k.revokedAt,
      createdAt: k.createdAt,
      isRevoked: !!k.revokedAt,
      isExpired: !!k.expiresAt && new Date(k.expiresAt) < now
    }))
}

export async function revokeApiKey(
  id: string,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<boolean> {
  const pool = getDbPool()
  if (pool) {
    try {
      await pool.execute('UPDATE api_keys SET revoked_at = NOW() WHERE id = ?', [id])
    } catch {
      // Memory fallback
      const found = inMemoryApiKeys.find((k) => k.id === id)
      if (found) found.revokedAt = new Date().toISOString()
    }
  } else {
    const found = inMemoryApiKeys.find((k) => k.id === id)
    if (found) found.revokedAt = new Date().toISOString()
  }

  await logAudit({
    adminId,
    action: 'apikey.revoke',
    targetType: 'api_key',
    targetId: id,
    ipAddress
  })

  return true
}

export async function deleteApiKey(
  id: string,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<boolean> {
  const pool = getDbPool()
  if (pool) {
    try {
      await pool.execute('DELETE FROM api_keys WHERE id = ?', [id])
    } catch {
      const idx = inMemoryApiKeys.findIndex((k) => k.id === id)
      if (idx !== -1) inMemoryApiKeys.splice(idx, 1)
    }
  } else {
    const idx = inMemoryApiKeys.findIndex((k) => k.id === id)
    if (idx !== -1) inMemoryApiKeys.splice(idx, 1)
  }

  await logAudit({
    adminId,
    action: 'apikey.delete',
    targetType: 'api_key',
    targetId: id,
    ipAddress
  })

  return true
}
