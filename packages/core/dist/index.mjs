// src/services/coze-browser.ts
import { v4 as uuidv4 } from "uuid";
var CozeApiError = class extends Error {
  constructor(message, options) {
    super(message);
    this.name = "CozeApiError";
    this.status = options?.status;
    this.code = options?.code;
    this.responseText = options?.responseText;
  }
};
var CozeBrowserClient = class {
  /**
   * 创建Coze API客户端
   * @param botId Coze机器人ID
   * @param accessToken Coze API密钥
   */
  constructor(botId, accessToken) {
    this.DEBUG = true;
    // 临时开启调试以便观察
    // 可能的API路径 - 根据官方文档和测试结果
    this.API_PATHS = [
      "/v3/chat"
      // 官方文档指定的路径，测试成功
    ];
    // API endpoints - 使用代理URL避免CORS问题
    this.API_BASE_URL = "/api/coze";
    this.currentPathIndex = 0;
    console.log("=== CozeBrowserClient \u521D\u59CB\u5316 ===");
    console.log(`botId: ${botId ? botId.substring(0, 5) + "..." : "undefined"}`);
    console.log(`accessToken: ${accessToken ? accessToken.substring(0, 5) + "..." : "undefined"}`);
    if (!botId) {
      throw new Error("Coze Bot ID is required");
    }
    if (!accessToken) {
      throw new Error("Coze API Key is required");
    }
    this.botId = botId;
    this.accessToken = accessToken;
    this.apiUrl = this.API_BASE_URL + this.API_PATHS[this.currentPathIndex];
    console.log(`\u521D\u59CB\u5316\u5B8C\u6210\uFF0C\u4F7F\u7528API\u5730\u5740: ${this.apiUrl}`);
  }
  /**
   * 切换API路径
   * 如果某个API路径失败，可以调用此方法尝试下一个路径
   * @returns 是否成功切换路径
   */
  switchApiPath() {
    console.log("=== \u5207\u6362API\u8DEF\u5F84 ===");
    const oldUrl = this.apiUrl;
    this.currentPathIndex = (this.currentPathIndex + 1) % this.API_PATHS.length;
    this.apiUrl = this.API_BASE_URL + this.API_PATHS[this.currentPathIndex];
    console.log(`\u5207\u6362API\u8DEF\u5F84\u4ECE ${oldUrl} \u5230 ${this.apiUrl}`);
    return oldUrl !== this.apiUrl;
  }
  /**
   * 在不同域名间切换 (.com/.cn)
   * 仅用于兼容旧代码，现在使用switchApiPath代替
   */
  switchDomain() {
    return this.switchApiPath();
  }
  /**
   * 将Message数组转换为Coze API格式的消息
   */
  convertMessages(messages) {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      content_type: "text"
      // 确保使用content_type字段
    }));
  }
  /**
   * 使用认证发送请求
   */
  async fetchWithAuth(url, options) {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    headers.set("Authorization", `Bearer ${this.accessToken}`);
    const requestOptions = {
      ...options,
      headers
    };
    console.log(`[CozeBrowserClient] \u53D1\u9001\u8BF7\u6C42\u5230: ${url}`, {
      method: options.method,
      headersKeys: Array.from(headers.keys()),
      bodyLength: options.body ? options.body.length : 0
    });
    try {
      const response = await fetch(url, requestOptions);
      console.log(`[CozeBrowserClient] \u6536\u5230\u54CD\u5E94: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      console.error(`[CozeBrowserClient] \u8BF7\u6C42\u5931\u8D25: ${url}`, error);
      throw error;
    }
  }
  /**
   * 发送聊天请求并获取响应
   */
  async chat(messages, config = {}) {
    console.log("=== CozeBrowserClient.chat \u5F00\u59CB ===");
    console.log("\u6D88\u606F\u6570\u91CF:", messages.length);
    console.log("API URL:", this.apiUrl);
    console.log("Bot ID:", this.botId.substring(0, 5) + "...");
    const initialPathIndex = this.currentPathIndex;
    let attempts = 0;
    do {
      try {
        const payload = {
          bot_id: this.botId,
          messages: this.convertMessages(messages),
          stream: false,
          user_id: uuidv4()
        };
        console.log("\u8BF7\u6C42\u8D1F\u8F7D:", {
          botId: this.botId.substring(0, 5) + "...",
          messageCount: payload.messages.length,
          url: this.apiUrl,
          firstMessageContent: payload.messages.length > 0 ? payload.messages[0].content.substring(0, 30) + "..." : "empty"
        });
        console.log("\u53D1\u9001\u8BF7\u6C42\u5230:", this.apiUrl);
        const response = await this.fetchWithAuth(this.apiUrl, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        console.log("\u6536\u5230\u54CD\u5E94:", response.status, response.statusText);
        if (response.status === 404) {
          console.warn(`API\u8DEF\u5F84 ${this.apiUrl} \u4E0D\u5B58\u5728(404)\uFF0C\u5C1D\u8BD5\u4E0B\u4E00\u4E2A\u8DEF\u5F84...`);
          this.switchApiPath();
          attempts++;
          continue;
        }
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP\u9519\u8BEF ${response.status}:`, errorText);
          throw new CozeApiError(`HTTP\u9519\u8BEF ${response.status}`, {
            status: response.status,
            responseText: errorText
          });
        }
        const responseText = await response.text();
        console.log("\u54CD\u5E94\u6587\u672C\u957F\u5EA6:", responseText.length);
        console.log("\u54CD\u5E94\u6587\u672C\u524D100\u4E2A\u5B57\u7B26:", responseText.substring(0, 100));
        try {
          const data = JSON.parse(responseText);
          console.log("\u54CD\u5E94\u6570\u636E\u7C7B\u578B:", typeof data);
          console.log("\u54CD\u5E94\u6570\u636E\u7ED3\u6784:", Object.keys(data));
          if (data.chat && data.chat.status === "in_process" && data.chat.id) {
            console.log("\u8BF7\u6C42\u5904\u7406\u4E2D\uFF0C\u5F00\u59CB\u8F6E\u8BE2\uFF0Cchat ID:", data.chat.id);
            const conversationId = data.conversation_id;
            const chatId = data.chat.id;
            console.log("\u4F1A\u8BDD\u4FE1\u606F:", {
              conversationId,
              chatId
            });
            return await this.pollChatStatus(this.apiUrl, chatId);
          } else if (data.choices && data.choices.length > 0) {
            const message = data.choices[0].message;
            console.log("\u76F4\u63A5\u8FD4\u56DE\u7684\u6D88\u606F:", message.content.substring(0, 50) + "...");
            return message.content;
          } else if (data.messages && data.messages.length > 0) {
            const assistantMessages = data.messages.filter((m) => m.role === "assistant");
            if (assistantMessages.length > 0) {
              const content = assistantMessages[assistantMessages.length - 1].content;
              console.log("\u4ECEmessages\u6570\u7EC4\u4E2D\u63D0\u53D6\u7684\u6D88\u606F:", content.substring(0, 50) + "...");
              return content;
            }
          }
          console.error("API\u54CD\u5E94\u4E2D\u6CA1\u6709\u627E\u5230\u6D88\u606F\u5185\u5BB9");
          throw new CozeApiError("API\u54CD\u5E94\u4E2D\u6CA1\u6709\u6D88\u606F\u5185\u5BB9", { responseText });
        } catch (parseError) {
          console.error("\u89E3\u6790\u54CD\u5E94\u9519\u8BEF:", parseError);
          if (responseText.includes("<!DOCTYPE html>")) {
            console.warn("\u6536\u5230HTML\u54CD\u5E94\uFF0C\u5C1D\u8BD5\u5176\u4ED6API\u8DEF\u5F84");
            this.switchApiPath();
            attempts++;
            continue;
          }
          throw new CozeApiError("\u89E3\u6790API\u54CD\u5E94\u5931\u8D25", { responseText });
        }
      } catch (error) {
        console.error("\u8BF7\u6C42\u6216\u5904\u7406\u9519\u8BEF:", error);
        if (error instanceof Error && (error.message.includes("Failed to fetch") || error.message.includes("Network error"))) {
          console.warn("\u7F51\u7EDC\u9519\u8BEF\uFF0C\u5C1D\u8BD5\u4E0B\u4E00\u4E2AAPI\u8DEF\u5F84");
          this.switchApiPath();
          attempts++;
          continue;
        }
        throw error;
      }
    } while (this.currentPathIndex !== initialPathIndex && attempts < this.API_PATHS.length);
    console.error("\u6240\u6709API\u8DEF\u5F84\u5747\u8BF7\u6C42\u5931\u8D25");
    throw new CozeApiError("\u6240\u6709API\u8DEF\u5F84\u5747\u8BF7\u6C42\u5931\u8D25");
  }
  /**
   * 轮询聊天状态直到完成
   * @param apiUrl API基础URL
   * @param chatId 聊天ID
   * @returns 完成后的聊天内容
   */
  async pollChatStatus(apiUrl, chatId) {
    const MAX_POLLS = 30;
    const POLL_INTERVAL = 1e3;
    let pollCount = 0;
    let conversationId = null;
    const urlParts = apiUrl.split("/");
    const apiBasePath = urlParts.slice(0, -1).join("/");
    console.log(`\u23F3 [CozeBrowserClient] \u5F00\u59CB\u8F6E\u8BE2, \u57FA\u7840\u8DEF\u5F84: ${apiBasePath}, chatId: ${chatId}`);
    const generatePollUrls = () => {
      const urls = [];
      if (conversationId) {
        urls.push(`${apiBasePath}/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`);
      } else {
        urls.push(`${apiBasePath}/retrieve?chat_id=${chatId}`);
      }
      urls.push(`${apiUrl}/status/${chatId}`);
      urls.push(`${apiBasePath}/v3/chat/retrieve?chat_id=${chatId}`);
      return urls;
    };
    while (pollCount < MAX_POLLS) {
      pollCount++;
      console.log(`\u23F3 [CozeBrowserClient] \u8F6E\u8BE2 #${pollCount}/${MAX_POLLS}: \u68C0\u67E5\u72B6\u6001...`);
      const pollUrls = generatePollUrls();
      console.log(`\u{1F50D} [CozeBrowserClient] \u5C06\u5C1D\u8BD5 ${pollUrls.length} \u79CD\u8F6E\u8BE2URL\u683C\u5F0F`);
      let success = false;
      for (const pollUrl of pollUrls) {
        try {
          console.log(`\u{1F504} [CozeBrowserClient] \u5C1D\u8BD5\u8F6E\u8BE2URL: ${pollUrl}`);
          const isPostMethod = pollUrl.includes("/retrieve");
          const pollResponse = await this.fetchWithAuth(pollUrl, {
            method: isPostMethod ? "POST" : "GET"
          });
          console.log(`\u{1F4E5} [CozeBrowserClient] \u8F6E\u8BE2\u54CD\u5E94\u72B6\u6001: ${pollResponse.status} ${pollResponse.statusText}`);
          console.log(`\u{1F4E5} [CozeBrowserClient] \u8F6E\u8BE2\u54CD\u5E94\u5934:`, Object.fromEntries(pollResponse.headers.entries()));
          if (!pollResponse.ok) {
            console.warn(`\u26A0\uFE0F [CozeBrowserClient] \u8F6E\u8BE2\u5931\u8D25: ${pollResponse.status} ${pollResponse.statusText}`);
            continue;
          }
          const responseText = await pollResponse.text();
          console.log(`\u{1F4C4} [CozeBrowserClient] \u8F6E\u8BE2\u54CD\u5E94\u6587\u672C: 
-------------BEGIN POLL RESPONSE-------------
${responseText.length > 500 ? responseText.substring(0, 500) + "...(\u622A\u65AD)" : responseText}
--------------END POLL RESPONSE--------------`);
          try {
            const pollData = JSON.parse(responseText);
            console.log("\u{1F4CA} [CozeBrowserClient] \u8F6E\u8BE2\u54CD\u5E94\u6570\u636E\u7ED3\u6784:", {
              keys: Object.keys(pollData),
              hasChat: !!pollData.chat,
              chatStatus: pollData.chat ? pollData.chat.status : null,
              status: pollData.status,
              hasMessages: Array.isArray(pollData.messages),
              messagesCount: Array.isArray(pollData.messages) ? pollData.messages.length : 0,
              hasChoices: Array.isArray(pollData.choices),
              choicesCount: Array.isArray(pollData.choices) ? pollData.choices.length : 0
            });
            if (pollData.conversation_id) {
              conversationId = pollData.conversation_id;
              console.log(`\u{1F194} [CozeBrowserClient] \u66F4\u65B0conversationId: ${conversationId}`);
            }
            const status = pollData.chat && pollData.chat.status || pollData.status || pollData.choices && pollData.choices[0] && pollData.choices[0].finish_reason || "unknown";
            console.log(`\u{1F4CA} [CozeBrowserClient] \u5F53\u524D\u72B6\u6001: ${status}`);
            if (status === "completed" || status === "stop" || status === "success") {
              console.log("\u2705 [CozeBrowserClient] \u8BF7\u6C42\u5DF2\u5B8C\u6210\uFF0C\u63D0\u53D6\u5185\u5BB9");
              const content = this.extractContentFromResponse(pollData);
              console.log(`\u{1F4DD} [CozeBrowserClient] \u63D0\u53D6\u5230\u5185\u5BB9: ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}`);
              return content;
            } else if (status === "in_process" || status === "processing" || status === "pending") {
              console.log("\u23F3 [CozeBrowserClient] \u8BF7\u6C42\u4ECD\u5728\u5904\u7406\u4E2D\uFF0C\u7EE7\u7EED\u8F6E\u8BE2");
              success = true;
              break;
            } else if (status === "failed" || status === "error") {
              console.error(`\u274C [CozeBrowserClient] \u8BF7\u6C42\u5931\u8D25\uFF0C\u72B6\u6001: ${status}`);
              const errorMsg = pollData.chat && pollData.chat.last_error && pollData.chat.last_error.message || pollData.error && pollData.error.message || "\u672A\u77E5\u9519\u8BEF";
              throw new CozeApiError(`\u8BF7\u6C42\u5904\u7406\u5931\u8D25: ${errorMsg}`);
            } else {
              console.warn(`\u26A0\uFE0F [CozeBrowserClient] \u672A\u77E5\u72B6\u6001: ${status}\uFF0C\u7EE7\u7EED\u8F6E\u8BE2`);
              success = true;
              break;
            }
          } catch (parseError) {
            console.error("\u274C [CozeBrowserClient] \u89E3\u6790\u8F6E\u8BE2\u54CD\u5E94\u5931\u8D25:", parseError);
          }
        } catch (pollError) {
          console.error("\u274C [CozeBrowserClient] \u8F6E\u8BE2\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF:", pollError);
        }
      }
      const waitTime = success ? POLL_INTERVAL : POLL_INTERVAL * 2;
      console.log(`\u23F3 [CozeBrowserClient] \u7B49\u5F85 ${waitTime}ms \u540E\u7EE7\u7EED\u8F6E\u8BE2...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    console.error(`\u274C [CozeBrowserClient] \u5DF2\u8FBE\u5230\u6700\u5927\u8F6E\u8BE2\u6B21\u6570 (${MAX_POLLS})\uFF0C\u65E0\u6CD5\u83B7\u53D6\u54CD\u5E94`);
    throw new CozeApiError(`\u5DF2\u8FBE\u5230\u6700\u5927\u8F6E\u8BE2\u6B21\u6570 (${MAX_POLLS})\uFF0C\u65E0\u6CD5\u83B7\u53D6\u54CD\u5E94`);
  }
  /**
   * 从响应中提取内容
   * 支持多种响应格式
   */
  extractContentFromResponse(data) {
    console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECE\u54CD\u5E94\u4E2D\u63D0\u53D6\u5185\u5BB9\uFF0C\u6570\u636E\u7ED3\u6784:", Object.keys(data).join(", "));
    console.log("\u{1F9E9} [CozeBrowserClient] \u54CD\u5E94\u6570\u636E\u8BE6\u60C5:", {
      hasMessages: Array.isArray(data.messages),
      messagesCount: Array.isArray(data.messages) ? data.messages.length : 0,
      hasChat: !!data.chat,
      chatStatus: data.chat ? data.chat.status : null,
      hasChoices: Array.isArray(data.choices),
      choicesCount: Array.isArray(data.choices) ? data.choices.length : 0,
      hasContent: typeof data.content !== "undefined",
      contentType: data.content ? typeof data.content : null,
      hasResponse: !!data.response
    });
    let extractedContent = null;
    if (data.messages && data.messages.length > 0) {
      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECEmessages\u6570\u7EC4\u4E2D\u63D0\u53D6\u5185\u5BB9\uFF0C\u6D88\u606F\u6570\u91CF:", data.messages.length);
      const cozeMessages = data.messages.filter((m) => m.role === "assistant" && typeof m.content === "string" && m.content.trim() !== "");
      if (cozeMessages.length > 0) {
        console.log("\u2705 [CozeBrowserClient] \u627E\u5230Coze\u683C\u5F0F\u52A9\u624B\u6D88\u606F\uFF0C\u6570\u91CF:", cozeMessages.length);
        const lastMessage = cozeMessages[cozeMessages.length - 1];
        extractedContent = lastMessage.content;
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECECoze\u6D88\u606F\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      }
      if (!extractedContent) {
        const assistantMessages = data.messages.filter((m) => m.role === "assistant" || m.role === "bot" || m.role === "system");
        if (assistantMessages.length > 0) {
          console.log("\u2705 [CozeBrowserClient] \u627E\u5230\u52A9\u624B\u6D88\u606F\uFF0C\u6570\u91CF:", assistantMessages.length);
          const lastMessage = assistantMessages[assistantMessages.length - 1];
          if (typeof lastMessage.content === "string") {
            extractedContent = lastMessage.content;
          } else if (typeof lastMessage.content === "object" && lastMessage.content !== null) {
            if (lastMessage.content.text) {
              extractedContent = lastMessage.content.text;
            } else if (lastMessage.content.message) {
              extractedContent = lastMessage.content.message;
            } else {
              extractedContent = JSON.stringify(lastMessage.content);
            }
          }
          if (extractedContent) {
            console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECE\u6D88\u606F\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
          }
        }
      }
    }
    if (!extractedContent && data.choices && data.choices.length > 0) {
      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECEchoices\u6570\u7EC4\u4E2D\u63D0\u53D6\u5185\u5BB9");
      const lastChoice = data.choices[data.choices.length - 1];
      if (lastChoice.message && lastChoice.message.content) {
        extractedContent = lastChoice.message.content;
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEchoices.message\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      } else if (lastChoice.text) {
        extractedContent = lastChoice.text;
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEchoices.text\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      } else if (lastChoice.content) {
        extractedContent = lastChoice.content;
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEchoices.content\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      }
    }
    if (!extractedContent && data.content) {
      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECEcontent\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9");
      if (typeof data.content === "string") {
        extractedContent = data.content;
      } else if (typeof data.content === "object" && data.content !== null) {
        if (data.content.text) {
          extractedContent = data.content.text;
        } else if (data.content.message) {
          extractedContent = data.content.message;
        } else {
          extractedContent = JSON.stringify(data.content);
        }
      }
      if (extractedContent) {
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEcontent\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      }
    }
    if (!extractedContent && data.response) {
      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECEresponse\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9");
      if (typeof data.response === "string") {
        extractedContent = data.response;
      } else if (typeof data.response === "object" && data.response !== null) {
        if (data.response.text) {
          extractedContent = data.response.text;
        } else if (data.response.message) {
          extractedContent = data.response.message;
        } else if (data.response.content) {
          extractedContent = data.response.content;
        } else {
          extractedContent = JSON.stringify(data.response);
        }
      }
      if (extractedContent) {
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEresponse\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      }
    }
    if (!extractedContent && data.chat) {
      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECEchat\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9");
      if (data.chat.message) {
        extractedContent = data.chat.message;
      } else if (data.chat.content) {
        extractedContent = data.chat.content;
      } else if (data.chat.text) {
        extractedContent = data.chat.text;
      } else if (data.chat.response) {
        if (typeof data.chat.response === "string") {
          extractedContent = data.chat.response;
        } else if (typeof data.chat.response === "object" && data.chat.response !== null) {
          if (data.chat.response.text) {
            extractedContent = data.chat.response.text;
          } else if (data.chat.response.content) {
            extractedContent = data.chat.response.content;
          }
        }
      }
      if (extractedContent) {
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEchat\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      }
    }
    if (!extractedContent && data.text) {
      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECEtext\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9");
      extractedContent = data.text;
      console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEtext\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
    }
    if (!extractedContent && data.message) {
      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECEmessage\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9");
      if (typeof data.message === "string") {
        extractedContent = data.message;
      } else if (typeof data.message === "object" && data.message !== null) {
        if (data.message.content) {
          extractedContent = data.message.content;
        } else if (data.message.text) {
          extractedContent = data.message.text;
        } else {
          extractedContent = JSON.stringify(data.message);
        }
      }
      if (extractedContent) {
        console.log(`\u{1F4DD} [CozeBrowserClient] \u4ECEmessage\u5B57\u6BB5\u4E2D\u63D0\u53D6\u5185\u5BB9: ${extractedContent?.substring(0, 50) || ""}...`);
      }
    }
    if (!extractedContent) {
      console.error("\u274C [CozeBrowserClient] \u65E0\u6CD5\u4ECE\u54CD\u5E94\u4E2D\u63D0\u53D6\u5185\u5BB9\uFF0C\u5B8C\u6574\u54CD\u5E94:", JSON.stringify(data, null, 2));
      throw new CozeApiError("\u627E\u4E0D\u5230\u5DF2\u5B8C\u6210\u8BF7\u6C42\u7684\u54CD\u5E94\u5185\u5BB9", {
        responseText: JSON.stringify(data)
      });
    }
    return extractedContent;
  }
  /**
   * 流式聊天 - 返回一个异步生成器，逐步生成响应
   */
  async *streamChat(messages, config = {}) {
    console.log("\u{1F6D1}\u{1F6D1}\u{1F6D1} [CozeBrowserClient] \u5F00\u59CB\u6D41\u5F0F\u804A\u5929", {
      messageCount: messages.length,
      apiUrl: this.apiUrl,
      botId: this.botId.substring(0, 5) + "..."
    });
    const initialPathIndex = this.currentPathIndex;
    let attempts = 0;
    do {
      try {
        const payload = {
          bot_id: this.botId,
          messages: this.convertMessages(messages),
          stream: true,
          user_id: uuidv4()
        };
        console.log("\u{1F4E4} [CozeBrowserClient] \u6D41\u5F0F\u8BF7\u6C42\u8D1F\u8F7D\u8BE6\u60C5:", {
          botId: this.botId.substring(0, 5) + "...",
          messageCount: payload.messages.length,
          url: this.apiUrl,
          stream: payload.stream,
          firstMessageContent: payload.messages.length > 0 ? payload.messages[0].content.substring(0, 30) + "..." : "empty",
          allMessages: payload.messages.map((m) => ({
            role: m.role,
            contentPreview: m.content.substring(0, 30) + (m.content.length > 30 ? "..." : ""),
            content_type: m.content_type
          }))
        });
        console.log("\u{1F504} [CozeBrowserClient] \u5F00\u59CB\u53D1\u9001\u6D41\u5F0F\u8BF7\u6C42\u5230:", this.apiUrl);
        const response = await this.fetchWithAuth(this.apiUrl, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Accept": "text/event-stream, application/json",
            // 接受SSE和JSON格式
            "X-Debug-Mode": "true"
            // 尝试启用更详细的API响应
          }
        });
        console.log("\u{1F4E5} [CozeBrowserClient] \u6536\u5230\u6D41\u5F0F\u54CD\u5E94\u72B6\u6001:", response.status, response.statusText);
        const headerEntries = Object.fromEntries(response.headers.entries());
        console.log("\u{1F4E5} [CozeBrowserClient] \u6D41\u5F0F\u54CD\u5E94\u5934:", headerEntries);
        console.log("\u{1F4E5} [CozeBrowserClient] \u5185\u5BB9\u7C7B\u578B:", response.headers.get("content-type"));
        if (response.status === 404) {
          console.warn(`\u26A0\uFE0F [CozeBrowserClient] API\u8DEF\u5F84 ${this.apiUrl} \u4E0D\u5B58\u5728(404)\uFF0C\u5C1D\u8BD5\u4E0B\u4E00\u4E2A\u8DEF\u5F84...`);
          this.switchApiPath();
          attempts++;
          continue;
        }
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`\u274C [CozeBrowserClient] \u6D41\u5F0FHTTP\u9519\u8BEF ${response.status}:`, errorText);
          try {
            const errorJson = JSON.parse(errorText);
            console.error("\u274C [CozeBrowserClient] \u9519\u8BEF\u54CD\u5E94\u8BE6\u60C5:", errorJson);
          } catch (e) {
            console.error("\u274C [CozeBrowserClient] \u9519\u8BEF\u54CD\u5E94\u4E0D\u662FJSON\u683C\u5F0F");
          }
          throw new CozeApiError(`HTTP\u9519\u8BEF ${response.status}`, {
            status: response.status,
            responseText: errorText
          });
        }
        if (!response.body) {
          console.warn("\u26A0\uFE0F [CozeBrowserClient] \u54CD\u5E94\u6CA1\u6709body\uFF0C\u53EF\u80FD\u4E0D\u652F\u6301\u6D41\u5F0F\u4F20\u8F93");
          const fullResponseText = await response.text();
          console.log("\u{1F4C4} [CozeBrowserClient] \u5B8C\u6574\u54CD\u5E94\u5185\u5BB9:", fullResponseText.substring(0, 1e3) + (fullResponseText.length > 1e3 ? "..." : ""));
          try {
            const jsonResponse = JSON.parse(fullResponseText);
            console.log("\u{1F4CA} [CozeBrowserClient] \u89E3\u6790\u4E3AJSON:", jsonResponse);
            if (jsonResponse.status === "in_process" && jsonResponse.id) {
              console.log("\u23F3 [CozeBrowserClient] \u68C0\u6D4B\u5230in_process\u72B6\u6001\uFF0C\u5F00\u59CB\u8F6E\u8BE2...");
              const finalContent = await this.pollChatStatus(this.apiUrl, jsonResponse.id);
              console.log("\u2705 [CozeBrowserClient] \u8F6E\u8BE2\u5B8C\u6210\uFF0C\u83B7\u53D6\u5230\u5185\u5BB9");
              yield finalContent;
              return;
            }
            const extractedContent = this.extractContentFromResponse(jsonResponse);
            if (extractedContent) {
              console.log("\u2705 [CozeBrowserClient] \u4ECE\u975E\u6D41\u5F0F\u54CD\u5E94\u4E2D\u63D0\u53D6\u5230\u5185\u5BB9");
              yield extractedContent;
              return;
            }
          } catch (e) {
            console.error("\u274C [CozeBrowserClient] \u89E3\u6790\u54CD\u5E94\u4E3AJSON\u5931\u8D25:", e);
          }
          console.log("\u23EA [CozeBrowserClient] \u56DE\u9000\u5230\u975E\u6D41\u5F0FAPI");
          const content = await this.chat(messages, config);
          yield content;
          return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let totalChunks = 0;
        let totalLength = 0;
        let currentEvent = "";
        let conversationId = null;
        let chatId = null;
        let accumulatedContent = "";
        console.log("\u{1F30A} [CozeBrowserClient] \u6D41\u5F0F\u54CD\u5E94\u5F00\u59CB\uFF0C\u51C6\u5907\u8BFB\u53D6\u6570\u636E\u6D41");
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("\u2705 [CozeBrowserClient] \u6D41\u5F0F\u4F20\u8F93\u5B8C\u6210", {
                totalChunks,
                totalLength,
                conversationId,
                chatId,
                accumulatedContentLength: accumulatedContent.length
              });
              break;
            }
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            totalLength += chunk.length;
            console.log(`\u{1F4E6} [CozeBrowserClient] \u63A5\u6536\u5230\u6570\u636E\u5757 #${totalChunks}\uFF0C\u957F\u5EA6: ${chunk.length}`);
            console.log(`\u{1F4E6} [CozeBrowserClient] \u539F\u59CB\u6570\u636E\u5757\u5185\u5BB9: 
-------------BEGIN CHUNK-------------
${chunk}
--------------END CHUNK--------------`);
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            if (lines.length === 0) {
              console.log("\u23F3 [CozeBrowserClient] \u6570\u636E\u5757\u4E0D\u5305\u542B\u5B8C\u6574\u884C\uFF0C\u7B49\u5F85\u66F4\u591A\u6570\u636E");
              continue;
            }
            console.log(`\u{1F50D} [CozeBrowserClient] \u5904\u7406 ${lines.length} \u884C\u6570\u636E`);
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) {
                console.log("\u2796 [CozeBrowserClient] \u8DF3\u8FC7\u7A7A\u884C");
                continue;
              }
              console.log(`\u{1F524} [CozeBrowserClient] \u5904\u7406\u884C: "${trimmedLine}"`);
              if (trimmedLine.startsWith("event:")) {
                currentEvent = trimmedLine.slice(6).trim();
                console.log(`\u{1F4E3} [CozeBrowserClient] \u68C0\u6D4B\u5230SSE\u4E8B\u4EF6: "${currentEvent}"`);
                continue;
              }
              if (trimmedLine.startsWith("data:")) {
                const dataContent = trimmedLine.slice(5).trim();
                console.log(`\u{1F9E9} [CozeBrowserClient] \u68C0\u6D4B\u5230SSE\u6570\u636E:
-------------BEGIN SSE DATA-------------
${dataContent}
--------------END SSE DATA--------------`);
                if (dataContent === "[DONE]") {
                  console.log("\u{1F3C1} [CozeBrowserClient] \u68C0\u6D4B\u5230\u6D41\u7ED3\u675F\u6807\u8BB0 [DONE]");
                  continue;
                }
                try {
                  const data = JSON.parse(dataContent);
                  totalChunks++;
                  console.log("\u{1F4CA} [CozeBrowserClient] \u89E3\u6790\u540E\u7684JSON\u6570\u636E:", JSON.stringify(data, null, 2));
                  if (data.conversation_id && !conversationId) {
                    conversationId = data.conversation_id;
                    console.log(`\u{1F194} [CozeBrowserClient] \u4F1A\u8BDDID: ${conversationId}`);
                  }
                  if (data.id && !chatId) {
                    chatId = data.id;
                    console.log(`\u{1F194} [CozeBrowserClient] \u804A\u5929ID: ${chatId}`);
                  }
                  if (data.status === "in_process") {
                    console.log("\u23F3 [CozeBrowserClient] \u68C0\u6D4B\u5230in_process\u72B6\u6001");
                    if (data.id) {
                      console.log(`\u23F3 [CozeBrowserClient] \u4FDD\u5B58\u804A\u5929ID ${data.id} \u7528\u4E8E\u7A0D\u540E\u8F6E\u8BE2`);
                    }
                  }
                  switch (currentEvent) {
                    case "conversation.chat.created":
                      console.log("\u{1F195} [CozeBrowserClient] \u804A\u5929\u5DF2\u521B\u5EFA:", data);
                      break;
                    case "conversation.chat.in_progress":
                      console.log("\u{1F504} [CozeBrowserClient] \u804A\u5929\u8FDB\u884C\u4E2D:", data);
                      break;
                    case "conversation.chat.completed":
                      console.log("\u2705 [CozeBrowserClient] \u804A\u5929\u5DF2\u5B8C\u6210:", data);
                      if (data.content) {
                        console.log(`\u{1F4DD} [CozeBrowserClient] \u5B8C\u6574\u5185\u5BB9: ${data.content.substring(0, 100)}...`);
                        yield data.content;
                      }
                      break;
                    case "conversation.chat.failed":
                      console.error("\u274C [CozeBrowserClient] \u804A\u5929\u5931\u8D25:", data.last_error);
                      throw new CozeApiError("\u804A\u5929\u5931\u8D25: " + (data.last_error?.message || "\u672A\u77E5\u9519\u8BEF"), data.last_error);
                    case "message":
                      if (data.content) {
                        console.log(`\u{1F4DD} [CozeBrowserClient] \u6D88\u606F\u5185\u5BB9: ${data.content.substring(0, 100)}...`);
                        yield data.content;
                      } else {
                        console.log("\u26A0\uFE0F [CozeBrowserClient] message\u4E8B\u4EF6\u7F3A\u5C11content:", data);
                      }
                      break;
                    case "content_block":
                      if (data.delta && data.delta.content) {
                        const content2 = data.delta.content;
                        accumulatedContent += content2;
                        console.log(`\u{1F4DD} [CozeBrowserClient] \u5185\u5BB9\u5757: "${content2}"`);
                        yield content2;
                      } else {
                        console.log("\u26A0\uFE0F [CozeBrowserClient] content_block\u4E8B\u4EF6\u7F3A\u5C11delta.content:", data);
                      }
                      break;
                    default:
                      let content = null;
                      console.log("\u{1F50D} [CozeBrowserClient] \u5C1D\u8BD5\u4ECE\u6570\u636E\u4E2D\u63D0\u53D6\u5185\u5BB9:", {
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
                        content = data.chat.message;
                      }
                      if (content) {
                        console.log(`\u{1F4DD} [CozeBrowserClient] \u63D0\u53D6\u5230\u5185\u5BB9: "${content}"`);
                        accumulatedContent += content;
                        yield content;
                      } else {
                        console.log(`\u26A0\uFE0F [CozeBrowserClient] \u672A\u80FD\u4ECE\u6570\u636E\u4E2D\u63D0\u53D6\u5185\u5BB9:`, data);
                      }
                  }
                } catch (jsonError) {
                  console.warn("\u26A0\uFE0F [CozeBrowserClient] \u89E3\u6790JSON\u6570\u636E\u5931\u8D25:", jsonError);
                  console.warn("\u26A0\uFE0F [CozeBrowserClient] \u539F\u59CB\u6570\u636E:", dataContent);
                  console.log(`\u26A0\uFE0F [CozeBrowserClient] \u65E0\u6548\u7684JSON\u6570\u636E:
-------------BEGIN INVALID JSON-------------
${dataContent}
--------------END INVALID JSON--------------`);
                }
                continue;
              }
              console.log(`\u{1F524} [CozeBrowserClient] \u975ESSE\u683C\u5F0F\u884C: "${trimmedLine}"`);
            }
          }
        } catch (error) {
          const streamError = error;
          console.error("\u274C [CozeBrowserClient] \u6D41\u5F0F\u4F20\u8F93\u9519\u8BEF:", streamError);
          console.error("\u274C [CozeBrowserClient] \u9519\u8BEF\u8BE6\u60C5:", streamError.stack);
          throw new CozeApiError("\u6D41\u5F0F\u4F20\u8F93\u9519\u8BEF: " + streamError.message);
        } finally {
          console.log("\u2705 [CozeBrowserClient] \u91CA\u653E\u6D41\u8BFB\u53D6\u5668");
          reader.releaseLock();
        }
        if (totalChunks === 0) {
          console.warn("\u26A0\uFE0F [CozeBrowserClient] \u7A7A\u54CD\u5E94\uFF0C\u5C1D\u8BD5\u4E0B\u4E00\u4E2AAPI\u8DEF\u5F84");
          this.switchApiPath();
          attempts++;
          continue;
        }
        if (accumulatedContent && totalChunks > 0) {
          console.log("\u{1F4DD} [CozeBrowserClient] \u6D41\u5F0F\u4F20\u8F93\u5B8C\u6210\uFF0C\u8FD4\u56DE\u7D2F\u79EF\u5185\u5BB9");
          yield accumulatedContent;
        } else if (totalChunks > 0 && !accumulatedContent) {
          console.warn("\u26A0\uFE0F [CozeBrowserClient] \u6536\u5230\u6570\u636E\u5757\u4F46\u6CA1\u6709\u7D2F\u79EF\u5185\u5BB9");
        }
        console.log("\u2705 [CozeBrowserClient] \u6D41\u5F0F\u4F20\u8F93\u6210\u529F\u5B8C\u6210");
        return;
      } catch (error) {
        console.error("\u274C [CozeBrowserClient] \u6D41\u5F0F\u8BF7\u6C42\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF:", error);
        if (error instanceof Error && (error.message.includes("Failed to fetch") || error.message.includes("Network error"))) {
          console.warn("\u{1F504} [CozeBrowserClient] \u7F51\u7EDC\u9519\u8BEF\uFF0C\u5C1D\u8BD5\u4E0B\u4E00\u4E2AAPI\u8DEF\u5F84");
          this.switchApiPath();
          attempts++;
          continue;
        }
        throw error;
      }
    } while (this.currentPathIndex !== initialPathIndex && attempts < this.API_PATHS.length);
    console.error("\u274C [CozeBrowserClient] \u6240\u6709API\u8DEF\u5F84\u5747\u8BF7\u6C42\u5931\u8D25\uFF0C\u5C1D\u8BD5\u6B21\u6570:", attempts);
    throw new CozeApiError("\u6240\u6709API\u8DEF\u5F84\u5747\u8BF7\u6C42\u5931\u8D25");
  }
};

