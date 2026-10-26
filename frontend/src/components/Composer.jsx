import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';

export default function Composer({ onSend, isLoading, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [text]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setText('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, isLoading, disabled, onSend]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = text.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="composer-area">
      <div className="composer-inner">
        <div className="composer-box">
          {/* Attachment (disabled in v1) */}
          <button
            className="composer-attachment-btn"
            disabled
            title="File attachments not available in v1"
            aria-label="Attach file (not available)"
            type="button"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            ref={textareaRef}
            className="composer-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Backend offline — cannot send messages'
                : isLoading
                ? 'Waiting for response…'
                : 'Message SilentChat…'
            }
            disabled={disabled || isLoading}
            rows={1}
            aria-label="Message input"
          />

          <button
            className="composer-send-btn"
            onClick={handleSend}
            disabled={!canSend}
            title="Send message"
            aria-label="Send message"
            type="button"
          >
            <Send size={16} />
          </button>
        </div>

        <p className="composer-footer-text">
          SilentChat uses a locally hosted AI model. Responses are not sent to the cloud.
        </p>
      </div>
    </div>
  );
}
