import mysql from 'mysql2/promise'
import { getDbPool, isSystemDatabase } from './db.service'
import { generateUUID } from '../utils/crypto'
import { logAudit } from './audit.service'
import {
  validateSqlIdentifier,
  isDestructiveOrWriteQuery
} from '../validators/database.validator'
import { isReservedDatabase } from '../validators/project.validator'
import type {
  DatabaseInfo,
  TableInfo,
  TableColumn,
  TableIndex,
  TableDataResponse,
  QueryExecutionResult,
  QueryHistoryRecord,
  CreateTableInput,
  TableDataQueryInput
} from '~/types'

/**
 * List all databases on the TiDB cluster with table counts and storage size
 */
export async function listDatabasesWithStats(): Promise<DatabaseInfo[]> {
  const pool = getDbPool()
  if (!pool) return []

  try {
    // 1. Fetch databases
    const [dbRows] = await pool.query<any[]>('SHOW DATABASES')
    const dbNames: string[] = dbRows.map((r) => Object.values(r)[0] as string)

    // 2. Fetch table counts and sizes from information_schema
    const [statsRows] = await pool.query<any[]>(
      `SELECT 
         table_schema as dbName,
         COUNT(*) as tablesCount,
         COALESCE(SUM(data_length + index_length), 0) as sizeBytes
       FROM information_schema.tables
       GROUP BY table_schema`
    )

    const statsMap = new Map<string, { tablesCount: number; sizeBytes: number }>()
    for (const s of statsRows) {
      statsMap.set(s.dbName.toLowerCase(), {
        tablesCount: Number(s.tablesCount || 0),
        sizeBytes: Number(s.sizeBytes || 0)
      })
    }

    return dbNames.map((name) => {
      const stats = statsMap.get(name.toLowerCase()) || { tablesCount: 0, sizeBytes: 0 }
      const isSystem = isReservedDatabase(name) || isSystemDatabase(name)
      return {
        name,
        tablesCount: stats.tablesCount,
        sizeBytes: stats.sizeBytes,
        isSystem
      }
    })
  } catch (err: any) {
    console.error('[DatabaseService] Failed to list databases:', err.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to retrieve databases from TiDB: ${err.message}`
    })
  }
}

/**
 * Create a new logical database on TiDB cluster
 */
export async function createDatabase(
  name: string,
  charset = 'utf8mb4',
  collation = 'utf8mb4_unicode_ci',
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; message: string; name: string }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeName = validateSqlIdentifier(name, 'Database name')
  if (isReservedDatabase(safeName)) {
    throw createError({
      statusCode: 400,
      statusMessage: `"${safeName}" is a reserved system database name.`
    })
  }

  try {
    await pool.query(
      `CREATE DATABASE \`${safeName}\` CHARACTER SET ${charset} COLLATE ${collation}`
    )

    await logAudit({
      adminId,
      action: 'database:create',
      targetType: 'database',
      targetId: safeName,
      metadata: { name: safeName, charset, collation },
      ipAddress
    })

    return {
      success: true,
      message: `Database "${safeName}" created successfully on TiDB Cloud.`,
      name: safeName
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to create database "${safeName}": ${err.message}`
    })
  }
}

/**
 * Drop a logical database from TiDB cluster (Forbidden for kyodb_system and internal schemas)
 */
export async function deleteDatabase(
  name: string,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; message: string }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeName = validateSqlIdentifier(name, 'Database name')
  if (isReservedDatabase(safeName) || isSystemDatabase(safeName)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Protected database "${safeName}" cannot be dropped.`
    })
  }

  try {
    await pool.query(`DROP DATABASE \`${safeName}\``)

    // Remove any associations in project_databases
    try {
      await pool.execute('DELETE FROM project_databases WHERE database_name = ?', [safeName])
    } catch {}

    await logAudit({
      adminId,
      action: 'database:delete',
      targetType: 'database',
      targetId: safeName,
      metadata: { name: safeName },
      ipAddress
    })

    return {
      success: true,
      message: `Database "${safeName}" dropped successfully from TiDB cluster.`
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to drop database "${safeName}": ${err.message}`
    })
  }
}

/**
 * List all tables inside a specific database
 */
export async function listTablesForDatabase(databaseName: string): Promise<TableInfo[]> {
  const pool = getDbPool()
  if (!pool) return []

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')

  try {
    const [rows] = await pool.query<any[]>(
      `SELECT 
         table_name as name,
         COALESCE(engine, 'InnoDB') as engine,
         COALESCE(table_rows, 0) as \`rows\`,
         COALESCE(data_length, 0) as dataLengthBytes,
         COALESCE(index_length, 0) as indexLengthBytes,
         COALESCE(table_collation, '') as collation,
         COALESCE(table_comment, '') as comment
       FROM information_schema.tables
       WHERE table_schema = ?
       ORDER BY table_name ASC`,
      [safeDb]
    )

    return rows.map((r) => ({
      name: r.name,
      engine: r.engine,
      rows: Number(r.rows || 0),
      dataLengthBytes: Number(r.dataLengthBytes || 0),
      indexLengthBytes: Number(r.indexLengthBytes || 0),
      collation: r.collation,
      comment: r.comment
    }))
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to list tables for database "${safeDb}": ${err.message}`
    })
  }
}

/**
 * Get schema (columns and indexes) for a table
 */
export async function getTableDetails(
  databaseName: string,
  tableName: string
): Promise<{ columns: TableColumn[]; indexes: TableIndex[] }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const safeTable = validateSqlIdentifier(tableName, 'Table name')

  try {
    // 1. Columns
    const [colRows] = await pool.query<any[]>(
      `SELECT 
         column_name as name,
         column_type as type,
         is_nullable as nullable,
         column_key as \`key\`,
         column_default as \`default\`,
         extra,
         column_comment as comment
       FROM information_schema.columns
       WHERE table_schema = ? AND table_name = ?
       ORDER BY ordinal_position ASC`,
      [safeDb, safeTable]
    )

    const columns: TableColumn[] = colRows.map((r) => ({
      name: r.name,
      type: r.type,
      nullable: r.nullable === 'YES',
      key: r.key || '',
      default: r.default,
      extra: r.extra || '',
      comment: r.comment || ''
    }))

    // 2. Indexes
    const [idxRows] = await pool.query<any[]>(
      `SHOW INDEX FROM \`${safeDb}\`.\`${safeTable}\``
    )

    const indexes: TableIndex[] = idxRows.map((r) => ({
      name: r.Key_name,
      columnName: r.Column_name,
      isUnique: Number(r.Non_unique) === 0,
      type: r.Index_type || 'BTREE'
    }))

    return { columns, indexes }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get schema for table "${safeTable}": ${err.message}`
    })
  }
}

/**
 * Create a new table in a database
 */
export async function createTable(
  databaseName: string,
  params: CreateTableInput,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; message: string }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const safeTable = validateSqlIdentifier(params.tableName, 'Table name')

  // Prevent modifying internal system tables in kyodb_system
  if (isSystemDatabase(safeDb)) {
    const internalTables = ['admin_users', 'sessions', 'projects', 'project_databases', 'storage_objects', 'api_keys', 'audit_logs', 'query_history']
    if (internalTables.includes(safeTable.toLowerCase())) {
      throw createError({
        statusCode: 403,
        statusMessage: `Cannot overwrite core system table "${safeTable}" in kyodb_system.`
      })
    }
  }

  // Build column definitions
  const colDefs: string[] = []
  const primaryKeys: string[] = []

  for (const col of params.columns) {
    const colName = validateSqlIdentifier(col.name, 'Column name')
    let typeDef = col.type
    if (col.length) {
      typeDef += `(${col.length})`
    }

    let def = `\`${colName}\` ${typeDef}`
    if (!col.nullable) {
      def += ' NOT NULL'
    } else {
      def += ' NULL'
    }

    if (col.autoIncrement) {
      def += ' AUTO_INCREMENT'
    }

    if (col.defaultValue !== undefined && col.defaultValue !== null) {
      if (col.defaultValue.toUpperCase() === 'CURRENT_TIMESTAMP') {
        def += ' DEFAULT CURRENT_TIMESTAMP'
      } else {
        def += ` DEFAULT ${mysql.escape(col.defaultValue)}`
      }
    }

    colDefs.push(def)

    if (col.primaryKey) {
      primaryKeys.push(`\`${colName}\``)
    }
  }

  if (primaryKeys.length > 0) {
    colDefs.push(`PRIMARY KEY (${primaryKeys.join(', ')})`)
  }

  let sql = `CREATE TABLE \`${safeDb}\`.\`${safeTable}\` (\n  ${colDefs.join(',\n  ')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  if (params.comment) {
    sql += ` COMMENT=${mysql.escape(params.comment)}`
  }

  try {
    await pool.query(sql)

    await logAudit({
      adminId,
      action: 'table:create',
      targetType: 'table',
      targetId: `${safeDb}.${safeTable}`,
      metadata: { database: safeDb, table: safeTable, columns: params.columns.map((c) => c.name) },
      ipAddress
    })

    return {
      success: true,
      message: `Table "${safeTable}" created successfully in database "${safeDb}".`
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to create table: ${err.message}`
    })
  }
}

