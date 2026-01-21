'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Indent,
  Minimize2,
  Quote,
  Wand2,
  Copy,
  Clipboard,
  History,
  Trash2,
  Gauge,
  CircleCheck,
  AlertTriangle
} from 'lucide-react'
import Layout from '../components/Layout'
import { HistoryPanel } from '../components/HistoryPanel'
import { useHistory, useClipboard, useLiveMode } from '../hooks'
import { formatBytes } from '../utils'
import { useToastContext } from '../providers/ToastProvider'
import { useI18n } from '../providers/I18nProvider'
import { STORAGE_KEYS } from '@/constants'
import { getErrorMessage } from '@/types'
import type { JsonValue, JsonObject, ValidationStatus } from '@/types'

// Helper for object key sorting
function sortObjectKeys(obj: JsonValue): JsonValue {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: JsonObject = {}
    Object.keys(obj as JsonObject)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObjectKeys((obj as JsonObject)[key])
      })
    return sorted
  }
  return obj
}

interface JsonHistoryItem {
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
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('empty')
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ input: 0, output: 0 })

  const toast = useToastContext()
  const { t } = useI18n()
  const { copyWithToast, pasteWithToast } = useClipboard()
  const {
    history,
    historyVisible,
    saveToHistory,
    deleteHistoryItem,
    clearAllHistory,
    showHistory,
    hideHistory
  } = useHistory<JsonHistoryItem>({ storageKey: STORAGE_KEYS.JSON_HISTORY, toolName: 'json' })

  const addToHistory = useCallback((mode: string, inputText: string, outputText: string) => {
    saveToHistory({
      type: 'json_processing',
      input: inputText,
      output: outputText,
      mode: mode
    })
  }, [saveToHistory])

  // Stats
  useEffect(() => {
    setStats({
      input: input.length,
      output: output.length
    })
  }, [input, output])

  // Validation
  useEffect(() => {
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

  // Live Mode
  const processLiveMode = useCallback(() => {
    try {
      const raw = input.trim()
      if (!raw) return
      let obj: JsonValue
      try {
        obj = JSON.parse(raw) as JsonValue
      } catch { return }

      if (sortKeys) obj = sortObjectKeys(obj)
      setOutput(JSON.stringify(obj, null, indent))
    } catch {}
  }, [input, indent, sortKeys])

  useLiveMode(liveMode, input, processLiveMode)

  const processJSON = useCallback((mode: string, silent = false) => {
    const raw = input.trim()
    if (!raw) {
      if (!silent) toast.warning(t.validation.required)
      return
    }

    try {
      let result = ''
      if (mode === 'escape') {
        result = JSON.stringify(raw)
      } else if (mode === 'unescape') {
        try {
          result = JSON.parse(raw)
          if (typeof result !== 'string') result = JSON.stringify(result, null, indent)
        } catch {
          result = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        }
      } else {
        let obj: JsonValue
        try {
          obj = JSON.parse(raw) as JsonValue
        } catch (e) {
          throw new Error(`${t.validation.invalidJson}: ${getErrorMessage(e)}`)
        }

        if (mode === 'format') {
          if (sortKeys) obj = sortObjectKeys(obj)
          result = JSON.stringify(obj, null, indent)
        } else if (mode === 'minify') {
          result = JSON.stringify(obj)
        }
      }
      setOutput(result)
      if (!silent) {
        toast.success(t.toast.operationSuccess)
        addToHistory(mode, raw, result)
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err)
      setError(errorMsg)
      if (!silent) toast.error(errorMsg)
    }
  }, [input, indent, sortKeys, addToHistory, toast, t])

  const fixJSON = () => {
     const raw = input.trim()
      if (!raw) {
        toast.warning(t.validation.required)
        return
      }
      try {
        let fixed = raw.replace(/'/g, '"').replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":').replace(/,(\s*[}\]])/g, '$1')
        const obj = JSON.parse(fixed)
        const result = JSON.stringify(obj, null, indent)
        setOutput(result)
        setInput(fixed)
        toast.success(t.json.fixSuccess)
        addToHistory('fix', raw, result)
      } catch {
        toast.error(t.json.fixFailed)
      }
  }

  const handlePaste = async () => {
    const text = await pasteWithToast()
    if (text) setInput(text)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setValidationStatus('empty')
  }

  const loadFromHistory = (item: JsonHistoryItem) => {
    setInput(item.input)
    setOutput(item.output)
    hideHistory()
  }

  // UI Components matching Calquio Style
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-theme">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">JSON Formatter & Validator</h1>
            <p className="text-text-secondary mt-1">Format, validate, minify, and fix JSON data instantly.</p>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => setLiveMode(!liveMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                liveMode
                  ? 'bg-primary text-primary-text border-primary'
                  : 'bg-surface text-text-secondary border-theme hover:bg-surface-hover'
              }`}
            >
              <Gauge size={14} />
              {liveMode ? 'Live Mode On' : 'Live Mode Off'}
            </button>
            <button onClick={showHistory} className="btn btn-secondary text-xs py-1.5">
              <History size={14} className="mr-2"/> History
            </button>
          </div>
        </div>

        {/* Controls Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Input Section */}
            <section className="bg-surface rounded-xl border border-theme shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-theme bg-zinc-50/50">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary">Input JSON</span>
                    {validationStatus !== 'empty' && (
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                            validationStatus === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {validationStatus === 'valid' ? <CircleCheck size={12} /> : <AlertTriangle size={12} />}
                        {validationStatus === 'valid' ? 'Valid' : 'Invalid'}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePaste} className="text-text-secondary hover:text-text-primary text-xs flex items-center gap-1 transition-colors">
                        <Clipboard size={14}/> Paste
                    </button>
                    <button onClick={clearAll} className="text-text-secondary hover:text-red-600 text-xs flex items-center gap-1 transition-colors">
                        <Trash2 size={14}/> Clear
                    </button>
                </div>
              </div>

              <div className="relative flex-1">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm bg-surface resize-none focus:outline-none border-none focus:ring-0"
                    placeholder='Paste your JSON here...'
                    spellCheck={false}
                />
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 text-xs p-3 rounded-md border border-red-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        {error}
                    </div>
                )}
              </div>

              <div className="px-4 py-2 bg-surface border-t border-theme flex justify-between text-xs text-text-muted">
                 <span>{formatBytes(stats.input)}</span>
                 <span>Ln {input.split('\n').length}</span>
              </div>
            </section>

            {/* Action Bar (Mobile/Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 <button onClick={() => processJSON('format')} className="btn btn-primary w-full justify-center">
                    <Indent size={16} className="mr-2" /> Format
                 </button>
                 <button onClick={() => processJSON('minify')} className="btn btn-secondary w-full justify-center">
                    <Minimize2 size={16} className="mr-2" /> Minify
                 </button>
                 <button onClick={() => processJSON('escape')} className="btn btn-secondary w-full justify-center">
                    <Quote size={16} className="mr-2" /> Escape
                 </button>
                 <button onClick={() => fixJSON()} className="btn btn-secondary w-full justify-center group">
                    <Wand2 size={16} className="mr-2 group-hover:text-purple-500 transition-colors" /> AI Fix
                 </button>
            </div>
          </div>

          {/* Settings & Output Side (or Bottom on mobile) */}
          <div className="space-y-6">
             {/* Configuration Card */}
             <div className="bg-surface rounded-xl border border-theme shadow-sm p-5">
                <h3 className="font-semibold text-sm text-text-primary mb-4 flex items-center gap-2">
                    Configuration
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Indentation</span>
                        <select
                            value={indent}
                            onChange={(e) => setIndent(Number(e.target.value))}
                            className="bg-surface-hover border-theme rounded px-2 py-1 text-xs focus:ring-0 w-24"
                        >
                            <option value={2}>2 Spaces</option>
                            <option value={4}>4 Spaces</option>
                            <option value={0}>Minified</option>
                        </select>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Sort Keys</span>
                        <input
                            type="checkbox"
                            checked={sortKeys}
                            onChange={(e) => setSortKeys(e.target.checked)}
                            className="rounded border-theme text-primary focus:ring-primary h-4 w-4"
                        />
                    </div>
                </div>
             </div>

             {/* Output Preview Card */}
             <div className="bg-surface rounded-xl border border-theme shadow-sm overflow-hidden flex flex-col h-[350px]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-theme bg-zinc-50/50">
                    <span className="font-semibold text-sm text-text-primary">Result</span>
                    <button onClick={() => output && copyWithToast(output)} className="text-primary hover:text-primary-hover text-xs flex items-center gap-1 font-medium">
                        <Copy size={14}/> Copy
                    </button>
                </div>
                <textarea
                    value={output}
                    readOnly
                    className="flex-1 w-full p-4 font-mono text-sm bg-surface-hover/30 resize-none focus:outline-none border-none text-text-secondary"
                    placeholder="Output will appear here..."
                />
             </div>
          </div>
        </div>

        <HistoryPanel
          visible={historyVisible}
          title="History"
          history={history}
          onClose={hideHistory}
          onClearAll={clearAllHistory}
          onDelete={deleteHistoryItem}
          onLoad={loadFromHistory}
          renderItemLabel={(item: JsonHistoryItem) => (item.mode || item.type || '').toUpperCase()}
          renderItemPreview={(item: JsonHistoryItem) => item.input.length > 50 ? item.input.substring(0, 50) + '...' : item.input}
        />
      </div>
    </Layout>
  )
}
