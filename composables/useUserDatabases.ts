import type {
  UserDatabaseConnection,
  UserDatabaseConnectionPayload,
  TestConnectionPayload,
  ConnectionHealth
} from '~/types'

export const useUserDatabases = () => {
  const connections = useState<UserDatabaseConnection[]>('user_tidb_connections', () => [])
  const isLoading = ref<boolean>(false)
  const isTesting = ref<boolean>(false)
  const error = ref<string | null>(null)
  const testResult = ref<ConnectionHealth | null>(null)

  const activeConnection = computed(() => {
    return connections.value.find((c) => c.isDefault) || connections.value[0] || null
  })

  const hasConnection = computed(() => connections.value.length > 0)

  const fetchConnections = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: UserDatabaseConnection[] }>('/api/user-databases')
      connections.value = res.data || []
      return connections.value
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to load database connections'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const testConnection = async (payload: TestConnectionPayload): Promise<ConnectionHealth> => {
    isTesting.value = true
    testResult.value = null
    try {
      const res = await $fetch<{ success: boolean; data: ConnectionHealth }>('/api/user-databases/test', {
        method: 'POST',
        body: payload
      })
      testResult.value = res.data
      return res.data
    } catch (err: any) {
      const failHealth: ConnectionHealth = {
        connected: false,
        service: 'tidb',
        statusText: 'Connection Failed',
        error: err.data?.statusMessage || err.message || 'Failed to connect to TiDB instance',
        lastChecked: new Date().toISOString()
      }
      testResult.value = failHealth
      return failHealth
    } finally {
      isTesting.value = false
    }
  }

  const createConnection = async (payload: UserDatabaseConnectionPayload) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{
        success: boolean
        data: UserDatabaseConnection
        connectionTest?: ConnectionHealth
      }>('/api/user-databases', {
        method: 'POST',
        body: payload
      })
      await fetchConnections()
      return { success: true, data: res.data, connectionTest: res.connectionTest }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to save TiDB connection'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const updateConnection = async (id: string, payload: Partial<UserDatabaseConnectionPayload>) => {
    isLoading.value = true
    error.value = null
    try {
      const res = await $fetch<{ success: boolean; data: UserDatabaseConnection }>(
        `/api/user-databases/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          body: payload
        }
      )
      await fetchConnections()
      return { success: true, data: res.data }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to update TiDB connection'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const deleteConnection = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/user-databases/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
      await fetchConnections()
      return { success: true }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to delete TiDB connection'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  const activateConnection = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await $fetch(`/api/user-databases/${encodeURIComponent(id)}/activate`, {
        method: 'POST'
      })
      await fetchConnections()
      return { success: true }
    } catch (err: any) {
      const msg = err.data?.statusMessage || err.message || 'Failed to activate connection'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      isLoading.value = false
    }
  }

  return {
    connections,
    activeConnection,
    hasConnection,
    isLoading,
    isTesting,
    error,
    testResult,
    fetchConnections,
    testConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    activateConnection
  }
}
