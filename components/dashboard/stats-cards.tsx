'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  CreditCard,
  Landmark,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface StatCard {
  id: string
  title: string
  shortTitle: string
  value: number
  format: 'number' | 'currency' | 'percentage'
  icon: React.ElementType
  trend: 'up' | 'down'
  trendValue: string
  color: string
}

const initialStats: StatCard[] = [
  {
    id: 'active-users',
    title: 'Active Users',
    shortTitle: 'Users',
    value: 45678,
    format: 'number',
    icon: Users,
    trend: 'up',
    trendValue: '+12.5%',
    color: 'teal',
  },
  {
    id: 'total-transactions',
    title: 'Total Transactions',
    shortTitle: 'Transactions',
    value: 2847562,
    format: 'currency',
    icon: CreditCard,
    trend: 'up',
    trendValue: '+8.3%',
    color: 'teal',
  },
  {
    id: 'pending-loans',
    title: 'Pending Loans',
    shortTitle: 'Loans',
    value: 127,
    format: 'number',
    icon: Landmark,
    trend: 'down',
    trendValue: '-3.2%',
    color: 'teal',
  },
  {
    id: 'security-score',
    title: 'Security Score',
    shortTitle: 'Security',
    value: 98.7,
    format: 'percentage',
    icon: ShieldCheck,
    trend: 'up',
    trendValue: '+0.5%',
    color: 'teal',
  },
]

export function StatsCards() {
  const [stats, setStats] = useState(initialStats)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev.map(stat => ({
        ...stat,
        value: stat.format === 'percentage'
          ? Math.min(100, Math.max(95, stat.value + (Math.random() - 0.5) * 0.2))
          : stat.value + Math.floor((Math.random() - 0.3) * (stat.format === 'currency' ? 10000 : 10)),
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatValue = (stat: StatCard) => {
    switch (stat.format) {
      case 'currency':
        return `₦${stat.value.toLocaleString()}`
      case 'percentage':
        return `${stat.value.toFixed(1)}%`
      default:
        return stat.value.toLocaleString()
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-card border-border hover:border-teal/30 transition-colors">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Show short title on mobile, full title on larger screens */}
                  <span className="text-[11px] sm:text-xs md:text-sm text-muted-foreground block sm:hidden truncate">{stat.shortTitle}</span>
                  <span className="text-xs md:text-sm text-muted-foreground hidden sm:block truncate">{stat.title}</span>
                  <motion.p
                    key={stat.value}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-0.5 md:mt-1 font-mono truncate"
                  >
                    {formatValue(stat)}
                  </motion.p>
                  <div className={`flex items-center gap-1 mt-1 md:mt-2 text-[10px] sm:text-xs md:text-sm ${
                    stat.trend === 'up' ? 'text-success-green' : 'text-alert-red'
                  }`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{stat.trendValue}</span>
                    <span className="text-muted-foreground ml-0.5 md:ml-1 hidden sm:inline">vs last week</span>
                  </div>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-teal" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
