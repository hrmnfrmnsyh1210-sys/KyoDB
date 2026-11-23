import mysql from 'mysql2/promise'
import { getDbPool } from './db.service'
import { generateUUID } from '../utils/crypto'
import { logAudit } from './audit.service'
import { isReservedDatabase, RESERVED_DATABASES } from '../validators/project.validator'
import type {
  Project,
  ProjectDetail,
  ProjectDatabase,
  ProjectStorageSummary,
  ProjectStatus,
  CreateProjectPayload,
  UpdateProjectPayload,
  AvailableDatabase,
  AuditLogEntry
} from '~/types'

// Safe SQL identifier regex (letters, numbers, underscore only, max 64 chars)
const SAFE_IDENTIFIER_REGEX = /^[a-zA-Z0-9_]{1,64}$/

export function validateSafeDbIdentifier(name: string): string {
  const trimmed = name.trim()
  if (!SAFE_IDENTIFIER_REGEX.test(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid database identifier "${trimmed}". Only alphanumeric characters and underscores are allowed (1-64 characters).`
    })
  }
  if (isReservedDatabase(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot use protected system database name "${trimmed}".`
    })
  }
  return trimmed
}

// In-memory fallback for local mock testing or offline scenarios
interface InMemoryProjectStore {
  projects: Map<string, Project>
  databases: Map<string, ProjectDatabase[]>
}

const memoryStore: InMemoryProjectStore = {
  projects: new Map(),
  databases: new Map()
}

/**
 * List all projects with optional search and status filter
 */
export async function listProjects(params?: {
  search?: string
  status?: string
}): Promise<Project[]> {
  const pool = getDbPool()

  if (pool) {
    try {
      const search = params?.search?.trim()
      const status = params?.status?.trim()

      const conditions: string[] = []
      const queryParams: any[] = []

      if (search) {
        conditions.push('(p.name LIKE ? OR p.slug LIKE ?)')
        queryParams.push(`%${search}%`, `%${search}%`)
      }

      if (status && status !== 'all') {
        conditions.push('p.status = ?')
        queryParams.push(status)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      const [rows] = await pool.query<any[]>(
        `SELECT 
           p.id,
           p.name,
           p.slug,
           p.description,
           p.status,
           p.created_at as createdAt,
           p.updated_at as updatedAt,
           COALESCE(db_agg.db_count, 0) as databasesCount,
           COALESCE(st_agg.files_count, 0) as filesCount,
           COALESCE(st_agg.total_bytes, 0) as totalBytes
         FROM projects p
         LEFT JOIN (
           SELECT project_id, COUNT(*) as db_count
           FROM project_databases
           GROUP BY project_id
         ) db_agg ON p.id = db_agg.project_id
         LEFT JOIN (
           SELECT project_id, COUNT(*) as files_count, SUM(size_bytes) as total_bytes
           FROM storage_objects
           GROUP BY project_id
         ) st_agg ON p.id = st_agg.project_id
         ${whereClause}
         ORDER BY p.created_at DESC`,
        queryParams
      )

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description || null,
        status: r.status as ProjectStatus,
        createdAt: new Date(r.createdAt).toISOString(),
        updatedAt: new Date(r.updatedAt).toISOString(),
        databasesCount: Number(r.databasesCount || 0),
        storage: {
          filesCount: Number(r.filesCount || 0),
          totalBytes: Number(r.totalBytes || 0)
        }
      }))
    } catch (err: any) {
      console.warn('[ProjectService] TiDB query failed, checking fallback:', err.message)
    }
  }

  // In-memory fallback
  let list = Array.from(memoryStore.projects.values())
  if (params?.search) {
    const q = params.search.toLowerCase()
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
  }
  if (params?.status && params.status !== 'all') {
    list = list.filter((p) => p.status === params.status)
  }
  return list
}

/**
 * Get project details by UUID or unique slug
 */
