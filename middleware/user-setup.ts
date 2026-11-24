/**
 * User-setup middleware: ensures public users have configured a TiDB connection.
 * If not, they are redirected to /setup.
 * Admin users skip this check entirely.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // Admins bypass this check
  if (auth.user.value?.role === 'admin') return

  // Skip for /setup itself and /settings (so user can still manage connections there)
  const skipPaths = ['/setup', '/settings', '/login', '/register', '/docs', '/']
  if (skipPaths.some((p) => to.path === p || to.path.startsWith('/docs'))) return

  // Check if user has an active TiDB connection
  const userDbs = useUserDatabases()
  if (!userDbs.activeConnection.value && userDbs.connections.value.length === 0) {
    // Load connections lazily if not yet fetched
    try {
      await userDbs.fetchConnections()
    } catch {
      // Network error — let /setup handle it
    }
    if (!userDbs.activeConnection.value) {
      return navigateTo('/app?connect=1')
    }
  }
})