/**
 * Drop a table from a database
 */
export async function dropTable(
  databaseName: string,
  tableName: string,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; message: string }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const safeTable = validateSqlIdentifier(tableName, 'Table name')

  // Protect system tables
  if (isSystemDatabase(safeDb)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Cannot drop tables from system database "kyodb_system".`
    })
  }

  try {
    await pool.query(`DROP TABLE \`${safeDb}\`.\`${safeTable}\``)

    await logAudit({
      adminId,
      action: 'table:drop',
      targetType: 'table',
      targetId: `${safeDb}.${safeTable}`,
      metadata: { database: safeDb, table: safeTable },
      ipAddress
    })

    return {
      success: true,
      message: `Table "${safeTable}" dropped from database "${safeDb}".`
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to drop table "${safeTable}": ${err.message}`
    })
  }
}

/**
 * Get paginated rows from a table with sorting and optional column filter
 */
export async function getTableData(
  databaseName: string,
  tableName: string,
  params: TableDataQueryInput
): Promise<TableDataResponse> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const safeTable = validateSqlIdentifier(tableName, 'Table name')

  const page = Math.max(1, params.page || 1)
  const pageSize = Math.min(250, Math.max(1, params.pageSize || 50))
  const offset = (page - 1) * pageSize

  try {
    // 1. Get primary key column
    const [pkRows] = await pool.query<any[]>(
      `SELECT column_name 
       FROM information_schema.key_column_usage
       WHERE table_schema = ? AND table_name = ? AND constraint_name = 'PRIMARY'
       LIMIT 1`,
      [safeDb, safeTable]
    )
    const primaryKey = pkRows[0]?.column_name || null

    // 2. Build filter condition
    let whereClause = ''
    const queryParams: any[] = []

    if (params.filterColumn && params.filterValue !== undefined && params.filterValue !== '') {
      const safeCol = validateSqlIdentifier(params.filterColumn, 'Filter column')
      whereClause = `WHERE \`${safeCol}\` LIKE ?`
      queryParams.push(`%${params.filterValue}%`)
    }

    // 3. Count total rows
    const [countRows] = await pool.query<any[]>(
      `SELECT COUNT(*) as total FROM \`${safeDb}\`.\`${safeTable}\` ${whereClause}`,
      queryParams
    )
    const totalRows = Number(countRows[0]?.total || 0)

    // 4. Order clause
    let orderClause = ''
    if (params.sortColumn) {
      const safeSort = validateSqlIdentifier(params.sortColumn, 'Sort column')
      const dir = params.sortDirection === 'DESC' ? 'DESC' : 'ASC'
      orderClause = `ORDER BY \`${safeSort}\` ${dir}`
    } else if (primaryKey) {
      orderClause = `ORDER BY \`${primaryKey}\` ASC`
    }

    // 5. Fetch rows
    const dataParams = [...queryParams, pageSize, offset]
    const [rows, fields] = await pool.query<any[]>(
      `SELECT * FROM \`${safeDb}\`.\`${safeTable}\` ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
      dataParams
    )

    const columns: string[] = fields ? (fields as mysql.FieldPacket[]).map((f) => f.name) : []

    return {
      columns,
      rows: rows.map((r) => ({ ...r })),
      totalRows,
      page,
      pageSize,
      primaryKey
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch data from table "${safeTable}": ${err.message}`
    })
  }
}

