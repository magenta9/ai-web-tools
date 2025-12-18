'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { ToastContainer } from '../components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import type { ToastType } from '@/types'

interface ToastContextValue {
    success: (message: string, duration?: number) => string
    error: (message: string, duration?: number) => string
    info: (message: string, duration?: number) => string
    warning: (message: string, duration?: number) => string
    addToast: (type: ToastType, message: string, duration?: number) => string
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
    const { toasts, addToast, removeToast, success, error, info, warning } = useToast()

    return (
        <ToastContext.Provider value={{ success, error, info, warning, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

export function useToastContext() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider')
    }
    return context
}
