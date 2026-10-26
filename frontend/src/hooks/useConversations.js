import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage } from '../api';

const STORAGE_KEY = 'silentchat_conversations';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveToStorage(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage may be full or unavailable; silently ignore
  }
}

/**
 * useConversations — manages all conversation state with localStorage persistence.
 */
export function useConversations() {
  const [conversations, setConversations] = useState(() => loadFromStorage());
  const [activeConversationId, setActiveConversationId] = useState(() => {
    const saved = loadFromStorage();
    return saved.length > 0 ? saved[0].id : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage whenever conversations change
  useEffect(() => {
    saveToStorage(conversations);
  }, [conversations]);

  const createNewConversation = useCallback(() => {
    const newConv = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv.id;
  }, []);

  const deleteConversation = useCallback(
    (id) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        return updated;
      });
      setActiveConversationId((prev) => {
        if (prev !== id) return prev;
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      });
    },
    [conversations],
  );

  const renameConversation = useCallback((id, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c,
      ),
    );
  }, []);

  const switchConversation = useCallback((id) => {
    setActiveConversationId(id);
  }, []);

  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim() || isLoading) return;

      let targetId = activeConversationId;

      // Auto-create a conversation if none is active
      if (!targetId) {
        const newConv = {
          id: generateId(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        targetId = newConv.id;
      }

      const userMessage = {
        id: generateId(),
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date().toISOString(),
      };

      // Derive the title from first message if conversation is new
      let autoTitle = null;
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === targetId);
        if (conv && conv.messages.length === 0) {
          autoTitle = messageText.trim().slice(0, 50);
        }
        return prev.map((c) =>
          c.id === targetId
            ? {
                ...c,
                title: autoTitle || c.title,
                messages: [...c.messages, userMessage],
                updatedAt: new Date().toISOString(),
              }
            : c,
        );
      });

      setIsLoading(true);

      try {
        // Build history from current conversation messages (before this new message)
        const currentConv = conversations.find((c) => c.id === targetId);
        const history = (currentConv?.messages || []).map(({ role, content }) => ({
          role,
          content,
        }));

        const { reply, model } = await sendChatMessage(messageText.trim(), history);

        const assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: reply,
          model,
          timestamp: new Date().toISOString(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  messages: [...c.messages, assistantMessage],
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        );
      } catch (err) {
        const errorMessage = {
          id: generateId(),
          role: 'assistant',
          content: err.message || 'An unexpected error occurred.',
          timestamp: new Date().toISOString(),
          error: true,
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? {
                  ...c,
                  messages: [...c.messages, errorMessage],
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, conversations, isLoading],
  );

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading,
    createNewConversation,
    deleteConversation,
    renameConversation,
    switchConversation,
    sendMessage,
  };
}
