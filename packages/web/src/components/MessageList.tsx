import React, { useRef, useEffect } from 'react';
import { Message } from '@llmknow/core';
import styles from '../styles/chat.module.css';
import { ChatMessage } from './ChatMessage';

interface MessageListProps {
  messages: Message[];
  scrollToBottom?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  scrollToBottom = true,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollToBottom && listRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only auto-scroll if the last message is from the AI or is streaming
      if (lastMessage.role === 'assistant' || lastMessage.isStreaming) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [messages, scrollToBottom]);

  return (
    <div className={styles.messageList} ref={listRef}>
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 p-4">
          <p>What do you want to know about me today?</p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}
    </div>
  );
}; 