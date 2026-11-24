import { loginSchema } from '../../validators/auth.validator'
import { authenticateAdmin, checkRateLimit } from '../../services/auth.service'

export default defineEventHandler(async (event) => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const userAgent = getRequestHeader(event, 'user-agent')

  // Rate limit: 5 failed attempts per 15 mins per IP
  const allowed = checkRateLimit(`login_${clientIp}`, 5, 15)
  if (!allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many failed login attempts. Please try again in 15 minutes.'
    })
  }

  const body = await readBody(event)
  const validation = loginSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid input data'
    })
  }

  const { identifier, password } = validation.data
  const { user, rawToken, expiresAt } = await authenticateAdmin(
    identifier,
    password,
    clientIp,
    userAgent
  )

  const isHttps = getRequestProtocol(event) === 'https'

  // Set secure HTTP-only cookie (secure only on actual HTTPS connections)
  setCookie(event, 'kyodb_session', rawToken, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  })

  return {
    success: true,
    user
  }
})
