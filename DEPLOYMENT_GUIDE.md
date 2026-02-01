# Socket.IO Server Deployment Guide

## ✅ Checklist for Final Implementation

### Step 1: Server Installation & Setup

#### Local Development:
```bash
# Install server dependencies
npm install express socket.io cors

# Or use the provided server-package.json:
npm install --prefix . --save-dev express socket.io cors
```

#### Production Deployment Options:

**Option A: Render**
1. Create new Web Service on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. Create new project from repository
3. Railway auto-detects Node.js
4. Add environment variables in dashboard
5. Deploy automatically

**Option C: Local/Docker**
```bash
# Local development
node server.js

# Or with Docker:
docker run -d -p 3001:3001 -e PORT=3001 node:18 node server.js
```

### Step 2: Client Configuration

✅ Already completed:
- `socket.io-client` installed in package.json
- `.env.local` created with `NEXT_PUBLIC_REMOTE_SERVER_URL=http://localhost:3001`
- `hooks/use-socket.ts` hook created for easy Socket.IO integration

Update `.env.local` for production:
```env
NEXT_PUBLIC_REMOTE_SERVER_URL=https://your-server-url.com
```

### Step 3: Usage in Components

Import the socket hook in any component:
```tsx
'use client'
import { useSocket } from '@/hooks/use-socket'

export function YourComponent() {
  const { isConnected, accountNumber, sendData } = useSocket()
  
  return (
    <div>
      Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}
      Account: {accountNumber}
      <button onClick={() => sendData({ test: 'data' })}>
        Send Data
      </button>
    </div>
  )
}
```

### Step 4: Connection Test

1. **Start the server:**
   ```bash
   node server.js
   ```
   Expected output: `📡 Client Online: [Account Number]`

2. **Open the PWA in browser:**
   - Next.js dev: `npm run dev` → visit http://localhost:3000
   - Check browser console (F12) for connection status
   - Check server console for `📡 Client Online` message

3. **Verify server logs show:**
   ```
   🚀 Server running on port 3001
   📡 Client Online: ACC-XXXXXXXXX
   ✅ Connected to server (browser console)
   ```

## 🔧 Server.js Features

- **Health Check**: GET `/health` endpoint
- **Connection Handling**: Logs client online/offline status
- **Data Events**: `data` event for real-time updates
- **Remote Commands**: `command` event for remote control
- **Keep-Alive**: Ping-pong mechanism
- **CORS**: Configured for cross-origin requests
- **Graceful Shutdown**: SIGTERM handling

## 📦 Environment Variables

**Server:**
- `PORT` (default: 3001)
- `NODE_ENV` (production/development)
- `CLIENT_URL` (default: http://localhost:3000)

**Client (.env.local):**
- `NEXT_PUBLIC_REMOTE_SERVER_URL` (required for Socket.IO connection)

## 🐛 Troubleshooting

**Server not connecting?**
- Check `NEXT_PUBLIC_REMOTE_SERVER_URL` matches server address
- Ensure server is running on specified port
- Check CORS configuration in server.js

**Account number not persisting?**
- Client generates account number and stores in localStorage
- Clear browser data to regenerate

**Port already in use?**
```bash
# Find process on port 3001
lsof -i :3001

# Kill it (on Linux/Mac)
kill -9 <PID>
```

## 📊 Monitoring

View real-time logs:
```bash
# Local
node server.js

# Production (Render)
View in Render dashboard → Logs tab

# Production (Railway)
View in Railway dashboard → Deployments
```

---

**✨ All steps completed! Your Socket.IO server is ready for deployment.**
