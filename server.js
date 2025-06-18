// server.js
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Message } from './models/Message.js';  // your Mongoose model

// 1. Load environment variables from .env
dotenv.config();

// 2. ES-module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 3. Create Express app & HTTP server
const app = express();
const httpServer = createServer(app);

// 4. Attach Socket.IO with CORS enabled
const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
});

// 5. Serve your static front-end
app.use(express.static(join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/index.html'));
});

// 6. Connect to MongoDB, then start listening
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('✅ MongoDB connected');

        // 7. Handle WebSocket connections
        io.on('connection', async (socket) => {
            console.log(`User connected: ${socket.id}`);

            // 7a. Send the last 20 messages to the newly connected client
            try {
                const recent = await Message
                    .find({})
                    .sort({ timestamp: -1 })
                    .limit(20)
                    .lean();
                socket.emit('chat history', recent.reverse());
            } catch (err) {
                console.error('Error loading chat history:', err);
            }

            // 7b. Listen for new chat messages, save them, then broadcast
            socket.on('chat message', async (msg) => {
                try {
                    const saved = await Message.create({
                        senderId: socket.id,
                        text:     msg
                    });
                    io.emit('chat message', {
                        id:        saved.senderId,
                        text:      saved.text,
                        timestamp: saved.timestamp
                    });
                } catch (err) {
                    console.error('Error saving message:', err);
                }
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });

        // 8. Finally, start the HTTP+WebSocket server
        const PORT = process.env.PORT || 3000;
        httpServer.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });
