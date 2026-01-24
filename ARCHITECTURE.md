# System Architecture Reference

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER CLIENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          React Components (Next.js Frontend)             │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │       FloatingClientChat Component                  │ │  │
│  │  │  - Floating Action Button                           │ │  │
│  │  │  - Chat Window with Messages                        │ │  │
│  │  │  - Real-time Status Display                         │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                     ▲  ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │    ClientServiceInitializer (Initializer)           │ │  │
│  │  │    - Bootstraps all services on app start           │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▲  ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Client-Side Services (TypeScript)                 │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │    RemoteManager (WebSocket Manager)             │   │  │
│  │  │    - Manages socket.io-client connection         │   │  │
│  │  │    - Emits events to server                      │   │  │
│  │  │    - Listens for server commands                 │   │  │
│  │  │    - Generates unique Client IDs                 │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                      ▲  ▼                                 │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │    CheckInService (Background Polling)           │   │  │
│  │  │    - 10-second check-in interval                 │   │  │
│  │  │    - Sends device info to server                 │   │  │
│  │  │    - Stops on CHECK_IN_ACK                       │   │  │
│  │  │    - Max 60 retries (10 minutes)                 │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                      ▲  ▼                                 │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │    ChatService (Message Management)              │   │  │
│  │  │    - Stores message history                      │   │  │
│  │  │    - Manages listeners for updates               │   │  │
│  │  │    - Handles command processing                  │   │  │
│  │  │    - Reactive message updates                    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ WebSocket (Socket.IO)
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Socket.IO Server (Port 3001)                     │  │
│  │                                                            │  │
│  │  Events Received:                                        │  │
│  │  - CLIENT_CHECK_IN → Verify device, send ACK           │  │
│  │  - MESSAGE_TO_SERVER → Broadcast to admin_room          │  │
│  │                                                            │  │
│  │  Events Emitted:                                         │  │
│  │  - CHECK_IN_ACK → Tell client to stop checking in       │  │
│  │  - RECEIVE_MESSAGE → Send message to specific client    │  │
│  │  - DEVICE_CHECKIN_NOTIFICATION → Notify admins         │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▲  ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     In-Memory Database (Replaceable)                     │  │
│  │                                                            │  │
│  │  clients = {                                             │  │
│  │    "EB-XXXXX": {                                         │  │
│  │      clientId: "EB-XXXXX",                              │  │
│  │      status: "Online",                                   │  │
│  │      deviceInfo: { ua, platform, timestamp },            │  │
│  │      messages: [ { sender, text, timestamp } ],          │  │
│  │      lastActivity: timestamp,                            │  │
│  │      createdAt: timestamp                                │  │
│  │    }                                                      │  │
│  │  }                                                        │  │
│  │                                                            │  │
│  │  adminSessions = Set of admin socket IDs                │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      REST API Endpoints (Express)                        │  │
│  │                                                            │  │
│  │  GET /health                                             │  │
│  │  GET /api/clients                                        │  │
│  │  GET /api/clients/:clientId                              │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ WebSocket (Socket.IO)
                             │
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER - ADMIN                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           AdminPanel Component                           │  │
│  │                                                            │  │
│  │  ┌────────────────────┐  ┌─────────────────────────┐   │  │
│  │  │  Device Sidebar    │  │   Chat Area             │   │  │
│  │  │  - Device list     │  │  - Message history      │   │  │
│  │  │  - Search          │  │  - Device info          │   │  │
│  │  │  - Status dots     │  │  - Message input        │   │  │
│  │  │  - Click to select │  │  - Quick actions        │   │  │
│  │  └────────────────────┘  └─────────────────────────┘   │  │
│  │                                                            │  │
│  │  Socket.IO Events:                                       │  │
│  │  - Listens: DEVICE_CHECKIN_NOTIFICATION                │  │
│  │  - Listens: CLIENT_MESSAGE                              │  │
│  │  - Listens: DEVICE_DISCONNECTED                         │  │
│  │  - Emits: SEND_MESSAGE_TO_CLIENT                        │  │
│  │  - Emits: ADMIN_REQUEST_ID                              │  │
│  │  - Emits: ADMIN_REQUEST_TRANSACTION_LOG                 │  │
│  │  - Emits: ADMIN_REVOKE_SESSION                          │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Communication Protocol

### Event: CLIENT_CHECK_IN

