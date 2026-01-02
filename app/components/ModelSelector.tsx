'use client'

import React from 'react'
import type { OllamaModel } from '../hooks/useOllamaModels'

export interface ModelSelectorProps {
    models: OllamaModel[]
    selectedModel: string
    onModelChange: (model: string) => void
    className?: string
    disabled?: boolean
    defaultModel?: string
}

/**
 * Model selector component for Ollama models
 * Displays a dropdown to select from available AI models
 * 
 * @example
 * ```tsx
 * const { models, selectedModel, setSelectedModel } = useOllamaModels()
 * 
 * <ModelSelector
 *   models={models}
 *   selectedModel={selectedModel}
 *   onModelChange={setSelectedModel}
 * />
 * ```
 */
export function ModelSelector({
    models,
    selectedModel,
    onModelChange,
    className = 'header-model-select',
    disabled = false,
    defaultModel = 'claude-3-5-sonnet-20241022'
}: ModelSelectorProps) {
    return (
        <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className={className}
            disabled={disabled}
            aria-label="Select AI model"
        >
            {models.length === 0 && (
                <option value={defaultModel}>{defaultModel}</option>
            )}
            {models.map((model) => (
                <option key={model.id} value={model.id}>
                    {model.name}
                </option>
            ))}
        </select>
    )
}
