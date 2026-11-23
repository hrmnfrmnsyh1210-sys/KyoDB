export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // Only check session if user is not already authenticated in state
  if (!auth.isAuthenticated.value && !auth.isChecked.value) {
    await auth.fetchUser()
  }

  // Public accessible routes
  const publicRoutes = ['/', '/login', '/docs']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/docs')

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!auth.isAuthenticated.value && !isPublicRoute) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // If user is authenticated and navigating to login, redirect to dashboard
  if (auth.isAuthenticated.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
