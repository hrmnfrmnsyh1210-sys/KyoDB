import { hasAdminUser, validateSessionToken } from '../../services/auth.service'

export default defineEventHandler(async (event) => {
  let admin = event.context.admin

  if (!admin) {
    const token = getCookie(event, 'kyodb_session')
    if (token) {
      admin = await validateSessionToken(token)
    }
  }

  if (admin) {
    return {
      authenticated: true,
      user: admin
    }
  }

  const hasAdmin = await hasAdminUser()
  return {
    authenticated: false,
    requiresBootstrap: !hasAdmin,
    user: null
  }
})
