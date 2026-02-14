import express from 'express';
import Poll from '../models/Poll.js';
import Vote from '../models/Vote.js';
import { voteLimiter, createPollLimiter } from '../middleware/rateLimiter.js';
import { sessionHandler } from '../middleware/sessionHandler.js';
import { emitVoteUpdate } from '../sockets/pollSocket.js';

const router = express.Router();

/**
 * POST /api/polls
 * Create a new poll
 */
router.post('/', createPollLimiter, async (req, res) => {
  try {
    const { question, options, expiresInHours } = req.body;

    // Validation
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'At least 2 options are required' });
    }

    // Filter out empty options
    const validOptions = options
      .filter(opt => opt && opt.trim())
      .map(opt => ({ text: opt.trim(), votes: 0 }));

    if (validOptions.length < 2) {
      return res.status(400).json({ error: 'At least 2 valid options are required' });
    }

    // Calculate expiration if specified
    let expiresAt = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    const poll = new Poll({
      question: question.trim(),
      options: validOptions,
      expiresAt
    });

    await poll.save();

    res.status(201).json({
      pollId: poll._id,
      poll
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

/**
 * GET /api/polls/:id
 * Get poll by ID with current results
 */
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    console.error('Get poll error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Poll not found' });
    }
    
    res.status(500).json({ error: 'Failed to retrieve poll' });
  }
});

/**
 * POST /api/polls/:id/vote
 * Submit a vote for a poll option
 * 
 * Implements atomic vote increment to handle concurrent voters
 * Uses session-based fairness control to prevent duplicate votes
 */
router.post('/:id/vote', voteLimiter, sessionHandler, async (req, res) => {
  try {
    const { optionId } = req.body;
    const pollId = req.params.id;
    const sessionId = req.sessionId;

    // Validate inputs
    if (!optionId) {
      return res.status(400).json({ error: 'Option ID is required' });
    }

    // Check if poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ error: 'This poll has expired' });
    }

    // Validate option exists in poll
    const optionExists = poll.options.some(opt => opt._id.toString() === optionId);
    if (!optionExists) {
      return res.status(400).json({ error: 'Invalid option ID' });
    }

    // Create vote record (will fail if duplicate due to unique index)
    try {
      await Vote.create({
        pollId,
        sessionId,
        optionId
      });
    } catch (voteError) {
      // Handle duplicate vote attempt
      if (voteError.code === 11000) {
        return res.status(409).json({ 
          error: 'You have already voted in this poll',
          alreadyVoted: true 
        });
      }
      throw voteError;
    }

    /**
     * ATOMIC VOTE INCREMENT
     * Uses MongoDB $inc operator to safely increment vote count
     * Handles concurrent voters without race conditions
     * Updates only the specific option that was voted for
     */
    const updatedPoll = await Poll.findOneAndUpdate(
      { 
        _id: pollId,
        'options._id': optionId 
      },
      { 
        $inc: { 'options.$.votes': 1 } 
      },
      { 
        new: true // Return updated document
      }
    );

    if (!updatedPoll) {
      return res.status(500).json({ error: 'Failed to update vote count' });
    }

    // Emit real-time update to all viewers in this poll's room
    emitVoteUpdate(req.io, pollId, updatedPoll);

    res.json({
      message: 'Vote recorded successfully',
      poll: updatedPoll
    });
  } catch (error) {
    console.error('Vote error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid poll or option ID' });
    }
    
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

/**
 * GET /api/polls/:id/has-voted
 * Check if current session has voted in this poll
 */
router.get('/:id/has-voted', sessionHandler, async (req, res) => {
  try {
    const pollId = req.params.id;
    const sessionId = req.sessionId;

    const existingVote = await Vote.findOne({ pollId, sessionId });

    res.json({
      hasVoted: !!existingVote,
      votedOptionId: existingVote ? existingVote.optionId : null
    });
  } catch (error) {
    console.error('Check vote error:', error);
    res.status(500).json({ error: 'Failed to check vote status' });
  }
});

export default router;