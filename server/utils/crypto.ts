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

/**
 * Encrypt arbitrary secret (such as TiDB passwords) using AES-256-GCM
 */
export function encryptSecret(plainText: string, secretKey?: string): string {
  const keySecret = secretKey || process.env.SESSION_SECRET || 'kyodb-secure-key-default-salt-32'
  const key = crypto.createHash('sha256').update(keySecret).digest()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(plainText, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${tag}:${encrypted}`
}

/**
 * Decrypt AES-256-GCM encrypted secret
 */
export function decryptSecret(cipherText: string, secretKey?: string): string {
  const parts = cipherText.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted secret format')
  }
  const [ivHex, tagHex, encryptedHex] = parts
  const keySecret = secretKey || process.env.SESSION_SECRET || 'kyodb-secure-key-default-salt-32'
  const key = crypto.createHash('sha256').update(keySecret).digest()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

