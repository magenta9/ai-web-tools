'use client'

import React from 'react'

export interface PanelProps {
    title: React.ReactNode
    icon?: React.ReactNode
    actions?: React.ReactNode
    footer?: React.ReactNode
    children: React.ReactNode
    className?: string
    titleClassName?: string
    contentClassName?: string
    headerClassName?: string
    footerClassName?: string
}

/**
 * Reusable panel component with header, content, and footer sections
 * Provides consistent styling and structure across tool pages
 * 
 * @example
 * ```tsx
 * <Panel
 *   title="Input"
 *   icon={<ArrowRight size={14} />}
 *   titleClassName="input"
 *   actions={
 *     <>
 *       <button className="panel-btn">Copy</button>
 *       <button className="panel-btn">Paste</button>
 *     </>
 *   }
 *   footer={<span>0 bytes</span>}
 * >
 *   <textarea className="code-textarea" />
 * </Panel>
 * ```
 */
export function Panel({
    title,
    icon,
    actions,
    footer,
    children,
    className = '',
    titleClassName = '',
    contentClassName = '',
    headerClassName = '',
    footerClassName = ''
}: PanelProps) {
    return (
        <div className={`panel ${className}`.trim()}>
            <div className={`panel-header ${headerClassName}`.trim()}>
                <div className={`panel-title ${titleClassName}`.trim()}>
                    {icon}
                    {typeof title === 'string' ? <span>{title}</span> : title}
                </div>
                {actions && (
                    <div className="panel-actions">
                        {actions}
                    </div>
                )}
            </div>
            <div className={`panel-content ${contentClassName}`.trim()}>
                {children}
            </div>
            {footer && (
                <div className={`panel-footer ${footerClassName}`.trim()}>
                    {footer}
                </div>
            )}
        </div>
    )
}
