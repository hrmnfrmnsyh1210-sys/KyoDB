import { validateSessionToken } from '../services/auth.service'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'kyodb_session')

  if (token) {
    const sessionUser = await validateSessionToken(token)
    if (sessionUser) {
      if (sessionUser.role === 'admin') {
        event.context.admin = sessionUser
        event.context.user = null
      } else {
        event.context.user = sessionUser
        event.context.admin = null
      }
    }
  }

  const path = getRequestPath(event)

  // Protect internal admin-specific endpoints
  if (path.startsWith('/api/migrations/run')) {
    if (!event.context.admin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Admin session required.'
      })
    }
  }

  // Protect monitoring endpoints
  if (path.startsWith('/api/monitoring')) {
    if (!event.context.admin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Admin session required.'
      })
    }
  }

  // Protect API key management endpoints
  if (path.startsWith('/api/api-keys')) {
    if (!event.context.admin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Admin session required.'
      })
    }
  }

  // Protect project mutation endpoints
  if (path.startsWith('/api/projects') && (event.method === 'POST' || event.method === 'PUT' || event.method === 'DELETE')) {
    if (!event.context.admin) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Admin session required.'
      })
    }
  }

  // Protect database management and SQL execution mutation endpoints
  if (path.startsWith('/api/databases') && (event.method === 'POST' || event.method === 'PUT' || event.method === 'DELETE')) {
    if (!event.context.admin && !event.context.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Active session required.'
      })
    }
  }

  // Protect user database connection management endpoints
  if (path.startsWith('/api/user-databases')) {
    if (!event.context.admin && !event.context.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Please sign in.'
      })
    }
  }

  // Protect storage mutation endpoints
  if (path.startsWith('/api/storage') && (event.method === 'POST' || event.method === 'PUT' || event.method === 'DELETE')) {
    // Allow mock upload/download for dev
    if (!path.startsWith('/api/storage/mock-')) {
      if (!event.context.admin) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized. Admin session required.'
        })
      }
    }
  }
})
