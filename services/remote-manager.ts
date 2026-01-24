import { io, Socket } from 'socket.io-client';

export interface RemoteCommand {
  action: string;
  payload?: any;
}

class RemoteManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private commandListeners: ((command: RemoteCommand) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private clientId: string;

  constructor() {
    // Generate or retrieve client ID
    this.clientId = this.getOrCreateClientId();
    this.initializeSocket();
  }

  private getOrCreateClientId(): string {
    const stored = typeof window !== 'undefined' 
      ? localStorage.getItem('eb_client_id')
      : null;
    
    if (stored) return stored;
    
    const newId = `EB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('eb_client_id', newId);
    }
    return newId;
  }

  private initializeSocket() {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 
                     `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_SOCKET_PORT || 3001}`;

    try {
      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        query: {
          clientId: this.clientId
        }
      });

      this.socket.on('connect', () => {
        console.log('[RemoteManager] Connected to server');
        this.isConnected = true;
        this.notifyConnectionListeners(true);
      });

      this.socket.on('disconnect', () => {
        console.log('[RemoteManager] Disconnected from server');
        this.isConnected = false;
        this.notifyConnectionListeners(false);
      });

      this.socket.on('command', (command: RemoteCommand) => {
        console.log('[RemoteManager] Received command:', command.action);
        this.notifyCommandListeners(command);
      });

      this.socket.on('error', (error: any) => {
        console.error('[RemoteManager] Socket error:', error);
      });
    } catch (error) {
      console.error('[RemoteManager] Failed to initialize socket:', error);
    }
  }

  public emit(event: string, data: any) {
    try {
      if (this.socket && this.isConnected) {
        this.socket.emit(event, data);
      } else {
        console.warn(`[RemoteManager] Attempted to emit '${event}' but socket is not connected`);
      }
    } catch (error) {
      console.error(`[RemoteManager] Error emitting '${event}':`, error);
    }
  }

  public onCommand(callback: (command: RemoteCommand) => void) {
    this.commandListeners.push(callback);
    return () => {
      this.commandListeners = this.commandListeners.filter(l => l !== callback);
    };
  }

  public onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== callback);
    };
  }

  private notifyCommandListeners(command: RemoteCommand) {
    this.commandListeners.forEach(listener => {
      try {
        listener(command);
      } catch (error) {
        console.error('[RemoteManager] Error in command listener:', error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('[RemoteManager] Error in connection listener:', error);
      }
    });
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const remoteManager = new RemoteManager();
