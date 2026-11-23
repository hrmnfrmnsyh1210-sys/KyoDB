import { describe, it, expect, beforeAll } from 'vitest'

// Mock Nuxt runtime config for test runner environment
if (typeof (globalThis as any).useRuntimeConfig !== 'function') {
  ;(globalThis as any).useRuntimeConfig = () => ({
    tidbHost: '',
    tidbUser: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: ''
  })
}

import { formatUptime, recordQueryExecution, getPaginatedQueryHistory, getSystemResourceStats } from '../server/services/monitoring.service'
import { auditLogsQuerySchema, queryHistoryQuerySchema } from '../server/validators/monitoring.validator'

describe('Monitoring Service & Validators', () => {
  describe('formatUptime()', () => {
    it('formats seconds only', () => {
      expect(formatUptime(45)).toBe('45s')
    })

    it('formats minutes and seconds', () => {
      expect(formatUptime(125)).toBe('2m 5s')
    })

    it('formats hours, minutes and seconds', () => {
      expect(formatUptime(3665)).toBe('1h 1m 5s')
    })

    it('formats days, hours, minutes and seconds', () => {
      expect(formatUptime(90061)).toBe('1d 1h 1m 1s')
    })
  })

  describe('auditLogsQuerySchema', () => {
    it('applies default pagination values', () => {
      const parsed = auditLogsQuerySchema.parse({})
      expect(parsed.page).toBe(1)
      expect(parsed.pageSize).toBe(20)
    })

    it('coerces string numbers for page and pageSize', () => {
      const parsed = auditLogsQuerySchema.parse({ page: '2', pageSize: '50' })
      expect(parsed.page).toBe(2)
      expect(parsed.pageSize).toBe(50)
    })

    it('clamps or rejects invalid page sizes', () => {
      expect(() => auditLogsQuerySchema.parse({ pageSize: 500 })).toThrow()
      expect(() => auditLogsQuerySchema.parse({ page: 0 })).toThrow()
    })

    it('accepts optional action, targetType, and search filters', () => {
      const parsed = auditLogsQuerySchema.parse({
        action: 'database.create',
        targetType: 'database',
        search: 'analytics'
      })
      expect(parsed.action).toBe('database.create')
      expect(parsed.targetType).toBe('database')
      expect(parsed.search).toBe('analytics')
    })
  })

  describe('queryHistoryQuerySchema', () => {
    it('applies defaults correctly', () => {
      const parsed = queryHistoryQuerySchema.parse({})
      expect(parsed.page).toBe(1)
      expect(parsed.pageSize).toBe(20)
    })

    it('accepts valid status enum values', () => {
      const successParsed = queryHistoryQuerySchema.parse({ status: 'success' })
      expect(successParsed.status).toBe('success')

      const errorParsed = queryHistoryQuerySchema.parse({ status: 'error' })
      expect(errorParsed.status).toBe('error')

      expect(() => queryHistoryQuerySchema.parse({ status: 'pending' })).toThrow()
    })
  })

  describe('Query Execution Recording & Paginated History', () => {
    it('records query execution and retrieves it via getPaginatedQueryHistory()', async () => {
      recordQueryExecution({
        projectId: 'proj_test_1',
        databaseName: 'test_db',
        sqlQuery: 'SELECT * FROM users LIMIT 10;',
        queryType: 'SELECT',
        executionTimeMs: 14,
        rowsAffected: 10,
        status: 'success'
      })

      const res = await getPaginatedQueryHistory({ page: 1, pageSize: 10 })
      expect(res.items.length).toBeGreaterThan(0)
      const latest = res.items[0]
      expect(latest.databaseName).toBe('test_db')
      expect(latest.status).toBe('success')
      expect(latest.executionTimeMs).toBe(14)
    })

    it('filters query history by database name and status', async () => {
      recordQueryExecution({
        projectId: 'proj_test_2',
        databaseName: 'custom_filter_db',
        sqlQuery: 'INSERT INTO logs VALUES(1);',
        queryType: 'INSERT',
        executionTimeMs: 35,
        rowsAffected: 1,
        status: 'success'
      })

      recordQueryExecution({
        projectId: 'proj_test_2',
        databaseName: 'custom_filter_db',
        sqlQuery: 'INVALID SQL STATEMENT',
        queryType: 'OTHER',
        executionTimeMs: 2,
        rowsAffected: 0,
        status: 'error',
        errorMessage: 'Syntax error'
      })

      const filteredDb = await getPaginatedQueryHistory({
        databaseName: 'custom_filter_db',
        page: 1,
        pageSize: 10
      })
      expect(filteredDb.items.every((q) => q.databaseName === 'custom_filter_db')).toBe(true)

      const filteredStatus = await getPaginatedQueryHistory({
        databaseName: 'custom_filter_db',
        status: 'error',
        page: 1,
        pageSize: 10
      })
      expect(filteredStatus.items.length).toBeGreaterThan(0)
      expect(filteredStatus.items[0].status).toBe('error')
    })
  })

  describe('getSystemResourceStats()', () => {
    it('returns system telemetry with memory and process details', async () => {
      const stats = await getSystemResourceStats()
      expect(stats).toBeDefined()
      expect(stats.uptimeSeconds).toBeGreaterThanOrEqual(0)
      expect(typeof stats.uptimeFormatted).toBe('string')
      expect(stats.nodeVersion).toMatch(/^v\d+/)
      expect(stats.memory.heapUsedBytes).toBeGreaterThan(0)
      expect(stats.memory.heapTotalBytes).toBeGreaterThan(0)
      expect(stats.tidb).toBeDefined()
      expect(stats.r2).toBeDefined()
      expect(stats.counts).toBeDefined()
    })
  })
})
