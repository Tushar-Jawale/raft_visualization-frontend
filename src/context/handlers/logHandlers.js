/**
 * Handlers for log replication and KV store WebSocket messages:
 *   log_entry, entries_committed, kv_store_update
 */

export const createLogHandlers = ({
  setNodeLogEntries, setKvMetadata, setCommittedKVStore,
}) => {

  const handleLogEntry = (message) => {
    const { node_id, log_entry, log_index, committed } = message;
    if (!node_id || !log_entry || log_index == null) return;

    setNodeLogEntries((prev) => {
      const currentNodeLogs = prev[node_id] || [];
      if (currentNodeLogs.some(l => l.id === log_index)) return prev;

      let val = log_entry.command || String(log_entry);
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') {
          if ('ttl' in parsed) delete parsed.ttl;
          val = JSON.stringify(parsed);
        }
      } catch (e) {}

      return {
        ...prev,
        [node_id]: [
          ...currentNodeLogs,
          { id: log_index, value: val, committed: !!committed },
        ],
      };
    });
  };

  const handleEntriesCommitted = (message) => {
    try {
      const { committed_until_index } = message;
      setNodeLogEntries((prev) => {
        const updated = {};
        Object.keys(prev).forEach((nId) => {
          if (!prev[nId]) return;
          updated[nId] = prev[nId].map((entry) => {
            if (entry.id <= committed_until_index && !entry.committed) {
              return { ...entry, committed: true };
            }
            return entry;
          });
        });
        return updated;
      });
    } catch (e) {}
  };

  const handleKVStoreUpdate = (message) => {
    try {
      const { node_id, log_index, key, field, value, timestamp } = message;
      if (!node_id || log_index == null || !key || !field || value === undefined || value === null) return;

      setKvMetadata((prev) => ({
        ...prev,
        [`${key}-${field}`]: {
          node_id, log_index,
          timestamp: new Date().toISOString(),
          updated_at: new Date().toLocaleTimeString(),
        },
      }));

      setCommittedKVStore((prev) => {
        const existing = prev[String(key)]?.[String(field)];
        if (existing === String(value)) return prev;
        return {
          ...prev,
          [String(key)]: {
            ...(prev[String(key)] || {}),
            [String(field)]: String(value),
          },
        };
      });
    } catch (e) {}
  };

  return { handleLogEntry, handleEntriesCommitted, handleKVStoreUpdate };
};
