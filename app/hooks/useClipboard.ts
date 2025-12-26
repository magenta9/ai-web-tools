'use client'

import { useCallback } from 'react'
import { copyToClipboard, pasteFromClipboard } from '../utils/clipboard'
import { useToastContext } from '../providers/ToastProvider'
import { useI18n } from '../providers/I18nProvider'

export interface UseClipboardReturn {
    copy: (text: string) => Promise<boolean>
    paste: () => Promise<string | null>
    copyWithToast: (text: string) => Promise<boolean>
    pasteWithToast: () => Promise<string | null>
}

/**
 * Hook for clipboard operations with toast notifications
 * Provides copy and paste functionality with automatic user feedback
 * 
 * @returns Clipboard operation functions
 * 
 * @example
 * ```tsx
 * const { copy, paste } = useClipboard()
 * 
 * // Copy with automatic toast notification
 * await copy(text)
 * 
 * // Paste with automatic toast notification
 * const text = await paste()
 * if (text) {
 *   setInput(text)
 * }
 * ```
 */
export function useClipboard(): UseClipboardReturn {
    const toast = useToastContext()
    const { t } = useI18n()

    /**
     * Copy text to clipboard with toast notification
     */
    const copyWithToast = useCallback(async (text: string): Promise<boolean> => {
        if (!text) {
            toast.warning(t.validation.required)
            return false
        }

        const success = await copyToClipboard(text)
        if (success) {
            toast.success(t.toast.copySuccess)
        } else {
            toast.error(t.toast.copyFailed)
        }
        return success
    }, [toast, t])

    /**
     * Paste text from clipboard with toast notification
     */
    const pasteWithToast = useCallback(async (): Promise<string | null> => {
        const text = await pasteFromClipboard()
        if (text) {
            toast.success(t.toast.pasteSuccess)
        } else {
            toast.error(t.toast.pasteFailed)
        }
        return text
    }, [toast, t])

    /**
     * Copy text to clipboard without toast notification
     */
    const copy = useCallback(async (text: string): Promise<boolean> => {
        return await copyToClipboard(text)
    }, [])

    /**
     * Paste text from clipboard without toast notification
     */
    const paste = useCallback(async (): Promise<string | null> => {
        return await pasteFromClipboard()
    }, [])

    return {
        copy,
        paste,
        copyWithToast,
        pasteWithToast
    }
}
