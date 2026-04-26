'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

interface AppShellProps {
  children: React.ReactNode
  title?: string
}

export function AppShell({ children, title }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <Sidebar isMobile isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter p-4 lg:p-6 space-y-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