/**
 * Insert a row into a table
 */
export async function insertTableRow(
  databaseName: string,
  tableName: string,
  rowData: Record<string, any>,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; insertId?: any }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const safeTable = validateSqlIdentifier(tableName, 'Table name')

  const cols = Object.keys(rowData).map((k) => validateSqlIdentifier(k, 'Column name'))
  const values = Object.values(rowData)

  if (cols.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No column values provided' })
  }

  const colClause = cols.map((c) => `\`${c}\``).join(', ')
  const valPlaceholders = cols.map(() => '?').join(', ')

  try {
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      `INSERT INTO \`${safeDb}\`.\`${safeTable}\` (${colClause}) VALUES (${valPlaceholders})`,
      values
    )

    await logAudit({
      adminId,
      action: 'table:insert_row',
      targetType: 'table',
      targetId: `${safeDb}.${safeTable}`,
      metadata: { database: safeDb, table: safeTable, insertId: result.insertId },
      ipAddress
    })

    return {
      success: true,
      insertId: result.insertId
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to insert row into "${safeTable}": ${err.message}`
    })
  }
}

/**
 * Update an existing row in a table by primary key
 */
export async function updateTableRow(
  databaseName: string,
  tableName: string,
  primaryKey: string,
  primaryKeyValue: any,
  rowData: Record<string, any>,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; affectedRows: number }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const safeTable = validateSqlIdentifier(tableName, 'Table name')
  const safePk = validateSqlIdentifier(primaryKey, 'Primary key')

  const cols = Object.keys(rowData).filter((c) => c !== safePk)
  if (cols.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No columns to update' })
  }

  const setClause = cols.map((c) => `\`${validateSqlIdentifier(c, 'Column')}\` = ?`).join(', ')
  const values = cols.map((c) => rowData[c])
  values.push(primaryKeyValue)

  try {
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      `UPDATE \`${safeDb}\`.\`${safeTable}\` SET ${setClause} WHERE \`${safePk}\` = ?`,
      values
    )

    await logAudit({
      adminId,
      action: 'table:update_row',
      targetType: 'table',
      targetId: `${safeDb}.${safeTable}`,
      metadata: { database: safeDb, table: safeTable, pk: primaryKeyValue },
      ipAddress
    })

    return {
      success: true,
      affectedRows: result.affectedRows
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to update row: ${err.message}`
    })
  }
}

/**
 * Delete a row from a table by primary key
 */
export async function deleteTableRow(
  databaseName: string,
  tableName: string,
  primaryKey: string,
  primaryKeyValue: any,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; affectedRows: number }> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const safeTable = validateSqlIdentifier(tableName, 'Table name')
  const safePk = validateSqlIdentifier(primaryKey, 'Primary key')

  try {
    const [result] = await pool.execute<mysql.ResultSetHeader>(
      `DELETE FROM \`${safeDb}\`.\`${safeTable}\` WHERE \`${safePk}\` = ?`,
      [primaryKeyValue]
    )

    await logAudit({
      adminId,
      action: 'table:delete_row',
      targetType: 'table',
      targetId: `${safeDb}.${safeTable}`,
      metadata: { database: safeDb, table: safeTable, pk: primaryKeyValue },
      ipAddress
    })

    return {
      success: true,
      affectedRows: result.affectedRows
    }
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Failed to delete row: ${err.message}`
    })
  }
}

/**
 * Execute raw SQL query with execution timing, read-only mode, and query history persistence
 */
export async function executeRawSql(
  databaseName: string,
  sql: string,
  readOnly = false,
  adminId?: string | null,
  ipAddress?: string | null
): Promise<QueryExecutionResult> {
  const pool = getDbPool()
  if (!pool) throw createError({ statusCode: 500, statusMessage: 'TiDB connection not available' })

  const safeDb = validateSqlIdentifier(databaseName, 'Database name')
  const trimmedSql = sql.trim()

  // Enforce read-only constraint
  if (readOnly && isDestructiveOrWriteQuery(trimmedSql)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Read-only mode is active. Write, update, or destructive DDL queries are forbidden.'
    })
  }

  const startTime = Date.now()
  const conn = await pool.getConnection()
  let queryStatus: 'success' | 'error' = 'success'
  let queryError: string | undefined

  try {
    // Select active database
    await conn.query(`USE \`${safeDb}\``)

    const [rows, fields] = await conn.query<any>(trimmedSql)
    const executionTimeMs = Date.now() - startTime

    let columns: string[] = []
    let resultRows: Record<string, any>[] = []
    let affectedRows: number | undefined

    if (Array.isArray(rows)) {
      if (fields && Array.isArray(fields)) {
        columns = (fields as mysql.FieldPacket[]).map((f) => f.name)
      } else if (rows.length > 0) {
        columns = Object.keys(rows[0])
      }
      // Cap at 1000 rows to prevent frontend DOM collapse
      resultRows = rows.slice(0, 1000).map((r) => ({ ...r }))
    } else if (rows && typeof rows === 'object') {
      affectedRows = (rows as mysql.ResultSetHeader).affectedRows
    }

    // Persist to query_history table
    await recordQueryHistory({
      databaseName: safeDb,
      query: trimmedSql,
      queryType: trimmedSql.split(' ')[0].toUpperCase(),
      executionTimeMs,
      status: 'success'
    })

    return {
      query: trimmedSql,
      columns,
      rows: resultRows,
      affectedRows,
      executionTimeMs,
      status: 'success',
      readOnly
    }
  } catch (err: any) {
    queryStatus = 'error'
    queryError = err.message
    const executionTimeMs = Date.now() - startTime

    // Record error to query history
    await recordQueryHistory({
      databaseName: safeDb,
      query: trimmedSql,
      queryType: trimmedSql.split(' ')[0].toUpperCase(),
      executionTimeMs,
      status: 'error'
    })

    return {
      query: trimmedSql,
      columns: [],
      rows: [],
      executionTimeMs,
      status: 'error',
      error: err.message,
      readOnly
    }
  } finally {
    conn.release()
  }
}

