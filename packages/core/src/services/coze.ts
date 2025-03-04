import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types/chat';
import type { ChatEngineConfig } from '../types/chat';
// 只导入必要的类和常量，避免导入整个包含ws库的模块
import { 
  CozeAPI, 
  RoleType, 
  ChatStatus, 
  ChatEventType, 
  COZE_COM_BASE_URL, 
  COZE_CN_BASE_URL 
} from '@coze/api';

/**
 * Custom error class for Coze API errors
 */
export class CozeApiError extends Error {
  public status?: number;
  public code?: number;
  public responseText?: string;
  
  constructor(message: string, options?: { status?: number, code?: number, responseText?: string }) {
    super(message);
    this.name = 'CozeApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.responseText = options?.responseText;
  }
}

/**
 * Client for interacting with the Coze API
 */
export class CozeClient {
  private client: CozeAPI;
  private botId: string;
  private apiKey: string;
  private DEBUG = true;
  
  // 使用官方SDK提供的URL常量
  private baseURL: string;
  private useChinaDomain = false;

  /**
   * Create a new Coze client
   * @param botId The Coze bot ID
   * @param apiKey The Coze API key
   */
  constructor(botId: string, apiKey: string) {
    if (!botId) {
      throw new Error('Coze Bot ID is required');
    }

    if (!apiKey) {
      throw new Error('Coze API Key is required');
    }

    this.botId = botId;
    this.apiKey = apiKey;
    
    // 默认使用.com域名
    this.baseURL = COZE_COM_BASE_URL;

    // 初始化SDK客户端，设置isNode为false以避免使用Node特有功能如ws
    this.initClient();
    
    if (this.DEBUG) console.log('[CozeClient] Initialized with', { 
      botId: this.botId.substring(0, 5) + '...',
      baseURL: this.baseURL
    });
  }

  /**
   * Initialize the API client with the current baseURL
   */
  private initClient() {
    this.client = new CozeAPI({
      token: this.apiKey,
      baseURL: this.baseURL,
      debug: this.DEBUG,
      // 显式设置为false，避免使用Node.js特定的功能
      isNode: false
    });
  }

  /**
   * Switch between .com and .cn domains
   * @returns true if the domain was switched, false if already using the other domain
   */
  public switchDomain(): boolean {
    const wasUsingChinaDomain = this.useChinaDomain;
    
    if (this.useChinaDomain) {
      // Switch from .cn to .com
      this.baseURL = COZE_COM_BASE_URL;
      this.useChinaDomain = false;
    } else {
      // Switch from .com to .cn
      this.baseURL = COZE_CN_BASE_URL;
      this.useChinaDomain = true;
    }
    
    // Re-initialize client with new baseURL
    this.initClient();
    
    if (this.DEBUG) console.log('[CozeClient] Switched domain from', 
      wasUsingChinaDomain ? '.cn to .com' : '.com to .cn',
      'New baseURL:', this.baseURL);
    
    return wasUsingChinaDomain !== this.useChinaDomain;
  }

  /**
   * Convert messages to the format expected by the Coze API
   */
  private convertMessages(messages: Message[]) {
    // 根据SDK的要求将消息格式化
    return messages.map(msg => {
      let role: RoleType;
      
      switch (msg.role) {
        case 'user':
          role = RoleType.User;
          break;
        case 'assistant':
          role = RoleType.Assistant;
          break;
        case 'system':
          role = RoleType.System;
          break;
        default:
          role = RoleType.User;
      }
      
      return {
        role,
        content: msg.content,
        content_type: 'text',
      };
    });
  }

  /**
   * Send a chat message and get a response
   */
  async chat(messages: Message[], config: ChatEngineConfig = {}) {
    if (this.DEBUG) console.log('[CozeClient] Sending chat request with', { 
      messageCount: messages.length,
      botId: this.botId.substring(0, 5) + '...',
      domain: this.useChinaDomain ? '.cn' : '.com'
    });

    let attemptCount = 0;
    const MAX_ATTEMPTS = 2; // 最多尝试2次，切换域名后再试一次
    
    while (attemptCount < MAX_ATTEMPTS) {
      try {
        // 创建SDK请求参数
        const convertedMessages = this.convertMessages(messages);
        
        // 使用SDK的创建并轮询方法发送请求
        const response = await this.client.chat.createAndPoll({
          bot_id: this.botId,
          additional_messages: convertedMessages,
          user_id: uuidv4(),  // 生成唯一标识符
          stream: false,
        });
        
        if (this.DEBUG) {
          console.log('[CozeClient] Response status:', response.chat.status);
          console.log('[CozeClient] Chat ID:', response.chat.id);
          console.log('[CozeClient] Conversation ID:', response.chat.conversation_id);
        }
        
        // 检查响应状态
        if (response.chat.status === ChatStatus.COMPLETED) {
          // 找到助手的回复消息
          const assistantMessages = response.messages.filter(m => m.role === RoleType.Assistant);
          if (assistantMessages.length > 0) {
            const lastMessage = assistantMessages[assistantMessages.length - 1];
            
            if (this.DEBUG) console.log('[CozeClient] Received response:', lastMessage.content.substring(0, 50) + '...');
            
            return lastMessage.content;
          } else {
            throw new CozeApiError('No assistant response in the completed chat', { 
              status: 200,
              code: 0,
              responseText: JSON.stringify(response)
            });
          }
        } else {
          throw new CozeApiError(`Chat was not completed: ${response.chat.status}`, { 
            status: 200,
            code: 0,
            responseText: JSON.stringify(response)
          });
        }
      } catch (error) {
        console.error(`[CozeClient] Error in chat request (attempt ${attemptCount + 1}):`, error);
        
        // 检查是否需要切换域名并重试
        if (attemptCount < MAX_ATTEMPTS - 1) {
          if (this.DEBUG) console.log('[CozeClient] Attempting to switch domain and retry...');
          this.switchDomain();
          attemptCount++;
          continue;
        }
        
        // 如果是API错误，重新抛出
        if (error instanceof CozeApiError) {
          throw error;
        }
        
        // 如果SDK抛出错误，进行转换
        const apiError = error as any;
        if (apiError.status && apiError.code) {
          throw new CozeApiError(
            apiError.msg || 'Unknown Coze API Error', 
            { 
              status: apiError.status, 
              code: apiError.code,
              responseText: apiError.rawError ? JSON.stringify(apiError.rawError) : undefined
            }
          );
        }
        
        // 其他错误
        throw new CozeApiError(
          error instanceof Error ? error.message : 'Unknown error',
          { responseText: String(error) }
        );
      }
    }
    
    // 这行代码理论上永远不会执行，但TypeScript需要一个明确的返回
    throw new CozeApiError('Failed after all attempts');
  }

