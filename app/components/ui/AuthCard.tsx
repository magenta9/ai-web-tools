'use client'

import React from 'react'

export interface AuthCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  subtitle,
  footer,
  children,
  className = ''
}: AuthCardProps) {
  return (
    <div className={`auth-container ${className}`}>
      <div className="auth-card">
        <div className="auth-header">
          {typeof title === 'string' ? <h1>{title}</h1> : title}
          {subtitle && (typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle)}
        </div>

        {children}

        {footer && (
          <div className="auth-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
