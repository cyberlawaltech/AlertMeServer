import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [accountNumber, setAccountNumber] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const reconnectAttempts = useRef(0)

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_REMOTE_SERVER_URL || 'http://localhost:3001'
    
    // Get account number from localStorage or generate one
    const storedAccount = localStorage.getItem('accountNumber')
    const account = storedAccount || `ACC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    if (!storedAccount) {
      localStorage.setItem('accountNumber', account)
    }
    
    setAccountNumber(account)

    // Create socket connection with account number
    const socket = io(serverUrl, {
      query: {
        accountNumber: account,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket.id)
      setIsConnected(true)
      setError(null)
      reconnectAttempts.current = 0
      
      // Request initial sync
      socket.emit('request-sync')
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      setError(error.message || 'Connection error')
      reconnectAttempts.current += 1
    })

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
      setError(typeof error === 'string' ? error : 'Socket error')
    })

    socketRef.current = socket

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const sendData = (data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('data', data)
    } else {
      console.warn('Socket not connected, cannot send data')
    }
  }

  const sendCommand = (command: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('command', command)
    } else {
      console.warn('Socket not connected, cannot send command')
    }
  }

  const ping = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ping')
    }
  }

  const requestSync = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request-sync')
    }
  }

  const updateClient = (clientData: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update-client', clientData)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    accountNumber,
    error,
    sendData,
    sendCommand,
    ping,
    requestSync,
    updateClient,
  }
}