  /**
   * Send a chat message and get a streaming response
   * 使用标准流式API而不是WebSocket
   */
  async *streamChat(messages: Message[], config: ChatEngineConfig = {}) {
    if (this.DEBUG) console.log('[CozeClient] Starting streaming chat with', { 
      messageCount: messages.length,
      botId: this.botId.substring(0, 5) + '...',
      domain: this.useChinaDomain ? '.cn' : '.com'
    });

    let attemptCount = 0;
    const MAX_ATTEMPTS = 2; // 最多尝试2次，切换域名后再试一次
    
    while (attemptCount < MAX_ATTEMPTS) {
      try {
        // 创建SDK请求参数
        const convertedMessages = this.convertMessages(messages);

        // 使用SDK的流式方法（非WebSocket方法）
        const stream = await this.client.chat.stream({
          bot_id: this.botId,
          additional_messages: convertedMessages,
          user_id: uuidv4(),  // 生成唯一标识符
        });

        if (this.DEBUG) console.log('[CozeClient] Stream created successfully');

        // 递增地返回流式响应内容
        let responseText = '';
        
        for await (const part of stream) {
          // 根据文档，使用ChatEventType.CONVERSATION_MESSAGE_DELTA事件处理增量内容
          if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA && part.data?.content) {
            if (this.DEBUG && attemptCount === 0) console.log('[CozeClient] Stream chunk received:', 
              part.data.content.length < 20 ? part.data.content : part.data.content.substring(0, 20) + '...');
            
            responseText += part.data.content;
            yield part.data.content;
          }
        }
        
        if (this.DEBUG) console.log('[CozeClient] Stream completed, total response length:', responseText.length);
        
        // 检查是否收到任何内容
        if (responseText) {
          // 成功收到内容，不需要继续尝试
          return;
        } else if (attemptCount < MAX_ATTEMPTS - 1) {
          // 没有收到内容，尝试切换域名
          console.warn('[CozeClient] Empty response from stream, switching domain and retrying...');
          this.switchDomain();
          attemptCount++;
          continue;
        } else {
          // 最后一次尝试，仍然没有内容，尝试使用非流式API
          console.warn('[CozeClient] Empty response from stream on all domains, falling back to non-streaming API');
          try {
            const nonStreamResponse = await this.chat(messages, config);
            if (nonStreamResponse) {
              if (this.DEBUG) console.log('[CozeClient] Fallback to non-streaming API successful');
              yield nonStreamResponse;
            } else {
              if (this.DEBUG) console.log('[CozeClient] Fallback returned empty response');
              yield 'Sorry, I could not generate a response at this time.';
            }
          } catch (fallbackError) {
            console.error('[CozeClient] Error in fallback:', fallbackError);
            yield `Sorry, an error occurred: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`;
          }
        }
      } catch (error) {
        console.error(`[CozeClient] Error in stream request (attempt ${attemptCount + 1}):`, error);
        
        // 检查是否需要切换域名并重试
        if (attemptCount < MAX_ATTEMPTS - 1) {
          if (this.DEBUG) console.log('[CozeClient] Attempting to switch domain and retry...');
          this.switchDomain();
          attemptCount++;
          continue;
        }
        
        // 尝试回退到非流式API
        try {
          if (this.DEBUG) console.log('[CozeClient] Attempting fallback to non-streaming API');
          const fallbackResponse = await this.chat(messages, config);
          if (fallbackResponse) {
            yield fallbackResponse;
          } else {
            yield 'Sorry, I could not generate a streaming response. Please try again later.';
          }
        } catch (fallbackError) {
          console.error('[CozeClient] Error in fallback:', fallbackError);
          yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    }
  }
} 