'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Terminal,
  Zap,
  Send,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-media-query'
import { Client } from '@/components/data-provider'



interface RemoteControlDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
}

const clientState = {
  user: {
    id: 'USR-7842',
    tier: 'Premium',
    kycVerified: true,
    createdAt: '2023-08-15T10:30:00Z',
  },
  account: {
    balance: 245000,
    currency: 'NGN',
    frozen: false,
    dailyLimit: 500000,
  },
  device: {
    model: 'Samsung Galaxy A54',
    os: 'Android 14',
    appVersion: '3.2.1',
    pushEnabled: true,
  },
  preferences: {
    language: 'en',
    notifications: true,
    biometricEnabled: true,
  },
}

interface JsonNodeProps {
  data: unknown
  name: string
  level: number
}

function JsonTreeNode({ data, name, level }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(level < 2)
  const isObject = typeof data === 'object' && data !== null

  if (!isObject) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 py-0.5 sm:py-1" style={{ paddingLeft: level * 12 }}>
        <span className="text-teal font-mono text-[10px] sm:text-sm">{name}:</span>
        <span className={`font-mono text-[10px] sm:text-sm ${typeof data === 'boolean' ? (data ? 'text-success-green' : 'text-alert-red') : 'text-foreground'}`}>
          {typeof data === 'string' ? `"${data}"` : String(data)}
        </span>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 py-0.5 sm:py-1 hover:bg-muted/50 w-full rounded transition-colors touch-target"
        style={{ paddingLeft: level * 12 }}
      >
        {expanded ? (
          <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
        )}
        <span className="text-teal font-mono text-[10px] sm:text-sm">{name}</span>
        <span className="text-muted-foreground font-mono text-[9px] sm:text-xs">
          {Array.isArray(data) ? `[${(data as unknown[]).length}]` : `{${Object.keys(data as object).length}}`}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {Object.entries(data as object).map(([key, value]) => (
              <JsonTreeNode key={key} name={key} data={value} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RemoteControlDrawer({ open, onOpenChange, client }: RemoteControlDrawerProps) {
  const [selectedFunction, setSelectedFunction] = useState('')
  const [message, setMessage] = useState('')
  const [executing, setExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const isMobile = useIsMobile()

  const handleExecute = async () => {
    if (!selectedFunction) return
    
    setExecuting(true)
    setExecutionStatus('idle')
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setExecuting(false)
    setExecutionStatus('success')
    
    setTimeout(() => setExecutionStatus('idle'), 3000)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    setExecuting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setExecuting(false)
    setMessage('')
    setExecutionStatus('success')
    setTimeout(() => setExecutionStatus('idle'), 3000)
  }

  if (!client) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className={isMobile ? "h-[85vh] max-h-[85vh]" : "h-full w-[400px] sm:w-[450px] md:w-[500px] max-w-full"}>
        <DrawerHeader className="border-b border-border px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
            </div>
            <div className="min-w-0">
              <DrawerTitle className="text-foreground text-sm sm:text-base truncate">Remote Control</DrawerTitle>
              <DrawerDescription className="text-xs sm:text-sm truncate">
                {client.deviceId} - {client.name}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
          {/* Function Injector */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-teal" />
              <Label className="text-xs sm:text-sm font-medium text-foreground">Function Injector</Label>
            </div>
            <Select value={selectedFunction} onValueChange={setSelectedFunction}>
              <SelectTrigger className="bg-secondary border-border h-10 sm:h-11 text-xs sm:text-sm">
                <SelectValue placeholder="Select function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addBalance">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success-green" />
                    addBalance
                  </div>
                </SelectItem>
                <SelectItem value="resetPIN">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    resetPIN
                  </div>
                </SelectItem>
                <SelectItem value="freezeAccount">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-alert-red" />
                    freezeAccount
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {selectedFunction === 'addBalance' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5 sm:space-y-2"
              >
                <Label className="text-[10px] sm:text-xs text-muted-foreground">Amount (NGN)</Label>
                <Input type="number" placeholder="Enter amount" className="bg-secondary border-border h-10 sm:h-11 text-sm" />
              </motion.div>
            )}

            {selectedFunction === 'freezeAccount' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 sm:p-3 bg-alert-red/10 border border-alert-red/20 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-alert-red flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] sm:text-xs text-alert-red">
                    This will freeze the account and prevent all transactions.
                  </p>
                </div>
              </motion.div>
            )}

            <Button
              onClick={handleExecute}
              disabled={!selectedFunction || executing}
              className="w-full bg-teal hover:bg-teal/90 text-primary-foreground h-10 sm:h-11 text-xs sm:text-sm"
            >
              {executing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : executionStatus === 'success' ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Executed
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>

          {/* Property Editor */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
              <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-teal" />
              Property Editor
            </Label>
            <div className="bg-secondary rounded-lg border border-border p-2 sm:p-3 max-h-48 sm:max-h-64 overflow-y-auto scrollbar-hide">
              <JsonTreeNode data={clientState} name="clientState" level={0} />
            </div>
          </div>

          {/* Send Direct Message */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5 sm:gap-2">
              <Send className="w-3 h-3 sm:w-4 sm:h-4 text-teal" />
              Direct Message
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-secondary border-border min-h-[80px] sm:min-h-[100px] resize-none text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || executing}
              variant="outline"
              className="w-full border-teal text-teal hover:bg-teal hover:text-primary-foreground bg-transparent h-10 sm:h-11 text-xs sm:text-sm"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Send Push
            </Button>
          </div>
        </div>

        <DrawerFooter className="border-t border-border px-3 sm:px-4 py-3 sm:py-4">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full bg-transparent h-10 sm:h-11 text-xs sm:text-sm">
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
