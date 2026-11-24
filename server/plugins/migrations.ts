import { runMigrations } from '../services/migration.service'

export default defineNitroPlugin(async () => {
  try {
    const res = await runMigrations()
    if (res.success && res.executedFiles.length > 0) {
      console.log(`[Migrations] Auto-applied: ${res.executedFiles.join(', ')}`)
    }
  } catch (err: any) {
    console.warn('[Migrations] Auto-migration on startup skipped or failed:', err.message)
  }
})