export async function getProjectByIdOrSlug(idOrSlug: string): Promise<ProjectDetail> {
  const pool = getDbPool()

  if (pool) {
    try {
      // 1. Fetch project base record
      const [projRows] = await pool.query<any[]>(
        `SELECT id, name, slug, description, status, created_at as createdAt, updated_at as updatedAt
         FROM projects
         WHERE id = ? OR slug = ?
         LIMIT 1`,
        [idOrSlug, idOrSlug]
      )

      if (projRows.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: `Project "${idOrSlug}" not found`
        })
      }

      const proj = projRows[0]
      const projectId = proj.id

      // 2. Fetch associated databases
      const [dbRows] = await pool.query<any[]>(
        `SELECT id, project_id as projectId, database_name as databaseName, status, created_at as createdAt
         FROM project_databases
         WHERE project_id = ?
         ORDER BY created_at ASC`,
        [projectId]
      )

      // Query table count for each associated database from information_schema
      const databases: ProjectDatabase[] = await Promise.all(
        dbRows.map(async (row) => {
          let tablesCount = 0
          try {
            const [tblRows] = await pool.query<any[]>(
              `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?`,
              [row.databaseName]
            )
            tablesCount = Number(tblRows[0]?.count || 0)
          } catch {
            tablesCount = 0
          }
          return {
            id: row.id,
            projectId: row.projectId,
            databaseName: row.databaseName,
            status: row.status,
            createdAt: new Date(row.createdAt).toISOString(),
            tablesCount
          }
        })
      )

      // 3. Fetch storage object stats
      const [storageRows] = await pool.query<any[]>(
        `SELECT COUNT(*) as filesCount, COALESCE(SUM(size_bytes), 0) as totalBytes
         FROM storage_objects
         WHERE project_id = ?`,
        [projectId]
      )

      const storage: ProjectStorageSummary = {
        filesCount: Number(storageRows[0]?.filesCount || 0),
        totalBytes: Number(storageRows[0]?.totalBytes || 0)
      }

      // 4. Fetch recent project activity logs
      const [auditRows] = await pool.query<any[]>(
        `SELECT a.id, a.admin_id as adminId, u.username as adminUsername, a.action, a.target_type as targetType,
                a.target_id as targetId, a.metadata, a.ip_address as ipAddress, a.created_at as createdAt
         FROM audit_logs a
         LEFT JOIN admin_users u ON a.admin_id = u.id
         WHERE a.target_id = ? OR JSON_EXTRACT(a.metadata, '$.projectId') = ?
         ORDER BY a.created_at DESC
         LIMIT 15`,
        [projectId, projectId]
      )

      const recentActivity: AuditLogEntry[] = auditRows.map((r) => ({
        id: r.id,
        adminId: r.adminId,
        adminUsername: r.adminUsername,
        action: r.action,
        targetType: r.targetType,
        targetId: r.targetId,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
        ipAddress: r.ipAddress,
        createdAt: new Date(r.createdAt).toISOString()
      }))

      return {
        id: proj.id,
        name: proj.name,
        slug: proj.slug,
        description: proj.description || null,
        status: proj.status as ProjectStatus,
        createdAt: new Date(proj.createdAt).toISOString(),
        updatedAt: new Date(proj.updatedAt).toISOString(),
        databasesCount: databases.length,
        databases,
        storage,
        recentActivity
      }
    } catch (err: any) {
      if (err.statusCode === 404) throw err
      console.warn('[ProjectService] Get project failed:', err.message)
    }
  }

  // In-memory fallback
  for (const p of memoryStore.projects.values()) {
    if (p.id === idOrSlug || p.slug === idOrSlug) {
      const dbs = memoryStore.databases.get(p.id) || []
      return {
        ...p,
        databases: dbs,
        databasesCount: dbs.length,
        storage: { filesCount: 0, totalBytes: 0 },
        recentActivity: []
      }
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: `Project "${idOrSlug}" not found`
  })
}

/**
 * Create a new project with optional logical database creation or attachment
 */
