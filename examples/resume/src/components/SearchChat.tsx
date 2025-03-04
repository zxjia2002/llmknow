import React, { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { InlineChat } from '@llmknow/web';

const PRESET_QUESTIONS = [
  "What kind of technology stacks does he master?",
  "What is his most recent work experience?",
  "What are his key achievements?",
  "What are his soft skills?",
];

const AttachmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// 配置Coze API with safer environment variable access
const cozeConfig = {
  botId: typeof import.meta.env.VITE_COZE_BOT_ID === 'string' ? import.meta.env.VITE_COZE_BOT_ID : '',
  apiKey: typeof import.meta.env.VITE_COZE_API_KEY === 'string' ? import.meta.env.VITE_COZE_API_KEY : '',
  systemPrompt: "You are a helpful assistant that can provide detailed information about my resume, experience, and qualifications.",
};

// Debug logging for development - simplified to avoid TypeScript issues
const debugLog = (...args: any[]) => {
  if (typeof import.meta.env.DEV === 'boolean' && import.meta.env.DEV) {
    console.log('[SearchChat]', ...args);
  }
};

// Immediately log config for debugging - with safer checks
console.log('SearchChat cozeConfig:', {
  botId: cozeConfig.botId ? cozeConfig.botId.substring(0, 5) + '...' : 'undefined',
  apiKey: cozeConfig.apiKey ? cozeConfig.apiKey.substring(0, 5) + '...' : 'undefined',
  hasEnvVars: {
    botId: Boolean(import.meta.env.VITE_COZE_BOT_ID),
    apiKey: Boolean(import.meta.env.VITE_COZE_API_KEY)
  }
});

export default function SearchChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [chatKey, setChatKey] = useState(Date.now()); // Force re-render of chat component
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debug mode
  const DEBUG = false;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Validate Coze config when component mounts
    if (!cozeConfig.botId || !cozeConfig.apiKey) {
      console.error('Missing Coze API configuration. Please check your .env file for VITE_COZE_BOT_ID and VITE_COZE_API_KEY.');
    } else {
      debugLog('Coze configuration loaded:', { 
        botId: cozeConfig.botId.substring(0, 5) + '...',
        apiKey: cozeConfig.apiKey.substring(0, 5) + '...'
      });
    }
  }, []);

  const handleQuestionClick = (question: string) => {
    debugLog('Question clicked:', question);
    setInputValue(question);
    
    // Set the current message directly and reset the chat
    setCurrentMessage(question);
    setIsWaitingForResponse(true);
    setChatKey(Date.now());
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    debugLog('Files selected:', files);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      debugLog('Sending message:', {
        message: inputValue,
        attachments,
        config: {
          botId: cozeConfig.botId.substring(0, 5) + '...',
          apiKey: cozeConfig.apiKey.substring(0, 5) + '...'
        }
      });

      // Set the current message and reset the chat
      setCurrentMessage(inputValue);
      setIsWaitingForResponse(true);
      setInputValue('');
      setAttachments([]);
      setChatKey(Date.now());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render the InlineChat component with better debug messages
  const renderChatComponent = () => {
    if (!currentMessage) {
      return (
        <div className="text-center py-8 text-white/50">
          Ask a question to start the conversation
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4 p-3 bg-geist-surface rounded-lg">
          <div className="font-medium">You asked:</div>
          <div className="mt-1">{currentMessage}</div>
        </div>
        
        {isWaitingForResponse && (
          <div className="animate-pulse text-vercel-blue">
            Waiting for response...
          </div>
        )}
        
        <InlineChat
          key={chatKey}
          mode="inline"
          initialMessage={currentMessage}
          enableContext={true}
          engineConfig={cozeConfig}
          onMessage={(message) => {
            debugLog('Message received:', message);
            setIsWaitingForResponse(false);
          }}
          onError={(error) => {
            debugLog('Error:', error);
            console.error('Chat error:', error);
            setIsWaitingForResponse(false);
          }}
        />
      </div>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="w-full max-w-2xl mx-auto flex items-center gap-2 px-4 py-2 text-sm text-white bg-geist-surface border border-geist-border rounded-lg hover:border-geist-foreground/50 transition-colors">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
            <path
              d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
          Ask me anything about my resume...
          <div className="ml-auto flex items-center gap-1 text-xs text-white/70">
            <kbd className="px-1.5 py-0.5 bg-geist-background border border-geist-border rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-geist-background border border-geist-border rounded">K</kbd>
          </div>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-geist-background border border-geist-border rounded-lg shadow-lg">
          <div className="p-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <div className="flex-1 min-h-[20px] max-h-[200px] relative bg-[#1C1C1C] rounded-xl border border-geist-border overflow-hidden focus-within:border-vercel-blue">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question or select from below..."
                  className="w-full min-h-[56px] px-4 py-4 pr-20 bg-transparent text-white focus:outline-none"
                />
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <button 
                    onClick={handleAttachmentClick}
                    className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-geist-surface-secondary transition-colors"
                    title="Attach files"
                  >
                    <AttachmentIcon />
                    {attachments.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-vercel-blue text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {attachments.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      inputValue.trim() 
                        ? 'text-white hover:bg-vercel-blue/20' 
                        : 'text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
              {/* Show attached files */}
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 px-2 py-1 bg-geist-surface rounded text-sm">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                        className="text-white/50 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Suggested Questions</h3>
              <div className="flex flex-wrap gap-2">
                {PRESET_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleQuestionClick(question)}
                    className="px-3 py-1.5 text-sm text-white bg-geist-surface border border-geist-border rounded-full hover:bg-geist-surface-secondary transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="mt-4 border-t border-geist-border pt-4">
              {renderChatComponent()}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 