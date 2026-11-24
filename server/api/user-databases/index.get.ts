import { getUserConnections } from '../../services/user-db.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const connections = await getUserConnections(user.id)
  return {
    success: true,
    data: connections
  }
})
