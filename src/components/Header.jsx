import React from 'react';
import { useRaftContext } from '../context/RaftContext';
import './Header.css';

const Header = () => {
  const { connectionStatus, lastHeartbeatTime } = useRaftContext();
  const [systemTime, setSystemTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="header-container">
      <div>
        <h1 className="header-title">RAFT Consensus Visualization</h1>
        <p className="header-subtitle">Real-time leader election, heartbeats and consensus</p>
      </div>

      <div className="header-status">
        <div className={`status-indicator ${connectionStatus === 'connected' ? 'status-indicator-connected' : 'status-indicator-disconnected'}`} />
        <div className="status-text-content">
          <div className="status-label">
            {connectionStatus === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          <div className="status-heartbeat">
            Last heartbeat: {lastHeartbeatTime ? lastHeartbeatTime.toLocaleTimeString() : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
