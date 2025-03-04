import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatState, ChatEngineConfig } from '../types/chat';
import { DefaultChatEngine } from '../services/chat';

/**
 * Chat store state
 */
interface ChatStore extends ChatState {
  // State
  conversationId: string | null;
  
  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setConversationId: (id: string | null) => void;
  clearMessages: () => void;
  
  // Stream handling
  appendToLastMessage: (content: string) => void;
  startStreamingMessage: (message: Message) => void;
  stopStreamingMessage: (id: string) => void;
  
  // Chat operations
  sendMessage: (content: string, engineConfig: ChatEngineConfig) => Promise<void>;
  sendContextualMessage: (content: string, context: string, engineConfig: ChatEngineConfig) => Promise<void>;
  abortResponse: () => void;
}

// Chat engine instance
let chatEngine: DefaultChatEngine | null = null;
// Store the last used config to compare
let lastEngineConfig: ChatEngineConfig | null = null;

// Debug mode
const DEBUG = true;

// Debug logging
function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[ChatStore] ${message}`, data || '');
  }
}

/**
 * Create the chat store
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      return {
        // Initial state
        messages: [],
        isLoading: false,
        error: null,
        conversationId: null,
        
        // State setters
        setMessages: (messages: Message[]) => {
          debugLog('Setting messages', { count: messages.length });
          set({ messages });
        },
        addMessage: (message: Message) => {
          debugLog('Adding message', { id: message.id, role: message.role });
          set((state) => ({ 
            messages: [...state.messages, message],
          }));
        },
        updateMessage: (id: string, content: string) => {
          debugLog('Updating message', { id, contentLength: content.length });
          set((state) => ({
            messages: state.messages.map((message: Message) =>
              message.id === id ? { ...message, content } : message
            ),
          }));
        },
        setIsLoading: (isLoading: boolean) => {
          debugLog('Setting loading state', { isLoading });
          set({ isLoading });
        },
        setError: (error: Error | null) => {
          if (error) {
            console.error('[ChatStore] Error:', error);
          }
          set({ error });
        },
        setConversationId: (id: string | null) => {
          debugLog('Setting conversation ID', { id });
          set({ conversationId: id });
        },
        clearMessages: () => {
          debugLog('Clearing messages');
          set({ messages: [], conversationId: null });
        },
        
        // Stream handling
        appendToLastMessage: (content: string) => {
          debugLog('Appending to last message', { contentLength: content.length });
          set((state) => {
            const messages = [...state.messages];
            const lastMessage = messages[messages.length - 1];
            
            if (lastMessage && lastMessage.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + content,
              };
            }
            
            return { messages };
          });
        },
        startStreamingMessage: (message: Message) => {
          debugLog('Starting streaming message', { id: message.id });
          set((state) => ({
            messages: [...state.messages, { ...message, isStreaming: true }],
          }));
        },
        stopStreamingMessage: (id: string) => {
          debugLog('Stopping streaming message', { id });
          set((state) => ({
            messages: state.messages.map((message: Message) =>
              message.id === id ? { ...message, isStreaming: false } : message
            ),
          }));
        },
        
        // Chat operations
        sendMessage: async (content: string, engineConfig: ChatEngineConfig) => {
          console.log('=== ChatStore.sendMessage 开始 ===');
          console.log('消息内容:', content.substring(0, 50) + (content.length > 50 ? '...' : ''));
          console.log('引擎配置:', {
            botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + '...' : 'undefined',
            apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + '...' : 'undefined',
            hasSystemPrompt: !!engineConfig.systemPrompt
          });
          
          try {
            set({ isLoading: true, error: null });
            
            // Create user message
            const userMessage: Message = {
              id: uuidv4(),
              role: 'user',
              content,
              timestamp: Date.now(),
            };
            
            // Add user message to chat
            get().addMessage(userMessage);
            
            // Initialize chat engine if necessary
            if (!chatEngine || !lastEngineConfig || 
                JSON.stringify(lastEngineConfig) !== JSON.stringify(engineConfig)) {
              console.log('创建新的聊天引擎实例');
              try {
                chatEngine = new DefaultChatEngine(engineConfig);
                // Update the last used config
                lastEngineConfig = { ...engineConfig };
                console.log('聊天引擎创建成功');
              } catch (initError) {
                console.error('聊天引擎初始化失败:', initError);
                set({ 
                  isLoading: false, 
                  error: initError instanceof Error ? initError : new Error('Failed to initialize chat engine') 
                });
                return;
              }
            } else {
              console.log('使用现有聊天引擎实例');
            }
            
            // Create assistant message placeholder
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
            };
            
            // Start streaming the assistant message
            get().startStreamingMessage(assistantMessage);
            
            try {
              console.log('开始流式响应');
              // Stream response
              let chunkCount = 0;
              for await (const chunk of chatEngine.streamResponse(content)) {
                chunkCount++;
                if (chunkCount === 1) {
                  console.log('收到第一个响应块:', chunk.substring(0, 30) + (chunk.length > 30 ? '...' : ''));
                }
                if (chunkCount % 10 === 0) {
                  console.log(`已收到 ${chunkCount} 个响应块`);
                }
                get().appendToLastMessage(chunk);
              }
              console.log(`流式响应完成，共收到 ${chunkCount} 个响应块`);
            } catch (streamError) {
              console.error('流式响应错误:', streamError);
              // Set error but don't remove the partial message
              set({ 
                error: streamError instanceof Error ? streamError : new Error('Error streaming response'),
                isLoading: false
              });
            }
            
            // Mark streaming as complete
            get().stopStreamingMessage(assistantMessage.id);
            set({ isLoading: false });
            console.log('=== ChatStore.sendMessage 完成 ===');
          } catch (error) {
            console.error('发送消息错误:', error);
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error : new Error('Failed to send message') 
            });
          }
        },
        
        sendContextualMessage: async (content: string, context: string, engineConfig: ChatEngineConfig) => {
          console.log('=== ChatStore.sendContextualMessage 开始 ===');
          console.log('消息内容:', content.substring(0, 50) + (content.length > 50 ? '...' : ''));
          console.log('上下文长度:', context.length);
          console.log('引擎配置:', {
            botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + '...' : 'undefined',
            apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + '...' : 'undefined',
            hasSystemPrompt: !!engineConfig.systemPrompt
          });
          
          try {
            set({ isLoading: true, error: null });
            
            // Create user message
            const userMessage: Message = {
              id: uuidv4(),
              role: 'user',
              content,
              timestamp: Date.now(),
            };
            
            // Add user message to chat
            get().addMessage(userMessage);
            
            // Initialize chat engine if necessary
            if (!chatEngine || !lastEngineConfig || 
                JSON.stringify(lastEngineConfig) !== JSON.stringify(engineConfig)) {
              console.log('创建新的聊天引擎实例');
              try {
                chatEngine = new DefaultChatEngine(engineConfig);
                // Update the last used config
                lastEngineConfig = { ...engineConfig };
                console.log('聊天引擎创建成功');
              } catch (initError) {
                console.error('聊天引擎初始化失败:', initError);
                set({ 
                  isLoading: false, 
                  error: initError instanceof Error ? initError : new Error('Failed to initialize chat engine') 
                });
                return;
              }
            } else {
              console.log('使用现有聊天引擎实例');
            }
            
            // Create assistant message placeholder
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
            };
            
            // Start streaming the assistant message
            get().startStreamingMessage(assistantMessage);
            
            try {
              console.log('开始流式响应');
              // Stream contextual response
              let chunkCount = 0;
              let totalContent = '';
              let hasReceivedContent = false;
              
              // 设置超时
              const timeoutPromise = new Promise<void>((_, reject) => {
                setTimeout(() => {
                  reject(new Error('流式响应超时 (30秒)'));
                }, 30000);
              });
              
              // 创建一个异步函数来处理流式响应
              const processStream = async () => {
                try {
                  if (!chatEngine) {
                    throw new Error('聊天引擎未初始化');
                  }
                  
                  for await (const chunk of chatEngine.getContextualResponse(content, context)) {
                    // 检查chunk是否为空
                    if (!chunk) {
                      console.log(`收到空响应块 #${chunkCount + 1}`);
                      continue;
                    }
                    
                    chunkCount++;
                    hasReceivedContent = true;
                    totalContent += chunk;
                    
                    if (chunkCount === 1) {
                      console.log('收到第一个响应块:', chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
                    }
                    
                    if (chunkCount % 5 === 0) {
                      console.log(`已收到 ${chunkCount} 个响应块，总长度: ${totalContent.length}`);
                    }
                    
                    get().appendToLastMessage(chunk);
                  }
                } catch (error) {
                  throw error;
                }
              };
              
              // 使用Promise.race来处理超时
              try {
                await Promise.race([processStream(), timeoutPromise]);
              } catch (error) {
                if (error instanceof Error && error.message.includes('超时')) {
                  console.warn('流式响应超时:', error.message);
                  
                  // 如果已经收到了一些内容，则继续，否则抛出错误
                  if (!hasReceivedContent) {
                    throw error;
                  } else {
                    console.log('已收到部分内容，继续处理');
                  }
                } else {
                  throw error;
                }
              }
              
              console.log(`流式响应完成，共收到 ${chunkCount} 个响应块，总长度: ${totalContent.length}`);
              
              // 如果没有收到任何内容，添加一个提示
              if (chunkCount === 0 || !hasReceivedContent) {
                console.warn('未收到任何有效响应内容');
                get().appendToLastMessage('很抱歉，我无法生成回复。请稍后再试。');
              }
            } catch (streamError) {
              console.error('流式响应错误:', streamError);
              
              // 记录详细错误信息
              if (streamError instanceof Error) {
                console.error('错误类型:', streamError.constructor.name);
                console.error('错误消息:', streamError.message);
                console.error('错误堆栈:', streamError.stack);
              } else {
                console.error('非标准错误对象:', streamError);
              }
              
              // 添加错误消息到当前响应
              get().appendToLastMessage('\n\n[错误: ' + (streamError instanceof Error ? streamError.message : '未知错误') + ']');
              
              // Set error but don't remove the partial message
              set({ 
                error: streamError instanceof Error ? streamError : new Error('Error streaming contextual response'),
                isLoading: false
              });
            }
            
            // Mark streaming as complete
            get().stopStreamingMessage(assistantMessage.id);
            set({ isLoading: false });
            console.log('=== ChatStore.sendContextualMessage 完成 ===');
          } catch (error) {
            console.error('发送上下文消息错误:', error);
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error : new Error('Failed to send contextual message') 
            });
          }
        },
        
        abortResponse: () => {
          console.log('=== ChatStore.abortResponse 被调用 ===');
          if (chatEngine) {
            console.log('中止当前响应');
            chatEngine.abort();
            set({ isLoading: false });
            
            // Update the last message to indicate it was aborted
            set((state) => {
              const messages = [...state.messages];
              const lastMessage = messages[messages.length - 1];
              
              if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                console.log('标记最后一条消息为已中止');
                messages[messages.length - 1] = {
                  ...lastMessage,
                  isStreaming: false,
                  content: lastMessage.content + ' [Aborted]',
                };
              } else {
                console.log('没有正在流式传输的消息可中止');
              }
              
              return { messages };
            });
          } else {
            console.log('没有活动的聊天引擎实例');
          }
        },
      };
    },
    {
      name: 'chat-store',
      partialize: (state) => ({ messages: state.messages, conversationId: state.conversationId }),
    }
  )
); 