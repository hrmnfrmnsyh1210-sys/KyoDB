import { revokeSession } from '../../services/auth.service'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'kyodb_session')
  const adminId = event.context.admin?.id

  if (token) {
    await revokeSession(token, adminId)
    deleteCookie(event, 'kyodb_session', { path: '/' })
  }

  return { success: true, message: 'Logged out successfully' }
})
