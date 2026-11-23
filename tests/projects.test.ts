import { describe, it, expect } from 'vitest'
import { createProjectSchema, updateProjectSchema, attachDatabaseSchema, isReservedDatabase } from '../server/validators/project.validator'

describe('Project Validators', () => {
  describe('isReservedDatabase()', () => {
    it('flags kyodb_system as reserved', () => {
      expect(isReservedDatabase('kyodb_system')).toBe(true)
    })

    it('flags mysql as reserved', () => {
      expect(isReservedDatabase('mysql')).toBe(true)
    })

    it('flags information_schema as reserved', () => {
      expect(isReservedDatabase('information_schema')).toBe(true)
    })

    it('is case-insensitive', () => {
      expect(isReservedDatabase('KYODB_SYSTEM')).toBe(true)
      expect(isReservedDatabase('MySQL')).toBe(true)
    })

    it('allows user databases', () => {
      expect(isReservedDatabase('my_app_db')).toBe(false)
      expect(isReservedDatabase('ecommerce_production')).toBe(false)
    })
  })

  describe('createProjectSchema', () => {
    it('accepts valid minimal project', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'my-app'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('active')
        expect(result.data.databaseOption).toBe('none')
      }
    })

    it('accepts project with new database creation', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'my-app',
        databaseOption: 'create_new',
        databaseName: 'my_app_db'
      })
      expect(result.success).toBe(true)
    })

    it('rejects slug with uppercase letters', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'My-App'
      })
      expect(result.success).toBe(false)
    })

    it('rejects slug with spaces', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'my app'
      })
      expect(result.success).toBe(false)
    })

    it('rejects too-short name', () => {
      const result = createProjectSchema.safeParse({
        name: 'A',
        slug: 'a'
      })
      expect(result.success).toBe(false)
    })

    it('rejects create_new option without databaseName', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'my-app',
        databaseOption: 'create_new'
      })
      expect(result.success).toBe(false)
    })

    it('rejects system reserved database in create_new', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'my-app',
        databaseOption: 'create_new',
        databaseName: 'kyodb_system'
      })
      expect(result.success).toBe(false)
    })

    it('rejects database name with hyphens', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'my-app',
        databaseOption: 'create_new',
        databaseName: 'my-app-db'
      })
      expect(result.success).toBe(false)
    })

    it('accepts all valid statuses', () => {
      for (const status of ['active', 'archived', 'suspended'] as const) {
        const result = createProjectSchema.safeParse({
          name: 'My App',
          slug: 'my-app',
          status
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.status).toBe(status)
        }
      }
    })

    it('rejects invalid status', () => {
      const result = createProjectSchema.safeParse({
        name: 'My App',
        slug: 'my-app',
        status: 'disabled'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateProjectSchema', () => {
    it('allows partial updates (all fields optional)', () => {
      const result = updateProjectSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts name update only', () => {
      const result = updateProjectSchema.safeParse({ name: 'Updated Name' })
      expect(result.success).toBe(true)
    })

    it('accepts status update only', () => {
      const result = updateProjectSchema.safeParse({ status: 'archived' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('archived')
      }
    })

    it('rejects too-short name on update', () => {
      const result = updateProjectSchema.safeParse({ name: 'X' })
      expect(result.success).toBe(false)
    })
  })

  describe('attachDatabaseSchema', () => {
    it('accepts a valid database name', () => {
      const result = attachDatabaseSchema.safeParse({
        databaseName: 'my_new_db',
        createNew: true
      })
      expect(result.success).toBe(true)
    })

    it('defaults createNew to false', () => {
      const result = attachDatabaseSchema.safeParse({
        databaseName: 'existing_db'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.createNew).toBe(false)
      }
    })

    it('rejects reserved database name in attach', () => {
      const result = attachDatabaseSchema.safeParse({
        databaseName: 'mysql',
        createNew: false
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty database name', () => {
      const result = attachDatabaseSchema.safeParse({
        databaseName: '',
        createNew: false
      })
      expect(result.success).toBe(false)
    })

    it('rejects database name with hyphens', () => {
      const result = attachDatabaseSchema.safeParse({
        databaseName: 'my-db'
      })
      expect(result.success).toBe(false)
    })

    it('rejects database name with spaces', () => {
      const result = attachDatabaseSchema.safeParse({
        databaseName: 'my db'
      })
      expect(result.success).toBe(false)
    })
  })
})
