/**
 * Database schema extraction utilities
 */

function parseMysqlType(type) {
  const typeLower = type.toLowerCase()
  let jsType = 'string'
  let isNullable = true
  let extra = ''

  // Check nullable
  if (typeLower.includes('not null') || typeLower.includes('no sql')) {
    isNullable = false
  }

  // Check auto_increment
  if (typeLower.includes('auto_increment')) {
    extra = 'auto_increment'
  }

  // Parse base type
  if (typeLower.startsWith('int') || typeLower.startsWith('bigint') || typeLower.startsWith('smallint') || typeLower.startsWith('tinyint')) {
    jsType = 'number'
  } else if (typeLower.startsWith('float') || typeLower.startsWith('double') || typeLower.startsWith('decimal')) {
    jsType = 'number'
  } else if (typeLower.startsWith('bool')) {
    jsType = 'boolean'
  } else if (typeLower.startsWith('date') || typeLower.startsWith('time') || typeLower.startsWith('timestamp')) {
    jsType = 'Date'
  } else if (typeLower.includes('json')) {
    jsType = 'json'
  }

  return { type: jsType, nullable: isNullable, extra }
}

function parseCreateTableSQL(sql) {
  const tables = []

  // Match CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\(([\s\S]*?)\)(?:\s*ENGINE|\s*DEFAULT|\s*COMMENT|\s*AUTO_INCREMENT|\s*CHARSET|$)/gi
  let match

  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1]
    const columnsSection = match[2]

    const columns = []
    const primaryKeys = []
    const indexes = []

    // Parse columns and constraints
    const lines = columnsSection.split(/,\s*(?![^()]*\))/)
    for (const line of lines) {
      const trimmed = line.trim()

      // Primary key
      if (/^PRIMARY\s+KEY/i.test(trimmed)) {
        const pkMatch = trimmed.match(/\(([^)]+)\)/)
        if (pkMatch) {
          primaryKeys.push(...pkMatch[1].split(',').map(k => k.trim().replace(/[`"]/g, '')))
        }
        continue
      }

      // Foreign key
      if (/^FOREIGN\s+KEY/i.test(trimmed)) {
        const fkMatch = trimmed.match(/FOREIGN\s+KEY\s*[`"]?(\w*)[`"]?\s*\(([^)]+)\)\s*REFERENCES\s+[`"]?(\w+)[`"]?\s*\(([^)]+)\)/i)
        if (fkMatch) {
          indexes.push({
            type: 'FOREIGN KEY',
            columns: [fkMatch[2].trim().replace(/[`"]/g, '')],
            references: `${fkMatch[3]}(${fkMatch[4]})`
          })
        }
        continue
      }

      // Index
      if (/^(UNIQUE\s+)?(KEY|INDEX)\s+[`"]?(\w+)[`"]?/i.test(trimmed)) {
        const idxMatch = trimmed.match(/^(UNIQUE\s+)?(KEY|INDEX)\s+[`"]?(\w+)[`"]?\s*\(([^)]+)\)/i)
        if (idxMatch) {
          indexes.push({
            type: idxMatch[1] ? 'UNIQUE' : 'INDEX',
            name: idxMatch[3],
            columns: idxMatch[4].split(',').map(c => c.trim().replace(/[`"]/g, ''))
          })
        }
        continue
      }

      // Column definition
      const colMatch = trimmed.match(/^[`"]?(\w+)[`"]?\s+([^(]+)(?:\(([^)]+)\))?/)
      if (colMatch) {
        const columnName = colMatch[1]
        const fullType = colMatch[2].trim()
        const length = colMatch[3] || null

        const { type: jsType, nullable, extra } = parseMysqlType(fullType)

        columns.push({
          name: columnName,
          type: fullType,
          jsType,
          nullable,
          extra,
          isPrimaryKey: primaryKeys.includes(columnName),
          length
        })
      }
    }

    tables.push({
      name: tableName,
      columns,
      primaryKeys,
      indexes
    })
  }

  return tables
}

function formatSchemaForLLM(tables) {
  if (!tables || tables.length === 0) {
    return 'No tables found in database.'
  }

  let output = 'Database Schema:\n\n'

  for (const table of tables) {
    output += `Table: ${table.name}\n`

    if (table.primaryKeys.length > 0) {
      output += `  Primary Key: ${table.primaryKeys.join(', ')}\n`
    }

    output += '  Columns:\n'
    for (const col of table.columns) {
      const nullable = col.nullable ? 'NULL' : 'NOT NULL'
      const pk = col.isPrimaryKey ? ' (PRIMARY KEY)' : ''
      const auto = col.extra === 'auto_increment' ? ' (AUTO_INCREMENT)' : ''
      output += `    - ${col.name} ${col.type}${col.length ? `(${col.length})` : ''} ${nullable}${pk}${auto}\n`
    }

    if (table.indexes.length > 0) {
      output += '  Indexes:\n'
      for (const idx of table.indexes) {
        output += `    - ${idx.type} ${idx.name || ''} (${idx.columns.join(', ')})`
        if (idx.references) output += ` REFERENCES ${idx.references}`
        output += '\n'
      }
    }

    output += '\n'
  }

  return output
}

module.exports = {
  parseCreateTableSQL,
  formatSchemaForLLM
}
