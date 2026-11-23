import type {
  DatabaseInfo,
  TableInfo,
  TableColumn,
  TableIndex,
  TableDataResponse,
  CreateTableInput,
  TableDataQueryInput
} from '~/types'

export const useDatabases = () => {
  const databases = useState<DatabaseInfo[]>('databases_list', () => [])
  const currentDatabase = useState<string>('current_database', () => '')
  const tables = useState<TableInfo[]>('database_tables', () => [])
  const currentTable = useState<string>('current_table', () => '')
  const tableDetails = useState<{ columns: TableColumn[]; indexes: TableIndex[] } | null>('table_details', () => null)
  const tableData = useState<TableDataResponse | null>('table_data', () => null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchDatabases = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: DatabaseInfo[] }>('/api/databases')
      databases.value = res.data || []
      if (!currentDatabase.value && databases.value.length > 0) {
        // Default to first non-system database or first available
        const defaultDb = databases.value.find((d) => !d.isSystem) || databases.value[0]
        currentDatabase.value = defaultDb.name
      }
      return databases.value
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to fetch databases'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const createDatabase = async (name: string, charset = 'utf8mb4', collation = 'utf8mb4_unicode_ci') => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; message: string; name: string }>('/api/databases', {
        method: 'POST',
        body: { name, charset, collation }
      })
      await fetchDatabases()
      currentDatabase.value = res.name
      return { success: true, message: res.message }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to create database'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const deleteDatabase = async (name: string) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; message: string }>(`/api/databases/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      })
      if (currentDatabase.value === name) {
        currentDatabase.value = ''
        tables.value = []
        currentTable.value = ''
      }
      await fetchDatabases()
      return { success: true, message: res.message }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to drop database'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const fetchTables = async (databaseName?: string) => {
    const db = databaseName || currentDatabase.value
    if (!db) return []

    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: TableInfo[] }>(`/api/databases/${encodeURIComponent(db)}/tables`)
      tables.value = res.data || []
      return tables.value
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to load tables'
      tables.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  const fetchTableDetails = async (databaseName: string, tableName: string) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: { columns: TableColumn[]; indexes: TableIndex[] } }>(
        `/api/databases/${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(tableName)}`
      )
      tableDetails.value = res.data
      return res.data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to load table details'
      tableDetails.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createTable = async (databaseName: string, payload: CreateTableInput) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; message: string }>(
        `/api/databases/${encodeURIComponent(databaseName)}/tables`,
        {
          method: 'POST',
          body: payload
        }
      )
      await fetchTables(databaseName)
      currentTable.value = payload.tableName
      return { success: true, message: res.message }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to create table'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const dropTable = async (databaseName: string, tableName: string) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; message: string }>(
        `/api/databases/${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(tableName)}`,
        {
          method: 'DELETE'
        }
      )
      if (currentTable.value === tableName) {
        currentTable.value = ''
        tableDetails.value = null
        tableData.value = null
      }
      await fetchTables(databaseName)
      return { success: true, message: res.message }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to drop table'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const fetchTableData = async (databaseName: string, tableName: string, params: TableDataQueryInput) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: TableDataResponse }>(
        `/api/databases/${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(tableName)}/data`,
        {
          query: params
        }
      )
      tableData.value = res.data
      return res.data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to fetch table rows'
      tableData.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  const insertRow = async (databaseName: string, tableName: string, data: Record<string, any>) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; insertId?: any }>(
        `/api/databases/${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(tableName)}/data`,
        {
          method: 'POST',
          body: { data }
        }
      )
      return { success: true, insertId: res.insertId }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to insert row'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const updateRow = async (
    databaseName: string,
    tableName: string,
    primaryKey: string,
    primaryKeyValue: any,
    data: Record<string, any>
  ) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; affectedRows: number }>(
        `/api/databases/${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(tableName)}/data`,
        {
          method: 'PUT',
          body: { primaryKey, primaryKeyValue, data }
        }
      )
      return { success: true, affectedRows: res.affectedRows }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to update row'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const deleteRow = async (
    databaseName: string,
    tableName: string,
    primaryKey: string,
    primaryKeyValue: any
  ) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; affectedRows: number }>(
        `/api/databases/${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(tableName)}/data`,
        {
          method: 'DELETE',
          body: { primaryKey, primaryKeyValue }
        }
      )
      return { success: true, affectedRows: res.affectedRows }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to delete row'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  return {
    databases,
    currentDatabase,
    tables,
    currentTable,
    tableDetails,
    tableData,
    isLoading,
    error,
    fetchDatabases,
    createDatabase,
    deleteDatabase,
    fetchTables,
    fetchTableDetails,
    createTable,
    dropTable,
    fetchTableData,
    insertRow,
    updateRow,
    deleteRow
  }
}
