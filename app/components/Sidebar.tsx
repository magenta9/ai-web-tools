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
  Home,
  Cloud,
  FileText,
  Settings,
  Users,
  CreditCard,
  PieChart
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const regularTools = [
  { href: '/wordcloud', label: 'Word Cloud', Icon: Cloud },
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
  const { user } = useAuth()

  const NavItem = ({ href, label, Icon, isActive }: { href: string; label: string; Icon: any, isActive?: boolean }) => {
    const active = isActive || pathname === href
    return (
      <Link
        href={href}
        onClick={onCloseMobile}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
          ${active
            ? 'bg-primary/10 text-primary'
            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
          }
        `}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <aside className="h-full flex flex-col bg-surface border-r border-theme">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-theme/50">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <span className="text-xl font-bold text-text-primary">DevDash</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <NavItem href="/" label="Overview" Icon={Home} />
        <NavItem href="#" label="Projects" Icon={LayoutDashboard} />
        <NavItem href="#" label="Team" Icon={Users} />
        <NavItem href="#" label="Finance" Icon={CreditCard} />
        <NavItem href="#" label="Reports" Icon={PieChart} />

        <div className="pt-6 pb-2">
          <p className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            Regular Tools
          </p>
        </div>
        {regularTools.map((tool) => (
          <NavItem key={tool.href} {...tool} />
        ))}

        <div className="pt-6 pb-2">
          <p className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            AI Powered
          </p>
        </div>
        {aiTools.map((tool) => (
          <NavItem key={tool.href} {...tool} />
        ))}

        <div className="pt-6 pb-2">
          <p className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            System
          </p>
        </div>
        <NavItem href="#" label="Documents" Icon={FileText} />
        <NavItem href="#" label="Settings" Icon={Settings} />
      </nav>

      {/* User Profile Snippet */}
      <div className="p-4 border-t border-theme/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.username ? user.username[0].toUpperCase() : 'G'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user ? user.username : 'Guest User'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {user ? `${user.username.toLowerCase()}@devdash.com` : 'Sign in to access features'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
