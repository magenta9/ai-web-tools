'use client'

import React from 'react'
import { Copy, Clipboard, RefreshCcw, Trash2 } from 'lucide-react'

export interface ActionButtonsProps {
    onCopy?: () => void
    onPaste?: () => void
    onClear?: () => void
    onSwap?: () => void
    copyDisabled?: boolean
    pasteDisabled?: boolean
    clearDisabled?: boolean
    swapDisabled?: boolean
    copyLabel?: string
    pasteLabel?: string
    clearLabel?: string
    swapLabel?: string
    className?: string
}

/**
 * Reusable action buttons component
 * Provides common actions like copy, paste, clear, and swap
 * 
 * @example
 * ```tsx
 * <ActionButtons
 *   onCopy={handleCopy}
 *   onPaste={handlePaste}
 *   onClear={handleClear}
 *   copyDisabled={!output}
 * />
 * ```
 */
export function ActionButtons({
    onCopy,
    onPaste,
    onClear,
    onSwap,
    copyDisabled = false,
    pasteDisabled = false,
    clearDisabled = false,
    swapDisabled = false,
    copyLabel = '复制',
    pasteLabel = '粘贴',
    clearLabel = '清空',
    swapLabel = '交换',
    className = 'action-buttons'
}: ActionButtonsProps) {
    return (
        <div className={className}>
            {onPaste && (
                <button
                    className="panel-btn"
                    onClick={onPaste}
                    disabled={pasteDisabled}
                    title={pasteLabel}
                >
                    <Clipboard size={14} /> {pasteLabel}
                </button>
            )}
            {onCopy && (
                <button
                    className="panel-btn"
                    onClick={onCopy}
                    disabled={copyDisabled}
                    title={copyLabel}
                >
                    <Copy size={14} /> {copyLabel}
                </button>
            )}
            {onSwap && (
                <button
                    className="panel-btn"
                    onClick={onSwap}
                    disabled={swapDisabled}
                    title={swapLabel}
                >
                    <RefreshCcw size={14} /> {swapLabel}
                </button>
            )}
            {onClear && (
                <button
                    className="panel-btn"
                    onClick={onClear}
                    disabled={clearDisabled}
                    title={clearLabel}
                >
                    <Trash2 size={14} /> {clearLabel}
                </button>
            )}
        </div>
    )
}