// src/services/chat.ts
import { v4 as uuidv42 } from "uuid";
var DefaultChatEngine = class {
  constructor(config) {
    this.controller = null;
    this.DEBUG = true;
    console.log("=== DefaultChatEngine \u521D\u59CB\u5316 ===");
    console.log("\u914D\u7F6E:", {
      botId: config.botId ? config.botId.substring(0, 5) + "..." : "undefined",
      apiKey: config.apiKey ? config.apiKey.substring(0, 5) + "..." : "undefined",
      hasSystemPrompt: !!config.systemPrompt
    });
    this.config = config;
    if (!config.botId) {
      console.error("\u9519\u8BEF: \u7F3A\u5C11 botId");
      throw new Error("Bot ID is required");
    }
    if (!config.apiKey) {
      console.error("\u9519\u8BEF: \u7F3A\u5C11 apiKey");
      throw new Error("API Key is required");
    }
    this.cozeClient = new CozeBrowserClient(config.botId, config.apiKey);
    console.log("DefaultChatEngine \u521D\u59CB\u5316\u5B8C\u6210");
  }
  /**
   * 获取当前配置
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * 流式响应用户消息
   * @param message 用户消息
   * @returns 异步生成器，生成响应片段
   */
  async *streamResponse(message) {
    console.log("=== DefaultChatEngine.streamResponse \u5F00\u59CB ===");
    console.log("\u6D88\u606F:", message.substring(0, 50) + (message.length > 50 ? "..." : ""));
    this.controller = new AbortController();
    try {
      const messages = [];
      if (this.config.systemPrompt) {
        messages.push({
          id: uuidv42(),
          role: "system",
          content: this.config.systemPrompt,
          timestamp: Date.now()
        });
      }
      messages.push({
        id: uuidv42(),
        role: "user",
        content: message,
        timestamp: Date.now()
      });
      console.log("\u53D1\u9001\u8BF7\u6C42\uFF0C\u6D88\u606F\u6570\u91CF:", messages.length, "\u662F\u5426\u5305\u542B\u7CFB\u7EDF\u63D0\u793A:", !!this.config.systemPrompt);
      try {
        let chunkCount = 0;
        let responseContent = "";
        console.log("\u5F00\u59CB\u4ECECozeBrowserClient\u83B7\u53D6\u6D41\u5F0F\u54CD\u5E94...");
        for await (const chunk of this.cozeClient.streamChat(messages, this.config)) {
          chunkCount++;
          if (!chunk) {
            console.log(`\u6536\u5230\u7A7A\u54CD\u5E94\u5757 #${chunkCount}`);
            continue;
          }
          responseContent += chunk;
          if (chunkCount === 1) {
            console.log("\u6536\u5230\u7B2C\u4E00\u4E2A\u54CD\u5E94\u5757:", chunk.substring(0, 50) + (chunk.length > 50 ? "..." : ""));
          }
          if (chunkCount % 5 === 0) {
            console.log(`\u5DF2\u6536\u5230 ${chunkCount} \u4E2A\u54CD\u5E94\u5757\uFF0C\u5F53\u524D\u603B\u957F\u5EA6: ${responseContent.length}`);
          }
          yield chunk;
        }
        console.log(`\u6D41\u5F0F\u54CD\u5E94\u5B8C\u6210\uFF0C\u5171\u6536\u5230 ${chunkCount} \u4E2A\u54CD\u5E94\u5757\uFF0C\u603B\u957F\u5EA6: ${responseContent.length}`);
        if (chunkCount === 0) {
          console.warn("\u672A\u6536\u5230\u4EFB\u4F55\u54CD\u5E94\u5757\uFF0C\u53EF\u80FD\u5B58\u5728\u95EE\u9898");
        }
      } catch (error) {
        console.error("\u6D41\u5F0F\u54CD\u5E94\u9519\u8BEF:", error);
        if (error instanceof Error) {
          console.error("\u9519\u8BEF\u7C7B\u578B:", error.constructor.name);
          console.error("\u9519\u8BEF\u6D88\u606F:", error.message);
          console.error("\u9519\u8BEF\u5806\u6808:", error.stack);
          if (error instanceof CozeApiError) {
            console.error("Coze API\u9519\u8BEF:", error);
            if ("status" in error) {
              console.error("\u9519\u8BEF\u72B6\u6001\u7801:", error.status);
            }
            if ("responseText" in error) {
              console.error("\u54CD\u5E94\u6587\u672C:", error.responseText?.substring(0, 200) + "...");
            }
          }
        } else {
          console.error("\u975E\u6807\u51C6\u9519\u8BEF\u5BF9\u8C61:", error);
        }
        yield `\u5F88\u62B1\u6B49\uFF0C\u6211\u9047\u5230\u4E86\u4E00\u4E2A\u95EE\u9898: ${error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF"}`;
        throw error;
      }
    } finally {
      if (this.controller) {
        console.log("\u6E05\u7406AbortController");
        this.controller = null;
      }
      console.log("streamResponse\u5904\u7406\u5B8C\u6210\uFF0C\u5DF2\u6E05\u7406controller");
    }
  }
  /**
   * 获取基于上下文的响应
   * @param message 用户消息
   * @param context 上下文内容
   * @returns 异步生成器，生成响应片段
   */
  async *getContextualResponse(message, context) {
    console.log("=== DefaultChatEngine.getContextualResponse \u5F00\u59CB ===");
    console.log("\u6D88\u606F:", message.substring(0, 50) + (message.length > 50 ? "..." : ""));
    console.log("\u4E0A\u4E0B\u6587\u957F\u5EA6:", context.length);
    const contextualMessage = `
Context:
${context}

Question:
${message}
`;
    console.log("\u7EC4\u5408\u540E\u7684\u6D88\u606F\u957F\u5EA6:", contextualMessage.length);
    yield* this.streamResponse(contextualMessage);
  }
  /**
   * 中止当前响应
   */
  abort() {
    console.log("=== DefaultChatEngine.abort \u88AB\u8C03\u7528 ===");
    if (this.controller) {
      console.log("\u4E2D\u6B62\u8BF7\u6C42");
      this.controller.abort();
      this.controller = null;
    } else {
      console.log("\u6CA1\u6709\u6D3B\u52A8\u7684\u8BF7\u6C42\u53EF\u4E2D\u6B62");
    }
  }
};

