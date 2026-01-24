# 📚 Quick Reference Card

## Instant Quick Start

```bash
npm install              # Install dependencies (1 min)
npm run dev:full         # Start everything (2 min)
# Visit: http://localhost:3000/client  (client demo)
# Visit: http://localhost:3000/admin   (admin demo)
```

---

## 📁 Key Files Location

| What | File | Lines |
|-----|------|-------|
| **WebSocket Mgr** | `services/remote-manager.ts` | 140 |
| **Check-In Logic** | `services/checkin-service.ts` | 95 |
| **Messages** | `services/chat-service.ts` | 110 |
| **Client Chat UI** | `components/floating-client-chat.tsx` | 280 |
| **Admin Dashboard** | `components/admin-panel.tsx` | 520 |
| **Bootstrap** | `components/client-service-initializer.tsx` | 30 |
| **Server** | `server.js` | 220 |
| **Config** | `.env.local` | 8 |

---

## 🎯 Common Tasks

### Add Chat to Your Page
```typescript
import { FloatingClientChat } from '@/components';

export default function Page() {
  return <FloatingClientChat />;
}
```

### Change Server URL
Edit `.env.local`:
```bash
NEXT_PUBLIC_SOCKET_SERVER=https://your-server.com
```

### Change Server Port
Edit `.env.local`:
```bash
PORT=3002
NEXT_PUBLIC_SOCKET_PORT=3002
```

### Use Services Directly
```typescript
import { chatService, remoteManager } from '@/services';

// Send message
chatService.sendMessage("Hello");

// Get client ID
const id = remoteManager.getClientId();

// Check connection
const connected = remoteManager.isSocketConnected();

// Subscribe to messages
chatService.subscribe((messages) => {
  console.log(messages);
});
```

---

## 📊 Event Reference

### Client → Server
| Event | Data | Purpose |
|-------|------|---------|
| `CLIENT_CHECK_IN` | `{timestamp, device, platform, clientId}` | Device check-in |
| `MESSAGE_TO_SERVER` | `{text, clientId}` | Send message |

### Server → Client
| Event | Data | Purpose |
|-------|------|---------|
| `command` with `CHECK_IN_ACK` | `{action, payload}` | Acknowledge check-in |
| `command` with `RECEIVE_MESSAGE` | `{action, payload: {text, timestamp}}` | Receive message |

### Server → Admin
| Event | Data |
|-------|------|
| `DEVICE_CHECKIN_NOTIFICATION` | `{clientId, status, deviceInfo}` |
| `DEVICE_DISCONNECTED` | `{clientId, timestamp}` |
| `CLIENT_MESSAGE` | `{clientId, text, timestamp}` |

### Admin → Server
| Event | Data |
|-------|------|
| `SEND_MESSAGE_TO_CLIENT` | `{targetClientId, text}` |
| `ADMIN_REQUEST_ID` | `{targetClientId}` |
| `ADMIN_REQUEST_TRANSACTION_LOG` | `{targetClientId}` |
| `ADMIN_REVOKE_SESSION` | `{targetClientId, reason}` |

---

## 🔌 API Endpoints

```bash
GET /health
# Returns: {"status":"ok","timestamp":"..."}

GET /api/clients
# Returns: [{clientId, status, deviceInfo, messages, ...}]

GET /api/clients/:clientId
# Returns: {clientId, status, deviceInfo, messages, ...}
```

---

## 🎨 UI Components

### FloatingClientChat
```typescript
<FloatingClientChat />

// Props: None required (all optional in future versions)
// States:
// - isOpen: boolean
// - isConnecting: boolean
// - messages: Message[]
```

### AdminPanel
```typescript
<AdminPanel />

// Props: None required
// Features:
// - Device list with search
// - Chat interface
// - Quick action buttons
```

### ClientServiceInitializer
```typescript
<ClientServiceInitializer /> // In root layout only

// Put in: app/layout.tsx
// No props needed
```

---

## 🔑 Key Classes & Interfaces

### RemoteManager
```typescript
remoteManager.emit(event: string, data: any)
remoteManager.onCommand(callback: (cmd) => void): () => void
remoteManager.onConnectionChange(callback: (connected) => void): () => void
remoteManager.isSocketConnected(): boolean
remoteManager.getClientId(): string
remoteManager.disconnect(): void
```

### CheckInService
```typescript
checkInService.acknowledge(): void
checkInService.isAcknowledged(): boolean
checkInService.resetAcknowledgment(): void
checkInService.destroy(): void
```

### ChatService
```typescript
chatService.sendMessage(text: string): void
chatService.subscribe(callback: (messages) => void): () => void
chatService.getMessages(): Message[]
chatService.clearMessages(): void
chatService.getMessageCount(): number
```

### Message Interface
```typescript
interface Message {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  timestamp: string;
}
```

---

## 🚨 Troubleshooting Quick Guide

| Problem | Solution |
|---------|----------|
| Port 3001 in use | Change in `.env.local`: `PORT=3002` |
| Port 3000 in use | Run: `npm run dev -- -p 3001` |
| WebSocket connection fails | Check server is running on 3001 |
| Services not initializing | Check browser console (F12) |
| Messages not appearing | Check network tab (F12) for WebSocket |
| Admin device not showing | Refresh admin page |
| Can't send messages | Check socket connection indicator |

---

## 📊 System Check

```bash
# Verify services installed
npm list socket.io socket.io-client

# Test server health
curl http://localhost:3001/health

# Get all clients
curl http://localhost:3001/api/clients

# Get specific client
curl http://localhost:3001/api/clients/EB-XXXXX
```

