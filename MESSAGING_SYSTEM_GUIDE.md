# Professional Messaging & Stealth Check-In System

## Overview

This implementation provides a sophisticated, enterprise-grade messaging and stealth check-in system for the Ecobank Express security dashboard. The system ensures reliable client-server communication, background check-ins, and real-time admin monitoring.

## Architecture

### Part 1: Client-Side Services

#### 1. **RemoteManager** (`services/remote-manager.ts`)
The WebSocket connection manager for all client-server communication.

**Features:**
- Automatic socket initialization on client-side
- Connection state management
- Event emission and command listening
- Unique client ID generation and persistence (localStorage)
- Automatic reconnection with exponential backoff
- Error handling and logging

**Key Methods:**
```typescript
remoteManager.emit(event, data)           // Send data to server
remoteManager.onCommand(callback)         // Listen for server commands
remoteManager.onConnectionChange(cb)      // Monitor connection status
remoteManager.isSocketConnected()         // Check current status
remoteManager.getClientId()               // Get unique device ID
```

#### 2. **CheckInService** (`services/checkin-service.ts`)
Stealth background check-in mechanism that ensures the app communicates with the server periodically.

**How it works:**
- Starts a 10-second interval check-in loop when the app initializes
- Sends device info (UA, platform) to the server
- Stops checking in only after receiving `CHECK_IN_ACK` from the server
- Persists acknowledgment status in localStorage (`eb_ack`)
- Max 60 retries before stopping (10 minutes)

**Key Methods:**
```typescript
checkInService.acknowledge()              // Stop check-in (called by server)
checkInService.isAcknowledged()          // Check if server acknowledged
checkInService.resetAcknowledgment()     // Restart check-in process
```

#### 3. **ChatService** (`services/chat-service.ts`)
Real-time bidirectional messaging between client and admin.

**Features:**
- Message queue with unique IDs
- Listener pattern for reactive updates
- Automatic command handling for `RECEIVE_MESSAGE` and `CHECK_IN_ACK`
- Error-safe listener invocation

**Key Methods:**
```typescript
chatService.sendMessage(text)             // Send message to server
chatService.subscribe(callback)           // Subscribe to message updates
chatService.getMessages()                 // Get current message history
chatService.clearMessages()               // Clear message history
```

### Part 2: Client-Side Components

#### 1. **ClientServiceInitializer** (`components/client-service-initializer.tsx`)
A non-rendering component that initializes all services on app startup.
- Runs in the root layout
- Ensures RemoteManager, CheckInService, and ChatService are initialized
- Provides cleanup on unmount

#### 2. **FloatingClientChat** (`components/floating-client-chat.tsx`)
A professional, mobile-friendly chat interface for end users.

