import React from 'react';

const PollResults = ({ poll, hasVoted, onVote, voting, isExpired }) => {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  return (
    <div>
      {poll.options.map((option) => {
        const percentage = getPercentage(option.votes);
        const canVote = !hasVoted && !voting && !isExpired;

        return (
          <div
            key={option._id}
            className={`poll-option ${canVote ? '' : 'disabled'}`}
            onClick={() => canVote && onVote(option._id)}
          >
            <div className="poll-option-header">
              <span className="poll-option-text">{option.text}</span>
              <span className="poll-option-votes">{option.votes} votes</span>
            </div>
            
            <div className="poll-option-bar" style={{ width: `${percentage}%` }} />
            
            <div className="poll-option-percentage">
              {percentage}%
            </div>
          </div>
        );
      })}

      <div className="total-votes">
        Total votes: {totalVotes}
      </div>
    </div>
  );
};

export default PollResults;