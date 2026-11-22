import os from 'node:os'
import { testTiDbConnection } from '../../services/db.service'
import { testR2Connection } from '../../services/storage.service'
import type { SystemHealthSummary } from '~/types'

export default defineEventHandler(async (): Promise<SystemHealthSummary> => {
  const [tidb, r2] = await Promise.all([
    testTiDbConnection(),
    testR2Connection()
  ])

  return {
    tidb,
    r2,
    system: {
      nodeVersion: process.version,
      platform: `${os.type()} ${os.release()} (${os.arch()})`,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    }
  }
})
