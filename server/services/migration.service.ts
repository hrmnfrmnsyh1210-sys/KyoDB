import fs from 'node:fs/promises'
import path from 'node:path'
import { getDbPool } from './db.service'
import { logAudit } from './audit.service'

export interface MigrationResult {
  success: boolean
  executedFiles: string[]
  message: string
  error?: string
}

export async function runMigrations(): Promise<MigrationResult> {
  const pool = getDbPool()
  if (!pool) {
    return {
      success: false,
      executedFiles: [],
      message: 'Database connection pool is not available. Please configure TiDB credentials.'
    }
  }

  const connection = await pool.getConnection()
  const executedFiles: string[] = []

  try {
    // 1. Ensure migration tracking table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _kyodb_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        batch INT NOT NULL,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `)

    // 2. Fetch already executed migrations
    const [existing] = await connection.query<any[]>(
      'SELECT filename FROM _kyodb_migrations'
    )
    const appliedSet = new Set(existing.map((row: any) => row.filename))

    // 3. Read migration directory
    const migrationsDir = path.resolve(process.cwd(), 'database/migrations')
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort()

    // 4. Execute pending migrations sequentially
    for (const file of files) {
      if (appliedSet.has(file)) {
        continue
      }

      const filePath = path.join(migrationsDir, file)
      const content = await fs.readFile(filePath, 'utf-8')

      // Strip SQL line comments and split queries cleanly
      const cleanContent = content.replace(/--.*$/gm, '').trim()
      const statements = cleanContent
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      await connection.beginTransaction()

      try {
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.query(statement)
          }
        }

        await connection.query(
          'INSERT INTO _kyodb_migrations (filename, batch) VALUES (?, ?)',
          [file, 1]
        )
        await connection.commit()
        executedFiles.push(file)
      } catch (err: any) {
        await connection.rollback()
        throw new Error(`Failed executing migration ${file}: ${err.message}`)
      }
    }

    if (executedFiles.length > 0) {
      await logAudit({
        action: 'RUN_MIGRATIONS',
        targetType: 'DATABASE',
        targetId: 'kyodb_system',
        metadata: { files: executedFiles }
      })
    }

    return {
      success: true,
      executedFiles,
      message: executedFiles.length > 0
        ? `Successfully applied ${executedFiles.length} migration(s): ${executedFiles.join(', ')}`
        : 'Database schema is already up to date.'
    }
  } catch (err: any) {
    return {
      success: false,
      executedFiles,
      message: 'Migration failed.',
      error: err.message
    }
  } finally {
    connection.release()
  }
}
