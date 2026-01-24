'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Zap,
  Check,
  RefreshCw,
  Settings2,
} from 'lucide-react'

interface GatewayProvider {
  id: string
  name: string
  icon: string
  enabled: boolean
  status: 'connected' | 'disconnected' | 'error'
  latency: number
  messagesDelivered: number
}

const initialProviders: GatewayProvider[] = [
  {
    id: 'twilio',
    name: 'Twilio',
    icon: '📱',
    enabled: true,
    status: 'connected',
    latency: 124,
    messagesDelivered: 45678,
  },
  {
    id: 'messagebird',
    name: 'MessageBird',
    icon: '🐦',
    enabled: false,
    status: 'disconnected',
    latency: 0,
    messagesDelivered: 23456,
  },
  {
    id: 'infobip',
    name: 'Infobip',
    icon: '💬',
    enabled: true,
    status: 'connected',
    latency: 89,
    messagesDelivered: 67890,
  },
]

export function SMSGateway() {
  const [providers, setProviders] = useState(initialProviders)
  const [deploying, setDeploying] = useState(false)
  const [deployProgress, setDeployProgress] = useState(0)
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')

  const handleToggle = (providerId: string) => {
    setProviders(providers.map(p =>
      p.id === providerId
        ? {
            ...p,
            enabled: !p.enabled,
            status: !p.enabled ? 'connected' : 'disconnected',
            latency: !p.enabled ? Math.floor(Math.random() * 150) + 50 : 0,
          }
        : p
    ))
  }

  const handleDeploy = async () => {
    setDeploying(true)
    setDeployStatus('deploying')
    setDeployProgress(0)

    // Simulate deployment progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setDeployProgress(i)
    }

    setDeploying(false)
    setDeployStatus('success')

    setTimeout(() => {
      setDeployStatus('idle')
      setDeployProgress(0)
    }, 3000)
  }

  const getStatusColor = (status: GatewayProvider['status']) => {
    switch (status) {
      case 'connected': return 'bg-success-green'
      case 'disconnected': return 'bg-muted-foreground'
      case 'error': return 'bg-alert-red'
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-foreground text-sm sm:text-base truncate">SMS Gateway</CardTitle>
              <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Configure providers</p>
            </div>
          </div>
          <Badge variant="outline" className="border-teal text-teal text-[10px] sm:text-xs flex-shrink-0">
            {providers.filter(p => p.enabled).length}/{providers.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
        {/* Providers Grid */}
        <div className="grid gap-2 sm:gap-3">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              layout
              className={`relative p-3 sm:p-4 rounded-lg border transition-all ${
                provider.enabled
                  ? 'bg-secondary/50 border-teal/30'
                  : 'bg-secondary/20 border-border'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="text-xl sm:text-2xl flex-shrink-0">{provider.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-medium text-foreground text-xs sm:text-sm truncate">{provider.name}</span>
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${getStatusColor(provider.status)}`} />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {provider.enabled ? (
                        <>
                          <span className="whitespace-nowrap">{provider.latency}ms</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{provider.messagesDelivered.toLocaleString()} sent</span>
                        </>
                      ) : (
                        <span>Disabled</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex">
                    <Settings2 className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  </Button>
                  <Switch
                    checked={provider.enabled}
                    onCheckedChange={() => handleToggle(provider.id)}
                    className="data-[state=checked]:bg-teal scale-90 sm:scale-100"
                  />
                </div>
              </div>

              {/* Status indicator animation */}
              <AnimatePresence>
                {provider.enabled && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal origin-left rounded-b-lg"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Deploy Section */}
        <div className="pt-3 sm:pt-4 border-t border-border">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-medium text-foreground block truncate">Deploy Changes</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Apply globally</p>
            </div>
            <Button
              onClick={handleDeploy}
              disabled={deploying}
              size="sm"
              className="bg-teal hover:bg-teal/90 text-primary-foreground gap-1.5 sm:gap-2 text-xs h-8 sm:h-9 px-3 sm:px-4 flex-shrink-0"
            >
              {deployStatus === 'deploying' ? (
                <>
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Deploying...</span>
                  <span className="sm:hidden">{deployProgress}%</span>
                </>
              ) : deployStatus === 'success' ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Deploy</span>
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {deploying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Progress value={deployProgress} className="h-1.5 sm:h-2 bg-secondary [&>[role=progressbar]]:bg-teal" />
                <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="truncate">Syncing nodes...</span>
                  <span className="flex-shrink-0">{deployProgress}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {deployStatus === 'success' && !deploying && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-2 sm:p-3 bg-success-green/10 border border-success-green/20 rounded-lg"
              >
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success-green flex-shrink-0" />
                <span className="text-[10px] sm:text-sm text-success-green truncate">
                  Deployed successfully
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
