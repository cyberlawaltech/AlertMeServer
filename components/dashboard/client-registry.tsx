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
} from 'lucide-react'
import { RemoteControlDrawer } from './remote-control-drawer'
import { useIsMobile } from '@/hooks/use-media-query'

interface Client {
  id: string
  name: string
  deviceId: string
  balance: number
  status: 'active' | 'idle' | 'offline'
  lastSync: string
  location: string
  lat: number
  lng: number
}

const mockClients: Client[] = [
  { id: '1', name: 'Adebayo Oluwaseun', deviceId: 'ECO-7842', lat: 6.5244, lng: 3.3792, balance: 245000, status: 'active', lastSync: '2 min ago', location: 'Lagos, Nigeria' },
  { id: '2', name: 'Chioma Nnamdi', deviceId: 'ECO-3156', lat: 9.0579, lng: 7.4951, balance: 89500, status: 'active', lastSync: '5 min ago', location: 'Abuja, Nigeria' },
  { id: '3', name: 'Emmanuel Okonkwo', deviceId: 'ECO-9421', lat: 5.9631, lng: -0.1869, balance: 156000, status: 'idle', lastSync: '15 min ago', location: 'Accra, Ghana' },
  { id: '4', name: 'Fatima Diallo', deviceId: 'ECO-2847', lat: 14.6928, lng: -17.4467, balance: 312000, status: 'active', lastSync: '1 min ago', location: 'Dakar, Senegal' },
  { id: '5', name: 'Kwame Asante', deviceId: 'ECO-6539', lat: 6.1286, lng: 1.2254, balance: 78200, status: 'offline', lastSync: '2 hours ago', location: 'Lomé, Togo' },
  { id: '6', name: 'Amina Bello', deviceId: 'ECO-4721', lat: 12.0022, lng: 8.5919, balance: 423000, status: 'active', lastSync: '30 sec ago', location: 'Kano, Nigeria' },
  { id: '7', name: 'Kofi Mensah', deviceId: 'ECO-8934', lat: 5.5560, lng: -0.1969, balance: 67800, status: 'active', lastSync: '3 min ago', location: 'Tema, Ghana' },
  { id: '8', name: 'Blessing Eze', deviceId: 'ECO-1256', lat: 4.7500, lng: 7.0000, balance: 198500, status: 'idle', lastSync: '20 min ago', location: 'Port Harcourt, Nigeria' },
  { id: '9', name: 'Yusuf Ibrahim', deviceId: 'ECO-5623', lat: 11.9964, lng: 8.5167, balance: 534000, status: 'active', lastSync: '45 sec ago', location: 'Kano, Nigeria' },
  { id: '10', name: 'Grace Afolabi', deviceId: 'ECO-7189', lat: 7.3775, lng: 3.9470, balance: 112000, status: 'active', lastSync: '4 min ago', location: 'Ibadan, Nigeria' },
]

export function ClientRegistry() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortField, setSortField] = useState<'balance' | 'lastSync' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const isMobile = useIsMobile()

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortField) return 0
    if (sortField === 'balance') {
      return sortDirection === 'asc' ? a.balance - b.balance : b.balance - a.balance
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
                {mockClients.length}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 bg-transparent h-8 text-xs">
              <RefreshCw className="w-3 h-3" />
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
        </div>

        {/* Mobile Cards */}
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {sortedClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-3 sm:p-4 active:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-teal text-xs">{client.deviceId}</span>
                    {getStatusBadge(client.status)}
                  </div>
                  <p className="font-medium text-foreground text-sm truncate">{client.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{client.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {client.lastSync}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-foreground text-sm font-medium">
                    ₦{client.balance.toLocaleString()}
                  </p>
                  <Button
                    onClick={() => handleRemoteSession(client)}
                    size="sm"
                    className="mt-2 bg-teal/10 text-teal hover:bg-teal hover:text-primary-foreground transition-all h-8 text-xs px-2"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Remote
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border text-xs text-muted-foreground">
          Showing {sortedClients.length} of {mockClients.length}
        </div>

        <RemoteControlDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          client={selectedClient}
        />
      </div>
    )
  }

  // Desktop Table View
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-teal" />
            <h2 className="font-semibold text-foreground">Client Registry</h2>
            <Badge variant="secondary" className="bg-teal/10 text-teal">
              {mockClients.length} Devices
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs">Device ID</TableHead>
              <TableHead className="text-muted-foreground text-xs">Client Name</TableHead>
              <TableHead className="text-muted-foreground text-xs">
                <button
                  type="button"
                  onClick={() => handleSort('balance')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Balance (NGN)
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground text-xs hidden lg:table-cell">Location</TableHead>
              <TableHead className="text-muted-foreground text-xs">Status</TableHead>
              <TableHead className="text-muted-foreground text-xs hidden md:table-cell">Last Sync</TableHead>
              <TableHead className="text-muted-foreground text-xs text-right">Action</TableHead>
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
                <TableCell className="font-mono text-teal text-xs sm:text-sm">{client.deviceId}</TableCell>
                <TableCell className="font-medium text-foreground text-xs sm:text-sm">{client.name}</TableCell>
                <TableCell className="font-mono text-foreground text-xs sm:text-sm">
                  ₦{client.balance.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">{client.location}</TableCell>
                <TableCell>{getStatusBadge(client.status)}</TableCell>
                <TableCell className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">{client.lastSync}</TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleRemoteSession(client)}
                    size="sm"
                    className="bg-teal/10 text-teal hover:bg-teal hover:text-primary-foreground transition-all text-xs h-8"
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    <span className="hidden sm:inline">Remote Session</span>
                    <span className="sm:hidden">Remote</span>
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      <div className="p-4 border-t border-border text-sm text-muted-foreground">
        Showing {sortedClients.length} of {mockClients.length} clients
      </div>

      {/* Remote Control Drawer */}
      <RemoteControlDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        client={selectedClient}
      />
    </div>
  )
}
