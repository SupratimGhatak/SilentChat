import { useState, useEffect } from 'react';
import './App.css';
import { checkBackendHealth } from './api';
import { useConversations } from './hooks/useConversations';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [backendStatus, setBackendStatus] = useState('checking');

  const {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading,
    createNewConversation,
    deleteConversation,
    renameConversation,
    switchConversation,
    sendMessage,
  } = useConversations();

  // Check backend health on mount and periodically
  useEffect(() => {
    let cancelled = false;

    async function doCheck() {
      if (cancelled) return;
      setBackendStatus('checking');
      const healthy = await checkBackendHealth();
      if (!cancelled) {
        setBackendStatus(healthy ? 'online' : 'offline');
      }
    }

    doCheck();

    const interval = setInterval(doCheck, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Close sidebar on mobile when conversation is selected
  function handleSelectConversation(id) {
    switchConversation(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function handleNewChat() {
    createNewConversation();
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function handleRetryConnection() {
    setBackendStatus('checking');
    checkBackendHealth().then((healthy) => {
      setBackendStatus(healthy ? 'online' : 'offline');
    });
  }

  function handleToggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  return (
    <div className="app-container">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        conversations={[...conversations].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        )}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />

      <div className="main-content">
        <ChatArea
          conversation={activeConversation}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          backendStatus={backendStatus}
          onRetryConnection={handleRetryConnection}
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  );
}

export default App;
