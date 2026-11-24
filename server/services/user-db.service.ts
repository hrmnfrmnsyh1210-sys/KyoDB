import mysql from 'mysql2/promise'
import { createError } from 'h3'
import { getDbPool } from './db.service'
import { generateUUID, encryptSecret, decryptSecret } from '../utils/crypto'
import { logAudit } from './audit.service'
import type {
  UserDatabaseConnection,
  ConnectionHealth
} from '~/types'
import type {
  CreateUserConnectionInput,
  UpdateUserConnectionInput,
  TestConnectionInput
} from '../validators/user-db.validator'

// User connection model stored in DB
interface StoredUserConnection {
  id: string
  user_id: string
  name: string
  host: string
  port: number
  username: string
  password_encrypted: string
  database_name: string
  ssl_ca?: string | null
  is_default: number | boolean
  created_at: string
  updated_at: string
}

// In-memory fallback for local dev when system DB is offline
const inMemoryUserConnections: StoredUserConnection[] = []

// Track whether table schema has been verified in TiDB
let hasEnsuredUserTable = false

export async function ensureUserDatabaseTable(): Promise<void> {
  if (hasEnsuredUserTable) return
  const pool = getDbPool()
  if (!pool) return

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_database_connections (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(128) NOT NULL,
        host VARCHAR(255) NOT NULL,
        port INT NOT NULL DEFAULT 4000,
        username VARCHAR(128) NOT NULL,
        password_encrypted TEXT NOT NULL,
        database_name VARCHAR(128) NOT NULL,
        ssl_ca TEXT DEFAULT NULL,
        is_default TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_is_default (user_id, is_default)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
    try {
      await pool.execute(`
        ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'user';
      `)
    } catch {}
    hasEnsuredUserTable = true
  } catch (err: any) {
    console.warn('[UserDbService] Could not ensure user_database_connections table:', err.message)
  }
}

// Active connection pool cache: connectionId -> mysql.Pool
const userPools = new Map<string, mysql.Pool>()

export function closeUserPool(connectionId: string): void {
  const p = userPools.get(connectionId)
  if (p) {
    try {
      p.end()
    } catch {}
    userPools.delete(connectionId)
  }
}

/**
 * Test a TiDB connection with provided credentials
 */
export async function testTiDbCredentials(params: TestConnectionInput): Promise<ConnectionHealth> {
  const startTime = Date.now()
  const lastChecked = new Date().toISOString()

  let password = params.password || ''
  // If connectionId is provided without password, retrieve existing encrypted password
  if (!password && params.connectionId) {
    const existing = await getUserConnectionWithSecret(params.connectionId)
    if (existing) {
      password = existing.decryptedPassword
    }
  }

  const sslConfig: mysql.SslOptions = params.sslCa
    ? { ca: params.sslCa, minVersion: 'TLSv1.2', rejectUnauthorized: true }
    : { minVersion: 'TLSv1.2', rejectUnauthorized: true }

  let connection: mysql.Connection | null = null
  try {
    connection = await mysql.createConnection({
      host: params.host,
      port: params.port || 4000,
      user: params.username,
      password,
      database: params.database,
      ssl: sslConfig,
      connectTimeout: 10000
    })

    const [rows] = await connection.query<any[]>('SELECT VERSION() as version, NOW() as server_time')
    const latencyMs = Date.now() - startTime
    const versionStr = rows[0]?.version || 'Unknown'

    return {
      connected: true,
      service: 'tidb',
      statusText: 'Connected (TiDB Cloud)',
      latencyMs,
      version: versionStr,
      details: {
        host: params.host,
        port: params.port || 4000,
        database: params.database,
        user: params.username,
        serverTime: rows[0]?.server_time
      },
      lastChecked
    }
  } catch (err: any) {
    return {
      connected: false,
      service: 'tidb',
      statusText: 'Connection Failed',
      error: err.message || 'Unable to connect to TiDB instance',
      latencyMs: Date.now() - startTime,
      lastChecked
    }
  } finally {
    if (connection) {
      try {
        await connection.end()
      } catch {}
    }
  }
}

