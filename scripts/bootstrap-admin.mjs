import mysql from 'mysql2/promise'
import { hash } from '@node-rs/argon2'
import crypto from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config()

async function bootstrap() {
  const host = process.env.TIDB_HOST
  const port = parseInt(process.env.TIDB_PORT || '4000', 10)
  const user = process.env.TIDB_USER
  const password = process.env.TIDB_PASSWORD
  const database = process.env.TIDB_DATABASE || 'kyodb_system'
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@kyodb.local'
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Admin@KyoDB2026!'

  if (!host || !user) {
    console.error('Error: TIDB_HOST and TIDB_USER must be set in .env')
    process.exit(1)
  }

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  })

  console.log(`Connected to TiDB (${host}/${database})`)

  const [existing] = await conn.query('SELECT COUNT(*) as count FROM admin_users')
  if (existing[0].count > 0) {
    console.log('An administrator user already exists in admin_users.')
    await conn.end()
    return
  }

  const id = crypto.randomUUID()
  const username = 'admin'
  const passwordHash = await hash(adminPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  })

  await conn.execute(
    'INSERT INTO admin_users (id, username, email, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
    [id, username, adminEmail, passwordHash]
  )

  console.log('✓ Master Administrator successfully created!')
  console.log(`  Username : ${username}`)
  console.log(`  Email    : ${adminEmail}`)
  console.log(`  Password : ${adminPassword}`)
  await conn.end()
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err.message)
  process.exit(1)
})
