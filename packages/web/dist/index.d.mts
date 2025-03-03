import React from 'react';
import { ChatTheme, InlineChatProps, StandaloneChatProps, Message } from '@llmknow/core';

interface ThemeContextType {
    theme: ChatTheme;
    setTheme: (theme: ChatTheme) => void;
    activeThemeClass: string;
}
declare const useTheme: () => ThemeContextType;
interface ThemeProviderProps {
    initialTheme?: ChatTheme;
    children: React.ReactNode;
}
declare const ThemeProvider: React.FC<ThemeProviderProps>;

declare const InlineChat: React.FC<InlineChatProps>;

declare const StandaloneChat: React.FC<StandaloneChatProps>;

interface ChatMessageProps {
    message: Message;
}
declare const ChatMessage: React.FC<ChatMessageProps>;

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}
declare const ChatInput: React.FC<ChatInputProps>;

interface MessageListProps {
    messages: Message[];
    scrollToBottom?: boolean;
}
declare const MessageList: React.FC<MessageListProps>;

export { ChatInput, ChatMessage, InlineChat, MessageList, StandaloneChat, ThemeProvider, useTheme };
