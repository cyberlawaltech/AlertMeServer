const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

// BROAD CORS POLICY - DO NOT CHANGE THIS UNTIL CONNECTED
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true // Support older socket versions if necessary
});

io.on('connection', (socket) => {
  const clientId = socket.handshake.query.clientId;
  console.log(`\x1b[32m[CONNECTED]\x1b[0m Client ID: ${clientId} (Socket: ${socket.id})`);

  socket.emit('command', { action: 'CONNECT_SUCCESS', payload: { message: "Shadow Bridge Active" } });

  socket.on('disconnect', () => {
    console.log(`\x1b[31m[DISCONNECTED]\x1b[0m Client: ${clientId}`);
  });
});

// Use 0.0.0.0 to ensure it's visible on your local network
const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ====================================
  🚀 SHADOW SERVER RUNNING ON PORT ${PORT}
  📡 URL: http://localhost:${PORT}
  📱 IF ON PHONE: http://YOUR_COMPUTER_IP:${PORT}
  ====================================
  `);
});