export async function createProject(
  payload: CreateProjectPayload,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<Project> {
  const pool = getDbPool()
  const projectId = generateUUID()
  const now = new Date().toISOString()
  const slug = payload.slug.trim().toLowerCase()
  const name = payload.name.trim()
  const description = payload.description ? payload.description.trim() : null
  const status: ProjectStatus = payload.status || 'active'

  if (pool) {
    // 1. Check slug uniqueness
    const [existing] = await pool.query<any[]>(
      'SELECT id FROM projects WHERE slug = ? LIMIT 1',
      [slug]
    )
    if (existing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `A project with slug "${slug}" already exists. Please choose a different slug.`
      })
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // 2. Insert project record
      await conn.execute(
        `INSERT INTO projects (id, name, slug, description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [projectId, name, slug, description, status]
      )

      let associatedDbName: string | null = null

      // 3. Handle database association option
      if (payload.databaseOption === 'create_new' && payload.databaseName) {
        const safeDbName = validateSafeDbIdentifier(payload.databaseName)
        // Safely create logical database on TiDB cluster with utf8mb4 collation
        await conn.query(
          `CREATE DATABASE IF NOT EXISTS \`${safeDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )

        const dbId = generateUUID()
        await conn.execute(
          `INSERT INTO project_databases (id, project_id, database_name, status, created_at)
           VALUES (?, ?, ?, 'connected', NOW())`,
          [dbId, projectId, safeDbName]
        )
        associatedDbName = safeDbName
      } else if (payload.databaseOption === 'attach_existing' && payload.databaseName) {
        const safeDbName = validateSafeDbIdentifier(payload.databaseName)
        // Verify database exists on cluster
        const [found] = await conn.query<any[]>(
          `SHOW DATABASES LIKE ?`,
          [safeDbName]
        )
        if (found.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `Database "${safeDbName}" does not exist on the TiDB cluster.`
          })
        }

        const dbId = generateUUID()
        await conn.execute(
          `INSERT INTO project_databases (id, project_id, database_name, status, created_at)
           VALUES (?, ?, ?, 'connected', NOW())`,
          [dbId, projectId, safeDbName]
        )
        associatedDbName = safeDbName
      }

      await conn.commit()

      // 4. Log audit trail
      await logAudit({
        adminId,
        action: 'project:create',
        targetType: 'project',
        targetId: projectId,
        metadata: {
          name,
          slug,
          databaseOption: payload.databaseOption || 'none',
          databaseName: associatedDbName
        },
        ipAddress
      })

      return {
        id: projectId,
        name,
        slug,
        description,
        status,
        createdAt: now,
        updatedAt: now,
        databasesCount: associatedDbName ? 1 : 0,
        storage: { filesCount: 0, totalBytes: 0 }
      }
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  }

  // Fallback in-memory
  const newProj: Project = {
    id: projectId,
    name,
    slug,
    description,
    status,
    createdAt: now,
    updatedAt: now,
    databasesCount: 0,
    storage: { filesCount: 0, totalBytes: 0 }
  }
  memoryStore.projects.set(projectId, newProj)
  return newProj
}

/**
 * Update project details
 */
export async function updateProject(
  id: string,
  payload: UpdateProjectPayload,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<Project> {
  const pool = getDbPool()

  if (pool) {
    const [projRows] = await pool.query<any[]>(
      'SELECT id, name, slug, description, status FROM projects WHERE id = ? LIMIT 1',
      [id]
    )
    if (projRows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Project "${id}" not found`
      })
    }

    const current = projRows[0]
    const nextName = payload.name !== undefined ? payload.name.trim() : current.name
    const nextDescription = payload.description !== undefined ? payload.description : current.description
    const nextStatus = payload.status !== undefined ? payload.status : current.status

    await pool.execute(
      `UPDATE projects 
       SET name = ?, description = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [nextName, nextDescription, nextStatus, id]
    )

    await logAudit({
      adminId,
      action: 'project:update',
      targetType: 'project',
      targetId: id,
      metadata: {
        previous: { name: current.name, status: current.status },
        updated: { name: nextName, status: nextStatus, description: nextDescription }
      },
      ipAddress
    })

    return (await getProjectByIdOrSlug(id)) as Project
  }

  // In-memory fallback
  const memProj = memoryStore.projects.get(id)
  if (!memProj) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  if (payload.name) memProj.name = payload.name
  if (payload.description !== undefined) memProj.description = payload.description
  if (payload.status) memProj.status = payload.status
  memProj.updatedAt = new Date().toISOString()
  return memProj
}

/**
 * Delete a project and optionally drop its associated databases
 */
export async function deleteProject(
  id: string,
  options: { dropDatabases?: boolean } = {},
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; message: string; droppedDatabases: string[] }> {
  const pool = getDbPool()

  if (pool) {
    const [projRows] = await pool.query<any[]>(
      'SELECT id, name, slug FROM projects WHERE id = ? LIMIT 1',
      [id]
    )
    if (projRows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Project "${id}" not found`
      })
    }

    const project = projRows[0]

    // Fetch associated databases
    const [dbRows] = await pool.query<any[]>(
      'SELECT database_name as databaseName FROM project_databases WHERE project_id = ?',
      [id]
    )

    const conn = await pool.getConnection()
    const droppedDatabases: string[] = []

    try {
      await conn.beginTransaction()

      // If user explicitly requested dropping TiDB databases
      if (options.dropDatabases && dbRows.length > 0) {
        for (const row of dbRows) {
          const dbName = row.databaseName
          // Extra safeguard: NEVER drop system or reserved databases
          if (!isReservedDatabase(dbName) && SAFE_IDENTIFIER_REGEX.test(dbName)) {
            await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``)
            droppedDatabases.push(dbName)
          }
        }
      }

      // Remove database associations
      await conn.execute('DELETE FROM project_databases WHERE project_id = ?', [id])

      // Unlink storage objects (set project_id = NULL or delete metadata)
      await conn.execute('DELETE FROM storage_objects WHERE project_id = ?', [id])

      // Delete the project
      await conn.execute('DELETE FROM projects WHERE id = ?', [id])

      await conn.commit()

      await logAudit({
        adminId,
        action: 'project:delete',
        targetType: 'project',
        targetId: id,
        metadata: {
          name: project.name,
          slug: project.slug,
          droppedDatabases
        },
        ipAddress
      })

      return {
        success: true,
        message: `Project "${project.name}" has been deleted.`,
        droppedDatabases
      }
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  }

  // In-memory fallback
  memoryStore.projects.delete(id)
  memoryStore.databases.delete(id)
  return {
    success: true,
    message: 'Project deleted.',
    droppedDatabases: []
  }
}

