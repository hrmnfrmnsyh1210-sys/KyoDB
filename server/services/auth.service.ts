import { createError } from 'h3'
import { getDbPool } from './db.service'
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  generateUUID
} from '../utils/crypto'
import { logAudit } from './audit.service'
import type { AdminUser, AdminSession } from '~/types'

// Sliding window in-memory rate limiter for login attempts
interface RateLimitRecord {
  attempts: number
  resetTime: number
}
const loginRateLimits = new Map<string, RateLimitRecord>()

export function checkRateLimit(key: string, maxAttempts = 5, windowMinutes = 15): boolean {
  const now = Date.now()
  const record = loginRateLimits.get(key)

  if (!record || now > record.resetTime) {
    loginRateLimits.set(key, { attempts: 1, resetTime: now + windowMinutes * 60 * 1000 })
    return true
  }

  if (record.attempts >= maxAttempts) {
    return false
  }

  record.attempts += 1
  return true
}

export function resetRateLimit(key: string): void {
  loginRateLimits.delete(key)
}

// In-memory fallback admin & sessions store for local testing when TiDB is not yet connected
interface InMemoryStore {
  admins: AdminUser[]
  adminPasswords: Map<string, string> // id -> password_hash
  sessions: (AdminSession & { userId: string })[]
}

const inMemoryStore: InMemoryStore = {
  admins: [],
  adminPasswords: new Map(),
  sessions: []
}

/**
 * Check if the system has at least one active admin user
 */
export async function hasAdminUser(): Promise<boolean> {
  const pool = getDbPool()
  if (pool) {
    try {
      const [rows] = await pool.query<any[]>(
        'SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1'
      )
      return rows[0]?.count > 0
    } catch {
      // Table might not exist yet; check in-memory
    }
  }
  return inMemoryStore.admins.length > 0
}

/**
 * Bootstrap the initial admin user
 */
