import React from 'react';

interface ActionPanelProps {
  onClear: () => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
}

export function ActionPanel({ onClear, onGenerate, canGenerate, isGenerating }: ActionPanelProps) {
  return (
    <div className="action-panel">
      <button 
        type="button"
        className="btn btn-secondary" 
        onClick={onClear} 
        disabled={isGenerating}
      >
        Clear All
      </button>

      <button 
        type="button"
        className="btn btn-primary" 
        onClick={onGenerate} 
        disabled={!canGenerate || isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate Secure PDF'}
      </button>
    </div>
  );
}