```
Client sends:
{
  timestamp: "2024-01-24T10:30:00Z",
  device: "Mozilla/5.0...",
  platform: "Linux x86_64",
  clientId: "EB-XXXXX"
}
        │
        ▼
Server processes:
- Looks up or creates client in database
- Updates status to "Online"
- Stores device info
- Records lastActivity

Server responds with:
{
  action: 'CHECK_IN_ACK',
  payload: {
    message: 'Check-in acknowledged',
    timestamp: "2024-01-24T10:30:01Z"
  }
}
        │
        ▼
Client receives:
- CheckInService calls acknowledge()
- Stops checking in interval
- Sets localStorage['eb_ack'] = 'true'

Admin notified:
{
  clientId: "EB-XXXXX",
  status: "Online",
  deviceInfo: { ... },
  timestamp: "2024-01-24T10:30:01Z"
}
```

### Event: MESSAGE_TO_SERVER

```
Client sends:
{
  text: "Hello, I need help",
  clientId: "EB-XXXXX"
}
        │
        ▼
Server processes:
- Records message in client.messages[]
- Adds sender='client', timestamp

Server broadcasts to admin_room:
{
  clientId: "EB-XXXXX",
  text: "Hello, I need help",
  timestamp: "2024-01-24T10:30:05Z"
}
        │
        ▼
AdminPanel receives:
- Updates device.messages[]
- Displays in chat window
- Scrolls to latest
```

### Event: SEND_MESSAGE_TO_CLIENT

```
Admin sends:
{
  targetClientId: "EB-XXXXX",
  text: "Thank you for contacting us"
}
        │
        ▼
Server processes:
- Finds target client
- Records message in messages[]
- Sends to client_EB-XXXXX room

Server sends to client:
{
  action: 'RECEIVE_MESSAGE',
  payload: {
    text: "Thank you for contacting us",
    timestamp: "2024-01-24T10:30:10Z",
    from: 'admin'
  }
}
        │
        ▼
Client receives:
- ChatService.addMessage()
- Updates messages state
- FloatingClientChat re-renders
- Message appears in chat
```

## State Management Flow

### Client-Side State

```
RemoteManager
├── socket: Socket | null
├── isConnected: boolean
├── clientId: string
├── commandListeners: Function[]
└── connectionListeners: Function[]

CheckInService
├── checkInInterval: NodeJS.Timeout | null
├── acknowledged: boolean
├── maxRetries: number
└── retryCount: number

ChatService
├── messages: Message[]
└── listeners: Function[]

FloatingClientChat (Component)
├── isOpen: boolean
├── messages: Message[]
├── inputValue: string
├── isConnecting: boolean
└── isSending: boolean
```

### Server-Side State

```
clients: Map
├── "EB-XXXXX": {
│   ├── socketId: string
│   ├── status: "Online" | "Offline" | "Connected" | "Revoked"
│   ├── deviceInfo: { timestamp, device, platform }
│   ├── messages: Message[]
│   ├── lastActivity: Date
│   └── createdAt: Date
└── "EB-YYYYY": { ... }

adminSessions: Set<string>
├── "admin-socket-1"
├── "admin-socket-2"
└── ...

Socket Rooms
├── "admin_room" (all admins)
├── "client_EB-XXXXX" (specific client)
└── "client_EB-YYYYY"
```

## Component Hierarchy

```
RootLayout
├── ClientServiceInitializer (invisible)
│   ├── Initializes RemoteManager
│   ├── Initializes CheckInService
│   └── Initializes ChatService
└── Children
    ├── Page Content
    └── FloatingClientChat (can be on any page)
        ├── FAB Button
        └── Chat Window
            ├── Header
            ├── Message Display
            └── Input Area

AdminLayout
└── AdminPanel
    ├── Left Sidebar
    │   ├── Header
    │   ├── Search Input
    │   ├── Device List
    │   └── Status Indicator
    └── Main Chat Area
        ├── Chat Header
        ├── Device Info
        ├── Message Display
        ├── Quick Actions
        └── Input Area
```

## Data Types

```typescript
// Message
interface Message {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  timestamp: string;
}

// RemoteCommand
interface RemoteCommand {
  action: string;
  payload?: any;
}

// Client (Server DB)
interface ClientDevice {
  clientId: string;
  socketId: string;
  status: 'Online' | 'Offline' | 'Connected' | 'Revoked';
  deviceInfo?: {
    timestamp: string;
    device: string;
    platform: string;
  };
  messages: Message[];
  lastActivity: string;
  createdAt: string;
}

// Socket Handshake Query
interface SocketQuery {
  clientId?: string;
  isAdmin?: 'true' | 'false';
}
```

## Lifecycle Sequence Diagrams

### Initial Load Sequence

