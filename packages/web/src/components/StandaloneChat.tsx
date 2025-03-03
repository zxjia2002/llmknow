import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StandaloneChatProps, useChatStore } from '@llmknow/core';
import styles from '../styles/standalone.module.css';
import { useTheme } from './ThemeProvider';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

// CloseIcon component
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ChatIcon component
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const StandaloneChat: React.FC<StandaloneChatProps> = ({
  isOpen = false,
  onOpenChange,
  width = '360px',
  height = '500px',
  maxHeight = '80vh',
  engineConfig = {},
  theme: themeProp = 'system',
  enableHistory = true,
  onMessage,
  onError,
  onStateChange,
}) => {
  // Get theme context
  const { setTheme } = useTheme();
  
  // Local state for controlling open/closed state when no onOpenChange is provided
  const [internalIsOpen, setInternalIsOpen] = React.useState(isOpen);
  
  // Determine if the component is open based on props or internal state
  const isOpenState = onOpenChange ? isOpen : internalIsOpen;
  
  // Handle open state changes
  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  
  // Set theme from props
  useEffect(() => {
    setTheme(themeProp);
  }, [themeProp, setTheme]);
  
  // Use chat store
  const { messages, isLoading, error, sendMessage } = useChatStore();
  
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
      
      // Send message
      await sendMessage(content, engineConfig);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  return (
    <>
      {/* Trigger button */}
      <button
        className={styles.chatTrigger}
        onClick={() => handleOpenChange(true)}
        aria-label="Open chat"
      >
        <ChatIcon />
      </button>
      
      {/* Chat dialog */}
      <AnimatePresence>
        {isOpenState && (
          <motion.div
            className={styles.standaloneChatContainer}
            style={{ width, height, maxHeight }}
            initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className={styles.standaloneChatHeader}>
              <h3 className={styles.standaloneChatTitle}>Chat</h3>
              <button
                className={styles.closeButton}
                onClick={() => handleOpenChange(false)}
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Messages */}
            <MessageList messages={messages} />
            
            {/* Input */}
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 