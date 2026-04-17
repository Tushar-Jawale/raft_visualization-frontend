import React from 'react';
import { motion } from 'framer-motion';
import { useRaftContext } from '../context/RaftContext';
import './StateMachineTable.css';

const StateMachineTable = () => {
  const { getKVStoreRows } = useRaftContext();
  const rows = getKVStoreRows();

  return (
    <div className="sm-container">
      <h2 className="sm-title">
        Committed KV Store (State Machine)
      </h2>
      
      {rows.length === 0 ? (
        <div className="sm-empty">
          No committed entries yet...
        </div>
      ) : (
        <div className="sm-table-wrapper">
          <table className="sm-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Key</th>
                <th style={{ width: '20%' }}>Field</th>
                <th style={{ width: '30%' }}>Value</th>
                <th style={{ width: '15%' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <motion.tr
                  key={`kv-${row.key}-${row.field}-${idx}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <td className="sm-cell sm-key">{String(row.key)}</td>
                  <td className="sm-cell sm-key">{String(row.field)}</td>
                  <td className="sm-cell sm-val">{String(row.value)}</td>
                  <td className="sm-cell sm-time">{row.updated_at}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StateMachineTable;
