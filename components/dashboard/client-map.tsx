'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Wifi, User, Clock, X } from 'lucide-react'
import { RemoteControlDrawer } from './remote-control-drawer'
import { useIsMobile } from '@/hooks/use-media-query'

// Leaflet icon setup - will be initialized in useEffect
let DefaultIcon: any = null

const initializeLeafletIcon = () => {
  if (typeof window !== 'undefined' && !DefaultIcon) {
    const L = require('leaflet')
    DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  }
  return DefaultIcon
}

// Dynamic import for Leaflet (SSR-incompatible)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface ClientLocation {
  id: string
  name: string
  deviceId: string
  lat: number
  lng: number
  balance: number
  status: 'active' | 'idle' | 'offline'
  lastSync: string
  location: string
}

const mockClients: ClientLocation[] = []

export function ClientMap() {
  const [selectedClient, setSelectedClient] = useState<ClientLocation | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    setIsClient(true)
    initializeLeafletIcon()
  }, [])

  const handleMarkerClick = (client: ClientLocation) => {
    setSelectedClient(client)
    setDrawerOpen(true)
  }

  const getStatusColor = (status: ClientLocation['status']) => {
    switch (status) {
      case 'active': return '#30D158'
      case 'idle': return '#FFD60A'
      case 'offline': return '#FF3B30'
    }
  }

  return (
    <div className="relative w-full h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-card via-card/80 to-transparent p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal flex-shrink-0" />
            <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">Client Locations</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-sm flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success-green animate-pulse" />
              <span className="text-muted-foreground">{mockClients.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 hidden sm:flex">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">{mockClients.filter(c => c.status === 'idle').length}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 hidden sm:flex">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-alert-red" />
              <span className="text-muted-foreground">{mockClients.filter(c => c.status === 'offline').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full">
        {isClient && (
          <MapContainer
            center={[7.5, 3.5]}
            zoom={isMobile ? 4 : 5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={!isMobile}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mockClients.map((client) => (
              <Marker
                key={client.id}
                position={[client.lat, client.lng]}
                icon={DefaultIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(client),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[160px] sm:min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(client.status) }}
                      />
                      <span className="font-semibold text-foreground text-xs sm:text-sm truncate">{client.name}</span>
                    </div>
                    <div className="space-y-1 text-[10px] sm:text-sm text-muted-foreground">
                      <p>Device: {client.deviceId}</p>
                      <p>Balance: ₦{client.balance.toLocaleString()}</p>
                      <p>Last Sync: {client.lastSync}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarkerClick(client)}
                      className="mt-2 sm:mt-3 w-full py-1 sm:py-1.5 bg-teal text-primary-foreground rounded text-[10px] sm:text-sm font-medium hover:bg-teal/90 transition-colors touch-target"
                    >
                      Remote Control
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Custom Markers Overlay */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 bg-secondary/95 backdrop-blur-xl rounded-xl border border-border p-3 sm:p-4 z-20"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-teal" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{selectedClient.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{selectedClient.location}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1 hover:bg-muted rounded flex-shrink-0 touch-target"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-teal flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground block">Device</span>
                  <span className="text-xs sm:text-sm font-mono text-foreground truncate block">{selectedClient.deviceId}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-teal text-sm sm:text-base flex-shrink-0">₦</span>
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground block">Balance</span>
                  <span className="text-xs sm:text-sm font-mono text-foreground truncate block">{selectedClient.balance.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-teal flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-xs text-muted-foreground block">Sync</span>
                  <span className="text-xs sm:text-sm text-foreground truncate block">{selectedClient.lastSync}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remote Control Drawer */}
      <RemoteControlDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        client={selectedClient}
      />
    </div>
  )
}
