'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MapPin,
  Terminal,
  Landmark,
  Settings,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Home', id: 'dashboard' },
  { icon: MapPin, label: 'Map', id: 'client-map' },
  { icon: Terminal, label: 'Terminals', id: 'terminals' },
  { icon: Landmark, label: 'Loans', id: 'loan-desk' },
  { icon: Settings, label: 'Gateway', id: 'gateway' },
  { icon: FileText, label: 'Logs', id: 'audit-logs' },
]

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="mobile-nav flex items-center justify-around px-2 safe-area-inset-bottom">
      {navItems.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 touch-target relative',
              isActive
                ? 'text-teal'
                : 'text-muted-foreground active:text-foreground'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="mobileActiveTab"
                className="absolute inset-0 bg-teal/10 rounded-xl"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <item.icon className={cn('w-5 h-5 relative z-10', isActive && 'text-teal')} />
            <span className="text-[10px] font-medium relative z-10">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="mobileActiveDot"
                className="absolute -top-1 w-1 h-1 rounded-full bg-teal animate-pulse-glow"
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
