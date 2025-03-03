import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@llmknow/core';
import styles from '../styles/chat.module.css';
import clsx from 'clsx';

// Icons
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AssistantIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Loading indicator
const LoadingIndicator = () => (
  <div className={styles.loadingIndicator}>
    <span className={styles.dot}>.</span>
    <span className={styles.dot}>.</span>
    <span className={styles.dot}>.</span>
  </div>
);

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, isStreaming } = message;

  // Format the timestamp
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const messageClass = {
    user: styles.userMessage,
    assistant: styles.assistantMessage,
    system: styles.systemMessage,
  }[role];

  return (
    <div className={clsx(messageClass, 'animate-fade-in')}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-shrink-0">
          {role === 'user' ? <UserIcon /> : <AssistantIcon />}
        </div>
        <div className="text-xs text-gray-500">{timestamp}</div>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
        {isStreaming && <LoadingIndicator />}
      </div>
    </div>
  );
}; 