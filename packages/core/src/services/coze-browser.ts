/**
 * 浏览器特定的Coze客户端适配器
 * 该文件避免了对Node.js特定模块的依赖，例如'ws'
 */

import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types/chat';
import type { ChatEngineConfig } from '../types/chat';

// Coze API 接口定义
export interface CozeMessage {
  role: string;
  content: string;
  content_type: string;
}

export interface CozeRequest {
  bot_id: string;
  messages: CozeMessage[];
  stream?: boolean;
  user_id?: string;
}

export interface CozeResponse {
  choices: {
    message: {
      content: string;
    }
  }[];
}

export interface CozeStreamChunk {
  event: string;
  data: {
    content?: string;
  };
}

/**
 * Coze API 错误类
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
 * Coze API 客户端 - 浏览器版本
 * 该版本避免了对Node.js特定模块的依赖
 */
export class CozeBrowserClient {
  private botId: string;
  private accessToken: string;
  private DEBUG = true; // 临时开启调试以便观察
  
  // 可能的API路径 - 根据官方文档和测试结果
  private readonly API_PATHS = [
    '/v3/chat',               // 官方文档指定的路径，测试成功
  ];
  
  // API endpoints - 使用代理URL避免CORS问题
  private readonly API_BASE_URL = '/api/coze';
  
  // 当前使用的API URL和路径索引
  private apiUrl: string;
  private currentPathIndex: number = 0;
  
  /**
   * 创建Coze API客户端
   * @param botId Coze机器人ID
   * @param accessToken Coze API密钥
   */
  constructor(botId: string, accessToken: string) {
    console.log('=== CozeBrowserClient 初始化 ===');
    console.log(`botId: ${botId ? botId.substring(0, 5) + '...' : 'undefined'}`);
    console.log(`accessToken: ${accessToken ? accessToken.substring(0, 5) + '...' : 'undefined'}`);
    
    if (!botId) {
      throw new Error('Coze Bot ID is required');
    }

    if (!accessToken) {
      throw new Error('Coze API Key is required');
    }

    this.botId = botId;
    this.accessToken = accessToken;
    
    // 初始化API URL
    this.apiUrl = this.API_BASE_URL + this.API_PATHS[this.currentPathIndex];
    
    console.log(`初始化完成，使用API地址: ${this.apiUrl}`);
  }

  /**
   * 切换API路径
   * 如果某个API路径失败，可以调用此方法尝试下一个路径
   * @returns 是否成功切换路径
   */
  public switchApiPath(): boolean {
    console.log('=== 切换API路径 ===');
    const oldUrl = this.apiUrl;
    
    // 切换到下一个路径
    this.currentPathIndex = (this.currentPathIndex + 1) % this.API_PATHS.length;
    this.apiUrl = this.API_BASE_URL + this.API_PATHS[this.currentPathIndex];
    
    console.log(`切换API路径从 ${oldUrl} 到 ${this.apiUrl}`);
    
    return oldUrl !== this.apiUrl;
  }
  
  /**
   * 在不同域名间切换 (.com/.cn)
   * 仅用于兼容旧代码，现在使用switchApiPath代替
   */
  public switchDomain(): boolean {
    return this.switchApiPath();
  }

