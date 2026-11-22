import { validateSessionToken } from '../services/auth.service'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'kyodb_session')

  if (token) {
    const admin = await validateSessionToken(token)
    if (admin) {
      event.context.admin = admin
    }
  }

  // Protect internal admin-specific or migration endpoints
  const path = getRequestPath(event)
  if (path.startsWith('/api/migrations/run')) {
    if (!event.context.admin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Admin session required.'
      })
    }
  }
})
