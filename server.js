const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// This "clients" object stores the current state and connection of every PWA
// Key: clientId, Value: { socket, state, lastSeen }
const clients = new Map();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/clients', (req, res) => {
  const clientList = [];
  clients.forEach((value, key) => {
    clientList.push({
      clientId: key,
      state: value.state,
      online: value.socket !== null && value.socket.readyState === WebSocket.OPEN,
      lastSeen: value.lastSeen
    });
  });
  res.json(clientList);
});

app.get('/api/clients/:clientId', (req, res) => {
  const { clientId } = req.params;
  const clientRecord = clients.get(clientId);
  if (clientRecord) {
    res.json({
      clientId,
      state: clientRecord.state,
      online: clientRecord.socket !== null && clientRecord.socket.readyState === WebSocket.OPEN,
      lastSeen: clientRecord.lastSeen
    });
  } else {
    res.status(404).json({ error: 'Client not found' });
  }
});

// --- WEBSOCKET LOGIC (Client Communication) ---
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const clientId = url.searchParams.get('clientId');

  if (!clientId) {
    ws.terminate();
    return;
  }

  console.log(`Client Connected: ${clientId}`);
  
  // Register or update client
  clients.set(clientId, {
    socket: ws,
    state: {},
    lastSeen: new Date()
  });

  ws.on('message', (message) => {
    try {
      const { event, data } = JSON.parse(message);
      const clientRecord = clients.get(clientId);

      if (event === 'STATE_UPDATED') {
        console.log(`Update from ${clientId}`);
        clientRecord.state = data;
        clientRecord.lastSeen = new Date();
      }

      if (event === 'HEARTBEAT') {
        clientRecord.lastSeen = new Date();
      }
    } catch (err) {
      console.error('Error parsing client message', err);
    }
  });

  ws.on('close', () => {
    console.log(`Client Disconnected: ${clientId}`);
    // Keep the state in memory, just remove the socket
    const record = clients.get(clientId);
    if (record) record.socket = null;
  });
});

// --- API ROUTES (Dashboard Communication) ---

// 1. Send a command to a specific client
app.post('/api/command', (req, res) => {
  const { clientId, action, payload } = req.body;
  const clientRecord = clients.get(clientId);

  if (!clientRecord || !clientRecord.socket) {
    return res.status(404).json({ error: 'Client not online or not found' });
  }

  // Send the JSON packet to the PWA
  clientRecord.socket.send(JSON.stringify({ action, payload }));
  console.log(`Sent ${action} to ${clientId}`);
  
  res.json({ success: true, message: `Command ${action} dispatched.` });
});

// --- REMOTE CONTROL API ENDPOINTS ---
// 2. Invoke a function on a client
app.post('/api/control/invoke', (req, res) => {
  const { clientId, method, args } = req.body;
  const clientRecord = clients.get(clientId);
  
  if (clientRecord && clientRecord.socket && clientRecord.socket.readyState === WebSocket.OPEN) {
    clientRecord.socket.send(JSON.stringify({ 
      action: 'INVOKE_FUNCTION', 
      payload: { method, args } 
    }));
    return res.json({ success: true, message: `Invoking ${method} on ${clientId}` });
  }
  res.status(404).json({ error: 'Client offline or not found' });
});

// 3. Change Gateway remotely
app.post('/api/control/gateway', (req, res) => {
  const { gatewayId, targetClientId } = req.body;
  
  const command = { action: 'SWITCH_GATEWAY', payload: { gatewayId } };
  
  if (targetClientId) {
    const clientRecord = clients.get(targetClientId);
    if (clientRecord && clientRecord.socket && clientRecord.socket.readyState === WebSocket.OPEN) {
      clientRecord.socket.send(JSON.stringify(command));
      return res.json({ success: true, message: `Switched gateway to ${gatewayId} for ${targetClientId}` });
    }
    return res.status(404).json({ error: 'Target client not found' });
  } else {
    // Broadcast to all connected clients
    clients.forEach((clientRecord) => {
      if (clientRecord.socket && clientRecord.socket.readyState === WebSocket.OPEN) {
        clientRecord.socket.send(JSON.stringify(command));
      }
    });
    res.json({ success: true, message: `Switched gateway to ${gatewayId} globally` });
  }
});

// 4. Process Loan Decision
app.post('/api/control/loan', (req, res) => {
  const { clientId, loanId, status } = req.body;
  const clientRecord = clients.get(clientId);
  
  if (clientRecord && clientRecord.socket && clientRecord.socket.readyState === WebSocket.OPEN) {
    clientRecord.socket.send(JSON.stringify({ 
      action: 'LOAN_DECISION', 
      payload: { loanId, status } 
    }));
    res.json({ success: true, message: `Loan decision sent to ${clientId}` });
  } else {
    res.status(404).json({ error: 'Client not found' });
  }
});




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
  wss.close();
  server.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
