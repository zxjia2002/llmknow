import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { InlineChat } from '@llmknow/web';
import { additionalInfo } from '../data';

const PRESET_QUESTIONS = [
  "What kind of technology stacks does he master?",
  "What is his most recent work experience?",
  "What are his key achievements?",
  "What are his soft skills?",
];

export default function SearchChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className="w-full max-w-2xl mx-auto flex items-center gap-2 px-4 py-2 text-sm text-white bg-geist-surface border border-geist-border rounded-lg hover:border-geist-foreground/50 transition-colors"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
          >
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
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Suggested Questions</h3>
              <div className="flex flex-wrap gap-2">
                {PRESET_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => setSelectedQuestion(question)}
                    className="px-3 py-1.5 text-sm text-white bg-geist-surface border border-geist-border rounded-full hover:bg-geist-surface-secondary transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
            <InlineChat
              initialMessage={selectedQuestion}
              context={additionalInfo}
              systemPrompt="You are a helpful assistant that can provide detailed information about my resume, experience, and qualifications."
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 