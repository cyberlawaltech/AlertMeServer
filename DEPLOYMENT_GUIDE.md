# Deployment Guide

This guide helps you deploy the Messaging & Check-In System to production.

## Prerequisites

- Node.js 18+ runtime
- A hosting platform that supports both WebSocket and HTTP (Vercel, Railway, Heroku, DigitalOcean, etc.)
- Environment variables configured

## Environment Variables

Create a `.env.production` file (or set via deployment platform):

```bash
# Socket.IO Server
NEXT_PUBLIC_SOCKET_SERVER=https://your-server-domain.com
NEXT_PUBLIC_SOCKET_PORT=443
ALLOWED_ORIGINS=https://your-app-domain.com

# Node
NODE_ENV=production
PORT=3001
```

## Deployment Strategies

### Option 1: Single Server Deployment (Recommended for Testing)

Deploy both Next.js and Socket.IO server on a single instance.

**Platforms Supporting This:**
- Railway.app
- Render.com
- DigitalOcean App Platform
- Heroku
- Fly.io

**Steps:**

1. **Railway.app** (Easiest)
   ```bash
   npm install -g railway
   railway login
   railway init
   railway up
   ```

2. **Render.com**
   - Push to GitHub
   - Create new Web Service
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Add environment variables
   - Add port: `3000`

3. **Heroku**
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

### Option 2: Separate Services (Recommended for Production)

Deploy Next.js and Socket.IO server separately for better scalability.

#### Frontend (Next.js) on Vercel

1. Push code to GitHub
2. Import repo to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SOCKET_SERVER`: https://socket-server-url.com
   - `NEXT_PUBLIC_SOCKET_PORT`: 443
4. Deploy

#### Backend (Socket.IO) on Railway/Render

1. Create a new `vercel-server.js` (Vercel adapter):
   ```javascript
   // Use the server.js with Vercel handler
   const http = require('http');
   const { Server } = require('socket.io');
   
   // Vercel serverless handler pattern...
   ```

2. Or use a standalone service:
   - Railway: `npm run server`
   - Render: `npm run server` on port 3001
   - DigitalOcean: Docker deployment

### Option 3: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build Next.js
RUN npm run build

# Expose both ports
EXPOSE 3000 3001

# Run server and next together
CMD ["sh", "-c", "npm run server & npm start"]
```

Build and deploy:

```bash
docker build -t ecobank-dashboard .
docker run -p 3000:3000 -p 3001:3001 \
  -e NEXT_PUBLIC_SOCKET_SERVER=https://localhost:3001 \
  ecobank-dashboard
```

## Database Persistence (Important!)

By default, client data is stored in-memory and lost on server restart.

### Add MongoDB for Persistence

1. **Install Mongoose**
   ```bash
   npm install mongoose
   ```

2. **Create Models** (`server/models/Client.js`):
   ```javascript
   const mongoose = require('mongoose');

   const clientSchema = new mongoose.Schema({
     clientId: { type: String, unique: true, required: true },
     status: { type: String, default: 'Offline' },
     deviceInfo: Object,
     messages: [
       {
         sender: String,
         text: String,
         timestamp: Date
       }
     ],
     lastActivity: Date,
     createdAt: { type: Date, default: Date.now }
   });

   module.exports = mongoose.model('Client', clientSchema);
   ```

3. **Update server.js**:
   ```javascript
   const mongoose = require('mongoose');
   const Client = require('./models/Client');

   mongoose.connect(process.env.MONGODB_URI);

   // Replace in-memory clients object with database queries
   socket.on('CLIENT_CHECK_IN', async (data) => {
     const clientId = socket.handshake.query.clientId;
     let client = await Client.findOne({ clientId });
     
     if (!client) {
       client = new Client({ clientId, ...data });
     } else {
       client.status = 'Online';
       client.deviceInfo = data;
       client.lastActivity = new Date();
     }
     
     await client.save();
     // ... rest of handler
   });
   ```

