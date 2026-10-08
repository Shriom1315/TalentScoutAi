import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  X,
  Target,
  RotateCcw,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const {
    opportunities,
    contacts,
    systemActivities,
    openContactDrawer,
    openDiscoveryModal,
    isDiscovering,
    clearAllData,
    runDiscovery,
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter search results
  const filteredJobs = searchQuery.trim()
    ? opportunities
        .filter(
          (j) =>
            j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            j.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 4)
    : []

  const filteredContacts = searchQuery.trim()
    ? contacts
        .filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.role.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : []

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand / Logo (visible on mobile if sidebar hidden) */}
        <Link to="/dashboard" className="flex items-center gap-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            TS
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">TalentScout AI</span>
        </Link>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search companies, tech (React, Node), or roles..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick search dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2 space-y-1">
                {filteredJobs.length === 0 && filteredContacts.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching roles or contacts found for "{searchQuery}".
                  </div>
                )}

                {filteredJobs.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Opportunities
                    </div>
                    {filteredJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          setIsSearchFocused(false)
                          setSearchQuery('')
                          navigate(`/opportunities/${job.id}`)
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors group"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {job.role}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {job.company} • {job.location}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {job.matchScore}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredContacts.length > 0 && (
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                      Hiring Contacts
                    </div>
                    {filteredContacts.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setIsSearchFocused(false)
                          setSearchQuery('')
                          openContactDrawer(c)
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {c.role} • {c.company}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {c.emailStatus}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-3">
        {/* Reset / Start fresh button */}
        <button
          onClick={clearAllData}
          title="Clear all saved data and start from scratch"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Pipeline</span>
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-900">Pipeline Activity</span>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">
                  All updates
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {systemActivities.map((act) => (
                  <div key={act.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                    <div className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Candidate Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            SO
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">Shriom</div>
            <div className="text-[10px] text-slate-500 font-medium">MCA Fresher • Full Stack</div>
          </div>
        </div>
      </div>
    </header>
  )
}
