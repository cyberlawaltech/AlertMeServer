'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Landmark,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-media-query'

interface LoanRequest {
  id: string
  loanId: string
  userName: string
  userId: string
  requestedAmount: number
  purpose: string
  riskScore: 'low' | 'medium' | 'high'
  businessLogic: string
  timestamp: string
  creditScore: number
  monthlyIncome: number
}

const mockLoanRequests: LoanRequest[] = []

export function LoanQueue() {
  const [requests, setRequests] = useState(mockLoanRequests)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const isMobile = useIsMobile()

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleGrant = async (id: string) => {
    setProcessingIds(prev => new Set([...prev, id]))
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setRequests(prev => prev.filter(r => r.id !== id))
    setProcessingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleDeny = async (id: string) => {
    setProcessingIds(prev => new Set([...prev, id]))
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setRequests(prev => prev.filter(r => r.id !== id))
    setProcessingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const getRiskBadge = (risk: LoanRequest['riskScore']) => {
    const baseClass = "text-[10px] sm:text-xs px-1.5 sm:px-2"
    switch (risk) {
      case 'low':
        return (
          <Badge className={`bg-success-green/20 text-success-green border-success-green/30 ${baseClass}`}>
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            Low
          </Badge>
        )
      case 'medium':
        return (
          <Badge className={`bg-yellow-500/20 text-yellow-500 border-yellow-500/30 ${baseClass}`}>
            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            Med
          </Badge>
        )
      case 'high':
        return (
          <Badge className={`bg-alert-red/20 text-alert-red border-alert-red/30 ${baseClass}`}>
            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            High
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
            <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">Loan Queue</h2>
            <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Review applications</p>
          </div>
        </div>
        <Badge variant="outline" className="border-teal text-teal text-[10px] sm:text-xs flex-shrink-0">
          {requests.length} Pending
        </Badge>
      </div>

      {/* Loan Cards */}
      <AnimatePresence mode="popLayout">
        {requests.map((request, index) => {
          const isProcessing = processingIds.has(request.id)
          const isExpanded = expandedIds.has(request.id)
          
          return (
            <motion.div
              key={request.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-card border-border transition-all ${isProcessing ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm sm:text-base text-foreground truncate">{request.userName}</CardTitle>
                        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                          <span className="font-mono">{request.loanId}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="font-mono hidden sm:inline">{request.userId}</span>
                        </div>
                      </div>
                    </div>
                    {getRiskBadge(request.riskScore)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                  {/* Amount and Purpose */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-secondary/50 rounded-lg">
                      <span className="text-[10px] sm:text-xs text-muted-foreground block">Amount</span>
                      <span className="text-base sm:text-xl font-bold text-teal font-mono">
                        ₦{request.requestedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 sm:p-3 bg-secondary/50 rounded-lg">
                      <span className="text-[10px] sm:text-xs text-muted-foreground block">Purpose</span>
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate block">{request.purpose}</span>
                    </div>
                  </div>

                  {/* Credit Info - Collapsible on mobile */}
                  {isMobile ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(request.id)}
                      className="w-full flex items-center justify-between p-2 bg-secondary/30 rounded-lg text-xs"
                    >
                      <span className="text-muted-foreground">View details</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  ) : null}

                  <AnimatePresence>
                    {(!isMobile || isExpanded) && (
                      <motion.div
                        initial={isMobile ? { height: 0, opacity: 0 } : false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={isMobile ? { height: 0, opacity: 0 } : undefined}
                        className="overflow-hidden space-y-3"
                      >
                        {/* Credit Info */}
                        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap">
                          <div>
                            <span className="text-muted-foreground">Credit: </span>
                            <span className={`font-mono font-medium ${
                              request.creditScore >= 700 ? 'text-success-green' :
                              request.creditScore >= 600 ? 'text-yellow-500' : 'text-alert-red'
                            }`}>
                              {request.creditScore}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Income: </span>
                            <span className="font-mono text-foreground">
                              ₦{request.monthlyIncome.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Business Logic */}
                        <div className="p-2 sm:p-3 bg-secondary/30 rounded-lg border border-border">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-teal" />
                            <span className="text-[10px] sm:text-xs font-medium text-teal uppercase tracking-wider">Business Logic</span>
                          </div>
                          <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
                            {request.businessLogic}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 sm:pt-2 border-t border-border gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{request.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleDeny(request.id)}
                        disabled={isProcessing}
                        variant="outline"
                        size="sm"
                        className="border-alert-red/30 text-alert-red hover:bg-alert-red hover:text-white h-8 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Deny</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleGrant(request.id)}
                        disabled={isProcessing}
                        size="sm"
                        className="bg-teal hover:bg-teal/90 text-primary-foreground h-8 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Grant</span>
                            <span className="sm:hidden">OK</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {requests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 sm:py-12"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-success-green/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-success-green" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">All Caught Up</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">No pending loan requests</p>
        </motion.div>
      )}
    </div>
  )
}
