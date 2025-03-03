"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DefaultChatEngine: () => DefaultChatEngine,
  DefaultContextManager: () => DefaultContextManager,
  defaultBreakpoints: () => defaultBreakpoints,
  getResponsiveConfig: () => getResponsiveConfig,
  getWindowWidth: () => getWindowWidth,
  useChatStore: () => useChatStore
});
module.exports = __toCommonJS(index_exports);

// src/services/chat.ts
var DefaultChatEngine = class {
  constructor(config) {
    this.controller = null;
    this.config = config;
  }
  /**
   * Stream a response from the AI model
   */
  async *streamResponse(message) {
    try {
      this.controller = new AbortController();
      const signal = this.controller.signal;
      const response = await fetch(this.config.apiUrl || "https://api.example.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1e3,
          stream: true
        }),
        signal
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      if (!response.body) {
        throw new Error("Response body is null");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Stream aborted");
      } else {
        console.error("Stream error:", error);
        throw error;
      }
    } finally {
      this.controller = null;
    }
  }
  /**
   * Get a contextual response based on the message and context
   */
  async *getContextualResponse(message, context) {
    const contextualMessage = `Context: ${context}

Question: ${message}`;
    for await (const chunk of this.streamResponse(contextualMessage)) {
      yield chunk;
    }
  }
  /**
   * Abort the current response
   */
  abort() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
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
var import_zustand = require("zustand");
var import_middleware = require("zustand/middleware");
var import_uuid = require("uuid");
var useChatStore = (0, import_zustand.create)()(
  (0, import_middleware.persist)(
    (set, get) => {
      let chatEngine = null;
      return {
        // Initial state
        messages: [],
        isLoading: false,
        error: null,
        conversationId: null,
        // State setters
        setMessages: (messages) => set({ messages }),
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, message]
        })),
        updateMessage: (id, content) => set((state) => ({
          messages: state.messages.map(
            (message) => message.id === id ? { ...message, content } : message
          )
        })),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setConversationId: (conversationId) => set({ conversationId }),
        clearMessages: () => set({ messages: [] }),
        // Stream handling
        appendToLastMessage: (content) => set((state) => {
          const messages = [...state.messages];
          if (messages.length === 0) return { messages };
          const lastMessage = messages[messages.length - 1];
          messages[messages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + content
          };
          return { messages };
        }),
        startStreamingMessage: (message) => set((state) => ({
          messages: [...state.messages, { ...message, isStreaming: true }]
        })),
        stopStreamingMessage: (id) => set((state) => ({
          messages: state.messages.map(
            (message) => message.id === id ? { ...message, isStreaming: false } : message
          )
        })),
        // Chat operations
        sendMessage: async (content, engineConfig) => {
          try {
            const userMessage = {
              id: (0, import_uuid.v4)(),
              role: "user",
              content,
              timestamp: Date.now()
            };
            get().addMessage(userMessage);
            const aiMessageId = (0, import_uuid.v4)();
            const aiMessage = {
              id: aiMessageId,
              role: "assistant",
              content: "",
              timestamp: Date.now(),
              isStreaming: true
            };
            get().addMessage(aiMessage);
            get().setIsLoading(true);
            chatEngine = new DefaultChatEngine(engineConfig);
            const stream = chatEngine.streamResponse(content);
            let result = await stream.next();
            while (!result.done) {
              const chunk = result.value;
              const currentMessage = get().messages.find((m) => m.id === aiMessageId);
              if (currentMessage) {
                get().updateMessage(aiMessageId, currentMessage.content + chunk);
              }
              result = await stream.next();
            }
            get().stopStreamingMessage(aiMessageId);
          } catch (error) {
            console.error("Error sending message:", error);
            get().setError(error);
          } finally {
            get().setIsLoading(false);
          }
        },
        sendContextualMessage: async (content, context, engineConfig) => {
          try {
            const userMessage = {
              id: (0, import_uuid.v4)(),
              role: "user",
              content,
              timestamp: Date.now()
            };
            get().addMessage(userMessage);
            const aiMessageId = (0, import_uuid.v4)();
            const aiMessage = {
              id: aiMessageId,
              role: "assistant",
              content: "",
              timestamp: Date.now(),
              isStreaming: true
            };
            get().addMessage(aiMessage);
            get().setIsLoading(true);
            chatEngine = new DefaultChatEngine(engineConfig);
            const stream = chatEngine.getContextualResponse(content, context);
            let result = await stream.next();
            while (!result.done) {
              const chunk = result.value;
              const currentMessage = get().messages.find((m) => m.id === aiMessageId);
              if (currentMessage) {
                get().updateMessage(aiMessageId, currentMessage.content + chunk);
              }
              result = await stream.next();
            }
            get().stopStreamingMessage(aiMessageId);
          } catch (error) {
            console.error("Error sending contextual message:", error);
            get().setError(error);
          } finally {
            get().setIsLoading(false);
          }
        },
        abortResponse: () => {
          if (chatEngine) {
            chatEngine.abort();
          }
        }
      };
    },
    {
      name: "llmknow-chat-store",
      partialize: (state) => ({
        messages: state.messages,
        conversationId: state.conversationId
      })
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DefaultChatEngine,
  DefaultContextManager,
  defaultBreakpoints,
  getResponsiveConfig,
  getWindowWidth,
  useChatStore
});
