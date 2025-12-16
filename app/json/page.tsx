'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faIndent,
  faCompressArrowsAlt,
  faQuoteRight,
  faQuoteLeft,
  faMagic,
  faCopy,
  faPaste,
  faExchangeAlt,
  faSortAmountDown,
  faHistory,
  faTrashAlt,
  faTrash,
  faTimes,
  faInbox,
  faUpload,
  faTachometerAlt,
  faCode,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons'
import Layout from '../components/Layout'
import '../tools.css'

interface HistoryItem {
  type: string
  input: string
  output: string
  timestamp: number
  mode: string
}

export default function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(true)
  const [liveMode, setLiveMode] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyVisible, setHistoryVisible] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'empty'>('empty')
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ input: 0, output: 0 })

  const liveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('json_history')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }

  const saveToHistory = useCallback((mode: string, inputText: string, outputText: string) => {
    const newHistory: HistoryItem = {
      type: 'json_processing',
      input: inputText,
      output: outputText,
      timestamp: new Date().getTime(),
      mode: mode
    }

    const updatedHistory = [newHistory, ...history].slice(0, 100)
    setHistory(updatedHistory)
    localStorage.setItem('json_history', JSON.stringify(updatedHistory))
  }, [history])

  const updateStats = useCallback(() => {
    setStats({
      input: input.length,
      output: output.length
    })
  }, [input, output])

  const validateJSON = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) {
      setValidationStatus('empty')
      setError('')
      return
    }

    try {
      JSON.parse(trimmed)
      setValidationStatus('valid')
      setError('')
    } catch (e) {
      setValidationStatus('invalid')
      setError((e as Error).message)
    }
  }, [input])

  const sortObjectKeys = useCallback((obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((sorted: any, key) => {
          sorted[key] = sortObjectKeys(obj[key])
          return sorted
        }, {})
    }
    return obj
  }, [])

  const processJSON = useCallback((mode: string, silent = false) => {
    const raw = input.trim()
    if (!raw) {
      if (!silent) alert('请输入内容')
      return
    }

    try {
      let result = ''

      if (mode === 'escape') {
        result = JSON.stringify(raw)
      } else if (mode === 'unescape') {
        try {
          result = JSON.parse(raw)
          if (typeof result !== 'string') {
            result = JSON.stringify(result, null, indent)
          }
        } catch (e) {
          result = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        }
      } else {
        let obj
        try {
          obj = JSON.parse(raw)
        } catch (e) {
          try {
            obj = new Function('return ' + raw)() // eslint-disable-line no-new-func
          } catch (e2) {
            throw new Error('无效的 JSON 数据')
          }
        }

        if (mode === 'format') {
          if (sortKeys) {
            obj = sortObjectKeys(obj)
          }
          result = JSON.stringify(obj, null, indent)
        } else if (mode === 'minify') {
          result = JSON.stringify(obj)
        }
      }

      setOutput(result)
      const operation = mode === 'format' ? '格式化' : (mode === 'minify' ? '压缩' : mode)
      if (!silent) {
        alert(`${operation}成功`)
        saveToHistory(mode, raw, result)
      }
    } catch (err) {
      const errorMsg = (err as Error).message
      setError(errorMsg)
      if (!silent) {
        alert(`处理失败: ${errorMsg}`)
      }
    }
  }, [input, indent, sortKeys, saveToHistory, sortObjectKeys])

  const fixJSON = () => {
    const raw = input.trim()
    if (!raw) {
      alert('请输入内容')
      return
    }

    try {
      // Try to fix common JSON issues
      let fixed = raw

      // Replace single quotes with double quotes
      fixed = fixed.replace(/'/g, '"')

      // Add quotes around unquoted property names
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

      // Remove trailing commas
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

      // Try to parse and re-stringify
      const obj = JSON.parse(fixed)
      const result = JSON.stringify(obj, null, indent)

      setOutput(result)
      setInput(fixed)
      alert('JSON 修复成功')
      saveToHistory('fix', raw, result)
    } catch (err) {
      alert('无法自动修复 JSON')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
    } catch (err) {
      alert('复制失败')
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
      alert('已粘贴')
    } catch (err) {
      alert('无法读取剪贴板')
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setValidationStatus('empty')
  }

  const swapInOut = () => {
    const temp = input
    setInput(output)
    setOutput(temp)
  }

  const clearAllHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
      setHistory([])
      localStorage.removeItem('json_history')
      alert('已清空所有历史记录')
    }
  }

  const deleteHistoryItem = (index: number) => {
    if (window.confirm('确定要删除这条历史记录吗？')) {
      const updatedHistory = history.filter((_, i) => i !== index)
      setHistory(updatedHistory)
      localStorage.setItem('json_history', JSON.stringify(updatedHistory))
      alert('已删除历史记录')
    }
  }

  const loadFromHistory = (item: HistoryItem) => {
    setInput(item.input)
    setOutput(item.output)
    setHistoryVisible(false)
    alert('已加载历史记录')
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`

    return date.toLocaleDateString('zh-CN')
  }

  useEffect(() => {
    loadHistory()
    updateStats()
  }, [updateStats])

  useEffect(() => {
    updateStats()
    if (liveMode && input) {
      if (liveTimeoutRef.current) {
        clearTimeout(liveTimeoutRef.current)
      }
      liveTimeoutRef.current = setTimeout(() => {
        processJSON('format', true)
      }, 500)
    }
    validateJSON()
  }, [input, liveMode, processJSON, updateStats, validateJSON])

  useEffect(() => {
    updateStats()
  }, [output, updateStats])

  return (
    <Layout>
      <div className="json-tool">
        <div className="corner-decoration corner-tl"></div>
        <div className="corner-decoration corner-tr"></div>
        <div className="corner-decoration corner-bl"></div>
        <div className="corner-decoration corner-br"></div>

        <div className="json-container">
          {/* Options Bar */}
          <div className="options-bar">
            <div className="option-group">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={sortKeys}
                  onChange={(e) => setSortKeys(e.target.checked)}
                />
                <FontAwesomeIcon icon={faSortAmountDown} /> 排序键
              </label>
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={liveMode}
                  onChange={(e) => setLiveMode(e.target.checked)}
                />
                <FontAwesomeIcon icon={faTachometerAlt} /> 实时模式
              </label>
            </div>
            <div className="option-group">
              <label className="option-label">
                缩进:
                <select
                  value={indent}
                  onChange={(e) => setIndent(Number(e.target.value))}
                  className="indent-select"
                >
                  <option value={2}>2 空格</option>
                  <option value={4}>4 空格</option>
                  <option value={0}>Tab</option>
                </select>
              </label>
            </div>
          </div>

          {/* Input/Output Panels */}
          <div className="panels">
            {/* Input Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <FontAwesomeIcon icon={faArrowRight} /> INPUT
                  {validationStatus !== 'empty' && (
                    <span className={`validation-indicator ${validationStatus}`}>
                      <FontAwesomeIcon icon={validationStatus === 'valid' ? faCheckCircle : faExclamationTriangle} />
                      {validationStatus === 'valid' ? '有效' : '无效'}
                    </span>
                  )}
                </div>
                <div className="panel-actions">
                  <button className="panel-btn format-btn" onClick={() => processJSON('format')}>
                    <FontAwesomeIcon icon={faIndent} /> FORMAT
                  </button>
                  <button className="panel-btn minify-btn" onClick={() => processJSON('minify')}>
                    <FontAwesomeIcon icon={faCompressArrowsAlt} /> MINIFY
                  </button>
                  <button className="panel-btn escape-btn" onClick={() => processJSON('escape')}>
                    <FontAwesomeIcon icon={faQuoteRight} /> ESCAPE
                  </button>
                  <button className="panel-btn unescape-btn" onClick={() => processJSON('unescape')}>
                    <FontAwesomeIcon icon={faQuoteLeft} /> UNESCAPE
                  </button>
                  <button className="panel-btn fix-btn" onClick={fixJSON}>
                    <FontAwesomeIcon icon={faMagic} /> FIX
                  </button>
                </div>
              </div>
              <div className="panel-content">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="code-textarea"
                  placeholder='输入 JSON 数据，例如: {"name": "John", "age": 30}'
                />
                {error && <div className="error-message">{error}</div>}
              </div>
              <div className="panel-footer">
                <div className="stats">
                  <span>{formatBytes(stats.input)} bytes</span>
                  <button className="panel-btn" onClick={() => setHistoryVisible(true)}>
                    <FontAwesomeIcon icon={faHistory} /> 历史记录
                  </button>
                </div>
                <div className="action-buttons">
                  <button className="panel-btn" onClick={pasteFromClipboard}>
                    <FontAwesomeIcon icon={faPaste} /> 粘贴
                  </button>
                  <button className="panel-btn" onClick={clearAll}>
                    <FontAwesomeIcon icon={faTrashAlt} /> 清空
                  </button>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <FontAwesomeIcon icon={faCode} /> OUTPUT
                </div>
                <div className="panel-actions">
                  <button className="panel-btn" onClick={swapInOut}>
                    <FontAwesomeIcon icon={faExchangeAlt} /> 交换
                  </button>
                  <button className="panel-btn" onClick={() => output && copyToClipboard(output)}>
                    <FontAwesomeIcon icon={faCopy} /> 复制
                  </button>
                </div>
              </div>
              <div className="panel-content">
                <textarea
                  value={output}
                  readOnly
                  className="code-textarea output-textarea"
                  placeholder="处理后的 JSON 将显示在这里"
                />
              </div>
              <div className="panel-footer">
                <div className="stats">
                  <span>{formatBytes(stats.output)} bytes</span>
                </div>
                <div className="action-buttons">
                  <button className="panel-btn" onClick={() => output && copyToClipboard(output)}>
                    <FontAwesomeIcon icon={faCopy} /> 复制
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Panel */}
        {historyVisible && (
          <div className="history-panel active">
            <div className="history-content">
              <div className="history-header">
                <h2 className="history-title">
                  <FontAwesomeIcon icon={faHistory} /> JSON 处理历史
                </h2>
                <div>
                  <button
                    className="cyber-btn-small"
                    onClick={clearAllHistory}
                    style={{ marginRight: '10px' }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} /> 清空所有
                  </button>
                  <button
                    className="cyber-btn-small"
                    onClick={() => setHistoryVisible(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} /> 关闭
                  </button>
                </div>
              </div>
              <div className="history-list">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div key={index} className="history-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: 'Orbitron, monospace',
                            background: 'rgba(0, 255, 255, 0.1)',
                            color: 'var(--accent-color)',
                            border: '1px solid var(--border-color)'
                          }}>
                            {item.mode.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteHistoryItem(index)}
                          className="panel-btn"
                          style={{ color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>输入:</div>
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          background: 'var(--bg-secondary)',
                          padding: '8px',
                          borderRadius: '4px',
                          maxHeight: '80px',
                          overflowY: 'auto',
                          wordBreak: 'break-all'
                        }}>
                          {item.input.length > 200 ? item.input.substring(0, 200) + '...' : item.input}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => loadFromHistory(item)}
                          className="cyber-btn-small"
                        >
                          <FontAwesomeIcon icon={faUpload} /> 加载
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faInbox} />
                    <p>暂无历史记录</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}