```
User Opens App
    │
    ├─> App/Layout loads
    │      │
    │      └─> ClientServiceInitializer mounts
    │             │
    │             ├─> RemoteManager initializes
    │             │      │
    │             │      └─> socket.io-client connects
    │             │             │
    │             │             └─> 'connect' event
    │             │                    │
    │             │                    └─> emit CLIENT_CHECK_IN
    │             │
    │             ├─> CheckInService initializes
    │             │      │
    │             │      └─> Check localStorage['eb_ack']
    │             │             │
    │             │             └─> If not set, start interval
    │             │
    │             └─> ChatService initializes
    │                    │
    │                    └─> Register onCommand listener
    │
    └─> Page renders with FloatingClientChat
           │
           └─> useEffect subscribes to chatService
```

### Check-In Sequence

```
CheckInService (10 second interval)
    │
    ├─> Emit CLIENT_CHECK_IN with device info
    │      │
    │      └─> Server receives
    │             │
    │             ├─> Update client.status = "Online"
    │             ├─> Update client.deviceInfo
    │             ├─> Update client.lastActivity
    │             │
    │             └─> Emit command: CHECK_IN_ACK
    │                    │
    │                    ├─> Send to specific client
    │                    │
    │                    └─> Broadcast to admin_room
    │                           │
    │                           └─> AdminPanel updates
    │
    └─> Client receives CHECK_IN_ACK
           │
           └─> ChatService handles RECEIVE_MESSAGE
                  │
                  └─> Call checkInService.acknowledge()
                         │
                         ├─> Set acknowledged = true
                         ├─> Set localStorage['eb_ack'] = 'true'
                         └─> Clear interval
```

### Message Sequence

```
User types in FloatingClientChat
    │
    └─> Click Send
           │
           └─> chatService.sendMessage(text)
                  │
                  ├─> Add to local messages
                  ├─> Emit MESSAGE_TO_SERVER via RemoteManager
                  │      │
                  │      └─> Server receives
                  │             │
                  │             ├─> Save to client.messages
                  │             │
                  │             └─> Broadcast to admin_room
                  │                    │
                  │                    └─> AdminPanel updates device.messages
                  │
                  └─> UI shows sent message
```

## Error Handling Strategy

```
Client Errors:
├── Socket Connection Failed
│   ├── Logged to console
│   ├── UI shows "Connecting..." state indefinitely
│   └── Auto-reconnect with exponential backoff
│
├── Service Errors
│   ├── Wrapped in try-catch
│   ├── Logged to console
│   └── Graceful degradation
│
└── UI Errors
    ├── Message listener errors caught
    ├── Logged without crashing app
    └── User sees last known state

Server Errors:
├── Invalid Client
│   └─> Emit 'error' event to socket
│
├── Socket Errors
│   ├── Logged to console
│   └─> Graceful disconnect handling
│
└── Handler Errors
    ├── Try-catch in all handlers
    ├── Logged with context
    └── Continue processing
```

## Performance Considerations

```
Optimization Areas:
├── Message History
│   ├── Current: Store all in memory
│   ├── Optimal: Paginate, cache latest 50
│   └── Production: Store in database
│
├── Connection Management
│   ├── Check-in interval: 10 seconds
│   ├── Can be tuned based on requirements
│   └── Max retries: 60 (10 minutes)
│
├── UI Rendering
│   ├── Auto-scroll only on new message
│   ├── Message list virtualization not needed (typically <100)
│   └── Consider virtualization for large histories
│
└── Socket Efficiency
    ├── Enable compression in Socket.IO
    ├── Batch messages if needed
    └── Implement acknowledgment for reliability
```

## Security Architecture

```
Client-Side:
├── Client ID: Generated, not user input
├── LocalStorage: Only stores 'eb_ack' flag
├── Messages: No sensitive data in localStorage
└── Validation: All server data validated

Server-Side:
├── Client Lookup: Required before responding
├── Admin Room: Query parameter validation
├── CORS: Configured for specific origins
├── Error Messages: Generic, no data exposure
└── Graceful Shutdown: Cleanup on SIGINT
```

## Deployment Architecture

```
Development:
npm run dev:full
├── Socket.IO on :3001
└── Next.js on :3000 with hot reload

Production (Single Server):
npm run build && npm start
├── Socket.IO on configured port
├── Next.js on configured port
└── Both in same process

Production (Separated):
├── Frontend: Vercel (Next.js)
│   └── NEXT_PUBLIC_SOCKET_SERVER → Backend URL
└── Backend: Railway/Render/DigitalOcean
    ├── Node.js server
    ├── Socket.IO handler
    ├── Database connection
    └── Redis adapter (optional)
```

This architecture provides a solid, scalable foundation for real-time messaging and device management.
