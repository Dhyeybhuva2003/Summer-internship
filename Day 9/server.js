const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an instance of Express
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.io on the server
const io = socketIo(server);

// Set up a simple route
app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
