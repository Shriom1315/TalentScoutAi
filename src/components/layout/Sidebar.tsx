import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users2,
  Send,
  BarChart3,
  Sparkles,
  Compass,
  Clock,
  Radio,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface SidebarProps {
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { lastScanText, isDiscovering, openDiscoveryModal } = useApp()

  const navItems = [
    { name: 'TPO Command Center', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Openings', path: '/opportunities', icon: Briefcase },
    { name: 'Recruiter Directory', path: '/contacts', icon: Users2 },
    { name: 'Campus Outreach', path: '/outreach', icon: Send },
    { name: 'Placement Analytics', path: '/analytics', icon: BarChart3 },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Brand Logo Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-extrabold text-slate-900 text-base tracking-tight leading-tight flex items-center gap-1.5">
            <span>TalentScout</span>
            <span className="text-blue-600 font-bold">TPO</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Placement Cell Hub
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Pipeline
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Section: Discovery Status & Action */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Radio
                className={`w-3.5 h-3.5 ${
                  isDiscovering ? 'text-blue-600 animate-spin' : 'text-emerald-500'
                }`}
              />
              Discovery Status
            </span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              Live
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Last scan: {lastScanText}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile()
            openDiscoveryModal()
          }}
          disabled={isDiscovering}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isDiscovering ? 'Scanning...' : 'Run Discovery'}</span>
        </button>
      </div>
    </aside>
  )
}
