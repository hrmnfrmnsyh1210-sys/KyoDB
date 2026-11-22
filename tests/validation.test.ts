import { describe, it, expect } from 'vitest'
import { loginSchema, bootstrapAdminSchema } from '../server/validators/auth.validator'

describe('Auth Validators', () => {
  it('should validate valid login credentials', () => {
    const result = loginSchema.safeParse({
      identifier: 'admin@kyodb.local',
      password: 'StrongPassword123!'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid passwords in login', () => {
    const result = loginSchema.safeParse({
      identifier: 'admin',
      password: 'short' // less than 8 chars
    })
    expect(result.success).toBe(false)
  })

  it('should validate valid bootstrap input', () => {
    const result = bootstrapAdminSchema.safeParse({
      username: 'master_admin',
      email: 'master@kyodb.local',
      password: 'AdminPassword2026!'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid username characters in bootstrap', () => {
    const result = bootstrapAdminSchema.safeParse({
      username: 'invalid user with spaces',
      email: 'admin@kyodb.local',
      password: 'AdminPassword2026!'
    })
    expect(result.success).toBe(false)
  })
})
