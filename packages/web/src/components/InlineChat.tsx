import React, { useEffect, useState } from 'react';
import { InlineChatProps, useChatStore, DefaultContextManager } from '@llmknow/core';
import styles from '../styles/chat.module.css';
import { useTheme } from './ThemeProvider';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export const InlineChat: React.FC<InlineChatProps> = ({
  position = 'right',
  width = '360px',
  height = '400px',
  maxHeight = '500px',
  enableContext = true,
  engineConfig = {},
  theme: themeProp = 'system',
  onMessage,
  onError,
  onStateChange,
  contextSelector,
}) => {
  // Get theme context
  const { setTheme } = useTheme();
  
  // Set theme from props
  useEffect(() => {
    setTheme(themeProp);
  }, [themeProp, setTheme]);
  
  // Initialize context manager if enableContext is true
  const [contextManager] = useState(() => 
    enableContext ? new DefaultContextManager(contextSelector) : null
  );
  
  // Use chat store
  const { messages, isLoading, error, sendMessage, sendContextualMessage } = useChatStore();
  
  // Update the context when content in view changes (if context is enabled)
  useEffect(() => {
    if (enableContext && contextManager) {
      const updateContext = () => {
        contextManager.updateContextFromVisibleElements();
      };
      
      // Update context on scroll and resize
      window.addEventListener('scroll', updateContext);
      window.addEventListener('resize', updateContext);
      
      // Initial update
      updateContext();
      
      return () => {
        window.removeEventListener('scroll', updateContext);
        window.removeEventListener('resize', updateContext);
      };
    }
  }, [enableContext, contextManager]);
  
  // Call onStateChange when state changes
  useEffect(() => {
    onStateChange?.({ messages, isLoading, error });
  }, [messages, isLoading, error, onStateChange]);
  
  // Call onError when error occurs
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);
  
  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    try {
      // Call onMessage callback
      onMessage?.({ id: '', role: 'user', content, timestamp: Date.now() });
      
      // Use contextual message if context is enabled
      if (enableContext && contextManager) {
        const context = contextManager.getCurrentContext();
        await sendContextualMessage(content, context, engineConfig);
      } else {
        await sendMessage(content, engineConfig);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  return (
    <div 
      className={styles.inlineChatContainer}
      style={{ 
        width, 
        height, 
        maxHeight,
        ...(position === 'left' ? { left: 0 } : { right: 0 })
      }}
    >
      <MessageList messages={messages} />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
      />
    </div>
  );
}; 