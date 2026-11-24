export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // Only check session if user is not already authenticated in state
  if (!auth.isAuthenticated.value && !auth.isChecked.value) {
    await auth.fetchUser()
  }

  // Public accessible routes
  const publicRoutes = ['/', '/login', '/register', '/docs']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/docs')

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!auth.isAuthenticated.value && !isPublicRoute) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  const role = auth.user.value?.role

  // If authenticated and going to login/register → redirect based on role
  if (auth.isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo(role === 'admin' ? '/dashboard' : '/app')
  }

  // Admin-only routes — block public users
  const adminOnlyPrefixes = ['/dashboard', '/projects', '/monitoring', '/storage']
  const isAdminRoute = adminOnlyPrefixes.some((p) => to.path === p || to.path.startsWith(p + '/'))
  if (auth.isAuthenticated.value && isAdminRoute && role !== 'admin') {
    return navigateTo('/app')
  }
})
