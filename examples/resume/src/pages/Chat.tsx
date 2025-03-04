import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StandaloneChat } from '@llmknow/web';
import { Message } from '@llmknow/core';

// Example chat history data
const EXAMPLE_CHATS = [
  { id: 1, title: 'About my experience', preview: 'Tell me about your work experience...' },
  { id: 2, title: 'Technical skills', preview: 'What technologies are you proficient in?' },
  { id: 3, title: 'Project discussion', preview: 'Can you explain your most challenging project?' },
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

// 添加更明显的调试日志函数
const DEBUG_LOG = (message: string, data?: any) => {
  const prefix = '🔍 [DEBUG]';
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

// 原始的debugLog函数保持不变
const debugLog = (message: string, data?: any) => {
  if (data !== undefined) {
    console.log(`[DEBUG] ${message}`, data);
  } else {
    console.log(`[DEBUG] ${message}`);
  }
};

// Get Coze API configuration from environment variables
const cozeConfig = {
  botId: import.meta.env.VITE_COZE_BOT_ID || '7477424686516174865',
  apiKey: import.meta.env.VITE_COZE_API_KEY || 'pat_p9y8XCOFiaJoAVe6ha7FtnJEm0mnT70UFoTu2OkSg7VRdyGGo42DhA0nmDMvPUyN',
  systemPrompt: "You are an AI assistant that helps people learn about the resume owner's skills, experience, and qualifications. Be helpful, concise, and accurate."
};

export default function Chat() {
  console.log('🚀 Chat组件初始化');
  
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(Date.now().toString());
  const [testResponse, setTestResponse] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Coze配置
  const cozeConfigMemo = useMemo(() => ({
    botId: import.meta.env.VITE_COZE_BOT_ID,
    apiKey: import.meta.env.VITE_COZE_API_KEY,
  }), []);
  
  console.log('🔧 Coze配置:', {
    botId: cozeConfigMemo.botId ? cozeConfigMemo.botId.substring(0, 5) + '...' : 'undefined',
    apiKey: cozeConfigMemo.apiKey ? cozeConfigMemo.apiKey.substring(0, 5) + '...' : 'undefined'
  });

  // 组件挂载时的效果
  useEffect(() => {
    console.log('🔄 Chat组件已挂载');
    return () => {
      console.log('🔄 Chat组件将卸载');
    };
  }, []);

  // Handle sending a message
  const handleSendMessage = () => {
    console.log('📤 发送消息:', message.substring(0, 30) + (message.length > 30 ? '...' : ''));
    // Reset the chat component with a new key to force re-creation with the new message
    setChatKey(Date.now().toString());
    setMessage('');
  };

  // Test the Coze API directly
  const handleTestApi = async () => {
    console.log('🧪 开始测试API');
    setIsTestingApi(true);
    setTestResponse('开始测试API连接...\n');
    
    console.log('开始测试API连接');
    
    // 使用Coze API配置
    const botId = import.meta.env.VITE_COZE_BOT_ID;
    const apiKey = import.meta.env.VITE_COZE_API_KEY;
    
    console.log('🔑 API配置:', {
      botId: botId ? botId.substring(0, 5) + '...' : 'undefined',
      apiKey: apiKey ? apiKey.substring(0, 5) + '...' : 'undefined'
    });
    
    setTestResponse(prev => `${prev}使用Bot ID: ${botId}\n`);
    setTestResponse(prev => `${prev}使用API Key: ${apiKey.substring(0, 10)}...\n\n`);
    
    console.log('配置信息:', {
      botId,
      apiKey: apiKey.substring(0, 10) + '...'
    });
    
    // 可能的API路径
    const API_PATHS = [
      '/api/coze/v3/chat',  // 官方文档指定的正确路径
      '/api/coze/open/api/chat/v3',
      '/api/coze/api/v3/chat'
    ];
    
    // 首先测试非流式API
    setTestResponse(prev => `${prev}=== 测试非流式API ===\n`);
    
    let parsedResponse: any = null;
    
    for (const apiPath of API_PATHS) {
      console.log(`🔍 尝试API路径: ${apiPath}`);
      setTestResponse(prev => `${prev}尝试API路径: ${apiPath}\n`);
      
      try {
        // 构建请求
        const requestBody = {
          bot_id: botId,
          messages: [
            {
              role: 'user',
              content: 'Hello, can you respond with a simple greeting?',
              content_type: 'text'
            }
          ],
          user_id: `test-user-${Date.now()}`,
          stream: false
        };
        
        console.log('📝 请求体:', JSON.stringify(requestBody, null, 2));
        
        setTestResponse(prev => `${prev}发送请求...\n`);
        
        console.log(`📤 发送请求到: ${apiPath}`);
        const startTime = Date.now();
        const response = await fetch(apiPath, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });
        
        const duration = Date.now() - startTime;
        console.log(`📥 收到响应，耗时: ${duration}ms, 状态: ${response.status} ${response.statusText}`);
        
        setTestResponse(prev => `${prev}\n响应状态: ${response.status} ${response.statusText}`);
        setTestResponse(prev => `${prev}\n响应耗时: ${duration}ms`);
        
        // 获取响应头
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log('📋 响应头:', headers);
        setTestResponse(prev => `${prev}\n响应头: ${JSON.stringify(headers, null, 2)}`);
        
        // 获取响应文本
        const responseText = await response.text();
        console.log('📄 响应体长度:', responseText.length);
        console.log('📄 响应体前500字符:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
        
        if (response.status === 404) {
          console.log(`❌ 路径 ${apiPath} 返回404，尝试下一个路径...`);
          setTestResponse(prev => `${prev}\n\n路径 ${apiPath} 返回404，尝试下一个路径...`);
          continue;
        }
        
        // 直接显示原始响应，便于调试
        setTestResponse(prev => `${prev}\n\n原始响应文本:\n${responseText.substring(0, 1000)}${responseText.length > 1000 ? '...(截断)' : ''}`);
        
        try {
          // 尝试解析为JSON
          const data = JSON.parse(responseText);
          parsedResponse = data;
          console.log('🔄 解析后的响应:', data);
          setTestResponse(prev => `${prev}\n\n响应解析为JSON成功!`);
          
          // 检查是否有错误信息
          if (data.code !== undefined && data.code !== 0) {
            console.log(`❌ API错误码: ${data.code}`);
            setTestResponse(prev => `${prev}\n\nAPI错误码: ${data.code}`);
            if (data.message) {
              console.log(`❌ 错误消息: ${data.message}`);
              setTestResponse(prev => `${prev}\n错误消息: ${data.message}`);
            }
            if (data.error) {
              console.log(`❌ 错误详情: ${data.error}`);
              setTestResponse(prev => `${prev}\n错误详情: ${data.error}`);
            }
          }
          
          // 检查是否是处理中状态
          if (data.chat && data.chat.status === 'in_process' && data.chat.id) {
            console.log('⏳ 请求处理中，需要轮询获取结果');
            setTestResponse(prev => `${prev}\n\n请求处理中，需要轮询获取结果`);
            setTestResponse(prev => `${prev}\n会话ID: ${data.conversation_id || 'N/A'}`);
            setTestResponse(prev => `${prev}\n聊天ID: ${data.chat.id}`);
            
            console.log('🔄 轮询信息:', {
              conversationId: data.conversation_id,
              chatId: data.chat.id
            });
            
            // 开始轮询
            let pollCount = 0;
            const MAX_POLLS = 10;
            const POLL_INTERVAL = 2000; // 2秒
            
            setTestResponse(prev => `${prev}\n\n开始轮询，最多${MAX_POLLS}次，间隔${POLL_INTERVAL}ms`);
            
            while (pollCount < MAX_POLLS) {
              pollCount++;
              console.log(`🔄 轮询 #${pollCount}/${MAX_POLLS}...`);
              setTestResponse(prev => `${prev}\n轮询 #${pollCount}/${MAX_POLLS}...`);
              
              // 等待一段时间
              await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
              
              // 构建轮询URL
              const pollUrl = `${apiPath.split('/').slice(0, -1).join('/')}/retrieve?conversation_id=${data.conversation_id}&chat_id=${data.chat.id}`;
              
              console.log(`🔄 轮询URL: ${pollUrl}`);
              setTestResponse(prev => `${prev}\n轮询URL: ${pollUrl}`);
              
              try {
                console.log(`📤 发送轮询请求: ${pollUrl}`);
                const pollResponse = await fetch(pollUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`
                  }
                });
                
                console.log(`📥 轮询响应状态: ${pollResponse.status}`);
                setTestResponse(prev => `${prev}\n轮询响应状态: ${pollResponse.status}`);
                
                if (!pollResponse.ok) {
                  console.error(`❌ 轮询失败: ${pollResponse.status}`);
                  setTestResponse(prev => `${prev}\n轮询失败: ${pollResponse.status}`);
                  continue;
                }
                
                const pollResponseText = await pollResponse.text();
                console.log('📄 轮询响应体长度:', pollResponseText.length);
                console.log('📄 轮询响应体前500字符:', pollResponseText.substring(0, 500));
                
                try {
                  const pollData = JSON.parse(pollResponseText);
                  console.log('🔄 轮询响应解析:', pollData);
                  
                  // 检查是否完成
                  if (pollData.chat && pollData.chat.status === 'completed') {
                    console.log('✅ 轮询完成，获取到结果');
                    setTestResponse(prev => `${prev}\n\n轮询完成，获取到结果!`);
                    
                    // 显示消息内容
                    if (pollData.messages && pollData.messages.length > 0) {
                      const assistantMessages = pollData.messages.filter((m: any) => m.role === 'assistant');
                      if (assistantMessages.length > 0) {
                        const lastMessage = assistantMessages[assistantMessages.length - 1];
                        console.log('💬 助手回复:', lastMessage.content);
                        setTestResponse(prev => `${prev}\n\n助手回复:\n${lastMessage.content}`);
                      }
                    }
                    
                    // 显示使用情况
                    if (pollData.chat.usage) {
                      console.log('📊 使用情况:', pollData.chat.usage);
                      setTestResponse(prev => `${prev}\n\n使用情况: ${JSON.stringify(pollData.chat.usage)}`);
                    }
                    
                    // 成功获取结果，退出循环
                    break;
                  } else {
                    console.log(`⏳ 状态: ${pollData.chat?.status || '未知'}`);
                    setTestResponse(prev => `${prev}\n状态: ${pollData.chat?.status || '未知'}`);
                  }
                } catch (pollParseError) {
                  console.error('❌ 轮询响应解析失败:', pollParseError);
                  console.error('原始响应:', pollResponseText);
                  setTestResponse(prev => `${prev}\n轮询响应解析失败: ${pollParseError instanceof Error ? pollParseError.message : String(pollParseError)}`);
                }
              } catch (pollError) {
                console.error('❌ 轮询请求失败:', pollError);
                setTestResponse(prev => `${prev}\n轮询错误: ${pollError instanceof Error ? pollError.message : String(pollError)}`);
              }
            }
            
            if (pollCount >= MAX_POLLS) {
              console.log('⚠️ 达到最大轮询次数，未能获取最终结果');
              setTestResponse(prev => `${prev}\n\n达到最大轮询次数，未能获取最终结果`);
            }
          } else if (data.choices && data.choices.length > 0) {
            // 直接返回的消息
            console.log('💬 直接返回的消息:', data.choices[0].message.content);
            setTestResponse(prev => `${prev}\n\n直接返回的消息:\n${data.choices[0].message.content}`);
          } else if (data.messages && data.messages.length > 0) {
            // 另一种格式的消息
            const assistantMessages = data.messages.filter((m: any) => m.role === 'assistant');
            if (assistantMessages.length > 0) {
              console.log('💬 助手消息:', assistantMessages[assistantMessages.length - 1].content);
              setTestResponse(prev => `${prev}\n\n助手消息:\n${assistantMessages[assistantMessages.length - 1].content}`);
            }
          }
          
          // 成功获取响应，退出循环
          break;
        } catch (parseError) {
          console.error('❌ 解析响应失败:', parseError);
          setTestResponse(prev => `${prev}\n\n解析响应失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      } catch (error) {
        console.error(`❌ API请求失败 (${apiPath}):`, error);
        setTestResponse(prev => `${prev}\n\nAPI请求失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // 现在测试流式API (SSE格式)
    setTestResponse(prev => `${prev}\n\n=== 测试流式API (SSE格式) ===\n`);
    
    // 使用成功的API路径
    const streamApiPath = API_PATHS[0]; // 使用第一个路径
    
    try {
      console.log(`🔍 尝试流式API路径: ${streamApiPath}`);
      setTestResponse(prev => `${prev}尝试流式API路径: ${streamApiPath}\n`);
      
      // 构建请求
      const streamRequestBody = {
        bot_id: botId,
        messages: [
          {
            role: 'user',
            content: 'Hello, can you respond with a simple greeting?',
            content_type: 'text'
          }
        ],
        user_id: `test-user-${Date.now()}`,
        stream: true
      };
      
      console.log('📝 流式请求体:', JSON.stringify(streamRequestBody, null, 2));
      setTestResponse(prev => `${prev}发送流式请求...\n`);
      
      console.log(`📤 发送流式请求到: ${streamApiPath}`);
      const startTime = Date.now();
      
      const streamResponse = await fetch(streamApiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(streamRequestBody)
      });
      
      const duration = Date.now() - startTime;
      console.log(`📥 收到流式响应，耗时: ${duration}ms, 状态: ${streamResponse.status} ${streamResponse.statusText}`);
      
      setTestResponse(prev => `${prev}\n流式响应状态: ${streamResponse.status} ${streamResponse.statusText}`);
      setTestResponse(prev => `${prev}\n流式响应耗时: ${duration}ms`);
      
      // 获取响应头
      const streamHeaders: Record<string, string> = {};
      streamResponse.headers.forEach((value, key) => {
        streamHeaders[key] = value;
      });
      console.log('📋 流式响应头:', streamHeaders);
      setTestResponse(prev => `${prev}\n流式响应头: ${JSON.stringify(streamHeaders, null, 2)}`);
      
      if (streamResponse.status === 404) {
        console.log(`❌ 流式路径 ${streamApiPath} 返回404`);
        setTestResponse(prev => `${prev}\n\n流式路径 ${streamApiPath} 返回404`);
        return;
      }
      
      if (!streamResponse.ok) {
        const errorText = await streamResponse.text();
        console.error(`❌ 流式HTTP错误 ${streamResponse.status}:`, errorText);
        setTestResponse(prev => `${prev}\n\n流式HTTP错误 ${streamResponse.status}: ${errorText}`);
        return;
      }
      
      if (!streamResponse.body) {
        console.warn('⚠️ 流式响应没有body');
        setTestResponse(prev => `${prev}\n\n流式响应没有body`);
        return;
      }
      
      // 处理流式响应
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let streamContent = '';
      
      setTestResponse(prev => `${prev}\n\n开始接收流式数据...\n`);
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('✅ 流式传输完成');
            setTestResponse(prev => `${prev}\n\n流式传输完成`);
            break;
          }
          
          // 解码二进制数据
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          console.log(`📦 接收到数据块，长度: ${chunk.length}`);
          console.log(`📦 数据块内容: ${chunk.substring(0, 100)}${chunk.length > 100 ? '...' : ''}`);
          
          // 处理SSE格式
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 最后一行可能不完整，保留到下一次
          
          if (lines.length === 0) {
            continue;
          }
          
          setTestResponse(prev => `${prev}\n处理 ${lines.length} 行数据`);
          
          // 处理每一行
          let currentEvent = '';
          let currentData = '';
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            // 显示原始行数据
            setTestResponse(prev => `${prev}\n${line}`);
            
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim();
              setTestResponse(prev => `${prev}\n事件类型: ${currentEvent}`);
            } else if (line.startsWith('data:')) {
              currentData = line.slice(5).trim();
              
              try {
                const data = JSON.parse(currentData);
                
                // 根据事件类型处理
                switch (currentEvent) {
                  case 'conversation.chat.created':
                    setTestResponse(prev => `${prev}\n聊天已创建: ${JSON.stringify(data, null, 2)}`);
                    break;
                    
                  case 'conversation.chat.in_progress':
                    setTestResponse(prev => `${prev}\n聊天进行中: ${JSON.stringify(data, null, 2)}`);
                    break;
                    
                  case 'conversation.chat.completed':
                    setTestResponse(prev => `${prev}\n聊天已完成: ${JSON.stringify(data, null, 2)}`);
                    if (data.content) {
                      streamContent += data.content;
                      setTestResponse(prev => `${prev}\n完整内容: ${data.content}`);
                    }
                    break;
                    
                  case 'conversation.chat.failed':
                    setTestResponse(prev => `${prev}\n聊天失败: ${JSON.stringify(data.last_error, null, 2)}`);
                    break;
                    
                  case 'message':
                    if (data.content) {
                      streamContent += data.content;
                      setTestResponse(prev => `${prev}\n消息内容: ${data.content}`);
                    }
                    break;
                    
                  case 'content_block':
                    if (data.delta && data.delta.content) {
                      streamContent += data.delta.content;
                      setTestResponse(prev => `${prev}\n内容块: ${data.delta.content}`);
                    }
                    break;
                    
                  default:
                    // 尝试从各种可能的格式中提取内容
                    let content = null;
                    
                    if (data.content) {
                      content = data.content;
                    } else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                      content = data.choices[0].delta.content;
                    } else if (data.delta && data.delta.content) {
                      content = data.delta.content;
                    } else if (data.message && data.message.content) {
                      content = data.message.content;
                    }
                    
                    if (content) {
                      streamContent += content;
                      setTestResponse(prev => `${prev}\n提取到内容: ${content}`);
                    } else {
                      setTestResponse(prev => `${prev}\n未能从数据中提取内容: ${JSON.stringify(data, null, 2)}`);
                    }
                }
              } catch (jsonError) {
                setTestResponse(prev => `${prev}\n解析JSON数据失败: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
              }
            }
          }
        }
      } catch (streamError) {
        console.error('❌ 流式传输错误:', streamError);
        setTestResponse(prev => `${prev}\n\n流式传输错误: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
      } finally {
        reader.releaseLock();
      }
      
      if (streamContent) {
        setTestResponse(prev => `${prev}\n\n最终流式内容:\n${streamContent}`);
      } else {
        setTestResponse(prev => `${prev}\n\n未收到任何流式内容`);
      }
    } catch (streamError) {
      console.error('❌ 流式API请求失败:', streamError);
      setTestResponse(prev => `${prev}\n\n流式API请求失败: ${streamError instanceof Error ? streamError.message : String(streamError)}`);
    }
    
    console.log('🧪 API测试完成');
    setIsTestingApi(false);
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
                    onClick={() => setSelectedChat(chat.id.toString())}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      selectedChat === chat.id.toString()
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
              <button 
                onClick={handleTestApi}
                disabled={isTestingApi}
                className="px-3 py-1 text-sm bg-vercel-blue text-white rounded-lg hover:bg-vercel-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingApi ? 'Testing...' : 'Test API'}
              </button>
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
            {testResponse ? (
              <div className="absolute inset-0 overflow-y-auto bg-geist-background p-4">
                <div className="max-w-3xl mx-auto">
                  <div className="p-4 bg-geist-surface rounded-lg">
                    <h3 className="font-medium mb-2">API Test Result</h3>
                    <pre className="whitespace-pre-wrap text-sm">{testResponse}</pre>
                    <button
                      onClick={() => setTestResponse('')}
                      className="mt-4 px-3 py-1 text-sm bg-geist-surface-secondary rounded-lg hover:bg-geist-border transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 overflow-y-auto">
                <div className="min-h-full flex flex-col">
                  <div className="flex-1 p-6">
                    <div className="max-w-3xl mx-auto">
                      <StandaloneChat 
                        key={chatKey}
                        mode="standalone"
                        enableContext={true}
                        engineConfig={cozeConfigMemo}
                        onMessage={(msg: Message) => debugLog('Message received', msg)}
                        onError={(err: Error) => {
                          debugLog('Error', err);
                          console.error('Chat error:', err);
                        }}
                        onStateChange={(state) => debugLog('State changed', state)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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