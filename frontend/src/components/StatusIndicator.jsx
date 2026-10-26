import { RefreshCw } from 'lucide-react';

export default function StatusIndicator({ status, onRetry }) {
  const labels = {
    online: 'Connected',
    checking: 'Connecting…',
    offline: 'Offline',
  };

  return (
    <div className="status-indicator" aria-live="polite">
      <span className={`status-dot ${status}`} />
      <span>{labels[status] ?? status}</span>
      {status === 'offline' && (
        <button className="status-retry-btn" onClick={onRetry} title="Retry connection">
          <RefreshCw size={10} />
          Retry
        </button>
      )}
    </div>
  );
}
