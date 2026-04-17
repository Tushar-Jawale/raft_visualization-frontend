import React from 'react';
import { motion } from 'framer-motion';
import { useRaftContext } from '../context/RaftContext';
import './NetworkTopology.css';

const NetworkTopology = () => {
  const {
    clusterNodes,
    nodeCoords,
    voteRequests,
    activeMessage,
    leaderId,
    followers,
    showElectionAnimation,
    electionWinner,
    getNodeState,
    nodeColors,
    currentTerm,
    lastLogIndex,
    lastLogTerm,
    toggleNodePower,
    nodePowerStatus
  } = useRaftContext();

  return (
    <div className="topology-container">
      <div className="section-header">
        <h2 className="section-title">
          Network Topology
        </h2>
        <div className="section-subtitle">Term {currentTerm ?? '-'} • Nodes: {clusterNodes.length}</div>
      </div>

      <div className="topology-svg-wrapper">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 320"
          className="topology-svg"
        >
          <defs>
            <linearGradient id="leaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="candidateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="followerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="deadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Static connections dynamically generated */}
          {clusterNodes.map((nodeA, i) =>
            clusterNodes.slice(i + 1).map((nodeB) => (
              <line
                key={`conn-${nodeA}-${nodeB}`}
                x1={nodeCoords[nodeA]?.x}
                y1={nodeCoords[nodeA]?.y}
                x2={nodeCoords[nodeB]?.x}
                y2={nodeCoords[nodeB]?.y}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))
          )}

          {/* Vote requests (candidate asking for votes) */}
          {voteRequests.map((req) => (
            <motion.line
              key={req.id}
              x1={nodeCoords[req.from]?.x}
              y1={nodeCoords[req.from]?.y}
              x2={nodeCoords[req.to]?.x}
              y2={nodeCoords[req.to]?.y}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0.8 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1 }}
            />
          ))}

          {/* Heartbeats */}
          {activeMessage?.type === 'heartbeat' &&
            leaderId &&
            followers.map((f) => (
              <motion.line
                key={`hb-${f}`}
                x1={nodeCoords[leaderId]?.x}
                y1={nodeCoords[leaderId]?.y}
                x2={nodeCoords[f]?.x}
                y2={nodeCoords[f]?.y}
                stroke="#06b6d4"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0.8 }}
                animate={{ pathLength: 1, opacity: 0 }}
                transition={{ duration: 1.5 }}
              />
            ))}

          {activeMessage?.type === 'heartbeat' && leaderId && (
            <motion.circle
              cx={nodeCoords[leaderId]?.x}
              cy={nodeCoords[leaderId]?.y}
              r={60}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              initial={{ r: 60, opacity: 0.8 }}
              animate={{ r: 90, opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          )}

          {/* Vote responses (voters responding to candidate) */}
          {activeMessage?.type === 'vote_response' &&
            nodeCoords[activeMessage.from] &&
            nodeCoords[activeMessage.to] && (
              <motion.line
                x1={nodeCoords[activeMessage.from].x}
                y1={nodeCoords[activeMessage.from].y}
                x2={nodeCoords[activeMessage.to].x}
                y2={nodeCoords[activeMessage.to].y}
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
            )}

          {/* Election won animation */}
          {showElectionAnimation && electionWinner && (
            <motion.circle
              cx={nodeCoords[electionWinner]?.x}
              cy={nodeCoords[electionWinner]?.y}
              r={50}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              initial={{ r: 50, opacity: 1 }}
              animate={{ r: 130, opacity: 0 }}
              transition={{ duration: 1.5 }}
            />
          )}

          {/* Nodes from clusterNodes */}
          {clusterNodes.map((nodeId) => {
            const state = getNodeState(nodeId);
            const color =
              state === 'LEADER'
                ? nodeColors.leader
                : state === 'CANDIDATE'
                  ? nodeColors.candidate
                  : state === 'DEAD'
                    ? nodeColors.dead
                    : nodeColors.follower;
            const coords = nodeCoords[nodeId];

            if (!coords) return null;

            return (
              <g key={`node-${nodeId}`}>
                <motion.circle
                  cx={coords.x}
                  cy={coords.y}
                  r={50}
                  fill={color.svgFill}
                  animate={
                    state === 'CANDIDATE'
                      ? {
                        filter: [
                          `drop-shadow(0 4px 12px ${color.shadow})`,
                          `drop-shadow(0 4px 20px ${color.shadow})`,
                          `drop-shadow(0 4px 12px ${color.shadow})`,
                        ],
                      }
                      : {
                        filter: `drop-shadow(0 4px 12px ${color.shadow})`,
                      }
                  }
                  transition={
                    state === 'CANDIDATE'
                      ? { duration: 1, repeat: Infinity }
                      : { duration: 0 }
                  }
                />
                <text
                  x={coords.x}
                  y={coords.y - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="20"
                  fontWeight="bold"
                >
                  Node {nodeId}
                </text>
                <text
                  x={coords.x}
                  y={coords.y + 15}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="600"
                >
                  {state === 'DEAD' ? 'OFFLINE' : state}
                </text>
                
                {/* Power Toggle Button */}
                <foreignObject x={coords.x - 20} y={coords.y + 25} width="40" height="40">
                  <button 
                    className={`node-power-btn ${state === 'DEAD' ? 'node-power-off' : 'node-power-on'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNodePower(nodeId);
                    }}
                    title={state === 'DEAD' ? "Revive Node" : "Kill Node"}
                  >
                    {state === 'DEAD' ? '⚡' : '✕'}
                  </button>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leader info */}
      <div className="leader-info-box">
        <div className="leader-info-header">
          Leader Info
        </div>
        <div className="leader-info-data">
          <div>
            Leader: <strong>{leaderId ?? '-'}</strong>
          </div>
          <div>
            Term: <strong>{currentTerm ?? '-'}</strong>
          </div>
          <div>
            Last Log:{' '}
            <strong>
              Index {lastLogIndex ?? '-'}, Term {lastLogTerm ?? '-'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;
