# Quick Start Guide - Messaging & Check-In System

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

This installs Socket.IO and other required packages.

### 2. Start the Full Stack
```bash
npm run dev:full
```

This runs both the Socket.IO server (port 3001) and Next.js app (port 3000) simultaneously.

### 3. Test the System

**Client Test:**
- Open `http://localhost:3000/client` in your browser
- Click the message button in the bottom-right
- Wait for the "Connecting to Secure Support..." animation
- Send a test message

**Admin Test:**
- Open `http://localhost:3000/admin` in a new tab
- You should see your client device appear in the left sidebar
- Select it and reply to messages
- Use quick action buttons (Ask for ID, Acknowledge, etc.)

## 📁 File Structure

```
services/
  ├── remote-manager.ts        ← WebSocket handler
  ├── checkin-service.ts       ← Background check-in logic
  ├── chat-service.ts          ← Message management
  └── index.ts                 ← Exports

components/
  ├── client-service-initializer.tsx  ← Initializes services
  ├── floating-client-chat.tsx        ← Client UI
  ├── admin-panel.tsx                 ← Admin UI
  └── index.ts                        ← Exports

app/
  ├── api/clients/              ← REST API for client data
  ├── client/page.tsx           ← Client demo page
  ├── admin/page.tsx            ← Admin demo page
  └── layout.tsx                ← Root layout with services

server.js                        ← Socket.IO server
.env.local                       ← Environment config
MESSAGING_SYSTEM_GUIDE.md        ← Full documentation
```

## 🔌 Integration Example

To add the messaging system to an existing page:

```typescript
import { FloatingClientChat } from '@/components';

export default function MyPage() {
  return (
    <div>
      <h1>My App</h1>
      {/* Services are initialized globally, just add the chat component */}
      <FloatingClientChat />
    </div>
  );
}
```

That's it! The services handle everything:
- ✅ WebSocket connection
- ✅ Background check-in
- ✅ Message management
- ✅ Error handling

## 🔍 Key Features

### Client-Side
- **Stealth Check-In**: App keeps "ringing home" until acknowledged
- **Real-Time Messaging**: Instant bidirectional communication
- **Automatic Reconnection**: Handles network interruptions
- **Unique Device ID**: Auto-generated and persistent

### Admin-Side
- **Device Monitoring**: Real-time list of connected clients
- **Chat Interface**: Professional messaging with timestamps
- **Quick Actions**: Pre-built commands (ID request, ACK, etc.)
- **Search**: Find devices by ID

## 🎨 Customization

### Change Ecobank Blue Color
Replace `#004A9F` with your brand color in:
- `components/floating-client-chat.tsx`
- `components/admin-panel.tsx`

### Modify Check-In Interval
Edit `services/checkin-service.ts`:
```typescript
setInterval(() => {
  // Change 10000 (10 seconds) to your desired interval
}, 10000);
```

### Extend Quick Actions
In `components/admin-panel.tsx`, add new buttons to `handleQuickAction()`.

## 📊 Architecture

```
User Opens App
    ↓
ClientServiceInitializer initializes
    ↓
RemoteManager connects to WebSocket
    ↓
CheckInService starts background polling
    ↓
Server receives CLIENT_CHECK_IN
    ↓
Server sends CHECK_IN_ACK
    ↓
CheckInService stops polling
    ↓
Admin sees device as "Online"
    ↓
User can now chat with admin
```

## 🐛 Troubleshooting

**Q: Socket connection failed**
- Check if `npm run server` is running on port 3001
- Verify `.env.local` has correct `NEXT_PUBLIC_SOCKET_SERVER`

**Q: No devices appearing in Admin panel**
- Refresh the Admin page
- Check browser console for errors
- Ensure both server and client are running

**Q: Messages not appearing**
- Check browser Network tab (WebSocket)
- Verify Socket.IO server logs for message events
- Ensure `FloatingClientChat` component is rendered

**Q: Check-in not stopping**
- Check localStorage for `eb_ack` key
- Verify server sends `CHECK_IN_ACK` (check console logs)
- Restart the app to reset

## 📚 Next Steps

1. **Persist Messages**: Replace in-memory storage with a database
2. **Add Authentication**: Implement JWT for admin security
3. **Message Encryption**: Use TweetNaCl for end-to-end encryption
4. **AI Responses**: Integrate LLM for auto-responses
5. **Analytics**: Track message metrics and response times

## 🔐 Security Notes

- Client IDs are unique but visible (consider adding encryption)
- Admin access is currently open (add authentication)
- Messages are in-memory (add database for persistence)
- Consider HTTPS in production

## 📞 Support

For detailed documentation, see `MESSAGING_SYSTEM_GUIDE.md`
