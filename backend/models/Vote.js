import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * FAIRNESS CONTROL #1: Session-based voting
 * This compound unique index ensures one vote per session per poll.
 * Prevents: Multiple votes from same browser session
 */
voteSchema.index({ pollId: 1, sessionId: 1 }, { unique: true });

// Index for efficient vote counting queries
voteSchema.index({ pollId: 1, votedAt: -1 });

export default mongoose.model('Vote', voteSchema);