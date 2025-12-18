'use client'

import { useState, useCallback, useEffect } from 'react'
import { MAX_HISTORY_ITEMS } from '@/constants'

export interface BaseHistoryItem {
    type: string
    input: string
    output: string
    timestamp: number
}

export interface UseHistoryOptions {
    storageKey: string
    maxItems?: number
}

function isBaseHistoryItem(item: unknown): item is BaseHistoryItem {
    return (
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        typeof (item as BaseHistoryItem).type === 'string' &&
        'input' in item &&
        typeof (item as BaseHistoryItem).input === 'string' &&
        'output' in item &&
        typeof (item as BaseHistoryItem).output === 'string' &&
        'timestamp' in item &&
        typeof (item as BaseHistoryItem).timestamp === 'number'
    )
}

function isHistoryArray(data: unknown): data is BaseHistoryItem[] {
    return Array.isArray(data) && data.every(isBaseHistoryItem)
}

function safeGetFromStorage<T extends BaseHistoryItem>(key: string): T[] {
    if (typeof window === 'undefined') return []

    try {
        const stored = localStorage.getItem(key)
        if (!stored) return []

        const parsed: unknown = JSON.parse(stored)
        if (isHistoryArray(parsed)) {
            return parsed as T[]
        }

        console.warn(`Invalid history data format for key: ${key}`)
        return []
    } catch (error) {
        console.error(`Failed to parse history for key ${key}:`, error)
        return []
    }
}

function safeSetToStorage<T extends BaseHistoryItem>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
        console.error(`Failed to save history for key ${key}:`, error)
    }
}

export function useHistory<T extends BaseHistoryItem>(options: UseHistoryOptions) {
    const { storageKey, maxItems = MAX_HISTORY_ITEMS } = options
    const [history, setHistory] = useState<T[]>([])
    const [historyVisible, setHistoryVisible] = useState(false)

    const loadHistory = useCallback(() => {
        const savedHistory = safeGetFromStorage<T>(storageKey)
        setHistory(savedHistory)
    }, [storageKey])

    useEffect(() => {
        loadHistory()
    }, [loadHistory])

    const saveToHistory = useCallback((item: Omit<T, 'timestamp'>) => {
        const newItem = {
            ...item,
            timestamp: Date.now()
        } as T

        setHistory(prev => {
            const updatedHistory = [newItem, ...prev].slice(0, maxItems)
            safeSetToStorage(storageKey, updatedHistory)
            return updatedHistory
        })
    }, [storageKey, maxItems])

    const deleteHistoryItem = useCallback((index: number) => {
        setHistory(prev => {
            const updatedHistory = prev.filter((_, i) => i !== index)
            safeSetToStorage(storageKey, updatedHistory)
            return updatedHistory
        })
    }, [storageKey])

    const clearAllHistory = useCallback(() => {
        setHistory([])
        if (typeof window !== 'undefined') {
            localStorage.removeItem(storageKey)
        }
    }, [storageKey])

    const showHistory = useCallback(() => setHistoryVisible(true), [])
    const hideHistory = useCallback(() => setHistoryVisible(false), [])

    return {
        history,
        historyVisible,
        saveToHistory,
        deleteHistoryItem,
        clearAllHistory,
        showHistory,
        hideHistory,
        loadHistory
    }
}
