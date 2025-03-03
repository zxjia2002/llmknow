/**
 * Chat message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message type
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

/**
 * Chat state
 */
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Chat engine configuration
 */
export interface ChatEngineConfig {
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
export type ChatMode = 'inline' | 'standalone';

/**
 * Chat theme
 */
export type ChatTheme = 'light' | 'dark' | 'system';

/**
 * Chat position
 */
export type ChatPosition = 'left' | 'right' | 'bottom';

/**
 * Base chat component props
 */
export interface BaseChatProps {
  // Appearance
  theme?: ChatTheme;
  width?: number | string;
  height?: number | string;
  maxHeight?: number | string;
  
  // Functionality
  enableContext?: boolean;
  enableHistory?: boolean;
  enableCodeHighlight?: boolean;
  
  // Engine configuration
  engineConfig?: ChatEngineConfig;
  
  // Events
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ChatState) => void;
}

/**
 * Inline chat component props
 */
export interface InlineChatProps extends BaseChatProps {
  mode: 'inline';
  position?: ChatPosition;
  contextSelector?: string;
}

/**
 * Standalone chat component props
 */
export interface StandaloneChatProps extends BaseChatProps {
  mode: 'standalone';
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onBack?: () => void;
}

/**
 * Combined chat component props
 */
export type ChatProps = InlineChatProps | StandaloneChatProps; 