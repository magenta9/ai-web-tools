'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
    Send,
    BookText,
    Trash2,
    Copy,
    User,
    Bot,
    Loader
} from 'lucide-react'
import Layout from '../components/Layout'
import { PromptSelector, ModelSelector, HistoryPanel } from '../components'
import { useClipboard, useOllamaModels, useHistory } from '../hooks'
import { useToastContext } from '../providers/ToastProvider'
import { useI18n } from '../providers/I18nProvider'
import { useTheme } from '../providers/ThemeProvider'
import { useAuth } from '@/app/context/AuthContext'
import { MarkdownMessage } from './MarkdownMessage'
import type { ChatMessage, Prompt } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import '../tools.css'
import '../prompt/prompt.css'
import './chat.css'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function ChatPage() {
    const { token } = useAuth()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPromptSelector, setShowPromptSelector] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const toast = useToastContext()
    const { t } = useI18n()
    const { copyWithToast } = useClipboard()
    const { selectedModel, models, isLoading: loadingModels, setSelectedModel } = useOllamaModels()
    const { isDarkMode } = useTheme()

    // Load messages from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) {
                    setMessages(parsed)
                }
            } catch (e) {
                console.error('Failed to load chat history:', e)
            }
        }
    }, [])

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages))
        }
    }, [messages])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (content: string) => {
        if (!content.trim() || loading) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        // Create placeholder for assistant message
        const assistantId = (Date.now() + 1).toString()
        const assistantMessage: ChatMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now()
        }
        setMessages(prev => [...prev, assistantMessage])

        try {
            const response = await fetch(`${API_BASE}/ollama/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: content.trim(),
                    model: selectedModel,
                    messages: messages,
                    stream: true
                })
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please login to continue')
                }
                throw new Error('Failed to get response from AI')
            }

            // Handle streaming response
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error('No response body')
            }

            let accumulatedContent = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') {
                            break
                        }
                        accumulatedContent += data
                        // Update the assistant message in real-time
                        setMessages(prev => prev.map(msg =>
                            msg.id === assistantId
                                ? { ...msg, content: accumulatedContent }
                                : msg
                        ))
                    }
                }
            }

            if (!accumulatedContent) {
                throw new Error('No response received')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
            toast.error(errorMessage)

            const errorMsg: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `错误: ${errorMessage}`,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handlePromptSelect = (prompt: Prompt) => {
        setInput(prompt.content)
        inputRef.current?.focus()
    }

    const clearChat = () => {
        if (messages.length > 0 && confirm('确定要清空对话历史吗？')) {
            setMessages([])
            localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY)
        }
    }

    const copyMessage = (content: string) => {
        copyWithToast(content)
    }

    return (
        <Layout>
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-title-section">
                        <h1>AI Chat</h1>
                        <p className="subtitle">与 AI 对话，使用 Prompt 模板</p>
                    </div>
                    <div className="chat-header-actions">
                        <ModelSelector
                            models={models}
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                        />
                        <button
                            className="btn-secondary"
                            onClick={() => setShowPromptSelector(true)}
                        >
                            <BookText size={16} /> Prompt 模板
                        </button>
                        {messages.length > 0 && (
                            <button className="btn-secondary" onClick={clearChat}>
                                <Trash2 size={16} /> 清空对话
                            </button>
                        )}
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="chat-empty-state">
                            <Bot size={48} />
                            <h3>开始对话</h3>
                            <p>输入消息或选择 Prompt 模板开始与 AI 对话</p>
                            <button
                                className="btn-primary"
                                onClick={() => setShowPromptSelector(true)}
                            >
                                <BookText size={16} /> 选择 Prompt 模板
                            </button>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`chat-message ${message.role}`}
                                >
                                    <div className="message-avatar">
                                        {message.role === 'user' ? (
                                            <User size={20} />
                                        ) : (
                                            <Bot size={20} />
                                        )}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-text">
                                            {message.role === 'assistant' ? (
                                                <MarkdownMessage content={message.content} isDarkMode={isDarkMode} />
                                            ) : (
                                                <span>{message.content}</span>
                                            )}
                                        </div>
                                        <div className="message-actions">
                                            <button
                                                className="message-action-btn"
                                                onClick={() => copyMessage(message.content)}
                                                title="复制"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <span className="message-time">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                <div className="chat-input-container">
                    <form onSubmit={handleSubmit} className="chat-input-form">
                        <button
                            type="button"
                            className="input-action-btn"
                            onClick={() => setShowPromptSelector(true)}
                            title="选择 Prompt 模板"
                        >
                            <BookText size={18} />
                        </button>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="输入消息... (Shift+Enter 换行)"
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="send-btn"
                            disabled={!input.trim() || loading}
                        >
                            {loading ? <Loader size={18} className="spinning" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>

                <PromptSelector
                    visible={showPromptSelector}
                    onSelect={handlePromptSelect}
                    onClose={() => setShowPromptSelector(false)}
                />
            </div>
        </Layout>
    )
}
