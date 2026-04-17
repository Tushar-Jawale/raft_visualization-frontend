import React from 'react';
import { useRaftContext } from '../context/RaftContext';
import './KVInputForm.css';

const KVInputForm = () => {
  const {
    inputKey, setInputKey,
    inputField, setInputField,
    inputValue, setInputValue,
    isSubmitting, connectionStatus,
    operation, setOperation,
    isDropdownOpen, setIsDropdownOpen,
    handleOperationSubmit,
    getResult, setGetResult
  } = useRaftContext();

  return (
    <div className="kv-input-container">
      <h2 className="kv-input-title">Input KV Store Entry</h2>
      
      <div 
        className="kv-input-grid" 
        style={{ gridTemplateColumns: operation === 'SET' ? '1fr 1fr 1fr 140px' : '1fr 1fr 140px' }}
      >
        <div>
          <label className="kv-input-label">Key</label>
          <input
            type="text"
            className="kv-input-field"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Enter key..."
            disabled={isSubmitting || connectionStatus !== 'connected'}
          />
        </div>

        <div>
          <label className="kv-input-label">Field</label>
          <input
            type="text"
            className="kv-input-field"
            value={inputField}
            onChange={(e) => setInputField(e.target.value)}
            placeholder="Enter field..."
            disabled={isSubmitting || connectionStatus !== 'connected'}
          />
        </div>

        {operation === 'SET' && (
          <div>
            <label className="kv-input-label">Value</label>
            <input
              type="text"
              className="kv-input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value..."
              disabled={isSubmitting || connectionStatus !== 'connected'}
            />
          </div>
        )}

        <div className="kv-button-vessel">
          <div className={`kv-split-button-container ${isSubmitting || connectionStatus !== 'connected' ? 'kv-btn-disabled' : ''}`}>
            <button
              className="kv-action-btn"
              onClick={() => handleOperationSubmit(operation)}
              disabled={isSubmitting || connectionStatus !== 'connected'}
            >
              {isSubmitting ? '...' : operation}
            </button>
            <button
              className="kv-dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSubmitting || connectionStatus !== 'connected'}
            >
              <span className={`toggle-arrow ${isDropdownOpen ? 'arrow-up' : 'arrow-down'}`}>▼</span>
            </button>
          </div>

          {isDropdownOpen && !isSubmitting && connectionStatus === 'connected' && (
            <div className="kv-dropdown-menu">
              {['SET', 'GET', 'DELETE'].map((op) => (
                <button
                  key={op}
                  className={`kv-dropdown-item ${operation === op ? 'kv-dropdown-active' : ''}`}
                  onClick={() => {
                    setOperation(op);
                    setIsDropdownOpen(false);
                    setGetResult(null);
                  }}
                >
                  {op}
                </button>
              ))}
            </div>
          )}
        </div>

        {getResult && (
          <div className="kv-result-display">
            <strong>Result:</strong> {getResult.value || 'Not found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default KVInputForm;
