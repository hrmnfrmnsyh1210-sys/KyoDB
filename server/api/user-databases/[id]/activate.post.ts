import { setDefaultUserConnection } from '../../../services/user-db.service'

export default defineEventHandler(async (event) => {
  const user = event.context.user || event.context.admin
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Connection ID required' })
  }

  await setDefaultUserConnection(user.id, id)

  return {
    success: true,
    message: 'Connection set as active TiDB database.'
  }
})
