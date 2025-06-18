import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId:   String,   // socket.id of the sender
    text:       String,   // message content
    timestamp: {          // when it was sent
        type:    Date,
        default: Date.now
    }
});

// Create & export the model
export const Message = mongoose.model('Message', messageSchema);
