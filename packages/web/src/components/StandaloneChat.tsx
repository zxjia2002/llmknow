import React from 'react';
import { StandaloneChatProps } from '@llmknow/core';
import { useTheme } from './ThemeProvider';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { useChatStore } from '@llmknow/core';
import styles from '../styles/standalone.module.css';

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const StandaloneChat: React.FC<StandaloneChatProps> = ({
  engineConfig = {},
  theme: themeProp = 'system',
  onMessage,
  onError,
  onStateChange,
  onBack,
}) => {
  const { activeThemeClass } = useTheme();
  const { messages, isLoading, error, sendMessage } = useChatStore();

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content, engineConfig);
      onMessage?.(messages[messages.length - 1]);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <div className={`${styles.chatContainer} ${activeThemeClass}`}>
      <header className={styles.chatHeader}>
        {onBack && (
          <button onClick={onBack} className={styles.backButton}>
            <BackIcon />
            <span>Back</span>
          </button>
        )}
        {/* <h1 className={styles.chatTitle}>Chat with AI</h1> */}
      </header>

      <div className={styles.messageList}>
        <MessageList messages={messages} />
      </div>

      {/* <div className={styles.inputContainer}>
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Type your message..."
        />
      </div> */}

      {error && (
        <div className={styles.error}>
          {error.message}
        </div>
      )}
    </div>
  );
}; 