import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toast } from '../common/Toast'
import { DiscoveryModal } from '../common/DiscoveryModal'
import { ContactDrawer } from '../common/ContactDrawer'
import { OutreachModal } from '../common/OutreachModal'
import { PrototypeBriefModal } from '../common/PrototypeBriefModal'

export const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      <div className="flex flex-1 min-h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-64 h-full bg-white animate-in slide-in-from-left duration-200">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Interactive Modals & Drawers */}
      <Toast />
      <DiscoveryModal />
      <ContactDrawer />
      <OutreachModal />
      <PrototypeBriefModal />
    </div>
  )
}
