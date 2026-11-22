import crypto from 'node:crypto'
import { hash, verify } from '@node-rs/argon2'

// Argon2 options matching high security specifications
const ARGON2_OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
}

/**
 * Hash password using Argon2id with automatic salt generation
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await hash(password, ARGON2_OPTIONS)
  } catch (err) {
    // Robust fallback using scrypt if native argon2 fails in any edge runtime
    const salt = crypto.randomBytes(16).toString('hex')
    const derivedKey = crypto.scryptSync(password, salt, 64)
    return `scrypt$${salt}$${derivedKey.toString('hex')}`
  }
}

/**
 * Verify password against Argon2id hash or fallback scrypt
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith('$argon2')) {
    try {
      return await verify(storedHash, password)
    } catch {
      return false
    }
  }

  if (storedHash.startsWith('scrypt$')) {
    const [, salt, originalKey] = storedHash.split('$')
    if (!salt || !originalKey) return false
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
    return crypto.timingSafeEqual(Buffer.from(derivedKey), Buffer.from(originalKey))
  }

  return false
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex')
}

/**
 * Hash a session token or API key with SHA-256 before persisting in DB
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID()
}
