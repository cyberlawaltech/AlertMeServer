'use client';

import { useEffect } from 'react';
import { checkInService } from '@/services/checkin-service';
import { chatService } from '@/services/chat-service';
import { remoteManager } from '@/services/remote-manager';

/**
 * ClientServiceInitializer
 * 
 * This component ensures that all client-side services are initialized
 * on app startup. It runs the RemoteManager, CheckInService, and ChatService
 * in the background.
 * 
 * The services will:
 * - Establish WebSocket connection to the server
 * - Begin stealth check-in process if not acknowledged
 * - Set up message listeners for real-time communication
 */
export function ClientServiceInitializer() {
  useEffect(() => {
    console.log('[ClientServiceInitializer] Initializing services...');

    // Services are already instantiated globally, but we can add logging here
    const clientId = remoteManager.getClientId();
    console.log(`[ClientServiceInitializer] Client ID: ${clientId}`);

    // Return cleanup function
    return () => {
      console.log('[ClientServiceInitializer] Cleaning up services...');
      // Services continue to run but we can add cleanup logic here if needed
    };
  }, []);

  // This component doesn't render anything
  return null;
}