/**
 * Get all available databases in the TiDB cluster with their association status
 */
export async function getAvailableClusterDatabases(): Promise<AvailableDatabase[]> {
  const pool = getDbPool()
  if (!pool) return []

  try {
    // 1. Fetch all databases in TiDB cluster
    const [allDbRows] = await pool.query<any[]>('SHOW DATABASES')
    const clusterDbs: string[] = allDbRows
      .map((r) => Object.values(r)[0] as string)
      .filter((name) => !isReservedDatabase(name))

    // 2. Fetch existing associations
    const [assocRows] = await pool.query<any[]>(
      `SELECT pd.database_name as databaseName, pd.project_id as projectId, p.name as projectName
       FROM project_databases pd
       LEFT JOIN projects p ON pd.project_id = p.id`
    )

    const assocMap = new Map<string, { projectId: string; projectName: string }>()
    for (const a of assocRows) {
      assocMap.set(a.databaseName.toLowerCase(), {
        projectId: a.projectId,
        projectName: a.projectName || 'Unknown Project'
      })
    }

    return clusterDbs.map((dbName) => {
      const match = assocMap.get(dbName.toLowerCase())
      return {
        databaseName: dbName,
        isAssociated: !!match,
        associatedProjectId: match?.projectId || null,
        associatedProjectName: match?.projectName || null
      }
    })
  } catch (err: any) {
    console.error('[ProjectService] Failed to fetch cluster databases:', err.message)
    return []
  }
}

/**
 * Attach a database to an existing project
 */
export async function attachDatabaseToProject(
  projectId: string,
  params: { databaseName: string; createNew?: boolean },
  adminId?: string | null,
  ipAddress?: string | null
): Promise<ProjectDatabase> {
  const pool = getDbPool()
  if (!pool) {
    throw createError({ statusCode: 500, statusMessage: 'Database connection unavailable' })
  }

  // 1. Verify project exists
  const [proj] = await pool.query<any[]>('SELECT id, name FROM projects WHERE id = ?', [projectId])
  if (proj.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  const safeDbName = validateSafeDbIdentifier(params.databaseName)

  // 2. If createNew, execute CREATE DATABASE
  if (params.createNew) {
    await pool.query(
      `CREATE DATABASE IF NOT EXISTS \`${safeDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
  } else {
    // Verify it exists in cluster
    const [exists] = await pool.query<any[]>('SHOW DATABASES LIKE ?', [safeDbName])
    if (exists.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Database "${safeDbName}" does not exist in cluster.`
      })
    }
  }

  // 3. Check if already attached to this project
  const [already] = await pool.query<any[]>(
    'SELECT id FROM project_databases WHERE project_id = ? AND database_name = ?',
    [projectId, safeDbName]
  )
  if (already.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Database "${safeDbName}" is already attached to this project.`
    })
  }

  const id = generateUUID()
  const now = new Date().toISOString()

  await pool.execute(
    `INSERT INTO project_databases (id, project_id, database_name, status, created_at)
     VALUES (?, ?, ?, 'connected', NOW())`,
    [id, projectId, safeDbName]
  )

  await logAudit({
    adminId,
    action: 'project:database:attach',
    targetType: 'project',
    targetId: projectId,
    metadata: {
      projectId,
      databaseName: safeDbName,
      createdNew: !!params.createNew
    },
    ipAddress
  })

  // Get table count
  let tablesCount = 0
  try {
    const [tbls] = await pool.query<any[]>(
      'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?',
      [safeDbName]
    )
    tablesCount = Number(tbls[0]?.count || 0)
  } catch {
    tablesCount = 0
  }

  return {
    id,
    projectId,
    databaseName: safeDbName,
    status: 'connected',
    createdAt: now,
    tablesCount
  }
}

/**
 * Detach a database from a project
 */
export async function detachDatabaseFromProject(
  projectId: string,
  databaseName: string,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; message: string }> {
  const pool = getDbPool()
  if (!pool) {
    throw createError({ statusCode: 500, statusMessage: 'Database connection unavailable' })
  }

  const safeDbName = validateSafeDbIdentifier(databaseName)

  const [res] = await pool.execute<mysql.ResultSetHeader>(
    'DELETE FROM project_databases WHERE project_id = ? AND database_name = ?',
    [projectId, safeDbName]
  )

  if (res.affectedRows === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `Database "${safeDbName}" is not attached to this project.`
    })
  }

  await logAudit({
    adminId,
    action: 'project:database:detach',
    targetType: 'project',
    targetId: projectId,
    metadata: {
      projectId,
      databaseName: safeDbName
    },
    ipAddress
  })

  return {
    success: true,
    message: `Database "${safeDbName}" detached from project.`
  }
}
