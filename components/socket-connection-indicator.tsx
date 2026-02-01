import { useSocket } from '@/hooks/use-socket'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

export function SocketConnectionIndicator() {
  const { isConnected, accountNumber, error } = useSocket()

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
        {isConnected ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Wifi className="w-4 h-4 text-success-green" />
            </motion.div>
            <span className="text-xs text-success-green font-medium">Connected</span>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-4 h-4 text-alert-red animate-pulse" />
            <span className="text-xs text-alert-red font-medium">Connection Error</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-muted-foreground animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">Connecting...</span>
          </>
        )}
        {accountNumber && (
          <span className="text-xs font-mono text-foreground ml-2 text-muted-foreground">
            {accountNumber}
          </span>
        )}
      </div>
    </motion.div>
  )
}
