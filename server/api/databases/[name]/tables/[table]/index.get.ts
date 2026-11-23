import { getTableDetails } from '../../../../../services/database.service'

export default defineEventHandler(async (event) => {
  const databaseName = getRouterParam(event, 'name')
  const tableName = getRouterParam(event, 'table')

  if (!databaseName || !tableName) {
    throw createError({ statusCode: 400, statusMessage: 'Database and table names are required' })
  }

  const details = await getTableDetails(databaseName, tableName)
  return {
    success: true,
    data: details
  }
})
