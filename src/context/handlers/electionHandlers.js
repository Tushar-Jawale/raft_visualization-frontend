/**
 * Handlers for election WebSocket messages:
 *   vote_request, vote_response, election_result
 *
 * Uses refs for synchronous tracking because React state updates 
 * are batched/async and would cause duplicate vote counting.
 */

export const createElectionHandlers = ({
  setCandidateNodes, setVotesReceived, setElectionTerm,
  setElectionInProgress, setLeaderId, setVoteRequests,
  setActiveMessage, setElectionWinner, setCurrentTerm,
  setShowElectionAnimation, nodeCoords,
  electionTermRef, votesReceivedRef,
}) => {

  const handleVoteRequest = (message) => {
    const { node_id, current_term } = message;

    // Use ref for synchronous term comparison (React state is async)
    if (current_term !== electionTermRef.current) {
      // New term — clear all previous election state
      electionTermRef.current = current_term;
      votesReceivedRef.current = {};
      setCandidateNodes([node_id]);
      setVotesReceived({});
    } else {
      // Same term — just add this candidate (deduped)
      setCandidateNodes((prev) => Array.from(new Set([...prev, node_id])));
    }

    setElectionTerm(current_term);
    setElectionInProgress(true);

    // Clear old leader — election means no confirmed leader right now
    setLeaderId(null);

    const targetNodes = Object.keys(nodeCoords).filter((n) => n !== node_id);
    const newRequests = targetNodes.map((target) => ({
      from: node_id, to: target, id: `vreq-${node_id}-${target}-${Date.now()}`,
    }));

    setVoteRequests(newRequests);
    setTimeout(() => setVoteRequests([]), 1500);
  };

  const handleVoteResponse = (message) => {
    const { node_id, voted_for, current_term } = message;
    if (voted_for === -1) return;

    // Reject votes from old terms
    if (current_term !== electionTermRef.current) return;

    // Synchronous dedup using ref (state updates are batched)
    const existingVoters = votesReceivedRef.current[voted_for] || [];
    if (existingVoters.includes(node_id)) return;

    // Update ref synchronously
    votesReceivedRef.current = {
      ...votesReceivedRef.current,
      [voted_for]: [...existingVoters, node_id],
    };

    // Then update state to trigger re-render
    setVotesReceived({ ...votesReceivedRef.current });

    setActiveMessage({ type: 'vote_response', from: node_id, to: voted_for });
    setTimeout(() => setActiveMessage(null), 1000);
  };

  const handleElectionResult = (message) => {
    const { node_id, election_result, current_term } = message;
    if (!election_result) return;

    setElectionWinner(node_id);
    setLeaderId(node_id);
    setCurrentTerm(current_term);
    setShowElectionAnimation(true);
    setCandidateNodes([]);

    // Clear election tracking refs
    votesReceivedRef.current = {};

    setTimeout(() => {
      setElectionInProgress(false);
      setVotesReceived({});
      setShowElectionAnimation(false);
      setElectionWinner(null);
    }, 2500);
  };

  return { handleVoteRequest, handleVoteResponse, handleElectionResult };
};
