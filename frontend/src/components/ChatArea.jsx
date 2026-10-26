import { useRef, useCallback } from 'react';
import { Menu } from 'lucide-react';
import './ChatArea.css';
import WelcomeScreen from './WelcomeScreen';
import MessageList from './MessageList';
import Composer from './Composer';
import StatusIndicator from './StatusIndicator';

export default function ChatArea({
  conversation,
  onSendMessage,
  isLoading,
  backendStatus,
  onRetryConnection,
  onToggleSidebar,
  sidebarOpen,
}) {
  const scrollRef = useRef(null);

  const handleSuggestPrompt = useCallback(
    (prompt) => {
      onSendMessage(prompt);
    },
    [onSendMessage],
  );

  const messages = conversation?.messages ?? [];
  const hasMessages = messages.length > 0;
  const isOffline = backendStatus === 'offline';
  const headerTitle = conversation ? conversation.title : 'SilentChat';

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <button
          className="chat-header-menu-btn"
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <span className="chat-header-title">{headerTitle}</span>

        <div className="chat-header-status">
          <StatusIndicator status={backendStatus} onRetry={onRetryConnection} />
        </div>
      </div>

      {/* Messages or Welcome */}
      {hasMessages ? (
        <div className="messages-scroll" ref={scrollRef}>
          <div className="messages-inner">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>
        </div>
      ) : (
        <div className="messages-scroll" ref={scrollRef}>
          <WelcomeScreen onSuggestPrompt={handleSuggestPrompt} />
        </div>
      )}

      {/* Composer */}
      <Composer
        onSend={onSendMessage}
        isLoading={isLoading}
        disabled={isOffline}
      />
    </div>
  );
}