/**
 * List all configured TiDB database connections for a user
 */
export async function getUserConnections(userId: string): Promise<UserDatabaseConnection[]> {
  await ensureUserDatabaseTable()
  const pool = getDbPool()

  if (pool) {
    try {
      const [rows] = await pool.execute<any[]>(
        `SELECT id, user_id, name, host, port, username, database_name, ssl_ca, is_default, created_at, updated_at
         FROM user_database_connections
         WHERE user_id = ?
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      )

      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        host: r.host,
        port: Number(r.port || 4000),
        username: r.username,
        database: r.database_name,
        sslCa: r.ssl_ca || null,
        isDefault: Boolean(r.is_default),
        hasPassword: true,
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString()
      }))
    } catch (err: any) {
      console.warn('[UserDbService] TiDB query failed, checking in-memory fallback:', err.message)
    }
  }

  return inMemoryUserConnections
    .filter((c) => c.user_id === userId)
    .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
    .map((c) => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      host: c.host,
      port: c.port,
      username: c.username,
      database: c.database_name,
      sslCa: c.ssl_ca || null,
      isDefault: Boolean(c.is_default),
      hasPassword: true,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))
}

/**
 * Get internal connection details including decrypted password
 */
async function getUserConnectionWithSecret(
  connectionId: string,
  userId?: string
): Promise<(StoredUserConnection & { decryptedPassword: string }) | null> {
  const pool = getDbPool()
  let conn: StoredUserConnection | null = null

  if (pool) {
    try {
      const sql = userId
        ? 'SELECT * FROM user_database_connections WHERE id = ? AND user_id = ? LIMIT 1'
        : 'SELECT * FROM user_database_connections WHERE id = ? LIMIT 1'
      const params = userId ? [connectionId, userId] : [connectionId]

      const [rows] = await pool.execute<any[]>(sql, params)
      if (rows.length > 0) {
        conn = rows[0] as StoredUserConnection
      }
    } catch {}
  }

  if (!conn) {
    conn = inMemoryUserConnections.find(
      (c) => c.id === connectionId && (!userId || c.user_id === userId)
    ) || null
  }

  if (!conn) return null

  let decryptedPassword = ''
  try {
    decryptedPassword = decryptSecret(conn.password_encrypted)
  } catch (err) {
    console.warn('[UserDbService] Decrypting TiDB password failed:', err)
  }

  return {
    ...conn,
    decryptedPassword
  }
}

/**
 * Create a new user TiDB database connection
 */
export async function createUserConnection(
  userId: string,
  input: CreateUserConnectionInput,
  ipAddress?: string
): Promise<UserDatabaseConnection> {
  await ensureUserDatabaseTable()
  const pool = getDbPool()
  const id = generateUUID()
  const now = new Date().toISOString()
  const encryptedPassword = encryptSecret(input.password || '')

  // Count existing connections
  const existingList = await getUserConnections(userId)
  const isDefault = existingList.length === 0 || input.isDefault

  if (pool) {
    try {
      // If setting as default, clear other defaults first
      if (isDefault) {
        await pool.execute(
          'UPDATE user_database_connections SET is_default = 0 WHERE user_id = ?',
          [userId]
        )
      }

      await pool.execute(
        `INSERT INTO user_database_connections
         (id, user_id, name, host, port, username, password_encrypted, database_name, ssl_ca, is_default, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          userId,
          input.name,
          input.host,
          input.port || 4000,
          input.username,
          encryptedPassword,
          input.database,
          input.sslCa || null,
          isDefault ? 1 : 0
        ]
      )
    } catch (err: any) {
      console.warn('[UserDbService] TiDB insert failed, attempting table creation & retry:', err.message)
      try {
        hasEnsuredUserTable = false
        await ensureUserDatabaseTable()
        if (isDefault) {
          await pool.execute('UPDATE user_database_connections SET is_default = 0 WHERE user_id = ?', [userId])
        }
        await pool.execute(
          `INSERT INTO user_database_connections
           (id, user_id, name, host, port, username, password_encrypted, database_name, ssl_ca, is_default, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            id,
            userId,
            input.name,
            input.host,
            input.port || 4000,
            input.username,
            encryptedPassword,
            input.database,
            input.sslCa || null,
            isDefault ? 1 : 0
          ]
        )
      } catch (retryErr: any) {
        console.error('[UserDbService] TiDB retry insert failed, saving in-memory:', retryErr.message)
        if (isDefault) {
          inMemoryUserConnections.forEach((c) => {
            if (c.user_id === userId) c.is_default = 0
          })
        }
        inMemoryUserConnections.push({
          id,
          user_id: userId,
          name: input.name,
          host: input.host,
          port: input.port || 4000,
          username: input.username,
          password_encrypted: encryptedPassword,
          database_name: input.database,
          ssl_ca: input.sslCa || null,
          is_default: isDefault ? 1 : 0,
          created_at: now,
          updated_at: now
        })
      }
    }
  } else {
    if (isDefault) {
      inMemoryUserConnections.forEach((c) => {
        if (c.user_id === userId) c.is_default = 0
      })
    }
    inMemoryUserConnections.push({
      id,
      user_id: userId,
      name: input.name,
      host: input.host,
      port: input.port || 4000,
      username: input.username,
      password_encrypted: encryptedPassword,
      database_name: input.database,
      ssl_ca: input.sslCa || null,
      is_default: isDefault ? 1 : 0,
      created_at: now,
      updated_at: now
    })
  }

  await logAudit({
    adminId: userId,
    action: 'USER_TIDB_ADD',
    targetType: 'DATABASE_CONNECTION',
    targetId: id,
    metadata: { name: input.name, host: input.host, database: input.database },
    ipAddress
  })

  return {
    id,
    userId,
    name: input.name,
    host: input.host,
    port: input.port || 4000,
    username: input.username,
    database: input.database,
    sslCa: input.sslCa || null,
    isDefault,
    hasPassword: true,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Update user connection credentials
 */
export async function updateUserConnection(
  userId: string,
  id: string,
  input: UpdateUserConnectionInput,
  ipAddress?: string
): Promise<UserDatabaseConnection> {
  const pool = getDbPool()
  closeUserPool(id)

  const existing = await getUserConnectionWithSecret(id, userId)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Database connection not found' })
  }

  const name = input.name !== undefined ? input.name : existing.name
  const host = input.host !== undefined ? input.host : existing.host
  const port = input.port !== undefined ? input.port : existing.port
  const username = input.username !== undefined ? input.username : existing.username
  const database = input.database !== undefined ? input.database : existing.database_name
  const sslCa = input.sslCa !== undefined ? input.sslCa : existing.ssl_ca
  const isDefault = input.isDefault !== undefined ? input.isDefault : Boolean(existing.is_default)

  let encryptedPassword = existing.password_encrypted
  if (input.password !== undefined && input.password !== '') {
    encryptedPassword = encryptSecret(input.password)
  }

  if (pool) {
    try {
      if (isDefault) {
        await pool.execute(
          'UPDATE user_database_connections SET is_default = 0 WHERE user_id = ? AND id != ?',
          [userId, id]
        )
      }

      await pool.execute(
        `UPDATE user_database_connections
         SET name = ?, host = ?, port = ?, username = ?, password_encrypted = ?, database_name = ?, ssl_ca = ?, is_default = ?, updated_at = NOW()
         WHERE id = ? AND user_id = ?`,
        [name, host, port, username, encryptedPassword, database, sslCa || null, isDefault ? 1 : 0, id, userId]
      )
    } catch (err: any) {
      console.warn('[UserDbService] TiDB update failed, updating memory:', err.message)
    }
  }

  const memIdx = inMemoryUserConnections.findIndex((c) => c.id === id && c.user_id === userId)
  if (memIdx !== -1) {
    if (isDefault) {
      inMemoryUserConnections.forEach((c) => {
        if (c.user_id === userId && c.id !== id) c.is_default = 0
      })
    }
    inMemoryUserConnections[memIdx] = {
      ...inMemoryUserConnections[memIdx],
      name,
      host,
      port,
      username,
      password_encrypted: encryptedPassword,
      database_name: database,
      ssl_ca: sslCa || null,
      is_default: isDefault ? 1 : 0,
      updated_at: new Date().toISOString()
    }
  }

  await logAudit({
    adminId: userId,
    action: 'USER_TIDB_UPDATE',
    targetType: 'DATABASE_CONNECTION',
    targetId: id,
    metadata: { name, host, database },
    ipAddress
  })

  return {
    id,
    userId,
    name,
    host,
    port,
    username,
    database,
    sslCa: sslCa || null,
    isDefault,
    hasPassword: true,
    createdAt: existing.created_at,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Delete a user connection
 */
export async function deleteUserConnection(
  userId: string,
  id: string,
  ipAddress?: string
): Promise<void> {
  const pool = getDbPool()
  closeUserPool(id)

  if (pool) {
    try {
      await pool.execute(
        'DELETE FROM user_database_connections WHERE id = ? AND user_id = ?',
        [id, userId]
      )
    } catch (err: any) {
      console.warn('[UserDbService] TiDB delete failed:', err.message)
    }
  }

  const idx = inMemoryUserConnections.findIndex((c) => c.id === id && c.user_id === userId)
  if (idx !== -1) {
    inMemoryUserConnections.splice(idx, 1)
  }

  await logAudit({
    adminId: userId,
    action: 'USER_TIDB_DELETE',
    targetType: 'DATABASE_CONNECTION',
    targetId: id,
    ipAddress
  })
}

/**
 * Set a connection as the user's active/default
 */
export async function setDefaultUserConnection(userId: string, id: string): Promise<void> {
  const pool = getDbPool()

  if (pool) {
    try {
      await pool.execute(
        'UPDATE user_database_connections SET is_default = 0 WHERE user_id = ?',
        [userId]
      )
      await pool.execute(
        'UPDATE user_database_connections SET is_default = 1 WHERE id = ? AND user_id = ?',
        [id, userId]
      )
    } catch (err: any) {
      console.warn('[UserDbService] TiDB set default failed:', err.message)
    }
  }

  inMemoryUserConnections.forEach((c) => {
    if (c.user_id === userId) {
      c.is_default = c.id === id ? 1 : 0
    }
  })
}

/**
 * Get active connection pool for a user, or fall back to system pool
 */
export async function getDbPoolForUser(userId?: string): Promise<mysql.Pool | null> {
  if (!userId) {
    return getDbPool()
  }

  // 1. Fetch user's active or default TiDB connection
  const connections = await getUserConnections(userId)
  const activeConn = connections.find((c) => c.isDefault) || connections[0]

  if (!activeConn) {
    // If user has not configured any personal TiDB connection, check if system pool is available
    return getDbPool()
  }

  // 2. Check if pool is already cached in memory
  const cachedPool = userPools.get(activeConn.id)
  if (cachedPool) {
    return cachedPool
  }

  // 3. Decrypt password and create pool
  const connDetails = await getUserConnectionWithSecret(activeConn.id, userId)
  if (!connDetails) {
    return getDbPool()
  }

  const sslConfig: mysql.SslOptions = connDetails.ssl_ca
    ? { ca: connDetails.ssl_ca, minVersion: 'TLSv1.2', rejectUnauthorized: true }
    : { minVersion: 'TLSv1.2', rejectUnauthorized: true }

  const newPool = mysql.createPool({
    host: connDetails.host,
    port: connDetails.port || 4000,
    user: connDetails.username,
    password: connDetails.decryptedPassword,
    database: connDetails.database_name,
    ssl: sslConfig,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  })

  userPools.set(activeConn.id, newPool)
  return newPool
}
