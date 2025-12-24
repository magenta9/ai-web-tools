/**
 * Database connection and query utilities using mysql2 CLI
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const { formatSchemaForLLM } = require('./schema')

const execAsync = promisify(exec)

/**
 * Build mysql command with connection options
 */
function buildMysqlCommand(options = {}) {
  const {
    host = '127.0.0.1',
    port = 3306,
    user = 'root',
    password = '',
    database = '',
    ssl = false
  } = options

  // Escape special characters for shell
  const esc = (s) => String(s).replace(/'/g, "'\"'\"'")

  let cmd = `mysql -h '${esc(host)}' -P ${port} -u '${esc(user)}' --protocol=TCP`

  if (password) {
    cmd += ` --password='${esc(password)}'`
  }

  if (ssl) {
    cmd += ' --ssl-mode=REQUIRED'
  }

  if (database) {
    cmd += ` '${esc(database)}'`
  }

  return cmd
}

/**
 * Unescape MySQL batch mode output (converts \n literals to actual newlines)
 */
function unescapeMysqlOutput(text) {
  return String(text).replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

/**
 * Execute a SQL query
 * @param {string} sql - SQL query to execute
 * @param {Object} options - Database connection options
 * @returns {Promise<Object>} - Query result
 */
async function executeQuery(sql, options = {}) {
  const cmd = buildMysqlCommand(options)

  try {
    // Escape single quotes in SQL for shell
    const escSql = String(sql).replace(/'/g, "'\"'\"'")

    // Use batch mode (-b) to get tab-separated output with column names
    const fullCmd = `${cmd} -b -e '${escSql}' 2>&1`
    const { stdout } = await execAsync(fullCmd, { maxBuffer: 10 * 1024 * 1024 })

    // Check for errors
    const lowerStdout = stdout.toLowerCase()
    if (lowerStdout.includes('error') || lowerStdout.includes('ERROR')) {
      const errorMatch = stdout.match(/ERROR\s+\d+\s+\([^)]+\):(.+)/i)
      if (errorMatch) {
        return { success: false, error: errorMatch[1].trim() }
      }
    }

    // Parse output
    const unescapedOutput = unescapeMysqlOutput(stdout)
    const lines = unescapedOutput.trim().split('\n').filter(row => {
      const trimmed = row.trim()
      if (trimmed.includes('Warning') && trimmed.includes('mysql')) return false
      return trimmed.length > 0
    })

    console.log('[MySQL] Lines:', lines.length, 'Raw first line:', JSON.stringify(lines[0] || ''))

    let header = ''
    let dataRows = []
    let hasTabs = false

    if (lines.length > 0) {
      // Check if output has tabs (tab-separated format)
      hasTabs = lines.some(line => line.includes('\t'))

      if (hasTabs) {
        // Standard tab-separated format: first line is header, rest are data rows
        header = lines[0]
        dataRows = lines.slice(1)
      } else {
        // No tabs - each line is a value (like SHOW TABLES)
        // Use first line as header, rest as data
        if (lines.length === 1) {
          // Single value result
          header = lines[0]
          dataRows = []
        } else {
          // First line is column name, rest are values
          header = lines[0]
          dataRows = lines.slice(1).map(row => row)
        }
      }
    }

    console.log('[MySQL] Header:', header, '| Data rows:', dataRows.length, '| Has tabs:', hasTabs)

    const cleanOutput = dataRows.length > 0 ? dataRows.join('\n') : (header ? header : '(0 rows)')

    return {
      success: true,
      output: cleanOutput,
      rows: dataRows,
      header,
      rowCount: dataRows.length,
      hasTabs
    }
  } catch (error) {
    return { success: false, error: error.message || String(error) }
  }
}

/**
 * Get database schema using SHOW COLUMNS (faster than SHOW CREATE TABLE)
 * @param {Object} options - Database connection options
 * @returns {Promise<Object>} - Schema information
 */
