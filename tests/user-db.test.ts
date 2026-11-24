import { describe, it, expect } from 'vitest'
import {
  testConnectionSchema,
  createUserConnectionSchema,
  updateUserConnectionSchema
} from '../server/validators/user-db.validator'
import {
  createUserConnection,
  getUserConnections,
  updateUserConnection,
  deleteUserConnection,
  setDefaultUserConnection,
  getDbPoolForUser
} from '../server/services/user-db.service'

describe('User TiDB Connection Management', () => {
  describe('user-db.validator', () => {
    it('validates test connection input', () => {
      const valid = testConnectionSchema.safeParse({
        host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
        port: 4000,
        username: 'user.root',
        password: 'Password123!',
        database: 'my_app_db'
      })
      expect(valid.success).toBe(true)

      const invalid = testConnectionSchema.safeParse({
        host: '',
        username: 'user'
      })
      expect(invalid.success).toBe(false)
    })

    it('validates create connection input with defaults', () => {
      const valid = createUserConnectionSchema.safeParse({
        name: 'Production Cluster',
        host: 'gateway01.us-west-2.prod.aws.tidbcloud.com',
        username: 'admin.root',
        database: 'ecommerce'
      })
      expect(valid.success).toBe(true)
      if (valid.success) {
        expect(valid.data.port).toBe(4000)
        expect(valid.data.isDefault).toBe(true)
      }
    })

    it('validates update connection input', () => {
      const valid = updateUserConnectionSchema.safeParse({
        name: 'Updated Name',
        port: 4001
      })
      expect(valid.success).toBe(true)
    })
  })

  describe('user-db.service in-memory fallback CRUD', () => {
    const testUserId = 'user-test-uuid-1234'

    it('creates and lists user TiDB connections', async () => {
      const conn = await createUserConnection(testUserId, {
        name: 'My TiDB Test',
        host: 'gateway01.tidbcloud.com',
        port: 4000,
        username: 'test_user',
        password: 'MySecretPassword123!',
        database: 'test_db',
        isDefault: true
      })

      expect(conn).toBeDefined()
      expect(conn.id).toBeDefined()
      expect(conn.name).toBe('My TiDB Test')
      expect(conn.isDefault).toBe(true)
      // Password must not be leaked in returned interface
      expect((conn as any).password).toBeUndefined()
      expect((conn as any).password_encrypted).toBeUndefined()

      const list = await getUserConnections(testUserId)
      expect(list.length).toBeGreaterThanOrEqual(1)
      const found = list.find((c) => c.id === conn.id)
      expect(found).toBeDefined()
      expect(found?.database).toBe('test_db')
    })

    it('updates user connection and marks default', async () => {
      const conn = await createUserConnection(testUserId, {
        name: 'Second TiDB',
        host: 'gateway02.tidbcloud.com',
        port: 4000,
        username: 'second_user',
        password: 'Password456!',
        database: 'second_db',
        isDefault: false
      })

      const updated = await updateUserConnection(testUserId, conn.id, {
        name: 'Renamed Second TiDB',
        database: 'second_db_v2'
      })

      expect(updated.name).toBe('Renamed Second TiDB')
      expect(updated.database).toBe('second_db_v2')

      await setDefaultUserConnection(testUserId, conn.id)
      const list = await getUserConnections(testUserId)
      const active = list.find((c) => c.id === conn.id)
      expect(active?.isDefault).toBe(true)
    })

    it('deletes user connection', async () => {
      const conn = await createUserConnection(testUserId, {
        name: 'To Delete',
        host: 'gateway03.tidbcloud.com',
        port: 4000,
        username: 'delete_user',
        password: 'Password789!',
        database: 'delete_db',
        isDefault: false
      })

      await deleteUserConnection(testUserId, conn.id)
      const list = await getUserConnections(testUserId)
      expect(list.find((c) => c.id === conn.id)).toBeUndefined()
    })
  })
})
