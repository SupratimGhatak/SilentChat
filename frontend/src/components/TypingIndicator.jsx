import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="typing-indicator" aria-label="AI is typing">
      <div className="message-avatar">
        <Bot size={16} />
      </div>
      <div className="typing-dots" role="status">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
