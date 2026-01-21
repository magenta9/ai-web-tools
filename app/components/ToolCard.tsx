'use client'

import Link from 'next/link'
import { LucideIcon, ArrowRight } from 'lucide-react'

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
      className={`group relative flex flex-col p-6 bg-surface border border-theme rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-surface-hover group-hover:bg-primary group-hover:text-primary-text transition-colors duration-300 text-text-primary shadow-sm border border-theme/50">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <ArrowRight
          size={18}
          className="text-text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        />
      </div>

      <h3 className="font-semibold text-lg text-text-primary mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
        {description}
      </p>
    </Link>
  )
}
