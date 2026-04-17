import React from 'react';
import { motion } from 'framer-motion';
import { useRaftContext } from '../context/RaftContext';
import './ElectionStatus.css';

const ElectionStatus = () => {
  const { 
    electionInProgress, 
    electionTerm, 
    candidateNodes, 
    votesReceived, 
    clusterNodes 
  } = useRaftContext();

  if (!electionInProgress) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="election-container"
    >
      <h2 className="election-title">Leader Election in Progress (Term {electionTerm})</h2>
      <div className="election-grid">
        {candidateNodes.map((candidate) => {
          const votes = votesReceived[candidate] || [];
          const total_nodes = clusterNodes.length || 3;
          const majority = Math.floor((total_nodes / 2) + 1);

          return (
            <div key={candidate} className="candidate-card">
              <div className="candidate-name">Candidate {candidate}</div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div className="votes-tally">
                  Votes: {votes.length}/{total_nodes} (Need {majority})
                </div>
                <div className="progress-bar-bg">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(votes.length / total_nodes) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="progress-bar-fill"
                    style={{
                      background: votes.length >= majority
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #a855f7, #d946ef)',
                    }}
                  />
                </div>
              </div>

              {votes.length > 0 && (
                <div className="voters-list">
                  From: {votes.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ElectionStatus;
