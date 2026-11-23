import type { QueryExecutionResult, QueryHistoryRecord } from '~/types'

export const useSqlEditor = () => {
  const activeDatabase = useState<string>('sql_active_database', () => '')
  const readOnly = useState<boolean>('sql_read_only', () => false)
  const isExecuting = ref<boolean>(false)
  const queryResult = useState<QueryExecutionResult | null>('sql_query_result', () => null)
  const queryHistory = useState<QueryHistoryRecord[]>('sql_query_history', () => [])
  const error = ref<string | null>(null)

  const executeQuery = async (database: string, sql: string, isReadOnly = false) => {
    isExecuting.value = true
    error.value = null

    try {
      const res = await $fetch<{ success: boolean; data: QueryExecutionResult }>('/api/databases/query/execute', {
        method: 'POST',
        body: {
          database,
          sql,
          readOnly: isReadOnly
        }
      })
      queryResult.value = res.data
      await fetchHistory(database)
      return res.data
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Query execution failed'
      error.value = msg
      queryResult.value = {
        query: sql,
        columns: [],
        rows: [],
        executionTimeMs: 0,
        status: 'error',
        error: msg,
        readOnly: isReadOnly
      }
      return queryResult.value
    } finally {
      isExecuting.value = false
    }
  }

  const fetchHistory = async (database?: string) => {
    try {
      const res = await $fetch<{ success: boolean; data: QueryHistoryRecord[] }>('/api/databases/query/history', {
        query: { database, limit: 30 }
      })
      queryHistory.value = res.data || []
      return queryHistory.value
    } catch {
      return []
    }
  }

  return {
    activeDatabase,
    readOnly,
    isExecuting,
    queryResult,
    queryHistory,
    error,
    executeQuery,
    fetchHistory
  }
}
