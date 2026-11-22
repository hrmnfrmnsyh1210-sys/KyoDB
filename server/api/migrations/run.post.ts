import { runMigrations } from '../../services/migration.service'

export default defineEventHandler(async (event) => {
  // Authentication check is enforced in server/middleware/auth.ts
  if (!event.context.admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Admin credentials required to execute migrations.'
    })
  }

  const result = await runMigrations()
  if (!result.success) {
    throw createError({
      statusCode: 500,
      statusMessage: result.message,
      data: { error: result.error }
    })
  }

  return result
})
