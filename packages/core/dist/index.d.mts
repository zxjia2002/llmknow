import * as zustand_middleware from 'zustand/middleware';
import * as zustand from 'zustand';

/**
 * Chat message role
 */
type MessageRole = 'user' | 'assistant' | 'system';
/**
 * Chat message type
 */
interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: number;
    isStreaming?: boolean;
}
/**
 * Chat state
 */
interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: Error | null;
}
/**
 * Chat engine configuration
 */
interface ChatEngineConfig {
    apiKey?: string;
    apiUrl?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}
/**
 * Chat mode
 */
type ChatMode = 'inline' | 'standalone';
/**
 * Chat theme
 */
type ChatTheme = 'light' | 'dark' | 'system';
/**
 * Chat position
 */
type ChatPosition = 'left' | 'right' | 'bottom';
/**
 * Base chat component props
 */
interface BaseChatProps {
    theme?: ChatTheme;
    width?: number | string;
    height?: number | string;
    maxHeight?: number | string;
    enableContext?: boolean;
    enableHistory?: boolean;
    enableCodeHighlight?: boolean;
    engineConfig?: ChatEngineConfig;
    onMessage?: (message: Message) => void;
    onError?: (error: Error) => void;
    onStateChange?: (state: ChatState) => void;
}
/**
 * Inline chat component props
 */
interface InlineChatProps extends BaseChatProps {
    mode: 'inline';
    position?: ChatPosition;
    contextSelector?: string;
}
/**
 * Standalone chat component props
 */
interface StandaloneChatProps extends BaseChatProps {
    mode: 'standalone';
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}
/**
 * Combined chat component props
 */
type ChatProps = InlineChatProps | StandaloneChatProps;

/**
 * Chat service interface
 */
interface ChatEngine {
    streamResponse(message: string): AsyncGenerator<string>;
    getContextualResponse(message: string, context: string): AsyncGenerator<string>;
    abort(): void;
}
/**
 * Default implementation of the chat engine
 */
declare class DefaultChatEngine implements ChatEngine {
    private controller;
    private config;
    constructor(config: ChatEngineConfig);
    /**
     * Stream a response from the AI model
     */
    streamResponse(message: string): AsyncGenerator<string>;
    /**
     * Get a contextual response based on the message and context
     */
    getContextualResponse(message: string, context: string): AsyncGenerator<string>;
    /**
     * Abort the current response
     */
    abort(): void;
}

/**
 * Context manager interface
 */
interface ContextManager {
    getCurrentContext(): string;
    updateContext(element: HTMLElement): void;
    clearContext(): void;
}
/**
 * Default implementation of the context manager
 */
declare class DefaultContextManager implements ContextManager {
    private context;
    private selector;
    constructor(selector?: string);
    /**
     * Get the current context
     */
    getCurrentContext(): string;
    /**
     * Update the context based on an element
     */
    updateContext(element: HTMLElement): void;
    /**
     * Update context based on the currently visible elements
     */
    updateContextFromVisibleElements(): void;
    /**
     * Clear the context
     */
    clearContext(): void;
}

/**
 * Chat store state
 */
interface ChatStore extends ChatState {
    conversationId: string | null;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, content: string) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: Error | null) => void;
    setConversationId: (id: string | null) => void;
    clearMessages: () => void;
    appendToLastMessage: (content: string) => void;
    startStreamingMessage: (message: Message) => void;
    stopStreamingMessage: (id: string) => void;
    sendMessage: (content: string, engineConfig: ChatEngineConfig) => Promise<void>;
    sendContextualMessage: (content: string, context: string, engineConfig: ChatEngineConfig) => Promise<void>;
    abortResponse: () => void;
}
/**
 * Create the chat store
 */
declare const useChatStore: zustand.UseBoundStore<Omit<zustand.StoreApi<ChatStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<zustand_middleware.PersistOptions<ChatStore, {
            messages: Message[];
            conversationId: string | null;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ChatStore) => void) => () => void;
        onFinishHydration: (fn: (state: ChatStore) => void) => () => void;
        getOptions: () => Partial<zustand_middleware.PersistOptions<ChatStore, {
            messages: Message[];
            conversationId: string | null;
        }>>;
    };
}>;

/**
 * Breakpoint configuration
 */
interface Breakpoints {
    mobile: number;
    tablet: number;
    desktop: number;
}
/**
 * Default breakpoints
 */
declare const defaultBreakpoints: Breakpoints;
/**
 * Responsive configuration
 */
interface ResponsiveConfig {
    fontSize: number;
    spacing: number;
    chatWidth: string;
    chatHeight: string;
    avatarSize: number;
    buttonSize: number;
}
/**
 * Get a responsive configuration based on screen width and platform
 */
declare const getResponsiveConfig: (width: number, platform?: "web" | "h5") => ResponsiveConfig;
/**
 * Hook to get the current window width (browser-only)
 */
declare const getWindowWidth: () => number;

export { type BaseChatProps, type Breakpoints, type ChatEngine, type ChatEngineConfig, type ChatMode, type ChatPosition, type ChatProps, type ChatState, type ChatTheme, type ContextManager, DefaultChatEngine, DefaultContextManager, type InlineChatProps, type Message, type MessageRole, type ResponsiveConfig, type StandaloneChatProps, defaultBreakpoints, getResponsiveConfig, getWindowWidth, useChatStore };
