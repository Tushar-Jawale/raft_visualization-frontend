import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { NODE_COLORS, calculateNodeCoords } from './constants';
import { createClusterHandlers, createElectionHandlers, createLogHandlers } from './handlers';
import { useClusterApi } from './useClusterApi';

const RaftContext = createContext(null);

export const useRaftContext = () => {
  const context = useContext(RaftContext);
  if (!context) {
    throw new Error('useRaftContext must be used within a RaftProvider');
  }
  return context;
};

export const RaftProvider = ({ children }) => {
  // ─── Form state ───
  const [inputKey, setInputKey] = useState('');
  const [inputField, setInputField] = useState('');
  const [inputValue, setInputValue] = useState('');

  // ─── Cluster state ───
  const [clusterNodes, setClusterNodes] = useState([]);
  const [nodeCoords, setNodeCoords] = useState({});
  const [nodeLogEntries, setNodeLogEntries] = useState({});
  const [kvMetadata, setKvMetadata] = useState({});
  const [committedKVStore, setCommittedKVStore] = useState({});

  // ─── Raft consensus state ───
  const [activeMessage, setActiveMessage] = useState(null);
  const [leaderId, setLeaderId] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);
  const [lastLogIndex, setLastLogIndex] = useState(null);
  const [lastLogTerm, setLastLogTerm] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [peerResponses, setPeerResponses] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState(null);
  const [debugMessages, setDebugMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operation, setOperation] = useState('SET');
  const [getResult, setGetResult] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ─── Election state ───
  const [electionInProgress, setElectionInProgress] = useState(false);
  const [candidateNodes, setCandidateNodes] = useState([]);
  const [electionTerm, setElectionTerm] = useState(null);
  const [voteRequests, setVoteRequests] = useState([]);
  const [votesReceived, setVotesReceived] = useState({});
  const [electionWinner, setElectionWinner] = useState(null);
  const [showElectionAnimation, setShowElectionAnimation] = useState(false);

  // ─── Node power state ───
  const [nodePowerStatus, setNodePowerStatus] = useState({});

  // ─── Refs ───
  const wsRef = useRef(null);
  const electionTermRef = useRef(null);
  const votesReceivedRef = useRef({});

  const addDebug = (msg) => {
    console.log(`[DEBUG] ${msg}`);
    setDebugMessages((prev) => [...prev.slice(-4), msg]);
  };

  // ─── Wire up handlers ───
  const clusterHandlers = createClusterHandlers({
    setLeaderId, setCurrentTerm, setLastLogIndex, setLastLogTerm,
    setFollowers, setLastHeartbeatTime, setPeerResponses,
    setActiveMessage, addDebug,
  });

  const electionHandlers = createElectionHandlers({
    setCandidateNodes, setVotesReceived, setElectionTerm,
    setElectionInProgress, setLeaderId, setVoteRequests,
    setActiveMessage, setElectionWinner, setCurrentTerm,
    setShowElectionAnimation, nodeCoords,
    electionTermRef, votesReceivedRef,
  });

  const logHandlers = createLogHandlers({
    setNodeLogEntries, setKvMetadata, setCommittedKVStore,
  });

  const { handleOperationSubmit, toggleNodePower } = useClusterApi({
    inputKey, inputField, inputValue,
    setInputKey, setInputField, setInputValue,
    setIsSubmitting, setGetResult,
    setCommittedKVStore, setNodePowerStatus,
  });

  // ─── Fetch cluster config ───
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/cluster/config');
        if (response.ok) {
          const config = await response.json();
          const nodeIds = Object.keys(config).sort();
          setClusterNodes(nodeIds);
          setNodeCoords(calculateNodeCoords(nodeIds));
          
          setNodePowerStatus(prev => {
            const status = { ...prev };
            nodeIds.forEach(id => {
              if (!status[id]) status[id] = 'alive';
            });
            return status;
          });
          
          setNodeLogEntries(prev => {
            const newLogs = { ...prev };
            nodeIds.forEach(id => {
              if (!newLogs[id]) newLogs[id] = [];
            });
            return newLogs;
          });
        }
      } catch (err) {
        console.log('Error fetching config, will retry...', err.message);
        setTimeout(fetchConfig, 3000);
      }
    };
    fetchConfig();
  }, []);

  // ─── WebSocket connection ───
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
        addDebug(`Attempting WebSocket connection to ${wsUrl}`);
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          addDebug('WebSocket CONNECTED');
          setConnectionStatus('connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type !== 'heartbeat') {
              addDebug(`📨 Message received: ${message.type}`);
            }
            handleWebSocketMessage(message);
          } catch (e) {
            addDebug(`Parse error: ${e.message}`);
          }
        };

        wsRef.current.onerror = (error) => {
          addDebug(`WebSocket ERROR: ${error.message || error.toString()}`);
          setConnectionStatus('error');
        };

        wsRef.current.onclose = () => {
          addDebug('WebSocket DISCONNECTED - Reconnecting in 3s');
          setConnectionStatus('disconnected');
          setTimeout(connectWebSocket, 3000);
        };
      } catch (e) {
        addDebug(`Connection failed: ${e.message}`);
        setConnectionStatus('error');
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  // ─── Message router ───
  const handleWebSocketMessage = (message) => {
    try {
      switch (message.type) {
        case 'heartbeat':        clusterHandlers.handleHeartbeat(message); break;
        case 'peer_response':    clusterHandlers.handlePeerResponse(message); break;
        case 'node_state_change':clusterHandlers.handleNodeStateChange(message); break;
        case 'log_entry':        logHandlers.handleLogEntry(message); break;
        case 'entries_committed':logHandlers.handleEntriesCommitted(message); break;
        case 'kv_store_update':  logHandlers.handleKVStoreUpdate(message); break;
        case 'vote_request':     electionHandlers.handleVoteRequest(message); break;
        case 'vote_response':    electionHandlers.handleVoteResponse(message); break;
        case 'election_result':  electionHandlers.handleElectionResult(message); break;
        default: addDebug(`Unknown message type: ${message.type}`);
      }
    } catch (e) {
      addDebug(`Handler error: ${e.message}`);
    }
  };

  // ─── Derived state helpers ───
  const getNodeState = (nodeId) => {
    if (nodePowerStatus[nodeId] === 'dead') return 'DEAD';
    if (candidateNodes.includes(nodeId)) return 'CANDIDATE';
    if (leaderId === nodeId) return 'LEADER';
    return 'FOLLOWER';
  };

  const getKVStoreRows = () => {
    const rows = [];
    Object.entries(committedKVStore).forEach(([key, fieldsObj]) => {
      if (fieldsObj && typeof fieldsObj === 'object') {
        Object.entries(fieldsObj).forEach(([field, value]) => {
          const metaKey = `${key}-${field}`;
          rows.push({
            key, field, value,
            node_id: kvMetadata[metaKey]?.node_id || '-',
            updated_at: kvMetadata[metaKey]?.updated_at || '-',
          });
        });
      }
    });
    return rows;
  };

  // ─── Context value ───
  const value = {
    inputKey, setInputKey, inputField, setInputField, inputValue, setInputValue,
    clusterNodes, nodeCoords, nodeLogEntries, kvMetadata, committedKVStore,
    activeMessage, leaderId, currentTerm, lastLogIndex, lastLogTerm,
    followers, peerResponses, connectionStatus, lastHeartbeatTime,
    debugMessages, isSubmitting, operation, setOperation, getResult, setGetResult,
    isDropdownOpen, setIsDropdownOpen, electionInProgress, candidateNodes,
    electionTerm, voteRequests, votesReceived, electionWinner, showElectionAnimation,
    handleOperationSubmit, toggleNodePower, nodePowerStatus,
    nodeColors: NODE_COLORS, getNodeState, getKVStoreRows,
  };

  return (
    <RaftContext.Provider value={value}>
      {children}
    </RaftContext.Provider>
  );
};
