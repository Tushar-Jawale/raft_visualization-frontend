/**
 * Handlers for cluster-level WebSocket messages:
 *   heartbeat, peer_response, node_state_change
 */

export const createClusterHandlers = ({
  setLeaderId, setCurrentTerm, setLastLogIndex, setLastLogTerm,
  setFollowers, setLastHeartbeatTime, setPeerResponses,
  setActiveMessage, addDebug,
}) => {

  const handleHeartbeat = (message) => {
    const {
      leader_id, current_term, last_log_index, last_log_term,
      followers: hbFollowers,
    } = message;

    setLeaderId(leader_id || null);
    setCurrentTerm(current_term ?? null);
    setLastLogIndex(last_log_index ?? null);
    setLastLogTerm(last_log_term ?? null);
    setFollowers(Array.isArray(hbFollowers) ? hbFollowers : []);
    setLastHeartbeatTime(new Date());

    const newResponses = {};
    (hbFollowers || []).forEach((f) => {
      newResponses[f] = { success: null, term: null, matchIndex: null };
    });
    setPeerResponses(newResponses);

    if (leader_id) {
      setActiveMessage({ type: 'heartbeat', leader_id });
      setTimeout(() => setActiveMessage(null), 1500);
    }
  };

  const handlePeerResponse = (message) => {
    const { leader_id, peer_id, success, term, timestamp } = message;
    if (!peer_id || !leader_id) {
      addDebug('peer_response missing fields');
      return;
    }

    setPeerResponses((prev) => ({
      ...prev,
      [peer_id]: { success, term, timestamp },
    }));

    if (success) {
      const localTime = new Date();
      setPeerResponses((prev) => ({
        ...prev,
        [peer_id]: { ...prev[peer_id], localTimestamp: localTime },
      }));
      
      setActiveMessage({ type: 'peer_response', from: peer_id, to: leader_id });
      setTimeout(() => setActiveMessage(null), 1500);
    }
  };

  const handleNodeStateChange = (message) => {
    const { node_id, new_state, current_term } = message;
    if (new_state === 'leader') {
      setLeaderId(node_id);
      if (current_term != null) setCurrentTerm(current_term);
    }
  };

  return { handleHeartbeat, handlePeerResponse, handleNodeStateChange };
};
