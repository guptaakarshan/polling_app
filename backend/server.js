import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import pollRoutes from './routes/polls.js';
import { setupPollSocket, emitVoteUpdate } from './sockets/pollSocket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Make io instance available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/polls', pollRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io handlers
setupPollSocket(io);

// Export emitVoteUpdate for use in routes
export { emitVoteUpdate };

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});