import mysql from 'mysql2/promise'
import type { ConnectionHealth } from '~/types'

let pool: mysql.Pool | null = null

export function isSystemDatabase(dbName: string): boolean {
  return dbName.toLowerCase() === 'kyodb_system'
}

export function getDbPool(): mysql.Pool | null {
  const config = useRuntimeConfig()

  if (!config.tidbHost || !config.tidbUser) {
    return null
  }

  if (!pool) {
    const sslConfig: mysql.SslOptions = config.tidbSslCa
      ? { ca: config.tidbSslCa, minVersion: 'TLSv1.2', rejectUnauthorized: true }
      : { minVersion: 'TLSv1.2', rejectUnauthorized: true }

    pool = mysql.createPool({
      host: config.tidbHost,
      port: config.tidbPort || 4000,
      user: config.tidbUser,
      password: config.tidbPassword,
      database: config.tidbDatabase || 'kyodb_system',
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    })
  }

  return pool
}

export async function testTiDbConnection(): Promise<ConnectionHealth> {
  const config = useRuntimeConfig()
  const lastChecked = new Date().toISOString()

  if (!config.tidbHost || !config.tidbUser) {
    return {
      connected: false,
      service: 'tidb',
      statusText: 'Not Configured',
      error: 'TIDB_HOST or TIDB_USER environment variable is missing',
      lastChecked
    }
  }

  const p = getDbPool()
  if (!p) {
    return {
      connected: false,
      service: 'tidb',
      statusText: 'Pool Initialization Failed',
      error: 'Unable to initialize database connection pool',
      lastChecked
    }
  }

  const startTime = Date.now()
  try {
    const connection = await p.getConnection()
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>('SELECT VERSION() as version, NOW() as server_time')
      const latencyMs = Date.now() - startTime
      const versionStr = rows[0]?.version || 'Unknown'

      return {
        connected: true,
        service: 'tidb',
        statusText: 'Connected (TiDB Cloud)',
        latencyMs,
        version: versionStr,
        details: {
          host: config.tidbHost,
          database: config.tidbDatabase || 'kyodb_system',
          serverTime: rows[0]?.server_time
        },
        lastChecked
      }
    } finally {
      connection.release()
    }
  } catch (err: any) {
    return {
      connected: false,
      service: 'tidb',
      statusText: 'Connection Failed',
      error: err.message || 'Failed to connect to TiDB Cloud',
      latencyMs: Date.now() - startTime,
      lastChecked
    }
  }
}
