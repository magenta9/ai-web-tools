'use client'

import React, { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = '', wrapperClassName = '', id, ...props }, ref) => {
    return (
      <div className={`form-group ${wrapperClassName}`}>
        {label && (
          <label className="form-label" htmlFor={id}>
            {label}
          </label>
        )}
        <div className="form-input-wrapper">
          {icon && (
            <div className="form-input-icon">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`form-input ${className}`}
            {...props}
          />
        </div>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
    )
  }
)

Input.displayName = 'Input'