/**
 * Record query execution into query_history table
 */
async function recordQueryHistory(params: {
  databaseName: string
  query: string
  queryType: string
  executionTimeMs: number
  status: 'success' | 'error'
}) {
  const pool = getDbPool()
  if (!pool) return

  try {
    const id = generateUUID()
    await pool.execute(
      `INSERT INTO kyodb_system.query_history (id, database_name, query_type, execution_time_ms, status, executed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, params.databaseName, params.queryType.slice(0, 32), params.executionTimeMs, params.status]
    )
  } catch (err) {
    console.warn('[DatabaseService] Failed to record query history:', err)
  }
}

/**
 * Get recent query execution history
 */
export async function getQueryHistory(limit = 20, databaseName?: string): Promise<QueryHistoryRecord[]> {
  const pool = getDbPool()
  if (!pool) return []

  try {
    let sql = `SELECT id, database_name as databaseName, query_type as queryType, execution_time_ms as executionTimeMs, status, executed_at as executedAt
               FROM kyodb_system.query_history`
    const params: any[] = []

    if (databaseName) {
      sql += ' WHERE database_name = ?'
      params.push(databaseName)
    }

    sql += ' ORDER BY executed_at DESC LIMIT ?'
    params.push(limit)

    const [rows] = await pool.query<any[]>(sql, params)
    return rows.map((r) => ({
      id: r.id,
      databaseName: r.databaseName,
      query: `${r.queryType} query`,
      queryType: r.queryType,
      executionTimeMs: Number(r.executionTimeMs || 0),
      status: r.status,
      executedAt: new Date(r.executedAt).toISOString()
    }))
  } catch {
    return []
  }
}
