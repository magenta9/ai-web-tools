'use client'

import { Sun, Moon, Search, Menu } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { memo } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = memo(function Header({ onMenuClick }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 w-full border-b border-theme bg-surface/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left: Mobile Menu + Search */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <button
            className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search tools..."
              className="h-9 w-full rounded-md border border-theme bg-surface-hover px-9 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn btn-ghost h-9 w-9 px-0"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <button
              onClick={logout}
              className="btn btn-ghost text-sm h-9"
            >
              Logout
            </button>
          ) : (
             null
          )}
        </div>
      </div>
    </header>
  )
})

export default Header
