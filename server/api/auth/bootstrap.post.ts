import { bootstrapAdminSchema } from '../../validators/auth.validator'
import { bootstrapAdmin, hasAdminUser } from '../../services/auth.service'

export default defineEventHandler(async (event) => {
  const existing = await hasAdminUser()
  if (existing) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Administrator is already initialized. Bootstrap is locked.'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const body = await readBody(event)
  const validation = bootstrapAdminSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Validation error'
    })
  }

  const result = await bootstrapAdmin({
    username: validation.data.username,
    email: validation.data.email,
    password: validation.data.password,
    ipAddress: clientIp
  })

  return {
    success: true,
    message: 'Initial administrator created successfully. You can now login.',
    user: result.user
  }
})