**Features:**
- Floating Action Button (FAB) in bottom-right
- High-quality "Connecting to Secure Support..." animation
- Connection state indicator with pulse effect
- Message thread with client/admin bubble differentiation
- Auto-scroll to latest messages
- Real-time status updates
- Message timestamps
- Ecobank color scheme (#004A9F)

### Part 3: Admin Dashboard

#### **AdminPanel** (`components/admin-panel.tsx`)
Enterprise-grade admin management interface.

**Left Sidebar:**
- Real-time device list with search
- Status indicators (Online/Offline/Connected/Revoked)
- Device selection
- Connection status

**Center Panel:**
- Large chat window with device context
- Device info (Platform, Last Activity)
- Message thread
- Quick action buttons:
  - **Ask for ID**: Request ID verification
  - **Acknowledge**: Send acknowledgment signal
  - **Request Log**: Request transaction logs
  - **Revoke**: Revoke device session
- Message input

### Part 4: Server-Side Integration

#### **Socket.IO Server** (`server.js`)
Node.js server handling WebSocket connections and messaging.

**Handlers:**

1. **CLIENT_CHECK_IN**
   - Receives: Device UA, platform, timestamp
   - Action: Updates client status to "Online"
   - Response: Sends back `CHECK_IN_ACK` command
   - Broadcasts: Notifies admins with `DEVICE_CHECKIN_NOTIFICATION`

2. **MESSAGE_TO_SERVER**
   - Receives: Message text from client
   - Stores: In client's message history
   - Broadcasts: To admin room via `CLIENT_MESSAGE`

3. **SEND_MESSAGE_TO_CLIENT**
   - Target: Specific client by ID
   - Action: Sends `RECEIVE_MESSAGE` command to client
   - Storage: Persists in client message history

4. **ADMIN_REQUEST_ID**
   - Sends `REQUEST_ID_VERIFICATION` to target client

5. **ADMIN_REQUEST_TRANSACTION_LOG**
   - Sends `REQUEST_TRANSACTION_LOG` to target client

6. **ADMIN_REVOKE_SESSION**
   - Sends `SESSION_REVOKED` command to client
   - Updates client status to "Revoked"

**In-Memory Database:**
```javascript
clients[clientId] = {
  socketId,
  status,           // "Online" | "Offline" | "Connected" | "Revoked"
  deviceInfo,       // {timestamp, device, platform}
  messages,         // Message history
  lastActivity,
  createdAt
}
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

This installs:
- `socket.io` - Server WebSocket library
- `socket.io-client` - Client WebSocket library
- `concurrently` - Run server and Next.js dev simultaneously

### 2. Environment Configuration
The `.env.local` file is pre-configured with:
```
NEXT_PUBLIC_SOCKET_SERVER=http://localhost:3001
NEXT_PUBLIC_SOCKET_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NODE_ENV=development
PORT=3001
```

### 3. Running the System

**Option A: Full Development Mode**
```bash
npm run dev:full
```
This runs both the Socket.IO server (port 3001) and Next.js app (port 3000) concurrently.

**Option B: Manual**
```bash
# Terminal 1: Start Socket.IO server
npm run server

# Terminal 2: Start Next.js development
npm run dev
```

## Usage

### Client-Side Integration

Simply add the floating chat to any page:

```typescript
import { FloatingClientChat } from '@/components/floating-client-chat';

export default function Page() {
  return (
    <div>
      <h1>My App</h1>
      <FloatingClientChat />
    </div>
  );
}
```

The `ClientServiceInitializer` in `app/layout.tsx` ensures services are running globally.

### Admin Dashboard Integration

Create an admin page:

```typescript
import { AdminPanel } from '@/components/admin-panel';

export default function AdminPage() {
  return <AdminPanel />;
}
```

## Data Flow

### Check-In Flow
```
Client App Start
    ↓
ClientServiceInitializer initializes
    ↓
RemoteManager establishes WebSocket connection
    ↓
CheckInService starts 10-second interval
    ↓
CLIENT_CHECK_IN emitted to server
    ↓
Server receives, updates client status
    ↓
Server emits CHECK_IN_ACK command
    ↓
Client receives, calls checkInService.acknowledge()
    ↓
CheckInService stops interval
    ↓
Admin sees device as "Online"
```

### Message Flow
```
User sends message
    ↓
chatService.sendMessage() called
    ↓
MESSAGE_TO_SERVER emitted
    ↓
Server receives, broadcasts to admin room
    ↓
AdminPanel receives CLIENT_MESSAGE
    ↓
Message displayed in chat
    ↓
Admin sends reply via SEND_MESSAGE_TO_CLIENT
    ↓
Server emits RECEIVE_MESSAGE to client
    ↓
Client receives command
    ↓
ChatService adds message
    ↓
Message displayed in FloatingClientChat
```

## Error Handling

### Client-Side
- All service methods wrapped in try-catch
- Socket emit failures logged and handled gracefully
- Connection state monitoring with fallback UI
- Max retry limits for check-in

### Server-Side
- Client validation before operations
- Error emissions for failed requests
- Graceful disconnect handling
- SIGINT handler for cleanup

## Security Considerations

1. **Client ID**: Unique per device, persisted in localStorage
2. **Admin Socket**: Identified via query parameter (can be enhanced with JWT)
3. **CORS**: Configured for allowed origins
4. **Message Storage**: Currently in-memory (add database for persistence)
5. **Error Messages**: Detailed on client, generic on admin

## Advanced Features

### 1. Auto-Responder AI (Concept)
When implementing AI responses:
```typescript
// In server.js MESSAGE_TO_SERVER handler
if (message.includes('loan')) {
  const loanStatus = clients[clientId].state.loans;
  const aiResponse = await aiAgent.generateResponse(loanStatus);
  io.to(`client_${clientId}`).emit('command', {
    action: 'RECEIVE_MESSAGE',
    payload: { text: aiResponse }
  });
}
```

### 2. Message Persistence
Replace in-memory `clients` object with a database:
```typescript
// Example: Mongoose schema
const messageSchema = new Schema({
  clientId: String,
  sender: String,
  text: String,
  timestamp: Date
});
```

### 3. Enhanced Authentication
Replace query-based admin auth with JWT tokens:
```typescript
const token = socket.handshake.auth.token;
const admin = verifyJWT(token);
```

## Troubleshooting

### "WebSocket connection failed"
- Ensure Socket.IO server is running on port 3001
- Check `NEXT_PUBLIC_SOCKET_SERVER` environment variable
- Verify CORS settings in server.js

### Messages not appearing
- Check browser console for errors
- Verify socket connection status (Connection indicator)
- Ensure server and client use same socket.io versions

### Check-in not stopping
- Check browser localStorage for `eb_ack` key
- Verify server is sending `CHECK_IN_ACK` on check-in
- Review server logs for CLIENT_CHECK_IN events

## File Structure
```
/services
  ├── remote-manager.ts          # WebSocket connection manager
  ├── checkin-service.ts         # Stealth check-in logic
  └── chat-service.ts            # Message management

/components
  ├── client-service-initializer.tsx  # Service initialization
  ├── floating-client-chat.tsx        # Client chat UI
  └── admin-panel.tsx                 # Admin dashboard

server.js                         # Socket.IO server
.env.local                        # Environment config
```

## API Endpoints

### REST (Express)
- `GET /health` - Server health check
- `GET /api/clients` - List all connected clients
- `GET /api/clients/:clientId` - Get specific client info

### WebSocket Events

**Client → Server:**
- `CLIENT_CHECK_IN` - Device check-in
- `MESSAGE_TO_SERVER` - Send message

**Server → Client:**
- `command` - Receive commands
- `CHECK_IN_ACK` - Check-in acknowledgment
- `RECEIVE_MESSAGE` - Receive admin message

**Admin → Server:**
- `SEND_MESSAGE_TO_CLIENT` - Send message to specific client
- `ADMIN_REQUEST_ID` - Request ID verification
- `ADMIN_REQUEST_TRANSACTION_LOG` - Request transaction log
- `ADMIN_REVOKE_SESSION` - Revoke client session

**Server → Admin:**
- `DEVICE_CHECKIN_NOTIFICATION` - New device check-in
- `DEVICE_DISCONNECTED` - Device disconnected
- `CLIENT_MESSAGE` - Message from client

## Performance Optimization

1. **Message History Limits**: Consider capping messages per client
2. **Connection Pooling**: Use Redis for distributed deployments
3. **Message Compression**: Enable Socket.IO compression
4. **Database Indexing**: Index clientId, timestamp for queries

## Future Enhancements

- [ ] Message encryption (end-to-end)
- [ ] File transfer capability
- [ ] Voice/video call integration
- [ ] Message search functionality
- [ ] Message delivery receipts
- [ ] Typing indicators
- [ ] AI-powered auto-responses
- [ ] Message rate limiting
- [ ] Admin multi-device support
- [ ] Message export/archive
