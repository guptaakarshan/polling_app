/**
 * Socket.io Handler for Real-time Poll Updates
 * 
 * Flow:
 * 1. Client connects and joins poll-specific room
 * 2. When vote occurs, server emits update to all clients in that room
 * 3. All viewers see real-time results without page refresh
 */
export const setupPollSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    /**
     * Join a poll room
     * Each poll has its own room identified by pollId
     * This allows targeted updates only to viewers of that specific poll
     */
    socket.on('joinPoll', (pollId) => {
      if (!pollId) {
        socket.emit('error', { message: 'Poll ID is required' });
        return;
      }

      socket.join(pollId);
      console.log(`Socket ${socket.id} joined poll room: ${pollId}`);
    });

    /**
     * Leave a poll room
     * Called when user navigates away from poll page
     */
    socket.on('leavePoll', (pollId) => {
      if (pollId) {
        socket.leave(pollId);
        console.log(`Socket ${socket.id} left poll room: ${pollId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

/**
 * Emit vote update to all clients in a poll room
 * Called from REST API after successful vote
 * 
 * @param {Object} io - Socket.io instance
 * @param {String} pollId - Poll identifier
 * @param {Object} updatedPoll - Updated poll data with new vote counts
 */
export const emitVoteUpdate = (io, pollId, updatedPoll) => {
  io.to(pollId).emit('voteUpdate', updatedPoll);
};