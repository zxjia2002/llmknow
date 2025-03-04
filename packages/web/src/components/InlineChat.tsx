import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineChatProps, useChatStore, DefaultContextManager, Message } from '@llmknow/core';
import styles from '../styles/chat.module.css';
import { useTheme } from './ThemeProvider';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { v4 as uuidv4 } from 'uuid';

// Search icon component
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" />
  </svg>
);

// Command icon component
const CommandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </svg>
);

// Close icon component
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const InlineChat: React.FC<InlineChatProps> = ({
  width = '600px',
  height = '400px',
  maxHeight = '80vh',
  enableContext = true,
  engineConfig = {},
  theme: themeProp = 'system',
  onMessage,
  onError,
  onStateChange,
  contextSelector,
  initialMessage,
}) => {
  const { theme: activeTheme } = useTheme();
  const chatInputRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Get the messages, loading state, and error from the store
  const { messages, isLoading, error, sendMessage, sendContextualMessage, abortResponse } = useChatStore(
    (state) => ({
      messages: state.messages,
      isLoading: state.isLoading,
      error: state.error,
      sendMessage: state.sendMessage,
      sendContextualMessage: state.sendContextualMessage,
      abortResponse: state.abortResponse,
    })
  );

  // Create context manager if context is enabled
  const contextManager = useMemo(() => {
    if (enableContext) {
      return new DefaultContextManager(contextSelector);
    }
    return null;
  }, [enableContext, contextSelector]);

  // Update context when the component mounts and when the selector changes
  useEffect(() => {
    if (contextManager) {
      contextManager.updateContextFromVisibleElements();
    }
  }, [contextManager]);

  // Process the initial message if provided
  useEffect(() => {
    if (initialMessage && !messages.length) {
      console.log("=== InlineChat 处理初始消息 ===");
      console.log("初始消息:", initialMessage);
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Notify parent if callback is provided
    if (onStateChange) {
      onStateChange({ messages, isLoading, error });
    }
  }, [messages, isLoading, error, onStateChange]);

  // Notify parent of errors
  useEffect(() => {
    if (error && onError) {
      console.error("=== InlineChat 错误 ===", error);
      onError(error);
    }
  }, [error, onError]);

  // Notify parent of new messages
  useEffect(() => {
    if (messages.length > 0 && onMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !lastMessage.isStreaming) {
        console.log("=== InlineChat 新消息 ===", {
          id: lastMessage.id,
          role: lastMessage.role,
          contentLength: lastMessage.content.length
        });
        onMessage(lastMessage);
      }
    }
  }, [messages, onMessage]);

  // Focus the input when the chat is expanded
  useEffect(() => {
    if (isExpanded && chatInputRef.current) {
      const inputElement = chatInputRef.current.querySelector('input, textarea');
      if (inputElement instanceof HTMLElement) {
        inputElement.focus();
      }
    }
  }, [isExpanded]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle chat with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleExpanded();
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const updateContext = () => {
    if (contextManager) {
      console.log("=== InlineChat 更新上下文 ===");
      contextManager.updateContextFromVisibleElements();
    }
  };

  const handleSendMessage = async (content: string) => {
    console.log("=== InlineChat.handleSendMessage 开始 ===");
    console.log("消息内容:", content.substring(0, 50) + (content.length > 50 ? '...' : ''));
    console.log("引擎配置:", {
      botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + '...' : 'undefined',
      apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + '...' : 'undefined',
      hasSystemPrompt: !!engineConfig.systemPrompt
    });
    
    try {
      if (enableContext && contextManager) {
        const context = contextManager.getCurrentContext();
        console.log("使用上下文发送消息，上下文长度:", context.length);
        sendContextualMessage(content, context, engineConfig);
      } else {
        console.log("直接发送消息，无上下文");
        sendMessage(content, engineConfig);
      }

      // Notify parent if callback is provided
      if (onMessage) {
        const message: Message = {
          id: uuidv4(),
          role: 'user',
          content,
          timestamp: Date.now(),
        };
        console.log("通知父组件新消息");
        onMessage(message);
      }
      
      console.log("=== InlineChat.handleSendMessage 完成 ===");
    } catch (err) {
      console.error("=== InlineChat.handleSendMessage 错误 ===", err);
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    // Update context when opening the chat
    if (!isExpanded && contextManager) {
      updateContext();
    }
  };

  return (
    <div 
      className={styles.inlineChatContainer} 
      style={{
        width,
        maxHeight: isExpanded ? maxHeight : 'auto',
      }}
      data-theme={activeTheme}
    >
      {!isExpanded ? (
        <button 
          className={styles.searchBar} 
          onClick={toggleExpanded}
          aria-label="Open chat"
        >
          <div className={styles.searchPlaceholder}>
            <SearchIcon />
            <span>Ask me anything...</span>
          </div>
          <div className={styles.searchShortcut}>
            <span>/</span>
          </div>
        </button>
      ) : (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>Ask me</div>
            <button 
              className={styles.closeButton} 
              onClick={toggleExpanded}
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </div>
          
          <div className={styles.messageList}>
            <MessageList messages={messages} scrollToBottom={true} />
            {error && (
              <div className={styles.errorMessage}>
                <span>Error: {error.message}</span>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
          
          <div className={styles.inputContainer} ref={chatInputRef}>
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading}
              placeholder="Type a message..."
            />
          </div>
        </div>
      )}
    </div>
  );
}; 