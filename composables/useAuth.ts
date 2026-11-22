import type { AdminUser } from '~/types'

export const useAuth = () => {
  const user = useState<AdminUser | null>('auth_user', () => null)
  const isChecked = useState<boolean>('auth_checked', () => false)
  const requiresBootstrap = useState<boolean>('auth_requires_bootstrap', () => false)
  const isLoading = ref<boolean>(false)

  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    isLoading.value = true
    try {
      const data = await $fetch<{
        authenticated: boolean
        requiresBootstrap?: boolean
        user: AdminUser | null
      }>('/api/auth/me')

      user.value = data.user
      requiresBootstrap.value = !!data.requiresBootstrap
      isChecked.value = true
      return data
    } catch {
      user.value = null
      isChecked.value = true
      return { authenticated: false, user: null }
    } finally {
      isLoading.value = false
    }
  }

  const login = async (identifier: string, password: string) => {
    isLoading.value = true
    try {
      const res = await $fetch<{ success: boolean; user: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: { identifier, password }
      })
      user.value = res.user
      isChecked.value = true
      requiresBootstrap.value = false
      return { success: true }
    } catch (err: any) {
      return {
        success: false,
        error: err.data?.statusMessage || err.message || 'Login failed'
      }
    } finally {
      isLoading.value = false
    }
  }

  const bootstrap = async (params: { username: string; email: string; password: string }) => {
    isLoading.value = true
    try {
      const res = await $fetch<{ success: boolean; message: string; user: AdminUser }>(
        '/api/auth/bootstrap',
        {
          method: 'POST',
          body: params
        }
      )
      requiresBootstrap.value = false
      return { success: true, message: res.message }
    } catch (err: any) {
      return {
        success: false,
        error: err.data?.statusMessage || err.message || 'Bootstrap failed'
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      isLoading.value = false
      await navigateTo('/login')
    }
  }

  return {
    user,
    isChecked,
    requiresBootstrap,
    isLoading,
    isAuthenticated,
    fetchUser,
    login,
    bootstrap,
    logout
  }
}
