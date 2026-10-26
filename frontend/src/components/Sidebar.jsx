import { useState, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
} from 'lucide-react';
import './Sidebar.css';

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const inputRef = useRef(null);

  function handleDoubleClick(e) {
    e.stopPropagation();
    setRenameValue(conversation.title);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(conversation.id, trimmed);
    }
    setIsRenaming(false);
  }

  function handleRenameKeyDown(e) {
    if (e.key === 'Enter') {
      commitRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
    }
  }

  function handleDeleteClick(e) {
    e.stopPropagation();
    onDelete(conversation.id);
  }

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={() => !isRenaming && onSelect(conversation.id)}
      onDoubleClick={handleDoubleClick}
      title={isRenaming ? undefined : conversation.title}
    >
      {isRenaming ? (
        <input
          ref={inputRef}
          className="conversation-rename-input"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="conversation-title">{conversation.title}</span>
      )}

      {!isRenaming && (
        <button
          className="conversation-delete-btn"
          onClick={handleDeleteClick}
          title="Delete conversation"
          aria-label="Delete conversation"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onToggle,
}) {
  return (
    <>
      {/* Expand button shown when sidebar is collapsed (desktop) */}
      {!isOpen && (
        <button
          className="sidebar-expand-btn"
          onClick={onToggle}
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <Menu size={16} />
        </button>
      )}

      <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`} aria-label="Conversations">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <MessageSquare className="sidebar-logo-icon" size={20} />
            <span className="sidebar-logo-name">SilentChat</span>
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Chat */}
        <button className="sidebar-new-chat-btn" onClick={onNewChat}>
          <Plus size={16} />
          New Chat
        </button>

        {/* Conversation List */}
        <nav className="sidebar-conversations" aria-label="Chat history">
          {conversations.length === 0 ? (
            <p className="sidebar-empty">No conversations yet. Start a new chat!</p>
          ) : (
            <>
              <p className="sidebar-section-label">Recent</p>
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  onSelect={onSelectConversation}
                  onDelete={onDeleteConversation}
                  onRename={onRenameConversation}
                />
              ))}
            </>
          )}
        </nav>

        {/* Footer: Model Info */}
        <div className="sidebar-footer">
          <div className="sidebar-model-info">
            <Zap className="sidebar-model-icon" size={16} />
            <div className="sidebar-model-label">
              <span className="sidebar-model-name">Qwen3:8B</span>
              <span className="sidebar-model-sub">Local · Private</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
