'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useIsMobile } from '@/hooks/use-media-query'

interface TrafficData {
  time: string
  transactions: number
  activeUsers: number
  apiCalls: number
}

const generateInitialData = (): TrafficData[] => {
  const data: TrafficData[] = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60000)
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      transactions: Math.floor(Math.random() * 500) + 200,
      activeUsers: Math.floor(Math.random() * 300) + 100,
      apiCalls: Math.floor(Math.random() * 1000) + 500,
    })
  }
  
  return data
}

export function LiveTrafficChart() {
  const [data, setData] = useState<TrafficData[]>([])
  const [trend, setTrend] = useState<'up' | 'down'>('up')
  const isMobile = useIsMobile()

  useEffect(() => {
    setData(generateInitialData())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const now = new Date()
        const newPoint: TrafficData = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          transactions: Math.floor(Math.random() * 500) + 200,
          activeUsers: Math.floor(Math.random() * 300) + 100,
          apiCalls: Math.floor(Math.random() * 1000) + 500,
        }
        
        const newData = [...prevData.slice(1), newPoint]
        
        // Calculate trend
        const lastFive = newData.slice(-5)
        const avg = lastFive.reduce((sum, d) => sum + d.transactions, 0) / 5
        const prevAvg = newData.slice(-10, -5).reduce((sum, d) => sum + d.transactions, 0) / 5
        setTrend(avg >= prevAvg ? 'up' : 'down')
        
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const totalTransactions = data.reduce((sum, d) => sum + d.transactions, 0)
  const avgUsers = Math.round(data.reduce((sum, d) => sum + d.activeUsers, 0) / (data.length || 1))

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-foreground text-sm sm:text-base truncate">Live Traffic</CardTitle>
              <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Real-time metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Badge variant="outline" className={`text-[10px] sm:text-xs ${trend === 'up' ? 'border-success-green text-success-green' : 'border-alert-red text-alert-red'}`}>
              {trend === 'up' ? (
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              )}
              {trend === 'up' ? '+12%' : '-8%'}
            </Badge>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success-green animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-secondary/50 rounded-lg">
            <span className="text-[10px] sm:text-xs text-muted-foreground block truncate">Transactions</span>
            <span className="text-sm sm:text-xl font-bold text-foreground font-mono">
              {isMobile ? `${(totalTransactions / 1000).toFixed(1)}k` : totalTransactions.toLocaleString()}
            </span>
          </div>
          <div className="p-2 sm:p-3 bg-secondary/50 rounded-lg">
            <span className="text-[10px] sm:text-xs text-muted-foreground block truncate">Avg Users</span>
            <span className="text-sm sm:text-xl font-bold text-teal font-mono">
              {avgUsers.toLocaleString()}
            </span>
          </div>
          <div className="p-2 sm:p-3 bg-secondary/50 rounded-lg">
            <span className="text-[10px] sm:text-xs text-muted-foreground block truncate">Uptime</span>
            <span className="text-sm sm:text-xl font-bold text-success-green font-mono">99.9%</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-40 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: isMobile ? -20 : 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A99D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00A99D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30D158" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#30D158" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#888888', fontSize: isMobile ? 9 : 11 }}
                tickLine={{ stroke: '#222222' }}
                axisLine={{ stroke: '#222222' }}
                interval={isMobile ? 5 : 3}
              />
              <YAxis
                tick={{ fill: '#888888', fontSize: isMobile ? 9 : 11 }}
                tickLine={{ stroke: '#222222' }}
                axisLine={{ stroke: '#222222' }}
                width={isMobile ? 30 : 40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  fontSize: isMobile ? 11 : 12,
                }}
                labelStyle={{ color: '#E5E5E5', fontWeight: 'bold' }}
                itemStyle={{ color: '#888888' }}
              />
              <Area
                type="monotone"
                dataKey="transactions"
                name="Transactions"
                stroke="#00A99D"
                strokeWidth={isMobile ? 1.5 : 2}
                fillOpacity={1}
                fill="url(#colorTransactions)"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke="#30D158"
                strokeWidth={isMobile ? 1.5 : 2}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-teal" />
            <span className="text-[10px] sm:text-sm text-muted-foreground">Transactions</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success-green" />
            <span className="text-[10px] sm:text-sm text-muted-foreground">Active Users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
