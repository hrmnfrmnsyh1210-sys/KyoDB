/**
 * Admin-only middleware: blocks public users from admin routes.
 * Redirect public users to /app.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth()
  if (!auth.isAuthenticated.value) return navigateTo('/login')
  if (auth.user.value?.role !== 'admin') return navigateTo('/app')
})
