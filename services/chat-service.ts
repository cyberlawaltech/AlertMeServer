import { remoteManager } from './remote-manager';

export interface Message {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  timestamp: string;
}

type MessageListener = (msgs: Message[]) => void;

class ChatService {
  private messages: Message[] = [];
  private listeners: MessageListener[] = [];

  constructor() {
    // Listen for messages from the server via RemoteManager
    remoteManager.onCommand((command) => {
      try {
        if (command.action === 'RECEIVE_MESSAGE') {
          this.addMessage({
            id: Date.now().toString(),
            sender: 'admin',
            text: command.payload?.text || 'Message received',
            timestamp: new Date().toISOString()
          });
        }

        if (command.action === 'CHECK_IN_ACK') {
          // Dynamically import to avoid circular dependencies
          import('./checkin-service').then((m) => {
            m.checkInService.acknowledge();
          }).catch((error) => {
            console.error('[ChatService] Error importing checkin-service:', error);
          });
        }
      } catch (error) {
        console.error('[ChatService] Error handling command:', error);
      }
    });
  }

  public sendMessage(text: string) {
    try {
      const msg: Message = {
        id: Date.now().toString(),
        sender: 'client',
        text,
        timestamp: new Date().toISOString()
      };
      this.addMessage(msg);

      // Emit to server
      remoteManager.emit('MESSAGE_TO_SERVER', {
        text,
        clientId: remoteManager.getClientId()
      });
    } catch (error) {
      console.error('[ChatService] Error sending message:', error);
    }
  }

  private addMessage(msg: Message) {
    this.messages.push(msg);
    this.notifyListeners();
  }

  public subscribe(callback: MessageListener): () => void {
    this.listeners.push(callback);
    // Immediately call with current messages
    callback([...this.messages]);
    
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    const messagesCopy = [...this.messages];
    this.listeners.forEach((listener) => {
      try {
        listener(messagesCopy);
      } catch (error) {
        console.error('[ChatService] Error in message listener:', error);
      }
    });
  }

  public getMessages(): Message[] {
    return [...this.messages];
  }

  public clearMessages() {
    this.messages = [];
    this.notifyListeners();
  }

  public getMessageCount(): number {
    return this.messages.length;
  }
}

export const chatService = new ChatService();
