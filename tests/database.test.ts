import { describe, it, expect } from 'vitest'
import {
  validateSqlIdentifier,
  isDestructiveOrWriteQuery,
  createDatabaseSchema,
  createTableSchema,
  executeSqlSchema,
  tableDataQuerySchema
} from '../server/validators/database.validator'

describe('Database Validators & Security Guardrails', () => {
  describe('validateSqlIdentifier()', () => {
    it('accepts valid SQL identifiers', () => {
      expect(validateSqlIdentifier('ecommerce_db')).toBe('ecommerce_db')
      expect(validateSqlIdentifier('users_2026')).toBe('users_2026')
      expect(validateSqlIdentifier('OrderItems')).toBe('OrderItems')
    })

    it('rejects identifiers with SQL injection payloads', () => {
      expect(() => validateSqlIdentifier('db; DROP TABLE users;--')).toThrow()
      expect(() => validateSqlIdentifier("users' OR '1'='1")).toThrow()
      expect(() => validateSqlIdentifier('`users`')).toThrow()
      expect(() => validateSqlIdentifier('app db')).toThrow()
      expect(() => validateSqlIdentifier('app-db')).toThrow()
    })

    it('rejects empty or whitespace-only identifiers', () => {
      expect(() => validateSqlIdentifier('')).toThrow()
      expect(() => validateSqlIdentifier('   ')).toThrow()
    })
  })

  describe('isDestructiveOrWriteQuery()', () => {
    it('allows read-only queries', () => {
      expect(isDestructiveOrWriteQuery('SELECT * FROM users')).toBe(false)
      expect(isDestructiveOrWriteQuery('SHOW TABLES')).toBe(false)
      expect(isDestructiveOrWriteQuery('DESCRIBE orders')).toBe(false)
      expect(isDestructiveOrWriteQuery('EXPLAIN SELECT id FROM users WHERE status = 1')).toBe(false)
    })

    it('identifies DML write queries', () => {
      expect(isDestructiveOrWriteQuery('INSERT INTO users (name) VALUES ("Alice")')).toBe(true)
      expect(isDestructiveOrWriteQuery('UPDATE users SET name = "Bob" WHERE id = 1')).toBe(true)
      expect(isDestructiveOrWriteQuery('DELETE FROM users WHERE id = 1')).toBe(true)
      expect(isDestructiveOrWriteQuery('REPLACE INTO config (key, val) VALUES ("a", "b")')).toBe(true)
    })

    it('identifies DDL destructive queries', () => {
      expect(isDestructiveOrWriteQuery('DROP TABLE users')).toBe(true)
      expect(isDestructiveOrWriteQuery('DROP DATABASE mydb')).toBe(true)
      expect(isDestructiveOrWriteQuery('ALTER TABLE users ADD COLUMN phone VARCHAR(20)')).toBe(true)
      expect(isDestructiveOrWriteQuery('TRUNCATE TABLE logs')).toBe(true)
      expect(isDestructiveOrWriteQuery('CREATE TABLE temp (id INT)')).toBe(true)
    })

    it('detects write commands disguised with SQL comments', () => {
      expect(isDestructiveOrWriteQuery('/* comment */ DROP TABLE users')).toBe(true)
      expect(isDestructiveOrWriteQuery('-- line comment\nDELETE FROM orders')).toBe(true)
    })
  })

  describe('createDatabaseSchema', () => {
    it('accepts valid database name', () => {
      const res = createDatabaseSchema.safeParse({ name: 'analytics_db' })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.charset).toBe('utf8mb4')
        expect(res.data.collation).toBe('utf8mb4_unicode_ci')
      }
    })

    it('rejects protected system database names', () => {
      expect(createDatabaseSchema.safeParse({ name: 'kyodb_system' }).success).toBe(false)
      expect(createDatabaseSchema.safeParse({ name: 'mysql' }).success).toBe(false)
      expect(createDatabaseSchema.safeParse({ name: 'information_schema' }).success).toBe(false)
      expect(createDatabaseSchema.safeParse({ name: 'performance_schema' }).success).toBe(false)
      expect(createDatabaseSchema.safeParse({ name: 'sys' }).success).toBe(false)
    })

    it('rejects names with special characters or hyphens', () => {
      expect(createDatabaseSchema.safeParse({ name: 'my-db' }).success).toBe(false)
      expect(createDatabaseSchema.safeParse({ name: 'db.prod' }).success).toBe(false)
    })
  })

  describe('createTableSchema', () => {
    it('accepts valid table definition', () => {
      const res = createTableSchema.safeParse({
        tableName: 'orders',
        columns: [
          { name: 'id', type: 'BIGINT', primaryKey: true, autoIncrement: true, nullable: false },
          { name: 'total_amount', type: 'DECIMAL', length: '10,2', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
        ]
      })
      expect(res.success).toBe(true)
    })

    it('rejects table without columns', () => {
      const res = createTableSchema.safeParse({
        tableName: 'empty_table',
        columns: []
      })
      expect(res.success).toBe(false)
    })

    it('rejects column with invalid identifier', () => {
      const res = createTableSchema.safeParse({
        tableName: 'items',
        columns: [{ name: 'invalid-col-name', type: 'VARCHAR', length: '255' }]
      })
      expect(res.success).toBe(false)
    })
  })

  describe('executeSqlSchema', () => {
    it('accepts valid query payload', () => {
      const res = executeSqlSchema.safeParse({
        database: 'my_app',
        sql: 'SELECT * FROM users WHERE active = 1',
        readOnly: false
      })
      expect(res.success).toBe(true)
    })

    it('rejects empty SQL query', () => {
      const res = executeSqlSchema.safeParse({
        database: 'my_app',
        sql: ''
      })
      expect(res.success).toBe(false)
    })

    it('rejects invalid database name', () => {
      const res = executeSqlSchema.safeParse({
        database: 'db; DROP TABLE x',
        sql: 'SELECT 1'
      })
      expect(res.success).toBe(false)
    })
  })

  describe('tableDataQuerySchema', () => {
    it('parses pagination defaults', () => {
      const res = tableDataQuerySchema.safeParse({})
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.page).toBe(1)
        expect(res.data.pageSize).toBe(50)
        expect(res.data.sortDirection).toBe('ASC')
      }
    })

    it('coerces string numbers from query params', () => {
      const res = tableDataQuerySchema.safeParse({ page: '3', pageSize: '25' })
      expect(res.success).toBe(true)
      if (res.success) {
        expect(res.data.page).toBe(3)
        expect(res.data.pageSize).toBe(25)
      }
    })

    it('rejects pageSize over 250', () => {
      const res = tableDataQuerySchema.safeParse({ pageSize: '500' })
      expect(res.success).toBe(false)
    })
  })
})
