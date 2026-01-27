'use client'

import { Sun, Moon, Search, Menu, Bell, Calendar, LogOut } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { memo, useState, useEffect } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = memo(function Header({ onMenuClick }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    const now = new Date()
    setDateStr(now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
  }, [])

  return (
    <header className="h-16 bg-surface border-b border-theme flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-text-secondary hover:bg-surface-hover rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center text-text-muted bg-background px-3 py-2 rounded-lg w-64 border border-theme focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            className="ml-2 bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-muted focus:ring-0"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:bg-surface-hover rounded-full transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="p-2 text-text-secondary hover:bg-surface-hover rounded-full relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
        </button>

        <div className="h-8 w-px bg-border hidden sm:block"></div>

        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Calendar size={18} />
          <span>{dateStr}</span>
        </div>

        {user && (
            <>
                <div className="h-8 w-px bg-border hidden sm:block"></div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-red-500 transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </>
        )}
      </div>
    </header>
  )
})

export default Header
