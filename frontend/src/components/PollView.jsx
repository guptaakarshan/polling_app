import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getPoll, submitVote, checkVoteStatus } from '../services/api';
import PollResults from './PollResults';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const PollView = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [socket, setSocket] = useState(null);

  // Load poll data and check vote status
  useEffect(() => {
    const loadPoll = async () => {
      try {
        setLoading(true);
        const pollData = await getPoll(pollId);
        setPoll(pollData);

        // Check if user has already voted
        const voteStatus = await checkVoteStatus(pollId);
        setHasVoted(voteStatus.hasVoted);
        
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load poll');
      } finally {
        setLoading(false);
      }
    };

    loadPoll();
  }, [pollId]);

  // Setup Socket.io connection for real-time updates
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true
    });

    setSocket(newSocket);

    // Join this poll's room
    newSocket.emit('joinPoll', pollId);

    // Listen for vote updates
    newSocket.on('voteUpdate', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      newSocket.emit('leavePoll', pollId);
      newSocket.close();
    };
  }, [pollId]);

  const handleVote = async (optionId) => {
    // Prevent double-click voting
    if (voting || hasVoted) return;

    setVoting(true);
    setError('');

    try {
      const data = await submitVote(pollId, optionId);
      setPoll(data.poll);
      setHasVoted(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit vote';
      setError(errorMsg);
      
      // If already voted, update state
      if (err.response?.data?.alreadyVoted) {
        setHasVoted(true);
      }
    } finally {
      setVoting(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">Loading poll...</div>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="container">
        <a href="/" className="home-link">← Create New Poll</a>
        <div className="card">
          <div className="error">{error}</div>
          <button onClick={() => navigate('/')}>Create New Poll</button>
        </div>
      </div>
    );
  }

  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  return (
    <div className="container">
      <a href="/" className="home-link">← Create New Poll</a>
      
      <div className="card">
        <h2>
          {poll.question}
          <span className={`status-badge ${isExpired ? 'expired' : 'live'}`}>
            {isExpired ? 'Expired' : 'Live'}
          </span>
        </h2>

        {error && <div className="error">{error}</div>}

        {hasVoted && (
          <div className="success">
            ✓ Your vote has been recorded! Results update in real-time.
          </div>
        )}

        <PollResults 
          poll={poll} 
          hasVoted={hasVoted}
          onVote={handleVote}
          voting={voting}
          isExpired={isExpired}
        />

        <div className="share-link">
          <p>Share this poll:</p>
          <div className="share-link-input">
            <input
              type="text"
              value={window.location.href}
              readOnly
            />
            <button onClick={copyShareLink}>Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollView;