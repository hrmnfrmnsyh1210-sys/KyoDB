import mysql from 'mysql2/promise'
import type { ConnectionHealth } from '~/types'

let pool: mysql.Pool | null = null

export function isSystemDatabase(dbName: string): boolean {
  return dbName.toLowerCase() === 'kyodb_system'
}

export function getDbPool(): mysql.Pool | null {
  let config: any = {}
  try {
    config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : {}
  } catch {
    config = {}
  }

  const tidbHost = config.tidbHost || process.env.TIDB_HOST
  const tidbUser = config.tidbUser || process.env.TIDB_USER
  const tidbPassword = config.tidbPassword || process.env.TIDB_PASSWORD
  const tidbPort = Number(config.tidbPort || process.env.TIDB_PORT) || 4000
  const tidbDatabase = config.tidbDatabase || process.env.TIDB_DATABASE || 'kyodb_system'
  const tidbSslCa = config.tidbSslCa || process.env.TIDB_SSL_CA

  if (!tidbHost || !tidbUser) {
    return null
  }

  if (!pool) {
    const sslConfig: mysql.SslOptions = tidbSslCa
      ? { ca: tidbSslCa, minVersion: 'TLSv1.2', rejectUnauthorized: true }
      : { minVersion: 'TLSv1.2', rejectUnauthorized: true }

    pool = mysql.createPool({
      host: tidbHost,
      port: tidbPort,
      user: tidbUser,
      password: tidbPassword,
      database: tidbDatabase,
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
  let config: any = {}
  try {
    config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : {}
  } catch {
    config = {}
  }

  const tidbHost = config.tidbHost || process.env.TIDB_HOST
  const tidbUser = config.tidbUser || process.env.TIDB_USER
  const tidbDatabase = config.tidbDatabase || process.env.TIDB_DATABASE || 'kyodb_system'
  const lastChecked = new Date().toISOString()

  if (!tidbHost || !tidbUser) {
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
          host: tidbHost,
          database: tidbDatabase,
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
