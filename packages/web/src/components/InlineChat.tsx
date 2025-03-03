import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineChatProps, useChatStore, DefaultContextManager } from '@llmknow/core';
import styles from '../styles/chat.module.css';
import { useTheme } from './ThemeProvider';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme } = useTheme();
  const [contextManager] = useState(() => 
    enableContext ? new DefaultContextManager(contextSelector) : null
  );
  
  const { messages, isLoading, error, sendMessage, sendContextualMessage } = useChatStore();
  
  // Set theme from props
  useEffect(() => {
    setTheme(themeProp);
  }, [themeProp, setTheme]);
  
  // Update context when content in view changes
  useEffect(() => {
    if (enableContext && contextManager) {
      const updateContext = () => {
        contextManager.updateContextFromVisibleElements();
      };
      
      window.addEventListener('scroll', updateContext);
      window.addEventListener('resize', updateContext);
      
      updateContext();
      
      return () => {
        window.removeEventListener('scroll', updateContext);
        window.removeEventListener('resize', updateContext);
      };
    }
  }, [enableContext, contextManager]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    try {
      onMessage?.({ id: '', role: 'user', content, timestamp: Date.now() });
      
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
    <>
      {/* Search-like trigger */}
      <div className={styles.searchContainer} onClick={() => setIsOpen(true)}>
        <div className={styles.searchBar}>
          <SearchIcon />
          <span className={styles.searchPlaceholder}>Know more about this resume...</span>
          <div className={styles.searchShortcut}>
            <CommandIcon />
            K
          </div>
        </div>
      </div>
      
      {/* Chat dialog */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.dialogContent} style={{ width, maxHeight }}>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.chatContainer}
                  style={{ height }}
                >
                  <div className={styles.chatHeader}>
                    <h2 className={styles.chatTitle}>Ask about this resume</h2>
                    <Dialog.Close className={styles.closeButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </Dialog.Close>
                  </div>
                  
                  <MessageList messages={messages} />
                  
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="Ask anything about my experience..."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}; 