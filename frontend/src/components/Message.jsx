import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check, AlertCircle } from 'lucide-react';

function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function CopyButton({ text, className = 'message-copy-btn', label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied
    }
  }, [text]);

  return (
    <button
      className={`${className} ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : label}
      aria-label={copied ? 'Copied to clipboard' : label}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function CodeBlock({ children, className }) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const code = String(children).replace(/\n$/, '');

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{language}</span>
        <CopyButton text={code} className="code-copy-btn" label="Copy code" />
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        showLineNumbers={code.split('\n').length > 4}
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.84rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return <code className={className} {...props}>{children}</code>;
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
};

export default function Message({ message }) {
  const isUser = message.role === 'user';
  const isError = !!message.error;

  if (isUser) {
    return (
      <div className="message-row user">
        <div className="message-bubble">
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  // Assistant (or error) message
  return (
    <div className={`message-row assistant ${isError ? 'error' : ''}`}>
      <div className="message-avatar">
        <Bot size={16} />
      </div>

      <div className="message-content-wrapper">
        {isError ? (
          <div className="message-error-banner">
            <AlertCircle size={16} className="message-error-icon" />
            <div>
              <strong>Error: </strong>
              {message.content}
              <br />
              <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                Check that the backend is running and try again.
              </small>
            </div>
          </div>
        ) : (
          <div className="message-bubble">
            <div className="prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="message-meta">
          <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
          {!isError && (
            <CopyButton
              text={message.content}
              className="message-copy-btn"
              label="Copy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