4. **Set MongoDB URI** in environment:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecobank
   ```

### Use Firebase Firestore Alternative

```javascript
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Store/update client
await db.collection('clients').doc(clientId).set({
  status: 'Online',
  lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  // ...
});
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Enable CORS for your domain only
- [ ] Implement JWT authentication for admin panel
- [ ] Rate limit Socket.IO connections
- [ ] Add message encryption
- [ ] Validate all inputs on server
- [ ] Use HTTPS WebSocket (WSS)
- [ ] Add request validation middleware
- [ ] Enable helmet.js for security headers
- [ ] Regular security audits

## Scaling Considerations

### Redis for Horizontal Scaling

When running multiple server instances, use Redis adapter:

```bash
npm install socket.io-redis
```

```javascript
const { createAdapter } = require('socket.io-redis');
const { io } = require('socket.io');
const redis = require('redis');

const pubClient = redis.createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Load Balancing

Use an HTTP load balancer (nginx, HAProxy) to distribute traffic:

```nginx
upstream socket_servers {
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}

server {
  listen 443 ssl;
  server_name api.example.com;

  location / {
    proxy_pass http://socket_servers;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

## Monitoring & Logging

### Add Logging Service (Winston/Bunyan)

```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

socket.on('CLIENT_CHECK_IN', (data) => {
  logger.info('Client check-in', { clientId, data });
});
```

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    clients: Object.keys(clients).length
  });
});
```

## Vercel Deployment (Next.js Only)

If deploying frontend to Vercel and backend elsewhere:

1. **Connect GitHub Repository**
   - Go to vercel.com
   - Import your repository
   - Select "Next.js" framework

2. **Set Environment Variables**
   - `NEXT_PUBLIC_SOCKET_SERVER`: Your backend URL
   - `NEXT_PUBLIC_SOCKET_PORT`: Usually 443 for HTTPS

3. **Build Settings**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Deploy**
   - Vercel automatically deploys on push to main

## Railway Deployment (Full Stack)

Simplest option for deploying everything together:

1. **Create Railway Account**
   - Sign up at railway.app

2. **Connect GitHub**
   - Authorize Railway to access your repos

3. **Create New Service**
   - Select repository
   - Railway auto-detects Node.js
   - Configure:
     - Build Command: `npm install`
     - Start Command: `npm run dev:full`

4. **Add Environment Variables**
   - Port: 3000 (frontend)
   - NEXT_PUBLIC_SOCKET_SERVER: `https://your-railway-url.railway.app`

5. **Deploy**
   - Railway automatically deploys on push

## Testing Production Deployment

```bash
# Test client connection
curl https://your-domain/health

# Check Socket connection
node -e "
const io = require('socket.io-client');
const socket = io('https://your-domain', { query: { clientId: 'TEST' } });
socket.on('connect', () => {
  console.log('Connected!');
  process.exit(0);
});
"

# Monitor logs
railway logs
```

## Rollback Procedure

### If using Git:
```bash
git revert <commit-hash>
git push
# Service redeploys automatically
```

### If using Docker:
```bash
docker pull your-repo:previous-tag
docker run -p 3000:3000 -p 3001:3001 your-repo:previous-tag
```

### If using Railway:
1. Go to Deployments
2. Select previous successful deployment
3. Click "Redeploy"

## Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Socket.IO Adapter Settings**
   ```javascript
   io.engine.maxHttpBufferSize = 1e6; // 1MB
   io.engine.pingInterval = 25000;
   io.engine.pingTimeout = 20000;
   ```

3. **Message Pagination** (for long chat histories)
   ```javascript
   app.get('/api/clients/:clientId/messages?limit=50&offset=0');
   ```

## Maintenance

- Monitor error logs daily
- Clear old messages periodically
- Update dependencies monthly
- Test disaster recovery quarterly
- Review security logs weekly

## Support & Troubleshooting

See [MESSAGING_SYSTEM_GUIDE.md](./MESSAGING_SYSTEM_GUIDE.md) for:
- Architecture details
- API reference
- Troubleshooting guide
- Advanced configuration
