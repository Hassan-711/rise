'use client'

import { useState } from 'react'
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface NavbarProps {
  onMenuClick: () => void
  title?: string
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const today = format(new Date(), 'EEEE, MMM d')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <div className="flex-1">
        {title && (
          <h1 className="text-base font-semibold text-foreground hidden sm:block">{title}</h1>
        )}
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications (UI only) */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Avatar */}
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-xs font-bold text-primary">
          H
        </div>
      </div>
    </header>
  )
}
