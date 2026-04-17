import React from 'react';
import { motion } from 'framer-motion';
import { useRaftContext } from '../context/RaftContext';
import './NodeLogs.css';

const NodeLogs = () => {
  const { clusterNodes, nodeLogEntries, getNodeState } = useRaftContext();

  return (
    <div className="node-logs-grid">
      {clusterNodes.map((nodeId) => {
        const state = getNodeState(nodeId);
        
        let headerColor = '#bfdbfe';
        if (state === 'LEADER') headerColor = '#fed7aa';
        else if (state === 'CANDIDATE') headerColor = '#d946ef';

        return (
          <div key={`log-${nodeId}`} className={`log-panel state-${state.toLowerCase()}`}>
            <div className="log-panel-header">
              <h3 className="log-panel-title" style={{ color: headerColor }}>
                Node {nodeId}
              </h3>
              <div className={`status-badge badge-${state.toLowerCase()}`}>
                {state}
              </div>
            </div>
            
            <div className="log-scroll-container">
              {nodeLogEntries[nodeId] && nodeLogEntries[nodeId].length === 0 ? (
                <div className="log-empty-state">
                  No entries yet...
                </div>
              ) : nodeLogEntries[nodeId] ? (
                [...nodeLogEntries[nodeId]].reverse().map((log, idx) => (
                  <motion.div
                    key={`${nodeId}-log-${log.id}-${idx}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`log-entry ${log.committed ? 'log-entry-committed' : 'log-entry-uncommitted'}`}
                  >
                    <div className="log-entry-index">#{log.id}</div>
                    <div className="log-entry-content">
                      {log.value || 'Empty entry'}
                    </div>
                    {log.committed && (
                      <span className="log-check-mark">✓</span>
                    )}
                  </motion.div>
                ))
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NodeLogs;