// src/services/context.ts
var DefaultContextManager = class {
  constructor(selector = "[data-context]") {
    this.context = "";
    this.selector = selector;
  }
  /**
   * Get the current context
   */
  getCurrentContext() {
    return this.context;
  }
  /**
   * Update the context based on an element
   */
  updateContext(element) {
    if (!element) return;
    this.context = element.textContent || "";
    this.context = this.context.trim().replace(/\s+/g, " ");
  }
  /**
   * Update context based on the currently visible elements
   */
  updateContextFromVisibleElements() {
    const contextElements = document.querySelectorAll(this.selector);
    if (!contextElements.length) return;
    const visibleElements = Array.from(contextElements).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    });
    if (visibleElements.length === 0) return;
    const visibleContext = visibleElements.map((element) => element.textContent || "").join("\n\n").trim().replace(/\s+/g, " ");
    this.context = visibleContext;
  }
  /**
   * Clear the context
   */
  clearContext() {
    this.context = "";
  }
};

// src/store/chatStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv43 } from "uuid";
var chatEngine = null;
var lastEngineConfig = null;
var DEBUG = true;
function debugLog(message, data) {
  if (DEBUG) {
    console.log(`[ChatStore] ${message}`, data || "");
  }
}
var useChatStore = create()(
  persist(
    (set, get) => {
      return {
        // Initial state
        messages: [],
        isLoading: false,
        error: null,
        conversationId: null,
        // State setters
        setMessages: (messages) => {
          debugLog("Setting messages", { count: messages.length });
          set({ messages });
        },
        addMessage: (message) => {
          debugLog("Adding message", { id: message.id, role: message.role });
          set((state) => ({
            messages: [...state.messages, message]
          }));
        },
        updateMessage: (id, content) => {
          debugLog("Updating message", { id, contentLength: content.length });
          set((state) => ({
            messages: state.messages.map(
              (message) => message.id === id ? { ...message, content } : message
            )
          }));
        },
        setIsLoading: (isLoading) => {
          debugLog("Setting loading state", { isLoading });
          set({ isLoading });
        },
        setError: (error) => {
          if (error) {
            console.error("[ChatStore] Error:", error);
          }
          set({ error });
        },
        setConversationId: (id) => {
          debugLog("Setting conversation ID", { id });
          set({ conversationId: id });
        },
        clearMessages: () => {
          debugLog("Clearing messages");
          set({ messages: [], conversationId: null });
        },
        // Stream handling
        appendToLastMessage: (content) => {
          debugLog("Appending to last message", { contentLength: content.length });
          set((state) => {
            const messages = [...state.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + content
              };
            }
            return { messages };
          });
        },
        startStreamingMessage: (message) => {
          debugLog("Starting streaming message", { id: message.id });
          set((state) => ({
            messages: [...state.messages, { ...message, isStreaming: true }]
          }));
        },
        stopStreamingMessage: (id) => {
          debugLog("Stopping streaming message", { id });
          set((state) => ({
            messages: state.messages.map(
              (message) => message.id === id ? { ...message, isStreaming: false } : message
            )
          }));
        },
        // Chat operations
        sendMessage: async (content, engineConfig) => {
          console.log("=== ChatStore.sendMessage \u5F00\u59CB ===");
          console.log("\u6D88\u606F\u5185\u5BB9:", content.substring(0, 50) + (content.length > 50 ? "..." : ""));
          console.log("\u5F15\u64CE\u914D\u7F6E:", {
            botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + "..." : "undefined",
            apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + "..." : "undefined",
            hasSystemPrompt: !!engineConfig.systemPrompt
          });
          try {
            set({ isLoading: true, error: null });
            const userMessage = {
              id: uuidv43(),
              role: "user",
              content,
              timestamp: Date.now()
            };
            get().addMessage(userMessage);
            if (!chatEngine || !lastEngineConfig || JSON.stringify(lastEngineConfig) !== JSON.stringify(engineConfig)) {
              console.log("\u521B\u5EFA\u65B0\u7684\u804A\u5929\u5F15\u64CE\u5B9E\u4F8B");
              try {
                chatEngine = new DefaultChatEngine(engineConfig);
                lastEngineConfig = { ...engineConfig };
                console.log("\u804A\u5929\u5F15\u64CE\u521B\u5EFA\u6210\u529F");
              } catch (initError) {
                console.error("\u804A\u5929\u5F15\u64CE\u521D\u59CB\u5316\u5931\u8D25:", initError);
                set({
                  isLoading: false,
                  error: initError instanceof Error ? initError : new Error("Failed to initialize chat engine")
                });
                return;
              }
            } else {
              console.log("\u4F7F\u7528\u73B0\u6709\u804A\u5929\u5F15\u64CE\u5B9E\u4F8B");
            }
            const assistantMessage = {
              id: uuidv43(),
              role: "assistant",
              content: "",
              timestamp: Date.now()
            };
            get().startStreamingMessage(assistantMessage);
            try {
              console.log("\u5F00\u59CB\u6D41\u5F0F\u54CD\u5E94");
              let chunkCount = 0;
              for await (const chunk of chatEngine.streamResponse(content)) {
                chunkCount++;
                if (chunkCount === 1) {
                  console.log("\u6536\u5230\u7B2C\u4E00\u4E2A\u54CD\u5E94\u5757:", chunk.substring(0, 30) + (chunk.length > 30 ? "..." : ""));
                }
                if (chunkCount % 10 === 0) {
                  console.log(`\u5DF2\u6536\u5230 ${chunkCount} \u4E2A\u54CD\u5E94\u5757`);
                }
                get().appendToLastMessage(chunk);
              }
              console.log(`\u6D41\u5F0F\u54CD\u5E94\u5B8C\u6210\uFF0C\u5171\u6536\u5230 ${chunkCount} \u4E2A\u54CD\u5E94\u5757`);
            } catch (streamError) {
              console.error("\u6D41\u5F0F\u54CD\u5E94\u9519\u8BEF:", streamError);
              set({
                error: streamError instanceof Error ? streamError : new Error("Error streaming response"),
                isLoading: false
              });
            }
            get().stopStreamingMessage(assistantMessage.id);
            set({ isLoading: false });
            console.log("=== ChatStore.sendMessage \u5B8C\u6210 ===");
          } catch (error) {
            console.error("\u53D1\u9001\u6D88\u606F\u9519\u8BEF:", error);
            set({
              isLoading: false,
              error: error instanceof Error ? error : new Error("Failed to send message")
            });
          }
        },
        sendContextualMessage: async (content, context, engineConfig) => {
          console.log("=== ChatStore.sendContextualMessage \u5F00\u59CB ===");
          console.log("\u6D88\u606F\u5185\u5BB9:", content.substring(0, 50) + (content.length > 50 ? "..." : ""));
          console.log("\u4E0A\u4E0B\u6587\u957F\u5EA6:", context.length);
          console.log("\u5F15\u64CE\u914D\u7F6E:", {
            botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + "..." : "undefined",
            apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + "..." : "undefined",
            hasSystemPrompt: !!engineConfig.systemPrompt
          });
          try {
            set({ isLoading: true, error: null });
            const userMessage = {
              id: uuidv43(),
              role: "user",
              content,
              timestamp: Date.now()
            };
            get().addMessage(userMessage);
            if (!chatEngine || !lastEngineConfig || JSON.stringify(lastEngineConfig) !== JSON.stringify(engineConfig)) {
              console.log("\u521B\u5EFA\u65B0\u7684\u804A\u5929\u5F15\u64CE\u5B9E\u4F8B");
              try {
                chatEngine = new DefaultChatEngine(engineConfig);
                lastEngineConfig = { ...engineConfig };
                console.log("\u804A\u5929\u5F15\u64CE\u521B\u5EFA\u6210\u529F");
              } catch (initError) {
                console.error("\u804A\u5929\u5F15\u64CE\u521D\u59CB\u5316\u5931\u8D25:", initError);
                set({
                  isLoading: false,
                  error: initError instanceof Error ? initError : new Error("Failed to initialize chat engine")
                });
                return;
              }
            } else {
              console.log("\u4F7F\u7528\u73B0\u6709\u804A\u5929\u5F15\u64CE\u5B9E\u4F8B");
            }
            const assistantMessage = {
              id: uuidv43(),
              role: "assistant",
              content: "",
              timestamp: Date.now()
            };
            get().startStreamingMessage(assistantMessage);
            try {
              console.log("\u5F00\u59CB\u6D41\u5F0F\u54CD\u5E94");
              let chunkCount = 0;
              let totalContent = "";
              let hasReceivedContent = false;
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                  reject(new Error("\u6D41\u5F0F\u54CD\u5E94\u8D85\u65F6 (30\u79D2)"));
                }, 3e4);
              });
              const processStream = async () => {
                try {
                  if (!chatEngine) {
                    throw new Error("\u804A\u5929\u5F15\u64CE\u672A\u521D\u59CB\u5316");
                  }
                  for await (const chunk of chatEngine.getContextualResponse(content, context)) {
                    if (!chunk) {
                      console.log(`\u6536\u5230\u7A7A\u54CD\u5E94\u5757 #${chunkCount + 1}`);
                      continue;
                    }
                    chunkCount++;
                    hasReceivedContent = true;
                    totalContent += chunk;
                    if (chunkCount === 1) {
                      console.log("\u6536\u5230\u7B2C\u4E00\u4E2A\u54CD\u5E94\u5757:", chunk.substring(0, 50) + (chunk.length > 50 ? "..." : ""));
                    }
                    if (chunkCount % 5 === 0) {
                      console.log(`\u5DF2\u6536\u5230 ${chunkCount} \u4E2A\u54CD\u5E94\u5757\uFF0C\u603B\u957F\u5EA6: ${totalContent.length}`);
                    }
                    get().appendToLastMessage(chunk);
                  }
                } catch (error) {
                  throw error;
                }
              };
              try {
                await Promise.race([processStream(), timeoutPromise]);
              } catch (error) {
                if (error instanceof Error && error.message.includes("\u8D85\u65F6")) {
                  console.warn("\u6D41\u5F0F\u54CD\u5E94\u8D85\u65F6:", error.message);
                  if (!hasReceivedContent) {
                    throw error;
                  } else {
                    console.log("\u5DF2\u6536\u5230\u90E8\u5206\u5185\u5BB9\uFF0C\u7EE7\u7EED\u5904\u7406");
                  }
                } else {
                  throw error;
                }
              }
              console.log(`\u6D41\u5F0F\u54CD\u5E94\u5B8C\u6210\uFF0C\u5171\u6536\u5230 ${chunkCount} \u4E2A\u54CD\u5E94\u5757\uFF0C\u603B\u957F\u5EA6: ${totalContent.length}`);
              if (chunkCount === 0 || !hasReceivedContent) {
                console.warn("\u672A\u6536\u5230\u4EFB\u4F55\u6709\u6548\u54CD\u5E94\u5185\u5BB9");
                get().appendToLastMessage("\u5F88\u62B1\u6B49\uFF0C\u6211\u65E0\u6CD5\u751F\u6210\u56DE\u590D\u3002\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002");
              }
            } catch (streamError) {
              console.error("\u6D41\u5F0F\u54CD\u5E94\u9519\u8BEF:", streamError);
              if (streamError instanceof Error) {
                console.error("\u9519\u8BEF\u7C7B\u578B:", streamError.constructor.name);
                console.error("\u9519\u8BEF\u6D88\u606F:", streamError.message);
                console.error("\u9519\u8BEF\u5806\u6808:", streamError.stack);
              } else {
                console.error("\u975E\u6807\u51C6\u9519\u8BEF\u5BF9\u8C61:", streamError);
              }
              get().appendToLastMessage("\n\n[\u9519\u8BEF: " + (streamError instanceof Error ? streamError.message : "\u672A\u77E5\u9519\u8BEF") + "]");
              set({
                error: streamError instanceof Error ? streamError : new Error("Error streaming contextual response"),
                isLoading: false
              });
            }
            get().stopStreamingMessage(assistantMessage.id);
            set({ isLoading: false });
            console.log("=== ChatStore.sendContextualMessage \u5B8C\u6210 ===");
          } catch (error) {
            console.error("\u53D1\u9001\u4E0A\u4E0B\u6587\u6D88\u606F\u9519\u8BEF:", error);
            set({
              isLoading: false,
              error: error instanceof Error ? error : new Error("Failed to send contextual message")
            });
          }
        },
        abortResponse: () => {
          console.log("=== ChatStore.abortResponse \u88AB\u8C03\u7528 ===");
          if (chatEngine) {
            console.log("\u4E2D\u6B62\u5F53\u524D\u54CD\u5E94");
            chatEngine.abort();
            set({ isLoading: false });
            set((state) => {
              const messages = [...state.messages];
              const lastMessage = messages[messages.length - 1];
              if (lastMessage && lastMessage.role === "assistant" && lastMessage.isStreaming) {
                console.log("\u6807\u8BB0\u6700\u540E\u4E00\u6761\u6D88\u606F\u4E3A\u5DF2\u4E2D\u6B62");
                messages[messages.length - 1] = {
                  ...lastMessage,
                  isStreaming: false,
                  content: lastMessage.content + " [Aborted]"
                };
              } else {
                console.log("\u6CA1\u6709\u6B63\u5728\u6D41\u5F0F\u4F20\u8F93\u7684\u6D88\u606F\u53EF\u4E2D\u6B62");
              }
              return { messages };
            });
          } else {
            console.log("\u6CA1\u6709\u6D3B\u52A8\u7684\u804A\u5929\u5F15\u64CE\u5B9E\u4F8B");
          }
        }
      };
    },
    {
      name: "chat-store",
      partialize: (state) => ({ messages: state.messages, conversationId: state.conversationId })
    }
  )
);

