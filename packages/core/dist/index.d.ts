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
    botId?: string;
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
 * Base chat props
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
 * Inline chat props
 */
interface InlineChatProps extends BaseChatProps {
    mode: 'inline';
    position?: ChatPosition;
    contextSelector?: string;
    initialMessage?: string;
}
/**
 * Standalone chat props
 */
interface StandaloneChatProps extends BaseChatProps {
    mode: 'standalone';
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    onBack?: () => void;
}
/**
 * Combined chat props
 */
type ChatProps = InlineChatProps | StandaloneChatProps;

/**
 * Interface for a chat engine
 */
interface ChatEngine {
    streamResponse(message: string): AsyncGenerator<string>;
    getContextualResponse(message: string, context: string): AsyncGenerator<string>;
    abort(): void;
}
/**
 * Default implementation of the chat engine using the Coze API
 */
declare class DefaultChatEngine implements ChatEngine {
    private controller;
    private readonly config;
    private cozeClient;
    private DEBUG;
    constructor(config: ChatEngineConfig);
    /**
     * 获取当前配置
     */
    getConfig(): ChatEngineConfig;
    /**
     * 流式响应用户消息
     * @param message 用户消息
     * @returns 异步生成器，生成响应片段
     */
    streamResponse(message: string): AsyncGenerator<string>;
    /**
     * 获取基于上下文的响应
     * @param message 用户消息
     * @param context 上下文内容
     * @returns 异步生成器，生成响应片段
     */
    getContextualResponse(message: string, context: string): AsyncGenerator<string>;
    /**
     * 中止当前响应
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
 * 浏览器特定的Coze客户端适配器
 * 该文件避免了对Node.js特定模块的依赖，例如'ws'
 */

interface CozeMessage {
    role: string;
    content: string;
    content_type: string;
}
interface CozeRequest {
    bot_id: string;
    messages: CozeMessage[];
    stream?: boolean;
    user_id?: string;
}
interface CozeResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}
interface CozeStreamChunk {
    event: string;
    data: {
        content?: string;
    };
}
/**
 * Coze API 错误类
 */
declare class CozeApiError extends Error {
    status?: number;
    code?: number;
    responseText?: string;
    constructor(message: string, options?: {
        status?: number;
        code?: number;
        responseText?: string;
    });
}
/**
 * Coze API 客户端 - 浏览器版本
 * 该版本避免了对Node.js特定模块的依赖
 */
declare class CozeBrowserClient {
    private botId;
    private accessToken;
    private DEBUG;
    private readonly API_PATHS;
    private readonly API_BASE_URL;
    private apiUrl;
    private currentPathIndex;
    /**
     * 创建Coze API客户端
     * @param botId Coze机器人ID
     * @param accessToken Coze API密钥
     */
    constructor(botId: string, accessToken: string);
    /**
     * 切换API路径
     * 如果某个API路径失败，可以调用此方法尝试下一个路径
     * @returns 是否成功切换路径
     */
    switchApiPath(): boolean;
    /**
     * 在不同域名间切换 (.com/.cn)
     * 仅用于兼容旧代码，现在使用switchApiPath代替
     */
    switchDomain(): boolean;
    /**
     * 将Message数组转换为Coze API格式的消息
     */
    private convertMessages;
    /**
     * 使用认证发送请求
     */
    private fetchWithAuth;
    /**
     * 发送聊天请求并获取响应
     */
    chat(messages: Message[], config?: ChatEngineConfig): Promise<string>;
    /**
     * 轮询聊天状态直到完成
     * @param apiUrl API基础URL
     * @param chatId 聊天ID
     * @returns 完成后的聊天内容
     */
    private pollChatStatus;
    /**
     * 从响应中提取内容
     * 支持多种响应格式
     */
    private extractContentFromResponse;
    /**
     * 流式聊天 - 返回一个异步生成器，逐步生成响应
     */
    streamChat(messages: Message[], config?: ChatEngineConfig): AsyncGenerator<string>;
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

export { type BaseChatProps, type Breakpoints, type ChatEngine, type ChatEngineConfig, type ChatMode, type ChatPosition, type ChatProps, type ChatState, type ChatTheme, type ContextManager, CozeApiError, CozeBrowserClient, type CozeMessage, type CozeRequest, type CozeResponse, type CozeStreamChunk, DefaultChatEngine, DefaultContextManager, type InlineChatProps, type Message, type MessageRole, type ResponsiveConfig, type StandaloneChatProps, defaultBreakpoints, getResponsiveConfig, getWindowWidth, useChatStore };
