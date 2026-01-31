'use client'

import { Sun, Moon, Search, Menu, Calendar, LogOut } from 'lucide-react'
import { useTheme } from '../providers/ThemeProvider'
import { useAuth } from '../context/AuthContext'
import { memo, useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import CalendarWidget from './CalendarWidget'
import { useRouter } from 'next/navigation'
import { allTools } from '@/constants/tools'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = memo(function Header({ onMenuClick }: HeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [dateStr, setDateStr] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Search state
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  const filteredTools = searchTerm.trim()
    ? allTools.filter(tool =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  useEffect(() => {
    setDateStr(format(new Date(), 'EEE, MMM d, yyyy'))
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setShowResults(true)
    setSelectedIndex(-1)
  }

  const handleToolSelect = (href: string) => {
    router.push(href)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || filteredTools.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < filteredTools.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < filteredTools.length) {
        handleToolSelect(filteredTools[selectedIndex].href)
      } else if (filteredTools.length > 0) {
          // If no item explicitly selected, select the first one on Enter
          handleToolSelect(filteredTools[0].href)
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

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
        <div
            className="relative hidden md:block w-64"
            ref={searchRef}
        >
            <div className="flex items-center text-text-muted bg-background px-3 py-2 rounded-lg border border-theme focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search size={18} />
            <input
                type="text"
                placeholder="Search tools..."
                className="ml-2 bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-muted focus:ring-0"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                onKeyDown={handleKeyDown}
            />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-theme rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto z-50">
                    {filteredTools.length > 0 ? (
                        filteredTools.map((tool, index) => (
                            <button
                                key={tool.href}
                                onClick={() => handleToolSelect(tool.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors
                                    ${index === selectedIndex ? 'bg-primary/10 text-primary' : 'text-text-secondary'}
                                `}
                            >
                                <tool.icon size={18} className={index === selectedIndex ? 'text-primary' : 'text-text-muted'} />
                                <div>
                                    <div className={`text-sm font-medium ${index === selectedIndex ? 'text-primary' : 'text-text-primary'}`}>
                                        {tool.title}
                                    </div>
                                    {tool.description && (
                                        <div className="text-xs text-text-muted truncate max-w-[200px]">
                                            {tool.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-text-muted text-center">
                            No tools found
                        </div>
                    )}
                </div>
            )}
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
