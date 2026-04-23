/**
 * Custom hook for HTTP API operations — KV store CRUD and node power toggling.
 */

export const useClusterApi = ({
  inputKey, inputField, inputValue,
  setInputKey, setInputField, setInputValue,
  setIsSubmitting, setGetResult,
  setCommittedKVStore, setNodePowerStatus,
}) => {

  const handleOperationSubmit = async (op) => {
    if (!inputKey.trim() || !inputField.trim()) return alert('Please enter key and field');
    if (op === 'SET' && !inputValue.trim()) return alert('Please enter value for SET operation');

    setIsSubmitting(true);
    setGetResult(null);

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      
      if (op === 'SET') {
        const payload = {
          type: 'client_command',
          command: `SET ${inputKey}.${inputField}=${inputValue}`,
          key: inputKey, field: inputField, value: inputValue,
        };
        const response = await fetch(`${baseUrl}/kv-store`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        setInputKey(''); setInputField(''); setInputValue('');
      } else if (op === 'GET') {
        const response = await fetch(`${baseUrl}/kv-store?key=${inputKey}&field=${inputField}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
        setGetResult(data);
      } else if (op === 'DELETE') {
        const response = await fetch(`${baseUrl}/kv-store?key=${inputKey}&field=${inputField}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        setCommittedKVStore((prev) => {
          const updated = { ...prev };
          if (updated[inputKey]) {
            delete updated[inputKey][inputField];
            if (Object.keys(updated[inputKey]).length === 0) delete updated[inputKey];
          }
          return updated;
        });
        setInputKey(''); setInputField('');
      }
    } catch (err) {
      alert(`${op} failed: ${err.message}`);
      setInputKey('');
      setInputField('');
      setInputValue('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleNodePower = async (nodeId) => {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${baseUrl}/cluster/node/${nodeId}/toggle`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setNodePowerStatus(prev => ({
          ...prev,
          [nodeId]: data.status
        }));
      } else {
        alert(`Failed to toggle node: ${data.message}`);
      }
    } catch (err) {
      alert(`Error toggling node power: ${err.message}`);
    }
  };

  return { handleOperationSubmit, toggleNodePower };
};