export async function bootstrapAdmin(params: {
  username: string
  email: string
  password: string
  ipAddress?: string
}): Promise<{ user: AdminUser }> {
  const existing = await hasAdminUser()
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Admin already initialized. Public bootstrapping is disabled.'
    })
  }

  const id = generateUUID()
  const passwordHash = await hashPassword(params.password)
  const now = new Date().toISOString()

  const newUser: AdminUser = {
    id,
    username: params.username,
    email: params.email,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }

  const pool = getDbPool()
  if (pool) {
    try {
      await pool.execute(
        `INSERT INTO admin_users (id, username, email, password_hash, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
        [id, params.username, params.email, passwordHash]
      )
    } catch (err: any) {
      console.warn('[BootstrapAdmin] Failed to insert into TiDB, keeping in-memory:', err.message)
      inMemoryStore.admins.push(newUser)
      inMemoryStore.adminPasswords.set(id, passwordHash)
    }
  } else {
    inMemoryStore.admins.push(newUser)
    inMemoryStore.adminPasswords.set(id, passwordHash)
  }

  await logAudit({
    adminId: id,
    action: 'ADMIN_BOOTSTRAP',
    targetType: 'USER',
    targetId: id,
    metadata: { username: params.username, email: params.email },
    ipAddress: params.ipAddress
  })

  return { user: newUser }
}

/**
 * Register a public user account
 */
export async function registerUser(params: {
  username: string
  email: string
  password: string
  ipAddress?: string
  userAgent?: string
}): Promise<{ user: AdminUser; rawToken: string; expiresAt: Date }> {
  const pool = getDbPool()
  const cleanUsername = params.username.trim()
  const cleanEmail = params.email.trim().toLowerCase()

  // 1. Check if user already exists
  if (pool) {
    try {
      const [existing] = await pool.execute<any[]>(
        'SELECT id FROM admin_users WHERE username = ? OR email = ? LIMIT 1',
        [cleanUsername, cleanEmail]
      )
      if (existing.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Username or email is already registered.'
        })
      }
    } catch (err: any) {
      if (err.statusCode === 400) throw err
      console.warn('[RegisterUser] Query failed, checking in-memory store:', err.message)
    }
  }

  const inMemExists = inMemoryStore.admins.some(
    (a) => a.username.toLowerCase() === cleanUsername.toLowerCase() || a.email.toLowerCase() === cleanEmail
  )
  if (inMemExists) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username or email is already registered.'
    })
  }

  // 2. Hash password and prepare user record
  const id = generateUUID()
  const passwordHash = await hashPassword(params.password)
  const now = new Date().toISOString()
  const isFirst = !(await hasAdminUser())

  const newUser: AdminUser = {
    id,
    username: cleanUsername,
    email: cleanEmail,
    role: isFirst ? 'admin' : 'user',
    isActive: true,
    createdAt: now,
    updatedAt: now
  }

  // 3. Persist user
  if (pool) {
    try {
      await pool.execute(
        `INSERT INTO admin_users (id, username, email, password_hash, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
        [id, cleanUsername, cleanEmail, passwordHash]
      )
    } catch (err: any) {
      console.warn('[RegisterUser] Insert into TiDB failed, saving in-memory:', err.message)
      inMemoryStore.admins.push(newUser)
      inMemoryStore.adminPasswords.set(id, passwordHash)
    }
  } else {
    inMemoryStore.admins.push(newUser)
    inMemoryStore.adminPasswords.set(id, passwordHash)
  }

  // 4. Create session immediately for registration
  const rawToken = generateSecureToken(32)
  const tokenHash = hashToken(rawToken)
  const sessionId = generateUUID()
  const sessionDays = 7
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000)

  if (pool) {
    try {
      await pool.execute(
        `INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [sessionId, newUser.id, tokenHash, params.ipAddress || null, params.userAgent || null, expiresAt]
      )
    } catch (err: any) {
      console.warn('[RegisterUser] Failed to insert session into TiDB:', err.message)
      inMemoryStore.sessions.push({
        id: sessionId,
        userId: newUser.id,
        tokenHash,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      })
    }
  } else {
    inMemoryStore.sessions.push({
      id: sessionId,
      userId: newUser.id,
      tokenHash,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    })
  }

  await logAudit({
    adminId: newUser.id,
    action: 'USER_REGISTER',
    targetType: 'USER',
    targetId: newUser.id,
    metadata: { username: cleanUsername, email: cleanEmail },
    ipAddress: params.ipAddress
  })

  return { user: newUser, rawToken, expiresAt }
}


/**
 * Authenticate admin by email or username
 */
export async function authenticateAdmin(
  identifier: string,
  plainPassword: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: AdminUser; rawToken: string; expiresAt: Date }> {
  const pool = getDbPool()
  let user: AdminUser | null = null
  let storedHash: string | null = null

  if (pool) {
    try {
      let rows: any[] = []
      try {
        const [r] = await pool.execute<any[]>(
          `SELECT id, username, email, password_hash, is_active, role, created_at, updated_at
           FROM admin_users
           WHERE (email = ? OR username = ?) AND is_active = 1
           LIMIT 1`,
          [identifier, identifier]
        )
        rows = r
      } catch {
        // Fallback if role column does not exist yet
        const [r] = await pool.execute<any[]>(
          `SELECT id, username, email, password_hash, is_active, created_at, updated_at
           FROM admin_users
           WHERE (email = ? OR username = ?) AND is_active = 1
           LIMIT 1`,
          [identifier, identifier]
        )
        rows = r
      }

      if (rows.length > 0) {
        const row = rows[0]
        user = {
          id: row.id,
          username: row.username,
          email: row.email,
          role: row.role || 'user',
          isActive: Boolean(row.is_active),
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString()
        }
        storedHash = row.password_hash
      }
    } catch (err: any) {
      console.warn('[AuthService] TiDB query failed, falling back to memory store:', err.message)
    }
  }

  // Fallback to in-memory store if DB was not available or empty
  if (!user) {
    const memoryAdmin = inMemoryStore.admins.find(
      (a) => (a.email === identifier || a.username === identifier) && a.isActive
    )
    if (memoryAdmin) {
      user = memoryAdmin
      storedHash = inMemoryStore.adminPasswords.get(memoryAdmin.id) || null
    }
  }

  if (!user || !storedHash) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username/email or password'
    })
  }

  const isValid = await verifyPassword(plainPassword, storedHash)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username/email or password'
    })
  }

  // Create secure session
  const rawToken = generateSecureToken(32)
  const tokenHash = hashToken(rawToken)
  const sessionId = generateUUID()
  const sessionDays = 7
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000)

  if (pool) {
    try {
      await pool.execute(
        `INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [sessionId, user.id, tokenHash, ipAddress || null, userAgent || null, expiresAt]
      )
    } catch (err: any) {
      console.warn('[AuthService] Failed to insert session into TiDB:', err.message)
      inMemoryStore.sessions.push({
        id: sessionId,
        userId: user.id,
        tokenHash,
        ipAddress,
        userAgent,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      })
    }
  } else {
    inMemoryStore.sessions.push({
      id: sessionId,
      userId: user.id,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    })
  }

  await logAudit({
    adminId: user.id,
    action: 'ADMIN_LOGIN',
    targetType: 'SESSION',
    targetId: sessionId,
    ipAddress
  })

  return { user, rawToken, expiresAt }
}

