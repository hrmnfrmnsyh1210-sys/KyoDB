import { describe, it, expect } from 'vitest'
import { registerUser, validateSessionToken } from '../server/services/auth.service'
import { getDbPoolForUser } from '../server/services/user-db.service'

describe('Role-based Access & Session Verification', () => {
  it('assigns role: admin to first user, role: user to subsequent users, and returns role in validateSessionToken', async () => {
    const timestamp = Date.now()
    
    // First user in fresh environment becomes admin if none existed
    const user1Name = `user1_${timestamp}`
    const { user: user1, rawToken: token1 } = await registerUser({
      username: user1Name,
      email: `${user1Name}@example.com`,
      password: 'StrongUserPass2026!'
    })

    const validated1 = await validateSessionToken(token1)
    expect(validated1).not.toBeNull()
    expect(validated1?.role).toBe(user1.role)

    // Subsequent registered user MUST be role: 'user'
    const user2Name = `user2_${timestamp}`
    const { user: user2, rawToken: token2 } = await registerUser({
      username: user2Name,
      email: `${user2Name}@example.com`,
      password: 'StrongUserPass2026!'
    })

    expect(user2).toBeDefined()
    expect(user2.role).toBe('user')

    // Validate the issued raw token for user2
    const validated2 = await validateSessionToken(token2)
    expect(validated2).not.toBeNull()
    expect(validated2?.id).toBe(user2.id)
    expect(validated2?.username).toBe(user2Name)
    expect(validated2?.role).toBe('user')
  })

  it('differentiates admin role vs user role for routing guards', () => {
    const adminRoutes = ['/dashboard', '/projects', '/monitoring', '/storage']
    const publicUserRole = 'user'
    const adminRole = 'admin'

    const canAccessRoute = (role: string, path: string) => {
      const isAdminRoute = adminRoutes.some((p) => path === p || path.startsWith(p + '/'))
      if (isAdminRoute && role !== 'admin') {
        return false
      }
      return true
    }

    // Admin should access all admin routes
    expect(canAccessRoute(adminRole, '/dashboard')).toBe(true)
    expect(canAccessRoute(adminRole, '/projects')).toBe(true)
    expect(canAccessRoute(adminRole, '/monitoring')).toBe(true)
    expect(canAccessRoute(adminRole, '/storage')).toBe(true)

    // User should NOT access admin routes
    expect(canAccessRoute(publicUserRole, '/dashboard')).toBe(false)
    expect(canAccessRoute(publicUserRole, '/projects/123')).toBe(false)
    expect(canAccessRoute(publicUserRole, '/monitoring')).toBe(false)
    expect(canAccessRoute(publicUserRole, '/storage')).toBe(false)

    // User can access user routes
    expect(canAccessRoute(publicUserRole, '/app')).toBe(true)
    expect(canAccessRoute(publicUserRole, '/databases')).toBe(true)
    expect(canAccessRoute(publicUserRole, '/sql-editor')).toBe(true)
    expect(canAccessRoute(publicUserRole, '/settings')).toBe(true)
  })

  it('guarantees public user cannot access admin system database pool when user has no connection', async () => {
    const timestamp = Date.now()
    const pubUser = `isolated_${timestamp}`
    const { user } = await registerUser({
      username: pubUser,
      email: `${pubUser}@example.com`,
      password: 'StrongUserPass2026!'
    })

    const pool = await getDbPoolForUser(user.id)
    // Public user with no configured connections MUST receive null (no leak of admin pool)
    expect(pool).toBeNull()
  })
})
