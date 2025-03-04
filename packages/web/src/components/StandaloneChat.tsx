import React, { useEffect } from 'react';
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
  
  console.log("=== StandaloneChat 初始化 ===");
  console.log("引擎配置:", {
    botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + '...' : 'undefined',
    apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + '...' : 'undefined',
    hasSystemPrompt: !!engineConfig.systemPrompt
  });

  // 通知父组件状态变化
  useEffect(() => {
    if (onStateChange) {
      onStateChange({ messages, isLoading, error });
    }
  }, [messages, isLoading, error, onStateChange]);

  // 通知父组件错误
  useEffect(() => {
    if (error && onError) {
      console.error("=== StandaloneChat 错误 ===", error);
      onError(error);
    }
  }, [error, onError]);

  // 通知父组件新消息
  useEffect(() => {
    if (messages.length > 0 && onMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !lastMessage.isStreaming) {
        console.log("=== StandaloneChat 新消息 ===", {
          id: lastMessage.id,
          role: lastMessage.role,
          contentLength: lastMessage.content.length
        });
        onMessage(lastMessage);
      }
    }
  }, [messages, onMessage]);

  const handleSendMessage = async (content: string) => {
    console.log("=== StandaloneChat.handleSendMessage 开始 ===");
    console.log("消息内容:", content.substring(0, 50) + (content.length > 50 ? '...' : ''));
    
    try {
      console.log("发送消息到聊天引擎");
      await sendMessage(content, engineConfig);
      
      // 这里不需要手动通知父组件，因为我们在useEffect中监听messages变化
      console.log("=== StandaloneChat.handleSendMessage 完成 ===");
    } catch (err) {
      console.error("=== StandaloneChat.handleSendMessage 错误 ===", err);
      if (onError) {
        onError(err as Error);
      }
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