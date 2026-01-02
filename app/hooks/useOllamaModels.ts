'use client'

import { useState, useEffect } from 'react'
import { API_BASE } from '@/constants'

export interface OllamaModel {
    id: string
    name: string
    provider: string
    description?: string
    context_length?: number
}

export interface UseOllamaModelsOptions {
    defaultModel?: string
    autoLoad?: boolean
}

export interface UseOllamaModelsReturn {
    models: OllamaModel[]
    selectedModel: string
    setSelectedModel: (model: string) => void
    isLoading: boolean
    error: string | null
    reload: () => Promise<void>
}

/**
 * Hook for managing Ollama models
 * Automatically loads available models and manages model selection
 * 
 * @param options - Configuration options
 * @returns Models state and control functions
 * 
 * @example
 * ```tsx
 * const { models, selectedModel, setSelectedModel } = useOllamaModels()
 * 
 * <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
 *   {models.map(model => (
 *     <option key={model.name} value={model.name}>{model.name}</option>
 *   ))}
 * </select>
 * ```
 */
export function useOllamaModels(
    options: UseOllamaModelsOptions = {}
): UseOllamaModelsReturn {
    const { defaultModel = 'claude-3-5-sonnet-20241022', autoLoad = true } = options

    const [models, setModels] = useState<OllamaModel[]>([])
    const [selectedModel, setSelectedModel] = useState(defaultModel)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadModels = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch(`${API_BASE}/models`)
            const data = await res.json()

            if (data.success && data.models) {
                setModels(data.models)

                // Auto-select first available model if current selection is not available
                if (data.models.length > 0) {
                    const currentModelAvailable = data.models.some(
                        (m: OllamaModel) => m.id === selectedModel
                    )
                    if (!currentModelAvailable) {
                        setSelectedModel(data.models[0].id)
                    }
                }
            } else {
                throw new Error(data.error || 'Failed to load models')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load models'
            setError(errorMessage)
            console.error('Failed to load Ollama models:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!autoLoad) return

        let mounted = true

        const load = async () => {
            if (mounted) {
                await loadModels()
            }
        }

        load()

        return () => {
            mounted = false
        }
    }, [autoLoad])

    return {
        models,
        selectedModel,
        setSelectedModel,
        isLoading,
        error,
        reload: loadModels
    }
}