---

## 🗂️ Directory Structure

```
services/
  ├── remote-manager.ts       ← Use for socket communication
  ├── checkin-service.ts      ← Use for device check-in logic
  ├── chat-service.ts         ← Use for messaging
  └── index.ts                ← Export point

components/
  ├── floating-client-chat.tsx  ← Import this for client UI
  ├── admin-panel.tsx           ← Import this for admin UI
  ├── client-service-initializer.tsx  ← Put in layout
  └── index.ts                  ← Export point

app/
  ├── api/clients/
  │   ├── route.ts              ← GET /api/clients
  │   └── [clientId]/route.ts   ← GET /api/clients/:clientId
  ├── client/page.tsx           ← Client demo
  ├── admin/page.tsx            ← Admin demo
  └── layout.tsx                ← Add initializer here

server.js                        ← Socket.IO server
.env.local                       ← Configuration
```

---

## 🎯 Deployment Quick Links

| Platform | Time | Link |
|----------|------|------|
| Railway.app | 5 min | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#railway-deployment) |
| Vercel (Frontend) | 10 min | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#vercel-deployment) |
| Docker | 15 min | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#docker-deployment) |
| Single Server | 20 min | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#option-1) |

---

## 📚 Documentation Quick Links

| Doc | Time | Purpose |
|-----|------|---------|
| [START_HERE.md](./START_HERE.md) | 2 min | **Read this first** ⭐ |
| [QUICK_START.md](./QUICK_START.md) | 5 min | Fast setup |
| [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) | 15 min | Detailed setup |
| [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md) | 30 min | Complete reference |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 20 min | System design |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 45 min | Production setup |
| [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) | 30 min | Testing |

---

## 🔄 Flow Diagrams

### Check-In Flow
```
App Start
  ↓
RemoteManager connects
  ↓
CheckInService starts (10s interval)
  ↓
CLIENT_CHECK_IN emitted
  ↓
Server updates status → "Online"
  ↓
Server sends CHECK_IN_ACK
  ↓
CheckInService.acknowledge()
  ↓
Stops interval
```

### Message Flow
```
User sends message
  ↓
chatService.sendMessage()
  ↓
MESSAGE_TO_SERVER emitted
  ↓
Server broadcasts to admin_room
  ↓
AdminPanel receives update
  ↓
Admin replies
  ↓
SEND_MESSAGE_TO_CLIENT emitted
  ↓
Client receives RECEIVE_MESSAGE
  ↓
Message appears in chat
```

---

## 💾 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | Enter (or Shift+Enter for new line) |
| Open DevTools | F12 |
| Toggle chat | Click FAB button |
| Search devices | Type in admin search |
| View console logs | F12 → Console |
| Check network | F12 → Network → WS |

---

## 🎯 Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SOCKET_SERVER` | `http://localhost:3001` | Server URL |
| `NEXT_PUBLIC_SOCKET_PORT` | `3001` | WebSocket port |
| `ALLOWED_ORIGINS` | `http://localhost:*` | CORS origins |
| `NODE_ENV` | `development` | Environment |
| `PORT` | `3001` | Server port |

---

## 📈 Performance Tips

1. **Limit message history** - Paginate for large histories
2. **Enable compression** - Configure in Socket.IO
3. **Use Redis** - For horizontal scaling
4. **Database indexing** - Index clientId and timestamp
5. **Message pagination** - Fetch only recent 50

---

## 🔐 Security Checklist

- [ ] Change admin authentication (not just query param)
- [ ] Add message encryption
- [ ] Enable HTTPS in production
- [ ] Update CORS allowed origins
- [ ] Set strong database password
- [ ] Enable rate limiting
- [ ] Add input validation
- [ ] Log security events

---

## 🆘 Emergency Troubleshooting

```bash
# Kill stuck port
lsof -i :3001    # List processes
kill -9 <PID>    # Kill process

# Reinstall everything
rm -rf node_modules
npm install

# Clear Socket.IO cache
rm -rf .next

# Reset to defaults
rm .env.local
npm install

# Check what's running
ps aux | grep node
ps aux | grep next
```

---

## 📞 Support Resources

- **Quick questions** → Check [QUICK_START.md](./QUICK_START.md)
- **Setup issues** → Check [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
- **Technical details** → Check [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md)
- **Architecture** → Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment** → Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Verification** → Check [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Install dependencies | 1-2 min |
| Start development | 1 min |
| Test system | 5 min |
| Read documentation | 30 min |
| Understand code | 1-2 hours |
| Customize UI | 30 min |
| Add database | 1 hour |
| Deploy to staging | 1-2 hours |
| Deploy to production | 1-2 hours |

---

## ✅ Success Checklist

- [ ] All files present
- [ ] Dependencies installed
- [ ] npm run dev:full works
- [ ] Client page loads
- [ ] Admin page loads
- [ ] Messages send/receive
- [ ] No console errors
- [ ] Documentation reviewed

---

## 🎉 You're All Set!

Everything is ready to use. Start with:

1. **Read**: [START_HERE.md](./START_HERE.md)
2. **Run**: `npm run dev:full`
3. **Visit**: http://localhost:3000/client and /admin
4. **Test**: Send and receive messages
5. **Deploy**: Use [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

Happy coding! 🚀

---

*Last Updated: January 24, 2026 | Version 1.0.0 | Production Ready ✅*
