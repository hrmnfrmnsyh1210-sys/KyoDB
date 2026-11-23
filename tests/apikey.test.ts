import { describe, it, expect } from 'vitest'

// Mock Nuxt runtime config for test runner environment
if (typeof (globalThis as any).useRuntimeConfig !== 'function') {
  ;(globalThis as any).useRuntimeConfig = () => ({
    tidbHost: '',
    tidbUser: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: ''
  })
}

import {
  generatePlainApiKey,
  hashApiKey,
  createApiKey,
  listApiKeys,
  revokeApiKey,
  deleteApiKey
} from '../server/services/apikey.service'
import { createApiKeySchema, validPermissions } from '../server/validators/apikey.validator'

describe('API Key Service & Validators', () => {
  describe('generatePlainApiKey()', () => {
    it('generates an API key with kyo_live_ prefix and 48 hex chars (57 chars total)', () => {
      const key = generatePlainApiKey()
      expect(key.startsWith('kyo_live_')).toBe(true)
      expect(key.length).toBe(9 + 48) // 'kyo_live_' = 9, 24 bytes hex = 48
    })

    it('generates unique random tokens on successive calls', () => {
      const key1 = generatePlainApiKey()
      const key2 = generatePlainApiKey()
      expect(key1).not.toBe(key2)
    })
  })

  describe('hashApiKey()', () => {
    it('produces a deterministic 64-char SHA-256 hex hash', () => {
      const plainKey = 'kyo_live_abcdef1234567890abcdef1234567890abcdef12345678'
      const hash1 = hashApiKey(plainKey)
      const hash2 = hashApiKey(plainKey)

      expect(hash1).toBe(hash2)
      expect(hash1.length).toBe(64)
      expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true)
    })
  })

  describe('createApiKeySchema', () => {
    it('validates correct API key payload', () => {
      const validPayload = {
        name: 'Production Server Token',
        projectId: 'proj_123',
        permissions: ['databases:read', 'queries:execute'],
        expiresInDays: 30
      }
      const parsed = createApiKeySchema.parse(validPayload)
      expect(parsed.name).toBe('Production Server Token')
      expect(parsed.permissions).toEqual(['databases:read', 'queries:execute'])
      expect(parsed.expiresInDays).toBe(30)
    })

    it('rejects empty name or missing project ID', () => {
      expect(() =>
        createApiKeySchema.parse({
          name: '',
          projectId: 'proj_1',
          permissions: ['databases:read']
        })
      ).toThrow()

      expect(() =>
        createApiKeySchema.parse({
          name: 'Valid Name',
          projectId: '',
          permissions: ['databases:read']
        })
      ).toThrow()
    })

    it('rejects empty permissions array', () => {
      expect(() =>
        createApiKeySchema.parse({
          name: 'Key',
          projectId: 'proj_1',
          permissions: []
        })
      ).toThrow()
    })

    it('contains all standard permissions in validPermissions list', () => {
      expect(validPermissions).toContain('databases:read')
      expect(validPermissions).toContain('databases:write')
      expect(validPermissions).toContain('storage:read')
      expect(validPermissions).toContain('storage:write')
      expect(validPermissions).toContain('queries:execute')
      expect(validPermissions).toContain('projects:read')
    })
  })

  describe('API Key Lifecycle (Create, List, Revoke, Delete)', () => {
    it('creates an API key and returns plainKey once', async () => {
      const res = await createApiKey({
        name: 'CI/CD Pipeline Key',
        projectId: 'proj_lifecycle_test',
        permissions: ['storage:read', 'storage:write'],
        expiresInDays: 90
      })

      expect(res.plainKey).toBeDefined()
      expect(res.plainKey.startsWith('kyo_live_')).toBe(true)
      expect(res.apiKey.name).toBe('CI/CD Pipeline Key')
      expect(res.apiKey.projectId).toBe('proj_lifecycle_test')
      expect(res.apiKey.isRevoked).toBe(false)
      expect(res.apiKey.isExpired).toBe(false)
      expect(res.apiKey.expiresAt).not.toBeNull()
    })

    it('lists keys filtered by projectId', async () => {
      const created = await createApiKey({
        name: 'Service Account Token',
        projectId: 'proj_scoped_1',
        permissions: ['databases:read']
      })

      const keys = await listApiKeys('proj_scoped_1')
      expect(keys.length).toBeGreaterThan(0)
      const found = keys.find((k) => k.id === created.apiKey.id)
      expect(found).toBeDefined()
      expect(found?.name).toBe('Service Account Token')
    })

    it('revokes an API key successfully', async () => {
      const created = await createApiKey({
        name: 'Revoke Test Key',
        projectId: 'proj_revoke_test',
        permissions: ['queries:execute']
      })

      const revoked = await revokeApiKey(created.apiKey.id)
      expect(revoked).toBe(true)

      const keys = await listApiKeys('proj_revoke_test')
      const target = keys.find((k) => k.id === created.apiKey.id)
      expect(target).toBeDefined()
      expect(target?.isRevoked).toBe(true)
      expect(target?.revokedAt).not.toBeNull()
    })

    it('deletes an API key successfully', async () => {
      const created = await createApiKey({
        name: 'Delete Test Key',
        projectId: 'proj_delete_test',
        permissions: ['projects:read']
      })

      const deleted = await deleteApiKey(created.apiKey.id)
      expect(deleted).toBe(true)

      const keys = await listApiKeys('proj_delete_test')
      const target = keys.find((k) => k.id === created.apiKey.id)
      expect(target).toBeUndefined()
    })
  })
})