  /**
   * 将Message数组转换为Coze API格式的消息
   */
  private convertMessages(messages: Message[]): CozeMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      content_type: 'text'  // 确保使用content_type字段
    }));
  }

  /**
   * 使用认证发送请求
   */
  private async fetchWithAuth(url: string, options: RequestInit): Promise<Response> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${this.accessToken}`);
    
    const requestOptions: RequestInit = {
      ...options,
      headers
    };
    
    console.log(`[CozeBrowserClient] 发送请求到: ${url}`, {
      method: options.method,
      headersKeys: Array.from(headers.keys()),
      bodyLength: options.body ? (options.body as string).length : 0
    });
    
    try {
      const response = await fetch(url, requestOptions);
      console.log(`[CozeBrowserClient] 收到响应: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      console.error(`[CozeBrowserClient] 请求失败: ${url}`, error);
      throw error;
    }
  }

  /**
   * 发送聊天请求并获取响应
   */
  async chat(messages: Message[], config: ChatEngineConfig = {}): Promise<string> {
    console.log('=== CozeBrowserClient.chat 开始 ===');
    console.log('消息数量:', messages.length);
    console.log('API URL:', this.apiUrl);
    console.log('Bot ID:', this.botId.substring(0, 5) + '...');
    
    // 尝试所有API路径，直到成功或全部失败
    const initialPathIndex = this.currentPathIndex;
    let attempts = 0;
    
    do {
      try {
        // 准备请求负载
        const payload: CozeRequest = {
          bot_id: this.botId,
          messages: this.convertMessages(messages),
          stream: false,
          user_id: uuidv4(),
        };
        
        console.log('请求负载:', {
          botId: this.botId.substring(0, 5) + '...',
          messageCount: payload.messages.length,
          url: this.apiUrl,
          firstMessageContent: payload.messages.length > 0 ? 
            payload.messages[0].content.substring(0, 30) + '...' : 'empty'
        });
        
        // 发送请求
        console.log('发送请求到:', this.apiUrl);
        const response = await this.fetchWithAuth(this.apiUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        
        console.log('收到响应:', response.status, response.statusText);
        
        if (response.status === 404) {
          console.warn(`API路径 ${this.apiUrl} 不存在(404)，尝试下一个路径...`);
          this.switchApiPath();
          attempts++;
          continue;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP错误 ${response.status}:`, errorText);
          throw new CozeApiError(`HTTP错误 ${response.status}`, { 
            status: response.status, 
            responseText: errorText 
          });
        }
        
        const responseText = await response.text();
        console.log('响应文本长度:', responseText.length);
        console.log('响应文本前100个字符:', responseText.substring(0, 100));
        
        try {
          // 尝试解析为JSON
          const data = JSON.parse(responseText);
          console.log('响应数据类型:', typeof data);
          console.log('响应数据结构:', Object.keys(data));
          
          // 检查是否是处理中状态
          if (data.chat && data.chat.status === 'in_process' && data.chat.id) {
            console.log('请求处理中，开始轮询，chat ID:', data.chat.id);
            
            // 保存会话ID，用于轮询
            const conversationId = data.conversation_id;
            const chatId = data.chat.id;
            
            console.log('会话信息:', {
              conversationId,
              chatId
            });
            
            // 轮询直到得到结果
            return await this.pollChatStatus(this.apiUrl, chatId);
          }
          // 直接返回的消息 - 标准格式
          else if (data.choices && data.choices.length > 0) {
            const message = data.choices[0].message;
            console.log('直接返回的消息:', message.content.substring(0, 50) + '...');
            return message.content;
          }
          // 检查messages数组 - 另一种格式
          else if (data.messages && data.messages.length > 0) {
            const assistantMessages = data.messages.filter((m: any) => m.role === 'assistant');
            if (assistantMessages.length > 0) {
              const content = assistantMessages[assistantMessages.length - 1].content;
              console.log('从messages数组中提取的消息:', content.substring(0, 50) + '...');
              return content;
            }
          }
          
          console.error('API响应中没有找到消息内容');
          throw new CozeApiError('API响应中没有消息内容', { responseText });
        } catch (parseError) {
          console.error('解析响应错误:', parseError);
          
          if (responseText.includes('<!DOCTYPE html>')) {
            // HTML响应，可能是重定向或错误页面
            console.warn('收到HTML响应，尝试其他API路径');
            this.switchApiPath();
            attempts++;
            continue;
          }
          
          // 其他解析错误
          throw new CozeApiError('解析API响应失败', { responseText });
        }
      } catch (error) {
        console.error('请求或处理错误:', error);
        
        // 如果是网络错误或其他请求错误，尝试下一个路径
        if (error instanceof Error && 
            (error.message.includes('Failed to fetch') || 
             error.message.includes('Network error'))) {
          console.warn('网络错误，尝试下一个API路径');
          this.switchApiPath();
          attempts++;
          continue;
        }
        
        // 重新抛出其他错误
        throw error;
      }
    } while (this.currentPathIndex !== initialPathIndex && attempts < this.API_PATHS.length);
    
    // 所有路径都失败了
    console.error('所有API路径均请求失败');
    throw new CozeApiError('所有API路径均请求失败');
  }
  
  /**
   * 轮询聊天状态直到完成
   * @param apiUrl API基础URL
   * @param chatId 聊天ID
   * @returns 完成后的聊天内容
   */
  private async pollChatStatus(apiUrl: string, chatId: string): Promise<string> {
    const MAX_POLLS = 30;      // 增加最大轮询次数
    const POLL_INTERVAL = 1000; // 1秒
    
    let pollCount = 0;
    let conversationId: string | null = null;
    
    // 从API URL中提取基础路径
    const urlParts = apiUrl.split('/');
    const apiBasePath = urlParts.slice(0, -1).join('/');
    
    console.log(`⏳ [CozeBrowserClient] 开始轮询, 基础路径: ${apiBasePath}, chatId: ${chatId}`);
    
    // 尝试不同的轮询URL格式
    const generatePollUrls = () => {
      const urls = [];
      
      // 格式1: 主要格式
      if (conversationId) {
        urls.push(`${apiBasePath}/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`);
      } else {
        urls.push(`${apiBasePath}/retrieve?chat_id=${chatId}`);
      }
      
      // 格式2: 备选格式 (v2 API)
      urls.push(`${apiUrl}/status/${chatId}`);
      
      // 格式3: ChatV3 API格式
      urls.push(`${apiBasePath}/v3/chat/retrieve?chat_id=${chatId}`);
      
      return urls;
    };
    
    while (pollCount < MAX_POLLS) {
      pollCount++;
      
      console.log(`⏳ [CozeBrowserClient] 轮询 #${pollCount}/${MAX_POLLS}: 检查状态...`);
      
      // 获取所有可能的轮询URL
      const pollUrls = generatePollUrls();
      console.log(`🔍 [CozeBrowserClient] 将尝试 ${pollUrls.length} 种轮询URL格式`);
      
      let success = false;
      
      // 尝试所有可能的URL格式
      for (const pollUrl of pollUrls) {
        try {
          console.log(`🔄 [CozeBrowserClient] 尝试轮询URL: ${pollUrl}`);
          
          const isPostMethod = pollUrl.includes('/retrieve');
          
          const pollResponse = await this.fetchWithAuth(pollUrl, {
            method: isPostMethod ? 'POST' : 'GET',
          });
          
          console.log(`📥 [CozeBrowserClient] 轮询响应状态: ${pollResponse.status} ${pollResponse.statusText}`);
          console.log(`📥 [CozeBrowserClient] 轮询响应头:`, Object.fromEntries(pollResponse.headers.entries()));
          
          if (!pollResponse.ok) {
            console.warn(`⚠️ [CozeBrowserClient] 轮询失败: ${pollResponse.status} ${pollResponse.statusText}`);
            continue; // 尝试下一个URL格式
          }
          
          const responseText = await pollResponse.text();
          console.log(`📄 [CozeBrowserClient] 轮询响应文本: 
-------------BEGIN POLL RESPONSE-------------
${responseText.length > 500 ? responseText.substring(0, 500) + '...(截断)' : responseText}
--------------END POLL RESPONSE--------------`);
          
          try {
            const pollData = JSON.parse(responseText);
            console.log('📊 [CozeBrowserClient] 轮询响应数据结构:', {
              keys: Object.keys(pollData),
              hasChat: !!pollData.chat,
              chatStatus: pollData.chat ? pollData.chat.status : null,
              status: pollData.status,
              hasMessages: Array.isArray(pollData.messages),
              messagesCount: Array.isArray(pollData.messages) ? pollData.messages.length : 0,
              hasChoices: Array.isArray(pollData.choices),
              choicesCount: Array.isArray(pollData.choices) ? pollData.choices.length : 0
            });
            
            // 保存conversationId如果存在
            if (pollData.conversation_id) {
              conversationId = pollData.conversation_id;
              console.log(`🆔 [CozeBrowserClient] 更新conversationId: ${conversationId}`);
            }
            
            // 检查各种可能的状态表示
            const status = (
              (pollData.chat && pollData.chat.status) || 
              pollData.status || 
              (pollData.choices && pollData.choices[0] && pollData.choices[0].finish_reason) ||
              'unknown'
            );
            
            console.log(`📊 [CozeBrowserClient] 当前状态: ${status}`);
            
            if (status === 'completed' || status === 'stop' || status === 'success') {
              console.log('✅ [CozeBrowserClient] 请求已完成，提取内容');
              const content = this.extractContentFromResponse(pollData);
              console.log(`📝 [CozeBrowserClient] 提取到内容: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
              return content;
            } else if (status === 'in_process' || status === 'processing' || status === 'pending') {
              console.log('⏳ [CozeBrowserClient] 请求仍在处理中，继续轮询');
              success = true; // 成功获取状态，但需要继续轮询
              break; // 跳出URL循环，继续等待
            } else if (status === 'failed' || status === 'error') {
              console.error(`❌ [CozeBrowserClient] 请求失败，状态: ${status}`);
              
              // 检查是否有错误消息
              const errorMsg = 
                (pollData.chat && pollData.chat.last_error && pollData.chat.last_error.message) ||
                (pollData.error && pollData.error.message) ||
                '未知错误';
              
              throw new CozeApiError(`请求处理失败: ${errorMsg}`);
            } else {
              console.warn(`⚠️ [CozeBrowserClient] 未知状态: ${status}，继续轮询`);
              success = true; // 假设成功，继续轮询
              break; // 跳出URL循环
            }
          } catch (parseError) {
            console.error('❌ [CozeBrowserClient] 解析轮询响应失败:', parseError);
          }
        } catch (pollError) {
          console.error('❌ [CozeBrowserClient] 轮询过程中发生错误:', pollError);
          // 继续尝试下一个URL格式
        }
      }
      
      // 如果没有一个URL格式成功，增加等待时间
      const waitTime = success ? POLL_INTERVAL : (POLL_INTERVAL * 2);
      console.log(`⏳ [CozeBrowserClient] 等待 ${waitTime}ms 后继续轮询...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // 达到最大轮询次数
    console.error(`❌ [CozeBrowserClient] 已达到最大轮询次数 (${MAX_POLLS})，无法获取响应`);
    throw new CozeApiError(`已达到最大轮询次数 (${MAX_POLLS})，无法获取响应`);
  }
  
  /**
   * 从响应中提取内容
   * 支持多种响应格式
   */
  private extractContentFromResponse(data: any): string {
    console.log('🔍 [CozeBrowserClient] 尝试从响应中提取内容，数据结构:', Object.keys(data).join(', '));
    
    // 详细记录数据结构
    console.log('🧩 [CozeBrowserClient] 响应数据详情:', {
      hasMessages: Array.isArray(data.messages),
      messagesCount: Array.isArray(data.messages) ? data.messages.length : 0,
      hasChat: !!data.chat,
      chatStatus: data.chat ? data.chat.status : null,
      hasChoices: Array.isArray(data.choices),
      choicesCount: Array.isArray(data.choices) ? data.choices.length : 0,
      hasContent: typeof data.content !== 'undefined',
      contentType: data.content ? typeof data.content : null,
      hasResponse: !!data.response
    });
    
    // 使用一个变量跟踪是否找到内容
    let extractedContent: string | null = null;
    
    // 格式1: 使用messages数组 - ChatGPT, Claude等格式
    if (data.messages && data.messages.length > 0) {
      console.log('🔍 [CozeBrowserClient] 尝试从messages数组中提取内容，消息数量:', data.messages.length);
      
      // 首先检查是否为Coze特定格式
      const cozeMessages = data.messages.filter((m: any) => 
        m.role === 'assistant' && typeof m.content === 'string' && m.content.trim() !== '');
        
      if (cozeMessages.length > 0) {
        console.log('✅ [CozeBrowserClient] 找到Coze格式助手消息，数量:', cozeMessages.length);
        const lastMessage = cozeMessages[cozeMessages.length - 1];
        extractedContent = lastMessage.content;
        console.log(`📝 [CozeBrowserClient] 从Coze消息中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      }
      
      // 如果上面的方法没有找到内容，尝试其他格式
      if (!extractedContent) {
        // 找到助手的最后一条消息
        const assistantMessages = data.messages.filter((m: any) => 
          m.role === 'assistant' || m.role === 'bot' || m.role === 'system');
          
        if (assistantMessages.length > 0) {
          console.log('✅ [CozeBrowserClient] 找到助手消息，数量:', assistantMessages.length);
          const lastMessage = assistantMessages[assistantMessages.length - 1];
          
          // 检查内容格式
          if (typeof lastMessage.content === 'string') {
            extractedContent = lastMessage.content;
          } else if (typeof lastMessage.content === 'object' && lastMessage.content !== null) {
            // 可能是结构化内容，例如 { text: '...' } 或 { message: '...' }
            if (lastMessage.content.text) {
              extractedContent = lastMessage.content.text;
            } else if (lastMessage.content.message) {
              extractedContent = lastMessage.content.message;
            } else {
              // 尝试JSON序列化
              extractedContent = JSON.stringify(lastMessage.content);
            }
          }
          
          if (extractedContent) {
            console.log(`📝 [CozeBrowserClient] 从消息中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
          }
        }
      }
    }
    
    // 格式2: 使用choices数组 - OpenAI格式
    if (!extractedContent && data.choices && data.choices.length > 0) {
      console.log('🔍 [CozeBrowserClient] 尝试从choices数组中提取内容');
      
      const lastChoice = data.choices[data.choices.length - 1];
      
      if (lastChoice.message && lastChoice.message.content) {
        extractedContent = lastChoice.message.content;
        console.log(`📝 [CozeBrowserClient] 从choices.message中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      } else if (lastChoice.text) {
        extractedContent = lastChoice.text;
        console.log(`📝 [CozeBrowserClient] 从choices.text中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      } else if (lastChoice.content) {
        extractedContent = lastChoice.content;
        console.log(`📝 [CozeBrowserClient] 从choices.content中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      }
    }
    
    // 格式3: 直接使用content字段
    if (!extractedContent && data.content) {
      console.log('🔍 [CozeBrowserClient] 尝试从content字段中提取内容');
      
      if (typeof data.content === 'string') {
        extractedContent = data.content;
      } else if (typeof data.content === 'object' && data.content !== null) {
        // 尝试从内容对象中提取文本
        if (data.content.text) {
          extractedContent = data.content.text;
        } else if (data.content.message) {
          extractedContent = data.content.message;
        } else {
          // 尝试JSON序列化
          extractedContent = JSON.stringify(data.content);
        }
      }
      
      if (extractedContent) {
        console.log(`📝 [CozeBrowserClient] 从content字段中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      }
    }
    
    // 格式4: 使用response字段 - Coze和其他一些API格式
    if (!extractedContent && data.response) {
      console.log('🔍 [CozeBrowserClient] 尝试从response字段中提取内容');
      
      if (typeof data.response === 'string') {
        extractedContent = data.response;
      } else if (typeof data.response === 'object' && data.response !== null) {
        if (data.response.text) {
          extractedContent = data.response.text;
        } else if (data.response.message) {
          extractedContent = data.response.message;
        } else if (data.response.content) {
          extractedContent = data.response.content;
        } else {
          // 尝试JSON序列化
          extractedContent = JSON.stringify(data.response);
        }
      }
      
      if (extractedContent) {
        console.log(`📝 [CozeBrowserClient] 从response字段中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      }
    }
    
    // 格式5: 使用chat字段 - Coze特定格式
    if (!extractedContent && data.chat) {
      console.log('🔍 [CozeBrowserClient] 尝试从chat字段中提取内容');
      
      if (data.chat.message) {
        extractedContent = data.chat.message;
      } else if (data.chat.content) {
        extractedContent = data.chat.content;
      } else if (data.chat.text) {
        extractedContent = data.chat.text;
      } else if (data.chat.response) {
        // 尝试从response中提取
        if (typeof data.chat.response === 'string') {
          extractedContent = data.chat.response;
        } else if (typeof data.chat.response === 'object' && data.chat.response !== null) {
          if (data.chat.response.text) {
            extractedContent = data.chat.response.text;
          } else if (data.chat.response.content) {
            extractedContent = data.chat.response.content;
          }
        }
      }
      
      if (extractedContent) {
        console.log(`📝 [CozeBrowserClient] 从chat字段中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      }
    }
    
    // 格式6: 使用text字段 - 简单格式
    if (!extractedContent && data.text) {
      console.log('🔍 [CozeBrowserClient] 尝试从text字段中提取内容');
      extractedContent = data.text;
      console.log(`📝 [CozeBrowserClient] 从text字段中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
    }
    
    // 格式7: 使用message字段 - 简单格式
    if (!extractedContent && data.message) {
      console.log('🔍 [CozeBrowserClient] 尝试从message字段中提取内容');
      
      if (typeof data.message === 'string') {
        extractedContent = data.message;
      } else if (typeof data.message === 'object' && data.message !== null) {
        if (data.message.content) {
          extractedContent = data.message.content;
        } else if (data.message.text) {
          extractedContent = data.message.text;
        } else {
          // 尝试JSON序列化
          extractedContent = JSON.stringify(data.message);
        }
      }
      
      if (extractedContent) {
        console.log(`📝 [CozeBrowserClient] 从message字段中提取内容: ${extractedContent?.substring(0, 50) || ''}...`);
      }
    }
    
    // 如果找不到内容，记录完整响应并抛出错误
    if (!extractedContent) {
      console.error('❌ [CozeBrowserClient] 无法从响应中提取内容，完整响应:', JSON.stringify(data, null, 2));
      throw new CozeApiError('找不到已完成请求的响应内容', { 
        responseText: JSON.stringify(data) 
      });
    }
    
    return extractedContent;
  }

  /**
   * 流式聊天 - 返回一个异步生成器，逐步生成响应
   */
  async *streamChat(messages: Message[], config: ChatEngineConfig = {}): AsyncGenerator<string> {
    console.log('=== CozeBrowserClient.streamChat 被调用 ===');
    console.log('消息数量:', messages.length);
    console.log('API URL:', this.apiUrl);
    console.log('Bot ID:', this.botId ? this.botId.substring(0, 5) + '...' : 'undefined');
    console.log('API Key 存在:', !!this.accessToken);
    
    if (!this.botId) {
      console.error('错误: Bot ID 未设置');
      throw new CozeApiError('Bot ID is required');
    }
    
    if (!this.accessToken) {
      console.error('错误: API Key 未设置');
      throw new CozeApiError('API Key is required');
    }
    
    if (messages.length === 0) {
      console.error('错误: 没有要发送的消息');
      throw new CozeApiError('No messages to send');
    }
    
    console.log('🛑🛑🛑 [CozeBrowserClient] 开始流式聊天', { 
      messageCount: messages.length,
      apiUrl: this.apiUrl,
      botId: this.botId.substring(0, 5) + '...'
    });

    // 尝试所有API路径，直到成功或全部失败
    const initialPathIndex = this.currentPathIndex;
    let attempts = 0;
    
    do {
      try {
        // 准备请求负载
        const payload: CozeRequest = {
          bot_id: this.botId,
          messages: this.convertMessages(messages),
          stream: true,
          user_id: uuidv4(),
        };
        
        console.log('📤 [CozeBrowserClient] 流式请求负载详情:', {
          botId: this.botId.substring(0, 5) + '...',
          messageCount: payload.messages.length,
          url: this.apiUrl,
          stream: payload.stream,
          firstMessageContent: payload.messages.length > 0 ? 
            payload.messages[0].content.substring(0, 30) + '...' : 'empty',
          allMessages: payload.messages.map(m => ({
            role: m.role,
            contentPreview: m.content.substring(0, 30) + (m.content.length > 30 ? '...' : ''),
            content_type: m.content_type
          }))
        });
        
        console.log('🔄 [CozeBrowserClient] 开始发送流式请求到:', this.apiUrl);
        
        // 发送请求
        const response = await this.fetchWithAuth(this.apiUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Accept': 'text/event-stream, application/json',  // 接受SSE和JSON格式
            'X-Debug-Mode': 'true',  // 尝试启用更详细的API响应
          }
        });
        
        console.log('📥 [CozeBrowserClient] 收到流式响应状态:', response.status, response.statusText);
        const headerEntries = Object.fromEntries(response.headers.entries());
        console.log('📥 [CozeBrowserClient] 流式响应头:', headerEntries);
        console.log('📥 [CozeBrowserClient] 内容类型:', response.headers.get('content-type'));
        
        if (response.status === 404) {
          console.warn(`⚠️ [CozeBrowserClient] API路径 ${this.apiUrl} 不存在(404)，尝试下一个路径...`);
          this.switchApiPath();
          attempts++;
          continue;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [CozeBrowserClient] 流式HTTP错误 ${response.status}:`, errorText);
          
          try {
            // 尝试解析错误响应
            const errorJson = JSON.parse(errorText);
            console.error('❌ [CozeBrowserClient] 错误响应详情:', errorJson);
          } catch (e) {
            // 无法解析为JSON
            console.error('❌ [CozeBrowserClient] 错误响应不是JSON格式');
          }
          
          throw new CozeApiError(`HTTP错误 ${response.status}`, { 
            status: response.status, 
            responseText: errorText 
          });
        }
        
        // 检查是否返回了流
        if (!response.body) {
          console.warn('⚠️ [CozeBrowserClient] 响应没有body，可能不支持流式传输');
          
          // 尝试读取整个响应内容
          const fullResponseText = await response.text();
          console.log('📄 [CozeBrowserClient] 完整响应内容:', fullResponseText.substring(0, 1000) + (fullResponseText.length > 1000 ? '...' : ''));
          
          try {
            // 尝试解析为JSON
            const jsonResponse = JSON.parse(fullResponseText);
            console.log('📊 [CozeBrowserClient] 解析为JSON:', jsonResponse);
            
            // 检查是否是"in_process"状态
            if (jsonResponse.status === 'in_process' && jsonResponse.id) {
              console.log('⏳ [CozeBrowserClient] 检测到in_process状态，开始轮询...');
              // 轮询处理
              const finalContent = await this.pollChatStatus(this.apiUrl, jsonResponse.id);
              console.log('✅ [CozeBrowserClient] 轮询完成，获取到内容');
              yield finalContent;
              return;
            }
            
            // 提取内容
            const extractedContent = this.extractContentFromResponse(jsonResponse);
            if (extractedContent) {
              console.log('✅ [CozeBrowserClient] 从非流式响应中提取到内容');
              yield extractedContent;
              return;
            }
          } catch (e) {
            console.error('❌ [CozeBrowserClient] 解析响应为JSON失败:', e);
          }
          
          // 回退到非流式API
          console.log('⏪ [CozeBrowserClient] 回退到非流式API');
          const content = await this.chat(messages, config);
          yield content;
          return;
        }
        
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let totalChunks = 0;
        let totalLength = 0;
        let currentEvent = '';
        let conversationId = null;
        let chatId = null;
        let accumulatedContent = '';
        
        console.log('🌊 [CozeBrowserClient] 流式响应开始，准备读取数据流');
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('✅ [CozeBrowserClient] 流式传输完成', {
                totalChunks,
                totalLength,
                conversationId,
                chatId,
                accumulatedContentLength: accumulatedContent.length
              });
              break;
            }
            
            // 解码二进制数据
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            totalLength += chunk.length;
            
            // 记录每一块原始数据
            console.log(`📦 [CozeBrowserClient] 接收到数据块 #${totalChunks}，长度: ${chunk.length}`);
            console.log(`📦 [CozeBrowserClient] 原始数据块内容: 
-------------BEGIN CHUNK-------------
${chunk}
--------------END CHUNK--------------`);
            
            // 处理SSE格式 - 按行分割
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 最后一行可能不完整，保留到下一次
            
            if (lines.length === 0) {
              // 没有完整的行，继续读取
              console.log('⏳ [CozeBrowserClient] 数据块不包含完整行，等待更多数据');
              continue;
            }
            
            console.log(`🔍 [CozeBrowserClient] 处理 ${lines.length} 行数据`);
            
            // 处理每一行
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) {
                console.log('➖ [CozeBrowserClient] 跳过空行');
                continue; // 跳过空行
              }
              
              console.log(`🔤 [CozeBrowserClient] 处理行: "${trimmedLine}"`);
              
              // 处理SSE格式
              if (trimmedLine.startsWith('event:')) {
                currentEvent = trimmedLine.slice(6).trim();
                console.log(`📣 [CozeBrowserClient] 检测到SSE事件: "${currentEvent}"`);
                continue;
              }
              
              if (trimmedLine.startsWith('data:')) {
                const dataContent = trimmedLine.slice(5).trim();
                console.log(`🧩 [CozeBrowserClient] 检测到SSE数据:
-------------BEGIN SSE DATA-------------
${dataContent}
--------------END SSE DATA--------------`);
                
                // 特殊处理 [DONE] 标记
                if (dataContent === '[DONE]') {
                  console.log('🏁 [CozeBrowserClient] 检测到流结束标记 [DONE]');
                  continue;
                }
                
                try {
                  // 尝试解析JSON数据
                  const data = JSON.parse(dataContent);
                  totalChunks++;
                  
                  console.log('📊 [CozeBrowserClient] 解析后的JSON数据:', JSON.stringify(data, null, 2));
                  
                  // 记录会话和聊天ID
                  if (data.conversation_id && !conversationId) {
                    conversationId = data.conversation_id;
                    console.log(`🆔 [CozeBrowserClient] 会话ID: ${conversationId}`);
                  }
                  
                  if (data.id && !chatId) {
                    chatId = data.id;
                    console.log(`🆔 [CozeBrowserClient] 聊天ID: ${chatId}`);
                  }
                  
                  // 检查状态
                  if (data.status === 'in_process') {
                    console.log('⏳ [CozeBrowserClient] 检测到in_process状态');
                    // 如果有聊天ID，可以稍后轮询结果
                    if (data.id) {
                      console.log(`⏳ [CozeBrowserClient] 保存聊天ID ${data.id} 用于稍后轮询`);
                    }
                  }
                  
                  // 根据事件类型处理
                  switch (currentEvent) {
                    case 'conversation.chat.created':
                      console.log('🆕 [CozeBrowserClient] 聊天已创建:', data);
                      break;
                      
                    case 'conversation.chat.in_progress':
                      console.log('🔄 [CozeBrowserClient] 聊天进行中:', data);
                      break;
                      
                    case 'conversation.chat.completed':
                      console.log('✅ [CozeBrowserClient] 聊天已完成:', data);
                      if (data.content) {
                        console.log(`📝 [CozeBrowserClient] 完整内容: ${data.content.substring(0, 100)}...`);
                        yield data.content;
                      }
                      break;
                      
                    case 'conversation.chat.failed':
                      console.error('❌ [CozeBrowserClient] 聊天失败:', data.last_error);
                      throw new CozeApiError('聊天失败: ' + (data.last_error?.message || '未知错误'), data.last_error);
                      
                    case 'message':
                      if (data.content) {
                        console.log(`📝 [CozeBrowserClient] 消息内容: ${data.content.substring(0, 100)}...`);
                        yield data.content;
                      } else {
                        console.log('⚠️ [CozeBrowserClient] message事件缺少content:', data);
                      }
                      break;
                      
                    case 'content_block':
                      if (data.delta && data.delta.content) {
                        const content = data.delta.content;
                        accumulatedContent += content;
                        console.log(`📝 [CozeBrowserClient] 内容块: "${content}"`);
                        yield content;
                      } else {
                        console.log('⚠️ [CozeBrowserClient] content_block事件缺少delta.content:', data);
                      }
                      break;
                      
                    default:
                      // 尝试从各种可能的格式中提取内容
                      let content = null;
                      
                      // 详细记录数据结构
                      console.log('🔍 [CozeBrowserClient] 尝试从数据中提取内容:', {
                        hasContent: !!data.content,
                        hasChoices: !!data.choices,
                        hasDelta: !!data.delta,
                        hasMessage: !!data.message,
                        contentType: data.content ? typeof data.content : null,
                        keys: Object.keys(data)
                      });
                      
                      if (data.content) {
                        content = data.content;
                      } else if (data.choices && data.choices[0]) {
                        if (data.choices[0].delta && data.choices[0].delta.content) {
                          content = data.choices[0].delta.content;
                        } else if (data.choices[0].message && data.choices[0].message.content) {
                          content = data.choices[0].message.content;
                        }
                      } else if (data.delta && data.delta.content) {
                        content = data.delta.content;
                      } else if (data.message && data.message.content) {
                        content = data.message.content;
                      } else if (data.chat && data.chat.message) {
                        // 检查chatV3 API格式
                        content = data.chat.message;
                      }
                      
                      if (content) {
                        console.log(`📝 [CozeBrowserClient] 提取到内容: "${content}"`);
                        accumulatedContent += content;
                        yield content;
                      } else {
                        console.log(`⚠️ [CozeBrowserClient] 未能从数据中提取内容:`, data);
                      }
                  }
                } catch (jsonError) {
                  console.warn('⚠️ [CozeBrowserClient] 解析JSON数据失败:', jsonError);
                  console.warn('⚠️ [CozeBrowserClient] 原始数据:', dataContent);
                  
                  // 尝试保存错误的JSON以供分析
                  console.log(`⚠️ [CozeBrowserClient] 无效的JSON数据:
-------------BEGIN INVALID JSON-------------
${dataContent}
--------------END INVALID JSON--------------`);
                }
                
                continue;
              }
              
              // 非SSE格式的行，可能是直接的内容
              console.log(`🔤 [CozeBrowserClient] 非SSE格式行: "${trimmedLine}"`);
            }
          }
        } catch (error) {
          const streamError = error as Error;
          console.error('❌ [CozeBrowserClient] 流式传输错误:', streamError);
          console.error('❌ [CozeBrowserClient] 错误详情:', streamError.stack);
          throw new CozeApiError('流式传输错误: ' + streamError.message);
        } finally {
          // 确保读取器被释放
          console.log('✅ [CozeBrowserClient] 释放流读取器');
          reader.releaseLock();
        }
        
        // 如果没有收到任何数据块，可能是API不支持流式传输
        if (totalChunks === 0) {
          console.warn('⚠️ [CozeBrowserClient] 空响应，尝试下一个API路径');
          this.switchApiPath();
          attempts++;
          continue;
        }
        
        // 如果有累积的内容但没有产生任何yield，则在最后yield一次
        if (accumulatedContent && totalChunks > 0) {
          console.log('📝 [CozeBrowserClient] 流式传输完成，返回累积内容');
          yield accumulatedContent;
        } else if (totalChunks > 0 && !accumulatedContent) {
          console.warn('⚠️ [CozeBrowserClient] 收到数据块但没有累积内容');
        }
        
        // 成功完成
        console.log('✅ [CozeBrowserClient] 流式传输成功完成');
        return;
      } catch (error) {
        console.error('❌ [CozeBrowserClient] 流式请求过程中发生错误:', error);
        
        // 如果是网络错误或其他请求错误，尝试下一个路径
        if (error instanceof Error && 
            (error.message.includes('Failed to fetch') || 
             error.message.includes('Network error'))) {
          console.warn('🔄 [CozeBrowserClient] 网络错误，尝试下一个API路径');
          this.switchApiPath();
          attempts++;
          continue;
        }
        
        // 重新抛出其他错误
        throw error;
      }
    } while (this.currentPathIndex !== initialPathIndex && attempts < this.API_PATHS.length);
    
    // 所有路径都失败了
    console.error('❌ [CozeBrowserClient] 所有API路径均请求失败，尝试次数:', attempts);
    throw new CozeApiError('所有API路径均请求失败');
  }
}