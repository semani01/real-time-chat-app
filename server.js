// server.js
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES-module equivalents of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Attach Socket.IO to our HTTP server
const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
});

// Serve static files from /public
app.use(express.static(join(__dirname, 'public')));

// Fallback route to send index.html
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('chat message', (msg) => {
        io.emit('chat message', { id: socket.id, text: msg });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
