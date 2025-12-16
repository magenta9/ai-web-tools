'use client'

import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faCalendarAlt,
  faCopy,
  faPaste,
  faTrash,
  faHistory,
  faExchangeAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import Layout from '../components/Layout'
import '../tools.css'

interface HistoryItem {
  type: 'timestamp_to_date' | 'date_to_timestamp'
  input: string
  output: string
  timestamp: number
}

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('')
  const [date, setDate] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyVisible, setHistoryVisible] = useState(false)

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('timestamp_history')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }

  const saveToHistory = (type: HistoryItem['type'], input: string, output: string) => {
    const newHistory: HistoryItem = {
      type,
      input,
      output,
      timestamp: new Date().getTime()
    }

    const updatedHistory = [newHistory, ...history].slice(0, 100)
    setHistory(updatedHistory)
    localStorage.setItem('timestamp_history', JSON.stringify(updatedHistory))
  }

  const convertTimestampToDate = () => {
    const ts = timestamp.trim()
    if (!ts) {
      alert('请输入时间戳')
      return
    }

    try {
      const num = parseInt(ts)
      if (isNaN(num)) {
        throw new Error('无效的时间戳')
      }

      const dateObj = new Date(num)
      if (isNaN(dateObj.getTime())) {
        throw new Error('无效的时间戳')
      }

      const conversions = [
        {
          label: 'UTC 时间',
          value: dateObj.toUTCString()
        },
        {
          label: '本地时间',
          value: dateObj.toLocaleString()
        },
        {
          label: 'ISO 8601',
          value: dateObj.toISOString()
        },
        {
          label: '日期 (YYYY-MM-DD)',
          value: dateObj.toISOString().split('T')[0]
        },
        {
          label: '时间 (HH:MM:SS)',
          value: dateObj.toTimeString().split(' ')[0]
        },
        {
          label: '中国时区 (UTC+8)',
          value: new Date(num + 8 * 60 * 60 * 1000).toLocaleString('zh-CN')
        }
      ]

      setResults(conversions)
      const output = conversions.map(c => `${c.label}: ${c.value}`).join('\n')
      saveToHistory('timestamp_to_date', ts, output)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const convertDateToTimestamp = () => {
    const dateStr = date.trim()
    if (!dateStr) {
      alert('请输入日期')
      return
    }

    try {
      const dateObj = new Date(dateStr)
      if (isNaN(dateObj.getTime())) {
        throw new Error('无效的日期格式')
      }

      const conversions = [
        {
          label: 'Unix 时间戳 (秒)',
          value: Math.floor(dateObj.getTime() / 1000)
        },
        {
          label: 'Unix 时间戳 (毫秒)',
          value: dateObj.getTime()
        }
      ]

      setResults(conversions)
      const output = conversions.map(c => `${c.label}: ${c.value}`).join('\n')
      saveToHistory('date_to_timestamp', dateStr, output)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const getCurrentTimestamp = () => {
    const now = new Date()
    setTimestamp(Math.floor(now.getTime() / 1000).toString())
  }

  const getCurrentDate = () => {
    const now = new Date()
    setDate(now.toISOString())
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板')
    } catch (err) {
      alert('复制失败')
    }
  }

  const pasteFromClipboard = async (type: 'timestamp' | 'date') => {
    try {
      const text = await navigator.clipboard.readText()
      if (type === 'timestamp') {
        setTimestamp(text)
      } else {
        setDate(text)
      }
      alert('已粘贴')
    } catch (err) {
      alert('无法读取剪贴板')
    }
  }

  const clearAll = () => {
    setTimestamp('')
    setDate('')
    setResults([])
  }

  const swapInputOutput = () => {
    if (results.length > 0) {
      const firstResult = results[0].value
      if (results[0].label.includes('时间戳')) {
        setTimestamp(firstResult.toString())
        setDate('')
      } else {
        setDate(firstResult)
        setTimestamp('')
      }
    }
  }

  const clearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
      setHistory([])
      localStorage.removeItem('timestamp_history')
      alert('已清空历史记录')
    }
  }

  const loadFromHistory = (item: HistoryItem) => {
    if (item.type === 'timestamp_to_date') {
      setTimestamp(item.input)
    } else {
      setDate(item.input)
    }
    setHistoryVisible(false)
    alert('已加载历史记录')
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

  return (
    <Layout>
      <div className="timestamp-converter">
        <div className="timestamp-container">
          <div className="panels">
            {/* Timestamp Input Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <FontAwesomeIcon icon={faClock} /> 时间戳转换
                </div>
                <div className="panel-actions">
                  <button className="panel-btn" onClick={getCurrentTimestamp}>
                    当前时间戳
                  </button>
                  <button className="panel-btn" onClick={() => pasteFromClipboard('timestamp')}>
                    <FontAwesomeIcon icon={faPaste} /> 粘贴
                  </button>
                  <button className="panel-btn" onClick={() => setTimestamp('')}>
                    <FontAwesomeIcon icon={faTrash} /> 清空
                  </button>
                </div>
              </div>
              <div className="panel-content">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="输入 Unix 时间戳 (秒或毫秒)"
                  style={{ width: '100%', marginBottom: '10px' }}
                />
                <button className="cyber-btn-small" onClick={convertTimestampToDate}>
                  <FontAwesomeIcon icon={faCalendarAlt} /> 转换为日期
                </button>
              </div>
            </div>

            {/* Date Input Panel */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <FontAwesomeIcon icon={faCalendarAlt} /> 日期转换
                </div>
                <div className="panel-actions">
                  <button className="panel-btn" onClick={getCurrentDate}>
                    当前日期
                  </button>
                  <button className="panel-btn" onClick={() => pasteFromClipboard('date')}>
                    <FontAwesomeIcon icon={faPaste} /> 粘贴
                  </button>
                  <button className="panel-btn" onClick={() => setDate('')}>
                    <FontAwesomeIcon icon={faTrash} /> 清空
                  </button>
                </div>
              </div>
              <div className="panel-content">
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="输入日期 (支持多种格式)"
                  style={{ width: '100%', marginBottom: '10px' }}
                />
                <button className="cyber-btn-small" onClick={convertDateToTimestamp}>
                  <FontAwesomeIcon icon={faClock} /> 转换为时间戳
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="panel" style={{ marginTop: '20px' }}>
              <div className="panel-header">
                <div className="panel-title">
                  转换结果
                </div>
                <div className="panel-actions">
                  <button className="panel-btn" onClick={swapInputOutput}>
                    <FontAwesomeIcon icon={faExchangeAlt} /> 交换输入输出
                  </button>
                  <button className="panel-btn" onClick={clearAll}>
                    <FontAwesomeIcon icon={faTrash} /> 清空全部
                  </button>
                </div>
              </div>
              <div className="panel-content">
                <div className="timestamp-grid">
                  {results.map((result, index) => (
                    <div key={index} className="timestamp-result">
                      <div className="timestamp-label">{result.label}</div>
                      <div className="timestamp-value">{result.value}</div>
                      <button
                        className="panel-btn"
                        onClick={() => copyToClipboard(result.value.toString())}
                        style={{ marginTop: '8px' }}
                      >
                        <FontAwesomeIcon icon={faCopy} /> 复制
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Button */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button
              className="panel-btn"
              onClick={() => setHistoryVisible(true)}
            >
              <FontAwesomeIcon icon={faHistory} /> 历史记录
            </button>
          </div>
        </div>

        {/* History Panel */}
        {historyVisible && (
          <div className="history-panel active">
            <div className="history-content">
              <div className="history-header">
                <h2 className="history-title">
                  <FontAwesomeIcon icon={faHistory} /> 转换历史
                </h2>
                <div>
                  <button
                    className="cyber-btn-small"
                    onClick={clearHistory}
                    style={{ marginRight: '10px' }}
                  >
                    <FontAwesomeIcon icon={faTrash} /> 清空
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'Orbitron, monospace',
                          background: 'rgba(0, 255, 255, 0.1)',
                          color: 'var(--accent-color)',
                          border: '1px solid var(--border-color)'
                        }}>
                          {item.type === 'timestamp_to_date' ? '时间戳 → 日期' : '日期 → 时间戳'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px' }}>
                        输入: {item.input}
                      </div>
                      <button
                        onClick={() => loadFromHistory(item)}
                        className="cyber-btn-small"
                      >
                        加载
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
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