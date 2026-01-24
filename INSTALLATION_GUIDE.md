# Installation Guide

This guide walks you through installing and setting up the Professional Messaging & Stealth Check-In System.

## System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or pnpm, yarn)
- **OS**: Linux, macOS, or Windows (with WSL2 recommended)
- **RAM**: 2GB minimum (4GB recommended)
- **Disk**: 500MB available space

## Step 1: Clone or Navigate to Project

If you haven't already, navigate to your project directory:

```bash
cd /path/to/v0-cyber-security-dashboard
```

## Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Using pnpm (faster):
```bash
pnpm install
```

Using yarn:
```bash
yarn install
```

This will install:
- **socket.io** - Server WebSocket library
- **socket.io-client** - Client WebSocket library
- **concurrently** - Run multiple processes
- **next** - React framework
- All other UI and utility dependencies

Installation may take 2-5 minutes depending on your internet speed and system.

## Step 3: Verify Installation

Check that key packages are installed:

```bash
npm list socket.io socket.io-client next
```

Expected output:
```
my-v0-project@0.1.0
├── socket.io@^4.7.2
├── socket.io-client@^4.7.2
└── next@16.0.10
```

If any package is missing, run:
```bash
npm install socket.io socket.io-client concurrently
```

## Step 4: Configure Environment Variables

The project comes with a default `.env.local` file. If it doesn't exist, create one:

```bash
cat > .env.local << 'EOF'
# Socket.IO Server Configuration
NEXT_PUBLIC_SOCKET_SERVER=http://localhost:3001
NEXT_PUBLIC_SOCKET_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Node Environment
NODE_ENV=development

# Server Port
PORT=3001
EOF
```

### Environment Variables Reference

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_SOCKET_SERVER` | Backend server URL (public) | `http://localhost:3001` |
| `NEXT_PUBLIC_SOCKET_PORT` | WebSocket port (public) | `3001` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:*` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3001` |

## Step 5: Run the Development Server

### Option A: Run Everything Together (Recommended)

```bash
npm run dev:full
```

This command:
- Starts Socket.IO server on port 3001
- Starts Next.js dev server on port 3000
- Watches for file changes and hot reloads

Output should look like:
```
> my-v0-project@0.1.0 dev:full
> concurrently "npm run server" "npm run dev"

[0] 
[0] > npm run server
[0] 
[0] > node server.js
[0] [SERVER] Running on port 3001
[0] [SERVER] Environment: development
[1]
[1] > npm run dev
[1] 
[1] ▲ Next.js 16.0.10
[1] - Local: http://localhost:3000
...
```

### Option B: Run Separately (For Debugging)

**Terminal 1 - Start Socket.IO Server:**
```bash
npm run server
```

Wait for:
```
[SERVER] Running on port 3001
```

**Terminal 2 - Start Next.js Development:**
```bash
npm run dev
```

Wait for:
```
▲ Next.js 16.0.10
- Local: http://localhost:3000
```

## Step 6: Test the Setup

### Test 1: Check Server Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-24T..."}
```

### Test 2: Client Application

1. Open browser to: **http://localhost:3000/client**
2. You should see the Ecobank Express welcome page
3. Click the message button (bottom-right corner)
4. You should see "Connecting to Secure Support..." animation
5. After a few seconds, the connection should establish
6. Try sending a test message

### Test 3: Admin Dashboard

1. Open a new browser tab: **http://localhost:3000/admin**
2. You should see the Admin Dashboard
3. In the left sidebar, you should see your client device listed
4. Click on it to open the chat
5. You should see your test message from Step 2

If you send a reply from admin, it should appear in the client chat.

## Step 7: Verify File Structure

Ensure the following files were created during setup:

```
✓ services/
  ├── remote-manager.ts
  ├── checkin-service.ts
  ├── chat-service.ts
  └── index.ts

✓ components/
  ├── client-service-initializer.tsx
  ├── floating-client-chat.tsx
  ├── admin-panel.tsx
  └── index.ts

✓ app/
  ├── api/clients/
  │   ├── route.ts
  │   └── [clientId]/route.ts
  ├── admin/page.tsx
  ├── client/page.tsx
  └── layout.tsx (updated)

