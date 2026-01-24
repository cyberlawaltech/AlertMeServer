'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut,
  MessageCircle,
  Eye,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export interface ClientDevice {
  clientId: string;
  socketId: string;
  status: 'Online' | 'Offline' | 'Connected' | 'Revoked';
  deviceInfo?: {
    timestamp: string;
    device: string;
    platform: string;
  };
  messages: Array<{
    sender: 'client' | 'admin';
    text: string;
    timestamp: string;
  }>;
  lastActivity: string;
  createdAt: string;
}

type QuickAction = 'id' | 'ack' | 'log' | 'revoke';

export function AdminPanel() {
  const [devices, setDevices] = useState<ClientDevice[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ClientDevice['messages']>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 
                     `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_SOCKET_PORT || 3001}`;

    const newSocket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      query: {
        isAdmin: true
      }
    });

    newSocket.on('connect', () => {
      console.log('[Admin] Connected to server');
      setIsConnected(true);
      fetchDevices(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('[Admin] Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('DEVICE_CHECKIN_NOTIFICATION', (data: any) => {
      console.log('[Admin] Device check-in:', data.clientId);
      fetchDevices(newSocket);
    });

    newSocket.on('DEVICE_DISCONNECTED', (data: any) => {
      console.log('[Admin] Device disconnected:', data.clientId);
      fetchDevices(newSocket);
    });

    newSocket.on('CLIENT_MESSAGE', (data: any) => {
      console.log('[Admin] Message from', data.clientId);
      setDevices(prev =>
        prev.map(device =>
          device.clientId === data.clientId
            ? {
              ...device,
              messages: [
                ...device.messages,
                {
                  sender: 'client' as const,
                  text: data.text,
                  timestamp: data.timestamp
                }
              ]
            }
            : device
        )
      );

      if (selectedClientId === data.clientId) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'client' as const,
            text: data.text,
            timestamp: data.timestamp
          }
        ]);
      }
    });

    newSocket.on('error', (error: any) => {
      console.error('[Admin] Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch devices
  const fetchDevices = async (socketInstance?: Socket) => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  // Handle client selection
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const device = devices.find(d => d.clientId === clientId);
    if (device) {
      setMessages(device.messages || []);
    }
  };

  // Send message to client
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedClientId || isSending || !socket) return;

    try {
      setIsSending(true);
      socket.emit('SEND_MESSAGE_TO_CLIENT', {
        targetClientId: selectedClientId,
        text: inputValue.trim()
      });

      // Add message to local state
      setMessages(prev => [
        ...prev,
        {
          sender: 'admin',
          text: inputValue.trim(),
          timestamp: new Date().toISOString()
        }
      ]);

      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Quick actions
  const handleQuickAction = (action: QuickAction) => {
    if (!selectedClientId || !socket) return;

    switch (action) {
      case 'id':
        socket.emit('ADMIN_REQUEST_ID', { targetClientId: selectedClientId });
        setMessages(prev => [
          ...prev,
          {
            sender: 'admin',
            text: '[System] Requesting ID verification...',
            timestamp: new Date().toISOString()
          }
        ]);
        break;

      case 'ack':
        socket.emit('SEND_MESSAGE_TO_CLIENT', {
          targetClientId: selectedClientId,
          text: '[System] Check-in acknowledged'
        });
        break;

      case 'log':
        socket.emit('ADMIN_REQUEST_TRANSACTION_LOG', {
          targetClientId: selectedClientId
        });
        setMessages(prev => [
          ...prev,
          {
            sender: 'admin',
            text: '[System] Requesting transaction log...',
            timestamp: new Date().toISOString()
          }
        ]);
        break;

      case 'revoke':
        socket.emit('ADMIN_REVOKE_SESSION', {
          targetClientId: selectedClientId,
          reason: 'Session revoked by administrator'
        });
        setMessages(prev => [
          ...prev,
          {
            sender: 'admin',
            text: '[System] Session revoked',
            timestamp: new Date().toISOString()
          }
        ]);
        break;
    }
  };

  const selectedDevice = devices.find(d => d.clientId === selectedClientId);
  const filteredDevices = devices.filter(d =>
    d.clientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'text-green-600 bg-green-50';
      case 'Connected':
        return 'text-blue-600 bg-blue-50';
      case 'Offline':
        return 'text-gray-600 bg-gray-50';
      case 'Revoked':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Online':
      case 'Connected':
        return 'bg-green-500';
      case 'Offline':
        return 'bg-gray-400';
      case 'Revoked':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#004A9F] to-[#003580]">
          <div className="flex items-center gap-2 text-white mb-4">
            <AlertCircle className="w-5 h-5" />
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
          </div>
          {!isConnected && (
            <div className="flex items-center gap-2 text-yellow-200 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting...</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search Device ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
          />
        </div>

        {/* Target Device List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">
              Target Devices ({filteredDevices.length})
            </p>
            <div className="space-y-2">
              {filteredDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No devices found</p>
                </div>
              ) : (
                filteredDevices.map((device) => (
                  <button
                    key={device.clientId}
                    onClick={() => handleSelectClient(device.clientId)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedClientId === device.clientId
                        ? 'bg-[#004A9F] text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(device.status)}`} />
                      <span className="font-mono text-sm font-semibold">
                        {device.clientId}
                      </span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded inline-block ${getStatusColor(device.status)}`}>
                      {device.status}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Connected to server</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Chat Area */}
      {selectedDevice ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#004A9F] to-[#003580] text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{selectedDevice.clientId}</h2>
                <p className="text-sm opacity-90">
                  {selectedDevice.deviceInfo?.platform || 'Unknown Platform'} •{' '}
                  {selectedDevice.status}
                </p>
              </div>
              <Eye className="w-5 h-5 opacity-75" />
            </div>
          </div>

          {/* Device Info */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-xs uppercase">Device</p>
                <p className="text-gray-900 font-mono text-xs truncate">
                  {selectedDevice.deviceInfo?.device || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs uppercase">Last Activity</p>
                <p className="text-gray-900 text-xs">
                  {new Date(selectedDevice.lastActivity).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-center">
                <MessageCircle className="w-8 h-8 opacity-50 mr-2" />
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-sm px-4 py-2 rounded-lg ${
                      msg.sender === 'admin'
                        ? 'bg-[#004A9F] text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">
              Quick Responses
            </p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleQuickAction('id')}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-xs font-medium text-gray-700"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Ask for ID</span>
              </button>
              <button
                onClick={() => handleQuickAction('ack')}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-xs font-medium text-gray-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge</span>
              </button>
              <button
                onClick={() => handleQuickAction('log')}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-xs font-medium text-gray-700"
              >
                <FileText className="w-4 h-4" />
                <span>Request Log</span>
              </button>
              <button
                onClick={() => handleQuickAction('revoke')}
                className="flex flex-col items-center gap-1 p-3 bg-white border border-red-300 rounded-md hover:bg-red-50 text-xs font-medium text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Revoke</span>
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !inputValue.trim()}
                className="p-2 bg-[#004A9F] text-white rounded-md hover:bg-[#003580] disabled:bg-gray-300 transition-colors"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium">Select a device to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
