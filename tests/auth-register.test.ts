import { describe, it, expect } from 'vitest'
import { registerSchema } from '../server/validators/auth.validator'
import { registerUser } from '../server/services/auth.service'

describe('Public User Registration', () => {
  describe('registerSchema', () => {
    it('accepts valid registration input', () => {
      const res = registerSchema.safeParse({
        username: 'newdeveloper',
        email: 'developer@example.com',
        password: 'SecurePassword123!'
      })
      expect(res.success).toBe(true)
    })

    it('rejects invalid usernames and short passwords', () => {
      const shortPass = registerSchema.safeParse({
        username: 'user1',
        email: 'u@example.com',
        password: '123'
      })
      expect(shortPass.success).toBe(false)

      const invalidChar = registerSchema.safeParse({
        username: 'user with spaces',
        email: 'u@example.com',
        password: 'ValidPassword123!'
      })
      expect(invalidChar.success).toBe(false)
    })
  })

  describe('registerUser service', () => {
    it('creates user and issues valid session token', async () => {
      const uniqueUsername = `user_${Date.now()}`
      const uniqueEmail = `${uniqueUsername}@testkyodb.local`

      const { user, rawToken, expiresAt } = await registerUser({
        username: uniqueUsername,
        email: uniqueEmail,
        password: 'TestUserPassword2026!'
      })

      expect(user).toBeDefined()
      expect(user.username).toBe(uniqueUsername)
      expect(user.email).toBe(uniqueEmail)
      expect(user.isActive).toBe(true)
      expect(rawToken).toBeDefined()
      expect(rawToken.length).toBe(64)
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('rejects duplicate username or email', async () => {
      const dupUsername = `dup_${Date.now()}`
      const dupEmail = `${dupUsername}@testkyodb.local`

      await registerUser({
        username: dupUsername,
        email: dupEmail,
        password: 'TestUserPassword2026!'
      })

      await expect(
        registerUser({
          username: dupUsername,
          email: `${dupUsername}_different@testkyodb.local`,
          password: 'TestUserPassword2026!'
        })
      ).rejects.toThrow()
    })
  })
})
