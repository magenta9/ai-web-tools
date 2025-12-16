'use client'

import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faKey,
  faLink,
  faSync,
  faSearch,
  faCopy,
  faPaste,
  faCode,
  faCheck,
  faArrowUp,
  faHistory,
  faTrashAlt,
  faTimes,
  faInbox,
  faUpload,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import Layout from '../components/Layout'
import '../tools.css'

interface UrlItem {
  label: string
  url: string
  icon: string
}

interface HistoryItem {
  type: 'key_to_url' | 'url_to_key'
  input: string
  output: string
  timestamp: number
}

export default function ImageConverter() {
  const [activeTab, setActiveTab] = useState<'key-to-url' | 'url-to-key'>('key-to-url')
  const [keyInput, setKeyInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlOutput, setUrlOutput] = useState<UrlItem[]>([])
  const [keyOutput, setKeyOutput] = useState('')
  const [historyVisible, setHistoryVisible] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const savedHistory = localStorage.getItem('image_history')
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
    localStorage.setItem('image_history', JSON.stringify(updatedHistory))
  }

  const convertKeyToUrls = () => {
    const key = keyInput.trim()
    if (!key) {
      alert('请输入 Image Key')
      return
    }

    const baseCDN = 'https://cdn.lokboxes.ai/'
    const frenchCDN = 'https://cdn.flippop.fun/'

    const urls: UrlItem[] = [
      { label: 'Original CDN', url: baseCDN + key, icon: 'globe' },
      { label: 'French CDN', url: frenchCDN + key, icon: 'flag' },
      { label: 'Optimized (WebP, Quality 75)', url: baseCDN + 'cdn-cgi/image/quality=75,format=webp/' + key, icon: 'compress' },
      { label: 'Optimized (Width 400, Quality 75)', url: baseCDN + 'cdn-cgi/image/width=400,quality=75/' + key, icon: 'expand-arrows-alt' },
      { label: 'Optimized (Width 800, Quality 85)', url: baseCDN + 'cdn-cgi/image/width=800,quality=85/' + key, icon: 'tv' }
    ]

    setUrlOutput(urls)
    const outputText = urls.map(u => u.url).join('\n')
    saveToHistory('key_to_url', key, outputText)
    alert('转换成功')
  }

  const extractKeyFromUrl = () => {
    const url = urlInput.trim()
    if (!url) {
      alert('请输入 URL')
      return
    }

    try {
      let key = url

      // Remove protocol and domain
      key = key.replace(/^https?:\/\//, '')
      const firstSlash = key.indexOf('/')
      if (firstSlash !== -1) {
        key = key.substring(firstSlash + 1)
      }

      // Remove cdn-cgi/image processing
      if (key.includes('cdn-cgi/image/')) {
        const parts = key.split('/')
        const cgIndex = parts.findIndex(p => p.includes('cdn-cgi'))
        if (cgIndex !== -1) {
          key = parts.slice(cgIndex + 2).join('/')
        }
      }

      // Remove any remaining CDN prefixes
      key = key.replace(/^cdn\.(lokboxes|flippop)\.(ai|fun)\//, '')

      if (!key.startsWith('flippop/image/')) {
        throw new Error('无效的图像 URL 格式')
      }

      setKeyOutput(key)
      saveToHistory('url_to_key', url, key)
      alert('提取成功')
    } catch (error) {
      alert('提取失败: ' + (error as Error).message)
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

  const copyAllUrls = async () => {
    if (urlOutput.length === 0) {
      alert('没有可复制的内容')
      return
    }

    try {
      await navigator.clipboard.writeText(urlOutput.map(u => u.url).join('\n'))
      alert('已复制所有 URLs')
    } catch (err) {
      alert('复制失败')
    }
  }

  const pasteFromClipboard = async (type: 'key' | 'url') => {
    try {
      const text = await navigator.clipboard.readText()
      if (type === 'key') {
        setKeyInput(text)
      } else {
        setUrlInput(text)
      }
      alert('已粘贴')
    } catch (err) {
      alert('无法读取剪贴板')
    }
  }

  const loadExample = (type: 'key' | 'url') => {
    if (type === 'key') {
      const exampleKey = 'flippop/image/item/story/1996218524934668288/202512040537/6b3b2b76167b42c6a7ecfbb480e78219.jpeg'
      setKeyInput(exampleKey)
      setTimeout(() => convertKeyToUrls(), 100)
    } else {
      const exampleUrl = 'https://cdn.lokboxes.ai/cdn-cgi/image/quality=75,format=webp/flippop/image/item/story/1996218524934668288/202512040537/6b3b2b76167b42c6a7ecfbb480e78219.jpeg'
      setUrlInput(exampleUrl)
      setTimeout(() => extractKeyFromUrl(), 100)
    }
  }

  const clearAllHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
      setHistory([])
      localStorage.removeItem('image_history')
      alert('已清空所有历史记录')
    }
  }

  const deleteHistoryItem = (index: number) => {
    if (window.confirm('确定要删除这条历史记录吗？')) {
      const updatedHistory = history.filter((_, i) => i !== index)
      setHistory(updatedHistory)
      localStorage.setItem('image_history', JSON.stringify(updatedHistory))
      alert('已删除历史记录')
    }
  }

  const loadFromHistory = (item: HistoryItem, type: 'input' | 'key' | 'url') => {
    if (type === 'input') {
      if (item.type === 'key_to_url') {
        setKeyInput(item.input)
        setActiveTab('key-to-url')
      } else {
        setUrlInput(item.input)
        setActiveTab('url-to-key')
      }
    } else if (type === 'key' && item.type === 'key_to_url') {
      setKeyInput(item.input)
      setActiveTab('key-to-url')
    } else if (type === 'url' && item.type === 'url_to_key') {
      setUrlInput(item.input)
      setActiveTab('url-to-key')
    }
    alert(`已加载${type === 'input' ? '输入' : type === 'key' ? 'Key' : 'URL'}`)
  }

  const handleUrlClick = (url: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      copyToClipboard(url)
    }
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

  return (
    <Layout>
      <div className="image-converter">
        <div className="tab-container">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'key-to-url' ? 'active' : ''}`}
              onClick={() => setActiveTab('key-to-url')}
            >
              <FontAwesomeIcon icon={faKey} /> KEY → URLS
            </button>
            <button
              className={`tab-btn ${activeTab === 'url-to-key' ? 'active' : ''}`}
              onClick={() => setActiveTab('url-to-key')}
            >
              <FontAwesomeIcon icon={faLink} /> URL → KEY
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'key-to-url' && (
              <div className="tab-pane active">
                <div className="panels">
                  {/* Input Panel */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title input">
                        <FontAwesomeIcon icon={faKey} /> INPUT KEY
                      </div>
                      <div className="panel-actions">
                        <button className="panel-btn" onClick={() => pasteFromClipboard('key')}>
                          <FontAwesomeIcon icon={faPaste} /> PASTE
                        </button>
                        <button className="panel-btn" onClick={() => loadExample('key')}>
                          <FontAwesomeIcon icon={faCode} /> DEMO
                        </button>
                      </div>
                    </div>
                    <div className="panel-content">
                      <textarea
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        className="code-textarea"
                        placeholder="flippop/image/item/story/1996218524934668288/202512040537/6b3b2b76167b42c6a7ecfbb480e78219.jpeg"
                      />
                    </div>
                    <div className="panel-footer">
                      <div>
                        <span>{formatBytes(keyInput.length)} bytes</span>
                        <button
                          className="panel-btn"
                          onClick={() => setHistoryVisible(true)}
                          style={{ marginLeft: '10px' }}
                        >
                          <FontAwesomeIcon icon={faHistory} /> 历史记录
                        </button>
                      </div>
                      <button className="cyber-btn-small" onClick={convertKeyToUrls}>
                        <FontAwesomeIcon icon={faSync} /> CONVERT
                      </button>
                    </div>
                  </div>

                  {/* Output Panel */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title output">
                        <FontAwesomeIcon icon={faCheck} /> OUTPUT URLS
                      </div>
                      <div className="panel-actions">
                        <button className="panel-btn" onClick={copyAllUrls}>
                          <FontAwesomeIcon icon={faCopy} /> COPY ALL
                        </button>
                      </div>
                    </div>
                    <div className="panel-content">
                      {urlOutput.length > 0 ? (
                        <div className="url-list">
                          {urlOutput.map((item, index) => (
                            <div key={index} className="url-item">
                              <div className="url-item-header">
                                <FontAwesomeIcon icon={item.icon as any} />
                                {item.label}
                              </div>
                              <div
                                className="url-item-content"
                                onClick={(e) => handleUrlClick(item.url, e)}
                                title="点击复制，Ctrl+点击打开链接"
                              >
                                {item.url}
                              </div>
                              <div className="url-item-actions">
                                <button
                                  className="cyber-btn-small"
                                  onClick={() => copyToClipboard(item.url)}
                                >
                                  <FontAwesomeIcon icon={faCopy} /> 复制
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FontAwesomeIcon icon={faArrowUp} />
                          <p>Enter Image Key to generate URLs</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'url-to-key' && (
              <div className="tab-pane active">
                <div className="panels">
                  {/* Input Panel */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title input">
                        <FontAwesomeIcon icon={faLink} /> INPUT URL
                      </div>
                      <div className="panel-actions">
                        <button className="panel-btn" onClick={() => pasteFromClipboard('url')}>
                          <FontAwesomeIcon icon={faPaste} /> PASTE
                        </button>
                        <button className="panel-btn" onClick={() => loadExample('url')}>
                          <FontAwesomeIcon icon={faCode} /> DEMO
                        </button>
                      </div>
                    </div>
                    <div className="panel-content">
                      <textarea
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="code-textarea"
                        placeholder="https://cdn.lokboxes.ai/cdn-cgi/image/quality=75,format=webp/flippop/image/item/story/1996218524934668288/202512040537/6b3b2b76167b42c6a7ecfbb480e78219.jpeg"
                      />
                    </div>
                    <div className="panel-footer">
                      <div>
                        <span>{formatBytes(urlInput.length)} bytes</span>
                        <button
                          className="panel-btn"
                          onClick={() => setHistoryVisible(true)}
                          style={{ marginLeft: '10px' }}
                        >
                          <FontAwesomeIcon icon={faHistory} /> 历史记录
                        </button>
                      </div>
                      <button className="cyber-btn-small" onClick={extractKeyFromUrl}>
                        <FontAwesomeIcon icon={faSearch} /> EXTRACT
                      </button>
                    </div>
                  </div>

                  {/* Output Panel */}
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-title output">
                        <FontAwesomeIcon icon={faKey} /> OUTPUT KEY
                      </div>
                      <div className="panel-actions">
                        <button className="panel-btn" onClick={() => keyOutput && copyToClipboard(keyOutput)}>
                          <FontAwesomeIcon icon={faCopy} /> COPY
                        </button>
                      </div>
                    </div>
                    <div className="panel-content">
                      {keyOutput ? (
                        <div className="key-output">
                          <div className="key-output-header">
                            <FontAwesomeIcon icon={faKey} />
                            提取的 Image Key
                          </div>
                          <div className="key-output-content">
                            {keyOutput}
                          </div>
                          <div className="url-item-actions">
                            <button
                              className="cyber-btn-small"
                              onClick={() => copyToClipboard(keyOutput)}
                            >
                              <FontAwesomeIcon icon={faCopy} /> 复制
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FontAwesomeIcon icon={faArrowUp} />
                          <p>Enter URL to extract Image Key</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Panel */}
        {historyVisible && (
          <div className="history-panel active">
            <div className="history-content">
              <div className="history-header">
                <h2 className="history-title">
                  <FontAwesomeIcon icon={faHistory} /> CONVERSION HISTORY
                </h2>
                <div>
                  <button
                    className="cyber-btn-small"
                    onClick={clearAllHistory}
                    style={{ marginRight: '10px' }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} /> CLEAR ALL
                  </button>
                  <button
                    className="cyber-btn-small"
                    onClick={() => setHistoryVisible(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} /> CLOSE
                  </button>
                </div>
              </div>
              <div className="history-list">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div key={index} className="history-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontFamily: 'Orbitron, monospace',
                              background: item.type === 'key_to_url' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 0, 110, 0.1)',
                              color: item.type === 'key_to_url' ? 'var(--neon-cyan)' : 'var(--neon-pink)',
                              border: `1px solid ${item.type === 'key_to_url' ? 'var(--border-color)' : 'rgba(255, 0, 110, 0.3)'}`
                            }}
                          >
                            {item.type === 'key_to_url' ? 'Key → URLs' : 'URL → Key'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteHistoryItem(index)}
                          className="panel-btn"
                          style={{ color: 'var(--neon-pink)', borderColor: 'var(--neon-pink)' }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', fontFamily: 'Orbitron, monospace' }}>输入:</div>
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '8px',
                          borderRadius: '4px',
                          maxHeight: '80px',
                          overflowY: 'auto',
                          wordBreak: 'break-all'
                        }}>
                          {item.input.length > 200 ? item.input.substring(0, 200) + '...' : item.input}
                        </div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', fontFamily: 'Orbitron, monospace' }}>输出:</div>
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '8px',
                          borderRadius: '4px',
                          maxHeight: '80px',
                          overflowY: 'auto'
                        }}>
                          {item.type === 'key_to_url' ?
                            item.output.split('\n').map((url, i) => (
                              <div
                                key={i}
                                style={{
                                  cursor: 'pointer',
                                  color: 'var(--text-primary)',
                                  padding: '2px 0'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--neon-cyan)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onClick={(e) => handleUrlClick(url.trim(), e)}
                                title="点击复制，Ctrl+点击打开链接"
                              >
                                {url.trim().length > 200 ? url.trim().substring(0, 200) + '...' : url.trim()}
                              </div>
                            )) :
                            <div>{item.output.length > 200 ? item.output.substring(0, 200) + '...' : item.output}</div>
                          }
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => loadFromHistory(item, 'input')}
                          className="cyber-btn-small"
                        >
                          <FontAwesomeIcon icon={faUpload} /> 加载输入
                        </button>
                        {item.type === 'key_to_url' && (
                          <button
                            onClick={() => loadFromHistory(item, 'key')}
                            className="cyber-btn-small"
                          >
                            <FontAwesomeIcon icon={faKey} /> 加载Key
                          </button>
                        )}
                        {item.type === 'url_to_key' && (
                          <button
                            onClick={() => loadFromHistory(item, 'url')}
                            className="cyber-btn-small"
                          >
                            <FontAwesomeIcon icon={faLink} /> 加载URL
                          </button>
                        )}
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