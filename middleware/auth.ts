export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // Ensure we have loaded auth state from cookie/session
  if (!auth.isChecked.value) {
    await auth.fetchUser()
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!auth.isAuthenticated.value && to.path !== '/login') {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // If user is authenticated and navigating to login, redirect to home
  if (auth.isAuthenticated.value && to.path === '/login') {
    return navigateTo('/')
  }
})
