'use client'

import { useState, useCallback } from 'react'

interface ConfirmState {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant: 'danger' | 'warning' | 'info'
}

const initialState: ConfirmState = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning',
}

export function useConfirm() {
    const [state, setState] = useState<ConfirmState>(initialState)

    const confirm = useCallback(
        (options: {
            title: string
            message: string
            variant?: 'danger' | 'warning' | 'info'
        }): Promise<boolean> => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    title: options.title,
                    message: options.message,
                    variant: options.variant ?? 'warning',
                    onConfirm: () => {
                        setState(initialState)
                        resolve(true)
                    },
                })
            })
        },
        []
    )

    const handleCancel = useCallback(() => {
        setState(initialState)
    }, [])

    return {
        ...state,
        confirm,
        onCancel: handleCancel,
    }
}
