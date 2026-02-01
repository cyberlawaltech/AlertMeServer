'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Monitor,
  Search,
  RefreshCw,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react'
import { RemoteControlDrawer } from './remote-control-drawer'
import { useIsMobile } from '@/hooks/use-media-query'
import { useData, Client } from '@/components/data-provider'

export function ClientRegistry() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortField, setSortField] = useState<'balance' | 'lastSync' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const isMobile = useIsMobile()
  
  const { clients, loading, error, syncClients } = useData()

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortField) return 0
    if (sortField === 'balance') {
      return sortDirection === 'asc' ? a.balance - b.balance : b.balance - a.balance
    }
    if (sortField === 'lastSync') {
      const aTime = new Date(a.lastSync).getTime()
      const bTime = new Date(b.lastSync).getTime()
      return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
    }
    return 0
  })

  const handleSort = (field: 'balance' | 'lastSync') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleRemoteSession = (client: Client) => {
    setSelectedClient(client)
    setDrawerOpen(true)
  }

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-success-green/20 text-success-green border-success-green/30 hover:bg-success-green/20 text-[10px] sm:text-xs px-1.5 sm:px-2">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-success-green mr-1 sm:mr-1.5 animate-pulse" />
            Active
          </Badge>
        )
      case 'idle':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20 text-[10px] sm:text-xs px-1.5 sm:px-2">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-yellow-500 mr-1 sm:mr-1.5" />
            Idle
          </Badge>
        )
      case 'offline':
        return (
          <Badge className="bg-alert-red/20 text-alert-red border-alert-red/30 hover:bg-alert-red/20 text-[10px] sm:text-xs px-1.5 sm:px-2">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-alert-red mr-1 sm:mr-1.5" />
            Offline
          </Badge>
        )
    }
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
              <h2 className="font-semibold text-foreground text-sm sm:text-base">Client Registry</h2>
              <Badge variant="secondary" className="bg-teal/10 text-teal text-[10px] sm:text-xs">
                {clients.length}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 bg-transparent h-8 text-xs"
              onClick={syncClients}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-border h-10"
            />
          </div>
          {error && (
            <p className="text-alert-red text-xs mt-2">{error}</p>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal" />
            </div>
          ) : sortedClients.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No clients found</div>
          ) : (
            sortedClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 sm:p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-xs sm:text-sm truncate">{client.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{client.deviceId}</p>
                    </div>
                    {getStatusBadge(client.status)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{client.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Balance</p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        ₦{client.balance.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoteSession(client)}
                      className="h-7 text-[10px] sm:text-xs gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Connect
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    )
  }

  // Desktop Table View
  return (
    <Card className="bg-card border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Client Registry</h2>
              <p className="text-xs text-muted-foreground">Manage and monitor all connected clients</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={syncClients}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, device ID, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        {error && (
          <p className="text-alert-red text-sm mt-2">{error}</p>
        )}
      </div>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal" />
          </div>
        ) : sortedClients.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No clients found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground">Client Name</TableHead>
                  <TableHead className="text-foreground">Device ID</TableHead>
                  <TableHead className="text-foreground">Location</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead
                    className="text-foreground cursor-pointer"
                    onClick={() => handleSort('balance')}
                  >
                    <div className="flex items-center gap-2">
                      Balance
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-foreground cursor-pointer"
                    onClick={() => handleSort('lastSync')}
                  >
                    <div className="flex items-center gap-2">
                      Last Sync
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-border hover:bg-secondary/50 transition-colors"
                  >
                    <TableCell className="text-foreground font-medium">{client.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{client.deviceId}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {client.location}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell className="text-foreground font-semibold">
                      ₦{client.balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(client.lastSync).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoteSession(client)}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Connect
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
