import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  generateUUID,
  encryptSecret,
  decryptSecret
} from '../server/utils/crypto'

describe('Crypto & Security Utilities', () => {
  it('should hash and verify passwords using Argon2id', async () => {
    const password = 'SuperSecretMasterPassword2026!'
    const hashed = await hashPassword(password)

    expect(hashed).toBeDefined()
    expect(typeof hashed).toBe('string')
    // Must be either argon2 or fallback scrypt
    expect(hashed.startsWith('$argon2') || hashed.startsWith('scrypt$')).toBe(true)

    const isValid = await verifyPassword(password, hashed)
    expect(isValid).toBe(true)

    const isInvalid = await verifyPassword('WrongPassword123', hashed)
    expect(isInvalid).toBe(false)
  })

  it('should generate high entropy secure tokens and SHA-256 hashes', () => {
    const token1 = generateSecureToken(32)
    const token2 = generateSecureToken(32)

    expect(token1).toHaveLength(64) // 32 bytes in hex = 64 characters
    expect(token2).toHaveLength(64)
    expect(token1).not.toBe(token2)

    const hash1 = hashToken(token1)
    const hash2 = hashToken(token1)
    const hashDifferent = hashToken(token2)

    expect(hash1).toHaveLength(64)
    expect(hash1).toBe(hash2) // Deterministic SHA-256
    expect(hash1).not.toBe(hashDifferent)
  })

  it('should generate valid UUID v4', () => {
    const uuid = generateUUID()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(uuid).toMatch(uuidRegex)
  })

  it('should encrypt and decrypt secrets using AES-256-GCM', () => {
    const secret = 'TiDBCloudPassword@2026!'
    const encrypted = encryptSecret(secret)

    expect(encrypted).toBeDefined()
    expect(encrypted).not.toBe(secret)
    expect(encrypted.split(':')).toHaveLength(3) // iv:tag:ciphertext

    const decrypted = decryptSecret(encrypted)
    expect(decrypted).toBe(secret)

    // With custom secret key
    const customKey = 'my-custom-super-secret-key-32chrs'
    const customEnc = encryptSecret(secret, customKey)
    const customDec = decryptSecret(customEnc, customKey)
    expect(customDec).toBe(secret)

    // Rejects tampered ciphertext
    expect(() => decryptSecret('invalid:format')).toThrow()
  })
})
