import type { ApiKey, CreateApiKeyPayload, CreateApiKeyResponse } from '~/types'

export function useApiKeys() {
  const apiKeys = ref<ApiKey[]>([])
  const isLoading = ref(false)

  const fetchApiKeys = async (projectId?: string) => {
    isLoading.value = true
    try {
      const query = projectId ? { projectId } : undefined
      const res = await $fetch<{ success: boolean; data: ApiKey[] }>('/api/api-keys', { query })
      if (res?.success && res.data) {
        apiKeys.value = res.data
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createApiKey = async (payload: CreateApiKeyPayload): Promise<{ success: boolean; data?: CreateApiKeyResponse; error?: string }> => {
    try {
      const res = await $fetch<{ success: boolean; data: CreateApiKeyResponse }>('/api/api-keys', {
        method: 'POST',
        body: payload
      })
      if (res?.success && res.data) {
        apiKeys.value.unshift(res.data.apiKey)
        return { success: true, data: res.data }
      }
      return { success: false, error: 'Failed to create API key' }
    } catch (err: any) {
      return {
        success: false,
        error: err.data?.message || err.message || 'Failed to create API key'
      }
    }
  }

  const revokeApiKey = async (id: string): Promise<boolean> => {
    try {
      const res = await $fetch<{ success: boolean }>(`/api/api-keys/${id}/revoke`, {
        method: 'POST'
      })
      if (res?.success) {
        const item = apiKeys.value.find((k) => k.id === id)
        if (item) {
          item.isRevoked = true
          item.revokedAt = new Date().toISOString()
        }
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to revoke API key:', err)
      return false
    }
  }

  const deleteApiKey = async (id: string): Promise<boolean> => {
    try {
      const res = await $fetch<{ success: boolean }>(`/api/api-keys/${id}`, {
        method: 'DELETE'
      })
      if (res?.success) {
        apiKeys.value = apiKeys.value.filter((k) => k.id !== id)
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to delete API key:', err)
      return false
    }
  }

  return {
    apiKeys,
    isLoading,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    deleteApiKey
  }
}
