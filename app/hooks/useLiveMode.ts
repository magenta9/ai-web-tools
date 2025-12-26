'use client'

import { useEffect, useRef } from 'react'
import { DEBOUNCE_DELAY } from '@/constants'

export interface UseLiveModeOptions {
    delay?: number
}

/**
 * Hook for implementing live/real-time processing with debounce
 * Automatically processes input after a delay when live mode is enabled
 * 
 * @param enabled - Whether live mode is active
 * @param input - The input value to process
 * @param processor - Function to process the input
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const [liveMode, setLiveMode] = useState(false)
 * const [input, setInput] = useState('')
 * 
 * useLiveMode(liveMode, input, (value) => {
 *   // Process the input value
 *   processJson(value)
 * })
 * ```
 */
export function useLiveMode<T>(
    enabled: boolean,
    input: T,
    processor: (input: T) => void,
    options: UseLiveModeOptions = {}
): void {
    const { delay = DEBOUNCE_DELAY.LIVE_MODE } = options
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Clear timeout if live mode is disabled or input is empty
        if (!enabled || !input) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            return
        }

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set new timeout for processing
        timeoutRef.current = setTimeout(() => {
            try {
                processor(input)
            } catch (error) {
                console.error('Live mode processing error:', error)
            }
        }, delay)

        // Cleanup on unmount or dependency change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [enabled, input, processor, delay])
}
