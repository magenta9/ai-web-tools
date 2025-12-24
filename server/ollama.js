/**
 * Ollama API client for SQL generation
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'

/**
 * Call Ollama to generate SQL from natural language
 * @param {string} prompt - The prompt to send to Ollama
 * @param {string} model - Ollama model name (default: llama3.2)
 * @returns {Promise<string>} - Generated SQL
 */
async function generateSQL(prompt, model = 'llama3.2') {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_predict: 1000
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ollama API error: ${response.status} - ${error}`)
  }

  const data = await response.json()

  // Extract SQL from response (remove markdown code blocks if present)
  let sql = data.response || ''

  // Remove markdown code block markers
  sql = sql.replace(/```sql?/gi, '').replace(/```/g, '').trim()

  // Remove leading "sql" language indicator
  sql = sql.replace(/^sql\s*/i, '').trim()

  return sql
}

/**
 * Call Ollama to explain or refine SQL
 * @param {string} prompt - The prompt to send to Ollama
 * @param {string} model - Ollama model name
 * @returns {Promise<string>} - Ollama's response
 */
async function chatWithOllama(prompt, model = 'llama3.2') {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 2000
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ollama API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.response || ''
}

/**
 * Get available Ollama models
 * @returns {Promise<Array>} - List of available models
 */
async function getModels() {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`)
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }
    const data = await response.json()
    return data.models || []
  } catch (error) {
    console.error('Failed to get Ollama models:', error)
    return []
  }
}

module.exports = {
  generateSQL,
  chatWithOllama,
  getModels,
  OLLAMA_HOST
}
