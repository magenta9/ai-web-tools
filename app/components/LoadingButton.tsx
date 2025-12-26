'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading: boolean
    icon?: React.ReactNode
    loadingIcon?: React.ReactNode
    loadingText?: string
    children: React.ReactNode
}

/**
 * Button component with loading state
 * Automatically shows loading spinner and optional loading text
 * 
 * @example
 * ```tsx
 * <LoadingButton
 *   isLoading={isGenerating}
 *   icon={<Wand2 size={14} />}
 *   loadingText="生成中..."
 *   className="action-btn generate-btn"
 *   onClick={handleGenerate}
 * >
 *   生成 SQL
 * </LoadingButton>
 * ```
 */
export function LoadingButton({
    isLoading,
    icon,
    loadingIcon = <Loader2 size={14} className="spin" />,
    loadingText,
    children,
    disabled,
    className = '',
    ...props
}: LoadingButtonProps) {
    return (
        <button
            {...props}
            className={className}
            disabled={disabled || isLoading}
        >
            {isLoading ? loadingIcon : icon}
            <span>{isLoading && loadingText ? loadingText : children}</span>
        </button>
    )
}