✓ server.js
✓ .env.local
✓ package.json (updated with new scripts)
```

## Troubleshooting

### Issue: "Cannot find module 'socket.io-client'"

**Solution:**
```bash
npm install socket.io-client @types/node --save
npm install
```

### Issue: Port 3001 Already in Use

**Option 1:** Change port in `.env.local`
```bash
PORT=3002
NEXT_PUBLIC_SOCKET_PORT=3002
```

**Option 2:** Kill the process using port 3001
```bash
# On macOS/Linux
lsof -i :3001
kill -9 <PID>

# On Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Issue: Port 3000 Already in Use

**Solution:** Change Next.js port
```bash
npm run dev -- -p 3001
```

Then update `.env.local`:
```bash
NEXT_PUBLIC_SOCKET_SERVER=http://localhost:3002
```

### Issue: Module Not Found: 'express'

Server requires Express, but it may not be installed:

```bash
npm install express cors
```

### Issue: Services Not Initializing

Check browser console (F12) for errors. Ensure:
1. Socket server is running (`npm run server`)
2. Next.js is running (`npm run dev`)
3. No port conflicts
4. `.env.local` has correct server URL

### Issue: WebSocket Connection Failed

Add console logging to diagnose:

```typescript
// In services/remote-manager.ts, add:
console.log('[RemoteManager] Attempting connection to:', serverUrl);

// Check browser Network tab (F12 > Network > WS)
// Look for WebSocket connection attempts
```

## Next Steps

1. **Read Quick Start Guide**: [QUICK_START.md](./QUICK_START.md)
2. **Understand Architecture**: [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md)
3. **Plan Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. **Customize Components**: Modify colors, messages, and behavior
5. **Add Database**: Persist data with MongoDB or Firebase

## Common Tasks

### Add the Chat to Your Existing Page

```typescript
import { FloatingClientChat } from '@/components';

export default function MyPage() {
  return (
    <div>
      <h1>My Content</h1>
      <FloatingClientChat />
    </div>
  );
}
```

### Change Server Port

Edit `.env.local`:
```bash
PORT=3002
NEXT_PUBLIC_SOCKET_PORT=3002
NEXT_PUBLIC_SOCKET_SERVER=http://localhost:3002
```

### Access Admin Dashboard Programmatically

```bash
curl http://localhost:3001/api/clients
curl http://localhost:3001/api/clients/EB-XXXXX
```

## Getting Help

- **Stuck?** Check the [QUICK_START.md](./QUICK_START.md) for common issues
- **Need Details?** See [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md)
- **Deploying?** Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Browser Console**: Press F12 to see detailed error messages
- **Server Logs**: Check terminal running `npm run server`

## Performance Notes

### Development Mode
- Hot reload enabled
- Unoptimized code
- Detailed error messages
- Slower than production

### Production Mode
```bash
npm run build
npm start
```

- Optimized bundle (60% smaller)
- Faster performance
- Minimal error output

## Advanced Setup

### Using Docker

```bash
docker build -t ecobank-dashboard .
docker run -p 3000:3000 -p 3001:3001 ecobank-dashboard
```

### Using Database (MongoDB)

1. Create MongoDB cluster (MongoDB Atlas)
2. Install Mongoose: `npm install mongoose`
3. Update `server.js` to use database
4. Set `MONGODB_URI` environment variable

### Using Docker Compose

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
  mongo:
    image: mongo
    ports:
      - "27017:27017"
```

## Security Checklist for Development

- [ ] Never commit `.env.local` with production keys
- [ ] Use strong client authentication tokens
- [ ] Validate all socket messages on server
- [ ] Test error handling and edge cases
- [ ] Review console for warnings and errors
- [ ] Test on mobile devices

## Success Indicators

Your setup is complete when:

✅ `npm run dev:full` starts without errors
✅ Client page loads at http://localhost:3000/client  
✅ Admin page loads at http://localhost:3000/admin
✅ Message button appears and opens chat
✅ Client device appears in admin panel
✅ Messages can be sent and received
✅ No errors in browser console or terminal

## What's Next?

1. **Customize UI**: Modify colors and styling
2. **Add Features**: Implement auto-responses or file uploads
3. **Add Security**: Implement authentication and encryption
4. **Add Database**: Persist data across server restarts
5. **Deploy**: Use Deployment Guide for production setup

---

**Need Help?** Check the documentation files or review the browser console (F12) for detailed error messages.