// src/utils/responsive.ts
var defaultBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024
};
var getResponsiveConfig = (width, platform = "web") => {
  const baseConfig = {
    fontSize: 16,
    spacing: 16,
    chatWidth: "360px",
    chatHeight: "400px",
    avatarSize: 32,
    buttonSize: 40
  };
  const platformAdjustments = platform === "h5" ? {
    // H5 specific adjustments
    spacing: 12,
    buttonSize: 36
  } : {};
  let widthAdjustments = {};
  if (width < defaultBreakpoints.mobile) {
    widthAdjustments = {
      fontSize: 14,
      spacing: 8,
      chatWidth: "100%",
      chatHeight: "300px",
      avatarSize: 24,
      buttonSize: 32
    };
  } else if (width < defaultBreakpoints.tablet) {
    widthAdjustments = {
      fontSize: 14,
      spacing: 12,
      chatWidth: "90%",
      chatHeight: "350px",
      avatarSize: 28,
      buttonSize: 36
    };
  } else if (width < defaultBreakpoints.desktop) {
    widthAdjustments = {
      chatWidth: "320px"
    };
  }
  return {
    ...baseConfig,
    ...platformAdjustments,
    ...widthAdjustments
  };
};
var getWindowWidth = () => {
  if (typeof window === "undefined") return defaultBreakpoints.desktop;
  return window.innerWidth;
};
export {
  CozeApiError,
  CozeBrowserClient,
  DefaultChatEngine,
  DefaultContextManager,
  defaultBreakpoints,
  getResponsiveConfig,
  getWindowWidth,
  useChatStore
};