async function getSchema(options = {}) {
  const { database, ...connOptions } = options

  if (!database) {
    return {
      success: false,
      error: 'Database name is required'
    }
  }

  try {
    // Get list of all tables using SHOW TABLES
    const showTablesResult = await executeQuery('SHOW TABLES', { ...connOptions, database })

    if (!showTablesResult.success) {
      return {
        success: false,
        error: showTablesResult.error || 'Failed to get tables'
      }
    }

    // Parse SHOW TABLES output (skip header)
    // SHOW TABLES format: header line (Tables_in_xxx) + table names
    const tables = showTablesResult.rows.slice(1).filter(row => row.trim().length > 0)

    if (tables.length === 0) {
      return {
        success: true,
        schema: {
          tables: [],
          formatted: 'No tables found in database.'
        }
      }
    }

    // Get columns for all tables using a single query with information_schema
    // This is much faster than calling SHOW COLUMNS for each table
    const schemaQuery = `
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = '${database}'
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `
    const schemaResult = await executeQuery(schemaQuery, connOptions)

    if (!schemaResult.success) {
      // Fallback to individual SHOW COLUMNS queries if information_schema fails
      return await getSchemaFallback(options)
    }

    // Parse the schema data
    const tableMap = new Map()
    for (const row of schemaResult.rows) {
      // Parse: table_name\tcolumn_name\tcolumn_type\tnull\tkey\textra\tdefault
      const parts = row.split('\t')
      if (parts.length < 3) continue

      const tableName = parts[0]
      const columnName = parts[1]
      const columnType = parts[2]
      const isNullable = parts[3] === 'YES'
      const columnKey = parts[4]
      const extra = parts[5] || ''

      if (!tableMap.has(tableName)) {
        tableMap.set(tableName, {
          name: tableName,
          columns: [],
          primaryKeys: [],
          indexes: []
        })
      }

      const table = tableMap.get(tableName)
      table.columns.push({
        name: columnName,
        type: columnType,
        nullable: isNullable,
        isPrimaryKey: columnKey === 'PRI',
        extra
      })

      if (columnKey === 'PRI') {
        table.primaryKeys.push(columnName)
      }
    }

    // Convert map to array, only including tables that exist
    const tablesWithSchemas = Array.from(tableMap.values())

    // Filter to only include tables that were in SHOW TABLES
    const tableNames = new Set(tables)
    const filteredTables = tablesWithSchemas.filter(t => tableNames.has(t.name))

    const schemaForLLM = formatSchemaForLLM(filteredTables)

    return {
      success: true,
      schema: {
        tables: filteredTables,
        formatted: schemaForLLM
      }
    }
  } catch (error) {
    // Fallback to original method
    return await getSchemaFallback(options)
  }
}

/**
 * Fallback schema loading using SHOW COLUMNS for each table
 * Used when information_schema query fails
 */
async function getSchemaFallback(options = {}) {
  const { database, ...connOptions } = options

  try {
    const showTablesResult = await executeQuery('SHOW TABLES', { ...connOptions, database })

    if (!showTablesResult.success) {
      return {
        success: false,
        error: showTablesResult.error || 'Failed to get tables'
      }
    }

    const tables = showTablesResult.rows.slice(1).filter(row => row.trim().length > 0)
    const tablesWithSchemas = []

    // Use SHOW COLUMNS which is faster than SHOW CREATE TABLE
    for (const table of tables) {
      const columnsResult = await executeQuery(`SHOW COLUMNS FROM \`${table}\``, { ...connOptions, database })

      if (columnsResult.success && columnsResult.rows.length > 1) {
        // SHOW COLUMNS format: Field, Type, Null, Key, Default, Extra
        const columns = []
        const primaryKeys = []

        // Skip header row
        for (let i = 1; i < columnsResult.rows.length; i++) {
          const row = columnsResult.rows[i]
          const parts = row.split('\t')

          if (parts.length >= 6) {
            const columnName = parts[0]
            const columnType = parts[1]
            const isNullable = parts[2] === 'YES'
            const columnKey = parts[3]
            const extra = parts[5] || ''

            columns.push({
              name: columnName,
              type: columnType,
              nullable: isNullable,
              isPrimaryKey: columnKey === 'PRI',
              extra
            })

            if (columnKey === 'PRI') {
              primaryKeys.push(columnName)
            }
          }
        }

        tablesWithSchemas.push({
          name: table,
          columns,
          primaryKeys,
          indexes: []
        })
      }
    }

    const schemaForLLM = formatSchemaForLLM(tablesWithSchemas)

    return {
      success: true,
      schema: {
        tables: tablesWithSchemas,
        formatted: schemaForLLM
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || String(error)
    }
  }
}

/**
 * Test database connection
 * @param {Object} options - Database connection options
 * @returns {Promise<Object>} - Connection test result
 */
async function testConnection(options = {}) {
  try {
    // Try to execute a simple query
    const result = await executeQuery('SELECT 1 as test', options)

    if (result.success) {
      return {
        success: true,
        message: 'Connection successful'
      }
    } else {
      return {
        success: false,
        error: result.error || 'Connection failed'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || String(error)
    }
  }
}

/**
 * Get list of databases
 * @param {Object} options - Database connection options (without database)
 * @returns {Promise<Object>} - List of databases
 */
async function getDatabases(options = {}) {
  try {
    const result = await executeQuery('SHOW DATABASES', options)

    if (!result.success) {
      return {
        success: false,
        error: result.error
      }
    }

    // result.rows already excludes header from executeQuery
    // SHOW DATABASES format: each line is just the database name (no "Database" prefix in batch mode)
    const databases = result.rows.map(row => {
      const match = row.match(/^Database\s+(.+)$/)
      if (match) return match[1]
      // If no "Database" prefix, the row itself is the database name
      return row.trim()
    }).filter(name => name.length > 0)

    return {
      success: true,
      databases
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || String(error)
    }
  }
}

module.exports = {
  executeQuery,
  getSchema,
  testConnection,
  getDatabases,
  buildMysqlCommand
}
