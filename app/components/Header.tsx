'use client'

import { Sun, Moon, Search, Menu, Calendar, LogOut } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { memo, useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import CalendarWidget from './CalendarWidget'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = memo(function Header({ onMenuClick }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [dateStr, setDateStr] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDateStr(format(new Date(), 'EEE, MMM d, yyyy'))
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

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

        <div className="h-8 w-px bg-border hidden sm:block"></div>

        <div className="hidden sm:flex items-center text-sm font-medium text-text-secondary relative" ref={calendarRef}>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 hover:text-text-primary transition-colors focus:outline-none p-1 rounded-md hover:bg-surface-hover"
          >
            <Calendar size={18} />
            <span>{dateStr}</span>
          </button>
          {showCalendar && (
            <div className="absolute top-full right-0 mt-4 z-50 bg-surface border border-theme rounded-lg shadow-lg p-3">
              <CalendarWidget mode="single" selected={new Date()} />
            </div>
          )}
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
