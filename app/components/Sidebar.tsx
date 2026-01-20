'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Code,
  Image,
  GitCompare,
  Clock,
  Key,
  Database,
  FileJson,
  Sparkles,
  Languages,
  BookText,
  MessageSquare,
  Wrench,
  LayoutDashboard,
  X
} from 'lucide-react'

const regularTools = [
  { href: '/json', label: 'JSON Tool', Icon: Code },
  { href: '/image', label: 'Image Converter', Icon: Image },
  { href: '/diff', label: 'JSON Diff', Icon: GitCompare },
  { href: '/timestamp', label: 'Timestamp Converter', Icon: Clock },
  { href: '/jwt', label: 'JWT Tool', Icon: Key },
]

const aiTools = [
  { href: '/jsonfix', label: 'AI JSON Fix', Icon: FileJson },
  { href: '/aisql', label: 'AI SQL', Icon: Database },
  { href: '/translate', label: 'AI Translate', Icon: Languages },
  { href: '/prompt', label: 'Prompt Manager', Icon: BookText },
  { href: '/chat', label: 'AI Chat', Icon: MessageSquare },
]

interface SidebarProps {
  onCloseMobile?: () => void
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname()

  const NavItem = ({ href, label, Icon }: { href: string; label: string; Icon: any }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={onCloseMobile}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-primary-text'
            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    )
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-theme bg-surface">
      {/* Brand */}
      <div className="flex h-14 items-center justify-between border-b border-theme px-6">
        <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-text">
                <Code size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">Web Tools</span>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1 text-text-secondary hover:text-text-primary"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                <NavItem href="/" label="Dashboard" Icon={LayoutDashboard} />
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Regular Tools
                </h4>
                <div className="flex flex-col gap-1">
                {regularTools.map((tool) => (
                    <NavItem key={tool.href} {...tool} />
                ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                AI Powered
                </h4>
                <div className="flex flex-col gap-1">
                {aiTools.map((tool) => (
                    <NavItem key={tool.href} {...tool} />
                ))}
                </div>
            </div>
        </nav>
      </div>

      {/* Footer / Meta */}
      <div className="border-t border-theme p-4 text-xs text-text-muted text-center">
        © 2024 Web Tools
      </div>
    </aside>
  )
}
