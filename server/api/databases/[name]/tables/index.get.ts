import { listTablesForDatabase } from '../../../../services/database.service'

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Database name is required' })
  }

  const tables = await listTablesForDatabase(name)
  return {
    success: true,
    data: tables
  }
})
