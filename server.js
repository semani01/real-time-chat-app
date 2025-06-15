import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';

const app = express();
const httpServer = createServer(app);

// Attach Socket.IO to our HTTP server
const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }       // allows connections from any origin
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// WebSocket connection handler
io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`);

    // Listen for 'chat message' events from clients
    socket.on('chat message', msg => {
        // Broadcast the message to all connected clients
        io.emit('chat message', { id: socket.id, text: msg });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Fallback route (in case someone hits / directly)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Use httpServer instead of app.listen
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
