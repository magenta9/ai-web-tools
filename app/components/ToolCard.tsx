'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface ToolCardProps {
  href: string
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

export default function ToolCard({ href, title, description, icon: Icon, className = '' }: ToolCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col p-6 bg-surface border border-theme rounded-lg hover:border-theme-hover hover:shadow-sm transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-md bg-surface-hover group-hover:bg-primary group-hover:text-primary-text transition-colors duration-200 text-text-primary">
          <Icon size={20} />
        </div>
        <h3 className="font-semibold text-lg text-text-primary group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
    </Link>
  )
}
