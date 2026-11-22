import { hasAdminUser } from '../../services/auth.service'

export default defineEventHandler(async () => {
  const hasAdmin = await hasAdminUser()
  return {
    isConfigured: hasAdmin,
    requiresBootstrap: !hasAdmin
  }
})
