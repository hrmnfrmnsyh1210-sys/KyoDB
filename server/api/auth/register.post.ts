import { registerSchema } from '../../validators/auth.validator'
import { registerUser, checkRateLimit } from '../../services/auth.service'

export default defineEventHandler(async (event) => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const userAgent = getRequestHeader(event, 'user-agent')

  // Rate limit: 10 register attempts per 15 mins per IP
  const allowed = checkRateLimit(`register_${clientIp}`, 10, 15)
  if (!allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many registration attempts. Please try again in 15 minutes.'
    })
  }

  const body = await readBody(event)
  const validation = registerSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid registration data'
    })
  }

  const { username, email, password } = validation.data
  const { user, rawToken, expiresAt } = await registerUser({
    username,
    email,
    password,
    ipAddress: clientIp,
    userAgent
  })

  const isHttps = getRequestProtocol(event) === 'https'

  // Set secure HTTP-only session cookie (secure only on actual HTTPS connections)
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
