interface ActionPanelProps {
  onClear: () => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  isPasswordProtected: boolean;
  onTogglePassword: () => void;
}

export function ActionPanel({ 
  onClear, 
  onGenerate, 
  canGenerate, 
  isGenerating,
  isPasswordProtected,
  onTogglePassword
}: ActionPanelProps) {
  return (
    <div className="action-panel">
      <button 
        type="button"
        className="btn btn-secondary" 
        onClick={onClear} 
        disabled={isGenerating}
      >
        clear
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          cursor: 'pointer',
          fontSize: '0.85rem',
          color: isPasswordProtected ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontFamily: 'var(--font-geist, Geist, sans-serif)',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}>
          <input 
            type="checkbox" 
            checked={isPasswordProtected}
            onChange={onTogglePassword}
            style={{
              appearance: 'none',
              width: '16px',
              height: '16px',
              border: '1px solid currentColor',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'grid',
              placeContent: 'center',
              margin: 0
            }}
          />
          {isPasswordProtected && (
            <span style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: 'currentColor',
              borderRadius: '1px',
              marginLeft: '3px'
            }} />
          )}
          <span style={{ textTransform: 'lowercase' }}>
            {isPasswordProtected ? 'currently with password' : 'currently no password'}
          </span>
        </label>

        <button 
          type="button"
          className="btn btn-primary" 
          onClick={onGenerate} 
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating ? 'generating...' : 'generate pdf'}
        </button>
      </div>
    </div>
  );
}
