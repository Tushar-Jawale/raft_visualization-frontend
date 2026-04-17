import React from 'react';
import { RaftProvider } from './context/RaftContext';
import Header from './components/Header';
import ElectionStatus from './components/ElectionStatus';
import KVInputForm from './components/KVInputForm';
import NetworkTopology from './components/NetworkTopology';
import NodeLogs from './components/NodeLogs';
import StateMachineTable from './components/StateMachineTable';
import Legend from './components/Legend';
import './App.css';

const AppContent = () => {
  return (
    <div className="app-container">
      <Header />
      <ElectionStatus />
      <KVInputForm />

      <div className="app-grid">
        <NetworkTopology />
        <div className="logs-column">
          <div className="section-header">
            <h2 className="section-title">Node Logs</h2>
            <div className="section-subtitle">Real-time Raft consensus events</div>
          </div>
          <NodeLogs />
        </div>
      </div>

      <StateMachineTable />
      <Legend />
    </div>
  );
};

const App = () => {
  return (
    <RaftProvider>
      <AppContent />
    </RaftProvider>
  );
};

export default App;