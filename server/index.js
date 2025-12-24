/**
 * Express server for AI SQL API
 * Handles database connections and Ollama API calls
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { generateSQL, chatWithOllama, getModels, OLLAMA_HOST } = require('./ollama')
const { getSchema, testConnection, getDatabases, executeQuery } = require('./database')

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// ====================
// Ollama Routes
// ====================

/**
 * GET /api/ollama/models
 * Get available Ollama models
 */
app.get('/api/ollama/models', async (req, res) => {
  try {
    const models = await getModels()
    res.json({
      success: true,
      models,
      host: OLLAMA_HOST
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/ollama/generate
 * Generate SQL from natural language
 */
app.post('/api/ollama/generate', async (req, res) => {
  const { prompt, schema, model } = req.body

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    })
  }

  try {
    // Build the full prompt with schema context
    const fullPrompt = schema
      ? `You are a MySQL expert. Based on the following database schema, write a MySQL query for the request.

Database Schema:
${schema}

Request: ${prompt}

Write only the SQL query, nothing else. Do not include markdown code blocks.`
      : prompt

    const sql = await generateSQL(fullPrompt, model)

    res.json({
      success: true,
      sql
    })
  } catch (error) {
    console.error('SQL generation error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/ollama/chat
 * Chat with Ollama for explanations
 */
app.post('/api/ollama/chat', async (req, res) => {
  const { message, context } = req.body

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    })
  }

  try {
    const response = await chatWithOllama(message)
    res.json({
      success: true,
      response
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ====================
// Database Routes
// ====================

/**
 * POST /api/db/connect
 * Test database connection
 */
app.post('/api/db/connect', async (req, res) => {
  const { host, port, user, password, database, ssl } = req.body

  if (!host || !user) {
    return res.status(400).json({
      success: false,
      error: 'Host and user are required'
    })
  }

  try {
    const result = await testConnection({ host, port, user, password, database, ssl })
    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/db/databases
 * Get list of databases
 */
app.post('/api/db/databases', async (req, res) => {
  const { host, port, user, password, ssl } = req.body

  if (!host || !user) {
    return res.status(400).json({
      success: false,
      error: 'Host and user are required'
    })
  }

  try {
    const result = await getDatabases({ host, port, user, password, ssl })
    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/db/schema
 * Get database schema
 */
app.post('/api/db/schema', async (req, res) => {
  const { host, port, user, password, database, ssl } = req.body

  if (!host || !user || !database) {
    return res.status(400).json({
      success: false,
      error: 'Host, user, and database are required'
    })
  }

  try {
    const result = await getSchema({ host, port, user, password, database, ssl })
    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/db/execute
 * Execute a SQL query
 */
app.post('/api/db/execute', async (req, res) => {
  const { sql, host, port, user, password, database, ssl } = req.body

  if (!sql) {
    return res.status(400).json({
      success: false,
      error: 'SQL query is required'
    })
  }

  if (!host || !user || !database) {
    return res.status(400).json({
      success: false,
      error: 'Host, user, and database are required'
    })
  }

  // Security check - only allow SELECT queries for safety
  const normalizedSQL = sql.trim().toUpperCase()
  const isSelect = normalizedSQL.startsWith('SELECT') ||
    normalizedSQL.startsWith('SHOW') ||
    normalizedSQL.startsWith('DESCRIBE') ||
    normalizedSQL.startsWith('EXPLAIN') ||
    normalizedSQL.startsWith('WITH')

  if (!isSelect) {
    return res.status(400).json({
      success: false,
      error: 'Only SELECT, SHOW, DESCRIBE, EXPLAIN queries are allowed for safety'
    })
  }

  try {
    const result = await executeQuery(sql, { host, port, user, password, database, ssl })
    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// ====================
// Health Check
// ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

// ====================
// Start Server
// ====================

app.listen(PORT, () => {
  console.log(`AI SQL API server running on http://localhost:${PORT}`)
  console.log(`Ollama host: ${OLLAMA_HOST}`)
})

module.exports = app
