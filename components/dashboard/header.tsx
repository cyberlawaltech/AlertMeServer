'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Shield,
  AlertTriangle,
  Bell,
  Search,
  User,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  sidebarWidth: number
  isMobile: boolean
  isTablet?: boolean
}

export function Header({ sidebarWidth, isMobile, isTablet }: HeaderProps) {
  const [activeNodes, setActiveNodes] = useState(2847)
  const [systemHealth, setSystemHealth] = useState(98.7)
  const [alerts, setAlerts] = useState(3)
  const [time, setTime] = useState<Date | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Simulate real-time data updates
  useEffect(() => {
    // Mark as hydrated and initialize time on client side only
    setHydrated(true)
    setTime(new Date())
    
    const interval = setInterval(() => {
      setActiveNodes(prev => prev + Math.floor(Math.random() * 10) - 5)
      setSystemHealth(prev => Math.min(100, Math.max(90, prev + (Math.random() - 0.5) * 0.5)))
      setTime(new Date())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className="fixed top-0 right-0 h-14 md:h-16 bg-card/80 backdrop-blur-xl border-b border-border z-40 flex items-center justify-between px-3 sm:px-4 md:px-6 transition-all duration-300"
      style={{ left: sidebarWidth }}
    >
      {/* Left Section - Responsive */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
        {/* Active Nodes Counter */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="relative">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-teal" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-success-green rounded-full animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider hidden sm:block">Active Nodes</span>
            <motion.p
              key={activeNodes}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm md:text-lg font-mono font-bold text-success-green animate-text-glow"
            >
              {activeNodes.toLocaleString()}
            </motion.p>
          </div>
        </div>

        {/* System Health - Hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-border flex-shrink-0">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-teal" />
          <div className="min-w-0">
            <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider hidden md:block">System Health</span>
            <p className="text-sm md:text-lg font-mono font-bold text-foreground">
              {systemHealth.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Global Alerts - Hidden on mobile, visible on tablet+ */}
        {!isMobile && (
          <div className="hidden md:flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-border flex-shrink-0">
            <div className="relative">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-alert-red" />
              {alerts > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-alert-red rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white"
                >
                  {alerts}
                </motion.span>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider hidden lg:block">Global Alerts</span>
              <p className="text-sm md:text-lg font-mono font-bold text-alert-red">
                {alerts} Active
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {/* Search - Full on desktop, icon on mobile */}
        {isMobile || isTablet ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 md:h-10 md:w-10"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            
            {/* Mobile Search Modal */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/95 z-50 flex items-start justify-center pt-20 px-4"
                  onClick={() => setSearchOpen(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: -20 }}
                    className="w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        autoFocus
                        placeholder="Search clients, devices..."
                        className="w-full h-14 pl-12 pr-12 bg-secondary border-border text-lg rounded-xl"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setSearchOpen(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients, devices..."
              className="w-48 xl:w-64 pl-9 bg-secondary border-border"
            />
          </div>
        )}

        {/* Time - Hidden on small mobile */}
        {hydrated && (
          <div className="text-right px-2 sm:px-3 md:px-4 border-l border-border hidden sm:block">
            <span className="text-[10px] md:text-xs text-muted-foreground block">UTC</span>
            <span className="font-mono text-xs md:text-sm text-foreground">
              {time ? time.toUTCString().slice(17, 25) : '--:--:--'}
            </span>
          </div>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <AnimatePresence>
                {alerts > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-alert-red rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white"
                  >
                    {alerts}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80">
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-alert-red text-sm">Suspicious Activity Detected</span>
              <span className="text-xs text-muted-foreground">Device ECO-7842 - Lagos Region</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-alert-red text-sm">Gateway Latency Warning</span>
              <span className="text-xs text-muted-foreground">MessageBird API - 450ms response</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-alert-red text-sm">Failed Authentication</span>
              <span className="text-xs text-muted-foreground">3 failed attempts - Abuja Terminal</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-teal/10 h-9 w-9 md:h-10 md:w-10">
              <User className="w-4 h-4 md:w-5 md:h-5 text-teal" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-alert-red">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
