import { CozeApiError, CozeBrowserClient } from './coze-browser';
import { ChatEngineConfig, Message } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for a chat engine
 */
export interface ChatEngine {
  // Send a message and get a stream of response chunks
  streamResponse(message: string): AsyncGenerator<string>;
  
  // Get a contextual response based on the message and context
  getContextualResponse(
    message: string, 
    context: string
  ): AsyncGenerator<string>;
  
  // Abort the current response
  abort(): void;
}

/**
 * Default implementation of the chat engine using the Coze API
 */
export class DefaultChatEngine implements ChatEngine {
  private controller: AbortController | null = null;
  private readonly config: ChatEngineConfig;
  private cozeClient: CozeBrowserClient;
  private DEBUG = true;

  constructor(config: ChatEngineConfig) {
    console.log('=== DefaultChatEngine 初始化 ===');
    console.log('配置:', {
      botId: config.botId ? config.botId.substring(0, 5) + '...' : 'undefined',
      apiKey: config.apiKey ? config.apiKey.substring(0, 5) + '...' : 'undefined',
      hasSystemPrompt: !!config.systemPrompt
    });
    
    this.config = config;
    
    if (!config.botId) {
      console.error('错误: 缺少 botId');
      throw new Error('Bot ID is required');
    }
    
    if (!config.apiKey) {
      console.error('错误: 缺少 apiKey');
      throw new Error('API Key is required');
    }
    
    // 初始化Coze客户端
    this.cozeClient = new CozeBrowserClient(config.botId, config.apiKey);
    
    console.log('DefaultChatEngine 初始化完成');
  }

  /**
   * 获取当前配置
   */
  getConfig(): ChatEngineConfig {
    return { ...this.config };
  }

  /**
   * 流式响应用户消息
   * @param message 用户消息
   * @returns 异步生成器，生成响应片段
   */
  async *streamResponse(message: string): AsyncGenerator<string> {
    console.log('=== DefaultChatEngine.streamResponse 开始 ===');
    console.log('消息:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    
    // 创建一个新的AbortController
    this.controller = new AbortController();
    
    try {
      // 构建消息数组
      const messages: Message[] = [];
      
      // 添加系统提示（如果有）
      if (this.config.systemPrompt) {
        messages.push({
          id: uuidv4(),
          role: 'system',
          content: this.config.systemPrompt,
          timestamp: Date.now()
        });
      }
      
      // 添加用户消息
      messages.push({
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
      
      console.log('发送请求，消息数量:', messages.length, '是否包含系统提示:', !!this.config.systemPrompt);
      console.log('验证配置:', {
        botId: this.config.botId ? this.config.botId.substring(0, 5) + '...' : 'undefined',
        apiKey: this.config.apiKey ? this.config.apiKey.substring(0, 5) + '...' : 'undefined',
        hasSystemPrompt: !!this.config.systemPrompt
      });
      
      try {
        // 使用流式API获取响应
        let chunkCount = 0;
        let responseContent = '';
        
        console.log('开始从CozeBrowserClient获取流式响应...');
        console.log('调用 this.cozeClient.streamChat()...');
        
        // 捕获并记录streamChat迭代器的初始化
        let streamIterator: AsyncGenerator<string>;
        try {
          streamIterator = this.cozeClient.streamChat(messages, this.config);
          console.log('成功创建流式迭代器');
        } catch (initError) {
          console.error('创建流式迭代器失败:', initError);
          throw initError;
        }
        
        // 开始迭代
        try {
          for await (const chunk of streamIterator) {
            chunkCount++;
            
            // 检查chunk是否为空
            if (!chunk) {
              console.log(`收到空响应块 #${chunkCount}`);
              continue;
            }
            
            responseContent += chunk;
            
            if (chunkCount === 1) {
              console.log('收到第一个响应块:', chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''));
            }
            
            if (chunkCount % 5 === 0) {
              console.log(`已收到 ${chunkCount} 个响应块，当前总长度: ${responseContent.length}`);
            }
            
            yield chunk;
          }
        } catch (streamError) {
          console.error('流式迭代过程中发生错误:', streamError);
          throw streamError;
        }
        
        console.log(`流式响应完成，共收到 ${chunkCount} 个响应块，总长度: ${responseContent.length}`);
        
        // 如果没有收到任何块，但有错误，则抛出错误
        if (chunkCount === 0) {
          console.warn('未收到任何响应块，可能存在问题');
        }
      } catch (error) {
        console.error('流式响应错误:', error);
        
        // 记录详细错误信息
        if (error instanceof Error) {
          console.error('错误类型:', error.constructor.name);
          console.error('错误消息:', error.message);
          console.error('错误堆栈:', error.stack);
          
          if (error instanceof CozeApiError) {
            console.error('Coze API错误:', error);
            if ('status' in error) {
              console.error('错误状态码:', (error as any).status);
            }
            
            if ('responseText' in error) {
              console.error('响应文本:', (error as any).responseText?.substring(0, 200) + '...');
            }
          }
        } else {
          console.error('非标准错误对象:', error);
        }
        
        // 尝试返回一个错误消息
        yield `很抱歉，我遇到了一个问题: ${error instanceof Error ? error.message : '未知错误'}`;
        
        throw error;
      }
    } finally {
      // 清理
      if (this.controller) {
        console.log('清理AbortController');
        this.controller = null;
      }
      console.log('streamResponse处理完成，已清理controller');
    }
  }

  /**
   * 获取基于上下文的响应
   * @param message 用户消息
   * @param context 上下文内容
   * @returns 异步生成器，生成响应片段
   */
  async *getContextualResponse(message: string, context: string): AsyncGenerator<string> {
    console.log('=== DefaultChatEngine.getContextualResponse 开始 ===');
    console.log('消息:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
    console.log('上下文长度:', context.length);
    
    // 组合上下文和消息
    const contextualMessage = `
Context:
${context}

Question:
${message}
`;
    
    console.log('组合后的消息长度:', contextualMessage.length);
    
    // 使用标准流式响应处理组合消息
    yield* this.streamResponse(contextualMessage);
  }

  /**
   * 中止当前响应
   */
  abort(): void {
    console.log('=== DefaultChatEngine.abort 被调用 ===');
    if (this.controller) {
      console.log('中止请求');
      this.controller.abort();
      this.controller = null;
    } else {
      console.log('没有活动的请求可中止');
    }
  }
} 