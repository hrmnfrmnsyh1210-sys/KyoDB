import { hasAdminUser } from '../../services/auth.service'

export default defineEventHandler(async (event) => {
  if (event.context.admin) {
    return {
      authenticated: true,
      user: event.context.admin
    }
  }

  const hasAdmin = await hasAdminUser()
  return {
    authenticated: false,
    requiresBootstrap: !hasAdmin,
    user: null
  }
})
