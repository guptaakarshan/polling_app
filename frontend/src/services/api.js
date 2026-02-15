import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Important: enables cookie handling
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Create a new poll
 */
export const createPoll = async (question, options) => {
  const response = await api.post('/polls', {
    question,
    options
  });
  return response.data;
};

/**
 * Get poll by ID
 */
export const getPoll = async (pollId) => {
  const response = await api.get(`/polls/${pollId}`);
  return response.data;
};

/**
 * Submit a vote
 */
export const submitVote = async (pollId, optionId) => {
  const response = await api.post(`/polls/${pollId}/vote`, {
    optionId
  });
  return response.data;
};

/**
 * Check if current session has voted
 */
export const checkVoteStatus = async (pollId) => {
  const response = await api.get(`/polls/${pollId}/has-voted`);
  return response.data;
};

export default api;