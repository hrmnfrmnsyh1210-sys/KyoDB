import { testR2Connection } from '../../services/storage.service'

export default defineEventHandler(async () => {
  return await testR2Connection()
})
