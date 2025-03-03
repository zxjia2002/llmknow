import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StandaloneChat } from '@llmknow/web';
import { additionalInfo } from '../data';

const EXAMPLE_CHATS = [
  { id: 1, title: "Previous Projects", preview: "Tell me about your most challenging projects..." },
  { id: 2, title: "Work Experience", preview: "What was your role at your last company?" },
  { id: 3, title: "Technical Skills", preview: "What programming languages are you proficient in?" },
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

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-geist-background text-white">
      <div className="grid grid-cols-[280px_1fr] h-screen">
        {/* Sidebar */}
        <aside className="bg-geist-surface border-r border-geist-border flex flex-col">
          <div className="p-4 border-b border-geist-border">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9.5 13L4.5 8L9.5 3" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Back to Resume
            </Link>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-4">
                Chat History
              </h2>
              <div className="space-y-2">
                {EXAMPLE_CHATS.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      selectedChat === chat.id
                        ? 'bg-vercel-blue/10 border border-vercel-blue'
                        : 'hover:bg-geist-surface-secondary border border-transparent'
                    }`}
                  >
                    <h3 className="text-sm font-medium mb-1">{chat.title}</h3>
                    <p className="text-xs text-white/70 truncate">{chat.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-geist-border">
            <button
              onClick={() => setSelectedChat(null)}
              className="w-full px-4 py-2 bg-vercel-blue text-white rounded-lg hover:bg-vercel-blue/90 transition-colors"
            >
              New Chat
            </button>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-col h-screen bg-[#0C0C0C]">
          <header className="shrink-0 p-4 border-b border-geist-border bg-geist-surface flex items-center justify-between">
            <h1 className="text-xl font-semibold">Chat with My Resume AI</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-geist-surface-secondary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-geist-surface-secondary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8a5 5 0 1 0 10 0 5 5 0 0 0-10 0z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto">
              <div className="min-h-full flex flex-col">
                <div className="flex-1 p-6">
                  <div className="max-w-3xl mx-auto">
                    <StandaloneChat 
                      context={additionalInfo}
                      systemPrompt="You are a helpful assistant that can provide detailed information about my resume, experience, and qualifications."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="shrink-0 border-t border-geist-border bg-geist-surface p-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2">
                <div className="flex-1 min-h-[20px] max-h-[200px] relative bg-[#1C1C1C] rounded-xl border border-geist-border overflow-hidden focus-within:border-vercel-blue">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message..."
                    className="w-full min-h-[56px] max-h-[200px] px-4 py-4 pr-20 bg-transparent text-white resize-none focus:outline-none"
                    style={{ scrollbarWidth: 'none' }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    <button 
                      className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-geist-surface-secondary transition-colors"
                      title="Attach files"
                    >
                      <AttachmentIcon />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className={`p-2 rounded-lg transition-colors ${
                        message.trim() 
                          ? 'text-white hover:bg-vercel-blue/20' 
                          : 'text-white/30 cursor-not-allowed'
                      }`}
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-center text-white/50">
                AI responses may contain inaccuracies. Please verify important information.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 