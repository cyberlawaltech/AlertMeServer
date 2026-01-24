'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { chatService, type Message } from '@/services/chat-service';
import { remoteManager } from '@/services/remote-manager';

export function FloatingClientChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to chat messages
  useEffect(() => {
    const unsubscribe = chatService.subscribe((msgs) => {
      setMessages(msgs);
    });

    return unsubscribe;
  }, []);

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = remoteManager.onConnectionChange((connected) => {
      setIsConnecting(!connected);
    });

    // Initial check
    setIsConnecting(!remoteManager.isSocketConnected());

    return unsubscribe;
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    try {
      setIsSending(true);
      chatService.sendMessage(inputValue.trim());
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-300 hover:bg-gray-400'
            : 'bg-[#004A9F] hover:bg-[#003580] text-white shadow-lg'
        }`}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 z-50">
          {/* Header */}
          <div className="bg-[#004A9F] text-white px-4 py-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="font-semibold">Secure Support</span>
            </div>
            {isConnecting && (
              <div className="flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Connecting...</span>
              </div>
            )}
          </div>

          {/* Connection State Animation */}
          {isConnecting && (
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 border-b border-gray-200">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-[#004A9F] animate-pulse" />
                <div className="absolute inset-2 rounded-full border-2 border-[#004A9F] animate-pulse" style={{ animationDelay: '0.1s' }} />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Connecting to Secure Support...
              </p>
            </div>
          )}

          {/* Messages Area */}
          {!isConnecting && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm text-center">
                    <p>No messages yet. Start a conversation with support.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'client'
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

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004A9F]"
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !inputValue.trim()}
                    className="p-2 bg-[#004A9F] text-white rounded-md hover:bg-[#003580] disabled:bg-gray-300 transition-colors"
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