/**
 * Validate session token and retrieve admin user
 */
export async function validateSessionToken(rawToken: string): Promise<AdminUser | null> {
  if (!rawToken) return null
  const tokenHash = hashToken(rawToken)
  const pool = getDbPool()

  if (pool) {
    try {
      let rows: any[] = []
      try {
        const [r] = await pool.execute<any[]>(
          `SELECT u.id, u.username, u.email, u.is_active, u.role, u.created_at, u.updated_at
           FROM sessions s
           JOIN admin_users u ON s.user_id = u.id
           WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
           LIMIT 1`,
          [tokenHash]
        )
        rows = r
      } catch {
        // Fallback if role column does not exist yet
        const [r] = await pool.execute<any[]>(
          `SELECT u.id, u.username, u.email, u.is_active, u.created_at, u.updated_at
           FROM sessions s
           JOIN admin_users u ON s.user_id = u.id
           WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
           LIMIT 1`,
          [tokenHash]
        )
        rows = r
      }

      if (rows.length > 0) {
        const row = rows[0]
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          role: row.role || 'user',
          isActive: Boolean(row.is_active),
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString()
        }
      }
    } catch {
      // Fallback to in-memory check
    }
  }

  // Fallback to in-memory store
  const session = inMemoryStore.sessions.find(
    (s) => s.tokenHash === tokenHash && new Date(s.expiresAt) > new Date()
  )
  if (session) {
    const admin = inMemoryStore.admins.find((a) => a.id === session.userId && a.isActive)
    return admin || null
  }

  return null
}

/**
 * Retrieve user by ID
 */
export async function getUserById(userId: string): Promise<AdminUser | null> {
  if (!userId) return null
  const pool = getDbPool()
  if (pool) {
    try {
      const [rows] = await pool.execute<any[]>(
        'SELECT id, username, email, is_active, role, created_at, updated_at FROM admin_users WHERE id = ? LIMIT 1',
        [userId]
      )
      if (rows.length > 0) {
        const row = rows[0]
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          role: row.role || 'user',
          isActive: Boolean(row.is_active),
          createdAt: new Date(row.created_at).toISOString(),
          updatedAt: new Date(row.updated_at).toISOString()
        }
      }
    } catch {}
  }
  return inMemoryStore.admins.find((a) => a.id === userId) || null
}

/**
 * Revoke session by raw token
 */
export async function revokeSession(rawToken: string, adminId?: string): Promise<void> {
  if (!rawToken) return
  const tokenHash = hashToken(rawToken)
  const pool = getDbPool()

  if (pool) {
    try {
      await pool.execute('DELETE FROM sessions WHERE token_hash = ?', [tokenHash])
    } catch (err: any) {
      console.warn('[AuthService] Failed to delete session from TiDB:', err.message)
    }
  }

  const idx = inMemoryStore.sessions.findIndex((s) => s.tokenHash === tokenHash)
  if (idx !== -1) {
    inMemoryStore.sessions.splice(idx, 1)
  }

  if (adminId) {
    await logAudit({
      adminId,
      action: 'ADMIN_LOGOUT',
      targetType: 'SESSION',
      targetId: tokenHash.slice(0, 8)
    })
  }
}
