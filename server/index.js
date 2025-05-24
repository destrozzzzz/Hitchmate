import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser'; // ✅ NEW IMPORT

// Import routes based on your actual file names
import authRoutes from './routes/auth.routes.js';
import rideRoutes from './routes/ride.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js'; // Import the message routes
import kycRoutes from './routes/KycRoutes.js'; // ✅ NEW


// Import Message model to save messages
import Message from './models/Message.js'; // Make sure the path is correct

dotenv.config();

const app = express();
const server = http.createServer(app);

// === SOCKET.IO SETUP ===
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN, // Make sure the origin is correct
    methods: ['GET', 'POST'],
  },
});

// Track users connected to ride rooms
const rideRooms = {};

io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  // Join ride-specific room
  socket.on('join_room', (rideId) => {
    socket.join(rideId);
    if (!rideRooms[rideId]) {
      rideRooms[rideId] = [];
    }
    rideRooms[rideId].push(socket.id);
    console.log(`User ${socket.id} joined ride room: ${rideId}`);
  });

  // Listen for messages
  socket.on('send_message', async ({ rideId, sender, text }) => {
    console.log('Received message data:', { rideId, sender, text });

    const messageData = { rideId, sender, text, timestamp: new Date() };

    try {
      // Save the message to the database
      const newMessage = new Message({
        rideId,
        sender,
        text,
      });

      await newMessage.save();
      console.log('Message saved to database:', newMessage);

      // Emit the message to all users in the ride's room
      io.to(rideId).emit('receive_message', {
        _id: newMessage._id,
        rideId,
        sender,
        text,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Disconnecting
  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected:', socket.id);

    // Remove the user from all rooms
    for (const rideId in rideRooms) {
      const room = rideRooms[rideId];
      const index = room.indexOf(socket.id);
      if (index > -1) {
        room.splice(index, 1); // Remove user from the room
        console.log(`User ${socket.id} removed from ride room: ${rideId}`);
      }
    }
  });
});

// === MIDDLEWARES ===
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser()); // ✅ ENABLE COOKIE SUPPORT

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes); // Use the message routes
app.use('/api/kyc', kycRoutes); // ✅ NEW



// === DB CONNECT & SERVER START ===
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
