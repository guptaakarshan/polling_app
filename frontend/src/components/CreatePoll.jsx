import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoll } from '../services/api';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    setLoading(true);

    try {
      const data = await createPoll(question, validOptions);
      // Navigate to the newly created poll
      navigate(`/poll/${data.pollId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create a New Poll</h1>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="question">
              <strong>Question:</strong>
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              maxLength={200}
            />
          </div>

          <div>
            <strong>Options:</strong>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeOption(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 6 && (
            <button
              type="button"
              className="secondary"
              onClick={addOption}
              style={{ marginBottom: '16px' }}
            >
              + Add Option
            </button>
          )}

          <div>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;