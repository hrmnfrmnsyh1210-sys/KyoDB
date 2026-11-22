import type { SystemHealthSummary, ConnectionHealth } from '~/types'

export const useSystemHealth = () => {
  const health = useState<SystemHealthSummary | null>('system_health', () => null)
  const isChecking = ref<boolean>(false)
  const lastError = ref<string | null>(null)

  const checkHealth = async () => {
    isChecking.value = true
    lastError.value = null
    try {
      const data = await $fetch<SystemHealthSummary>('/api/health/system')
      health.value = data
      return data
    } catch (err: any) {
      lastError.value = err.message || 'Failed to fetch health status'
      return null
    } finally {
      isChecking.value = false
    }
  }

  const testTiDb = async (): Promise<ConnectionHealth> => {
    try {
      const res = await $fetch<ConnectionHealth>('/api/health/tidb')
      if (health.value) {
        health.value.tidb = res
      }
      return res
    } catch (err: any) {
      const failed: ConnectionHealth = {
        connected: false,
        service: 'tidb',
        statusText: 'Check Failed',
        error: err.message,
        lastChecked: new Date().toISOString()
      }
      if (health.value) {
        health.value.tidb = failed
      }
      return failed
    }
  }

  const testR2 = async (): Promise<ConnectionHealth> => {
    try {
      const res = await $fetch<ConnectionHealth>('/api/health/r2')
      if (health.value) {
        health.value.r2 = res
      }
      return res
    } catch (err: any) {
      const failed: ConnectionHealth = {
        connected: false,
        service: 'r2',
        statusText: 'Check Failed',
        error: err.message,
        lastChecked: new Date().toISOString()
      }
      if (health.value) {
        health.value.r2 = failed
      }
      return failed
    }
  }

  return {
    health,
    isChecking,
    lastError,
    checkHealth,
    testTiDb,
    testR2
  }
}
