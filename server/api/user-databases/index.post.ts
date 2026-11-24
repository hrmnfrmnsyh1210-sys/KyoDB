import { createUserConnectionSchema } from '../../validators/user-db.validator'
import { createUserConnection, testTiDbCredentials } from '../../services/user-db.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = createUserConnectionSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.errors[0]?.message || 'Invalid TiDB connection data'
    })
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'

  // Optionally test connection first
  const testRes = await testTiDbCredentials({
    host: validation.data.host,
    port: validation.data.port,
    username: validation.data.username,
    password: validation.data.password,
    database: validation.data.database,
    sslCa: validation.data.sslCa
  })

  const connection = await createUserConnection(user.id, validation.data, clientIp)

  return {
    success: true,
    data: connection,
    connectionTest: testRes
  }
})
