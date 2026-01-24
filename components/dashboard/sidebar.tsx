'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MapPin,
  Terminal,
  Landmark,
  Settings,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: MapPin, label: 'Client Map', id: 'client-map' },
  { icon: Terminal, label: 'Live Terminals', id: 'terminals' },
  { icon: Landmark, label: 'Loan Desk', id: 'loan-desk' },
  { icon: Settings, label: 'Gateway Settings', id: 'gateway' },
  { icon: FileText, label: 'Audit Logs', id: 'audit-logs' },
]

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  isTablet?: boolean
}

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapsedChange, isTablet }: SidebarProps) {
  const sidebarWidth = collapsed ? 72 : (isTablet ? 200 : 240)

  return (
    <motion.aside
      initial={{ width: sidebarWidth }}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-14 md:h-16 flex items-center px-3 md:px-4 border-b border-sidebar-border">
        <Shield className="w-7 h-7 md:w-8 md:h-8 text-teal flex-shrink-0" />
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ml-2 md:ml-3 overflow-hidden"
          >
            <span className="font-semibold text-foreground text-xs md:text-sm whitespace-nowrap">Ecobank Express</span>
            <span className="block text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">Admin Panel</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 md:py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-2 md:gap-3 px-2.5 md:px-3 py-2.5 md:py-2.5 rounded-lg transition-all duration-200 touch-target',
                isActive
                  ? 'bg-sidebar-accent text-teal'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-teal')} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs md:text-sm font-medium truncate"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-teal animate-pulse-glow flex-shrink-0"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors touch-target"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  )
}
