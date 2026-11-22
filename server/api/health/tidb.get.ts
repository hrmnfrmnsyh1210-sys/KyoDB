import { testTiDbConnection } from '../../services/db.service'

export default defineEventHandler(async () => {
  return await testTiDbConnection()
})
