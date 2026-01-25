'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  User,
  Clock,
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-media-query'

interface AuditLog {
  id: string
  timestamp: string
  action: string
  user: string
  userId: string
  target: string
  details: string
  severity: 'info' | 'warning' | 'success' | 'error'
  ipAddress: string
}

const mockLogs: AuditLog[] = []

export function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const isMobile = useIsMobile()

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
    
    return matchesSearch && matchesSeverity
  })

  const getSeverityIcon = (severity: AuditLog['severity']) => {
    const iconClass = "w-3 h-3 sm:w-4 sm:h-4"
    switch (severity) {
      case 'info': return <Info className={`${iconClass} text-blue-400`} />
      case 'warning': return <AlertTriangle className={`${iconClass} text-yellow-500`} />
      case 'success': return <CheckCircle2 className={`${iconClass} text-success-green`} />
      case 'error': return <XCircle className={`${iconClass} text-alert-red`} />
    }
  }

  const getSeverityBadge = (severity: AuditLog['severity']) => {
    const styles = {
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      success: 'bg-success-green/20 text-success-green border-success-green/30',
      error: 'bg-alert-red/20 text-alert-red border-alert-red/30',
    }
    return (
      <Badge className={`${styles[severity]} text-[10px] sm:text-xs px-1.5 sm:px-2`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-foreground text-sm sm:text-base truncate">Audit Logs</CardTitle>
              <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Security events</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 bg-transparent h-8 text-xs flex-shrink-0">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-border h-9 sm:h-10 text-sm"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-24 sm:w-40 bg-secondary border-border h-9 sm:h-10 text-xs sm:text-sm">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-muted-foreground flex-shrink-0" />
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto scrollbar-hide">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 sm:p-4 bg-secondary/30 rounded-lg border border-border hover:border-teal/30 transition-colors active:bg-secondary/50"
            >
              {isMobile ? (
                // Mobile Layout
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(log.severity)}
                      <span className="font-mono text-xs font-medium text-teal">{log.action}</span>
                    </div>
                    {getSeverityBadge(log.severity)}
                  </div>
                  <p className="text-xs text-foreground truncate-2">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{log.user}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">{log.timestamp.slice(11)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Desktop Layout
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-1">{getSeverityIcon(log.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium text-teal">{log.action}</span>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="text-sm text-foreground mt-1">{log.details}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{log.user}</span>
                          <span className="font-mono">({log.userId})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Target:</span>
                          <span className="font-mono text-teal">{log.target}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>IP:</span>
                          <span className="font-mono">{log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">{log.timestamp}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-sm">No logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
