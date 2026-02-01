'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSocket } from '@/hooks/use-socket'
import { apiClient } from '@/lib/api-client'

export interface Client {
  id: string
  name: string
  deviceId: string
  balance: number
  status: 'active' | 'idle' | 'offline'
  lastSync: string | Date
  location: string
  lat: number
  lng: number
}

export interface Stats {
  totalClients: number
  activeClients: number
  idleClients: number
  offlineClients: number
  totalBalance: number
  averageBalance: number
  lastUpdate: Date
}

interface DataContextType {
  clients: Client[]
  stats: Stats | null
  loading: boolean
  error: string | null
  isConnected: boolean
  syncClients: () => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  createClient: (data: Omit<Client, 'id'>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isConnected, socket } = useSocket()

  // Sync clients from server
  const syncClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getClients()
      if (response.success && response.data) {
        const formattedClients = response.data.map((client: any) => ({
          ...client,
          lastSync: new Date(client.lastSync),
        }))
        setClients(formattedClients)
      } else {
        setError(response.error || 'Failed to sync clients')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('Sync error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.getStats()
      if (response.success && response.data) {
        setStats({
          ...response.data,
          lastUpdate: new Date(response.data.lastUpdate),
        })
      }
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
  }, [])

  // Initial sync and setup
  useEffect(() => {
    syncClients()
    fetchStats()

    // Setup Socket.IO listeners
    if (socket) {
      socket.on('sync-clients', (data: any) => {
        const formattedClients = data.clients.map((client: any) => ({
          ...client,
          lastSync: new Date(client.lastSync),
        }))
        setClients(formattedClients)
      })

      socket.on('client-updated', (data: any) => {
        if (data.success && data.data) {
          setClients(prev => {
            const index = prev.findIndex(c => c.id === data.data.id)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = {
                ...data.data,
                lastSync: new Date(data.data.lastSync),
              }
              return updated
            }
            return prev
          })
        }
      })

      socket.on('client-created', (data: any) => {
        if (data.success && data.data) {
          setClients(prev => [
            ...prev,
            {
              ...data.data,
              lastSync: new Date(data.data.lastSync),
            },
          ])
        }
      })

      socket.on('client-deleted', (data: any) => {
        if (data.success && data.id) {
          setClients(prev => prev.filter(c => c.id !== data.id))
        }
      })

      socket.on('client-connection-change', () => {
        // Refresh stats when client connections change
        fetchStats()
      })

      return () => {
        socket.off('sync-clients')
        socket.off('client-updated')
        socket.off('client-created')
        socket.off('client-deleted')
        socket.off('client-connection-change')
      }
    }
  }, [socket, syncClients, fetchStats])

  // Re-sync every 30 seconds if not connected via Socket.IO
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        syncClients()
        fetchStats()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected, syncClients, fetchStats])

  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      const response = await apiClient.updateClient(id, data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update client')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      throw err
    }
  }

  const createClient = async (data: Omit<Client, 'id'>) => {
    try {
      const response = await apiClient.createClient(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create client')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const response = await apiClient.deleteClient(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete client')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      throw err
    }
  }

  return (
    <DataContext.Provider
      value={{
        clients,
        stats,
        loading,
        error,
        isConnected,
        syncClients,
        updateClient,
        createClient,
        deleteClient,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
