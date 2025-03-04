// react-import.js
import React from "react";

// src/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
var ThemeContext = createContext({
  theme: "system",
  setTheme: () => {
  },
  activeThemeClass: "light-theme"
});
var useTheme = () => useContext(ThemeContext);
var ThemeProvider = ({
  initialTheme = "system",
  children
}) => {
  const [theme, setTheme] = useState(initialTheme);
  const [activeThemeClass, setActiveThemeClass] = useState("light-theme");
  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setActiveThemeClass(isDarkMode ? "dark-theme" : "light-theme");
      } else {
        setActiveThemeClass(theme === "dark" ? "dark-theme" : "light-theme");
      }
    };
    updateTheme();
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
      }
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [theme]);
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, setTheme, activeThemeClass }, children: /* @__PURE__ */ jsx("div", { className: activeThemeClass, children }) });
};

// src/components/InlineChat.tsx
import { useEffect as useEffect4, useState as useState3, useRef as useRef3, useMemo } from "react";
import { useChatStore, DefaultContextManager } from "@llmknow/core";

// src/styles/chat.module.css
var chat_default = {};

// src/components/MessageList.tsx
import { useRef, useEffect as useEffect2 } from "react";

// src/components/ChatMessage.tsx
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var UserIcon = () => /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx2("path", { d: "M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ jsx2("path", { d: "M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var AssistantIcon = () => /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx2("path", { d: "M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ jsx2("path", { d: "M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var LoadingIndicator = () => /* @__PURE__ */ jsxs("div", { className: chat_default.loadingIndicator, children: [
  /* @__PURE__ */ jsx2("span", { className: chat_default.dot, children: "." }),
  /* @__PURE__ */ jsx2("span", { className: chat_default.dot, children: "." }),
  /* @__PURE__ */ jsx2("span", { className: chat_default.dot, children: "." })
] });
var ChatMessage = ({ message }) => {
  const { role, content, isStreaming } = message;
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  const messageClass = {
    user: chat_default.userMessage,
    assistant: chat_default.assistantMessage,
    system: chat_default.systemMessage
  }[role];
  return /* @__PURE__ */ jsxs("div", { className: clsx(messageClass, "animate-fade-in"), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ jsx2("div", { className: "flex-shrink-0", children: role === "user" ? /* @__PURE__ */ jsx2(UserIcon, {}) : /* @__PURE__ */ jsx2(AssistantIcon, {}) }),
      /* @__PURE__ */ jsx2("div", { className: "text-xs text-gray-500", children: timestamp })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "prose prose-sm max-w-none dark:prose-invert", children: [
      /* @__PURE__ */ jsx2(ReactMarkdown, { children: content }),
      isStreaming && /* @__PURE__ */ jsx2(LoadingIndicator, {})
    ] })
  ] });
};

// src/components/MessageList.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var MessageList = ({
  messages,
  scrollToBottom = true
}) => {
  const listRef = useRef(null);
  useEffect2(() => {
    if (scrollToBottom && listRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" || lastMessage.isStreaming) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [messages, scrollToBottom]);
  return /* @__PURE__ */ jsx3("div", { className: chat_default.messageList, ref: listRef, children: messages.length === 0 ? /* @__PURE__ */ jsx3("div", { className: "text-center text-gray-500 p-4", children: /* @__PURE__ */ jsx3("p", { children: "What do you want to know about me today?" }) }) : messages.map((message) => /* @__PURE__ */ jsx3(ChatMessage, { message }, message.id)) });
};

// src/components/ChatInput.tsx
import { useState as useState2, useRef as useRef2, useEffect as useEffect3 } from "react";
import clsx2 from "clsx";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
var SendIcon = () => /* @__PURE__ */ jsxs2("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx4("path", { d: "M22 2L11 13", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ jsx4("path", { d: "M22 2L15 22L11 13L2 9L22 2Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var ChatInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState2("");
  const textareaRef = useRef2(null);
  useEffect3(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [message]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };
  return /* @__PURE__ */ jsxs2("div", { className: chat_default.inputContainer, children: [
    /* @__PURE__ */ jsx4(
      "textarea",
      {
        ref: textareaRef,
        className: chat_default.input,
        value: message,
        onChange: (e) => setMessage(e.target.value),
        onKeyDown: handleKeyDown,
        placeholder,
        disabled: isLoading,
        rows: 1
      }
    ),
    /* @__PURE__ */ jsx4(
      "button",
      {
        className: clsx2(chat_default.sendButton, {
          "opacity-50 cursor-not-allowed": isLoading || !message.trim()
        }),
        onClick: handleSendMessage,
        disabled: isLoading || !message.trim(),
        "aria-label": "Send message",
        children: /* @__PURE__ */ jsx4(SendIcon, {})
      }
    )
  ] });
};

// src/components/InlineChat.tsx
import { v4 as uuidv4 } from "uuid";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var SearchIcon = () => /* @__PURE__ */ jsx5("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx5("path", { d: "M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" }) });
var CloseIcon = () => /* @__PURE__ */ jsx5("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx5("path", { d: "M18 6L6 18M6 6l12 12", strokeLinecap: "round", strokeLinejoin: "round" }) });
var InlineChat = ({
  width = "600px",
  height = "400px",
  maxHeight = "80vh",
  enableContext = true,
  engineConfig = {},
  theme: themeProp = "system",
  onMessage,
  onError,
  onStateChange,
  contextSelector,
  initialMessage
}) => {
  const { theme: activeTheme } = useTheme();
  const chatInputRef = useRef3(null);
  const [isExpanded, setIsExpanded] = useState3(false);
  const messageEndRef = useRef3(null);
  const { messages, isLoading, error, sendMessage, sendContextualMessage, abortResponse } = useChatStore(
    (state) => ({
      messages: state.messages,
      isLoading: state.isLoading,
      error: state.error,
      sendMessage: state.sendMessage,
      sendContextualMessage: state.sendContextualMessage,
      abortResponse: state.abortResponse
    })
  );
  const contextManager = useMemo(() => {
    if (enableContext) {
      return new DefaultContextManager(contextSelector);
    }
    return null;
  }, [enableContext, contextSelector]);
  useEffect4(() => {
    if (contextManager) {
      contextManager.updateContextFromVisibleElements();
    }
  }, [contextManager]);
  useEffect4(() => {
    if (initialMessage && !messages.length) {
      console.log("=== InlineChat \u5904\u7406\u521D\u59CB\u6D88\u606F ===");
      console.log("\u521D\u59CB\u6D88\u606F:", initialMessage);
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, messages.length]);
  useEffect4(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (onStateChange) {
      onStateChange({ messages, isLoading, error });
    }
  }, [messages, isLoading, error, onStateChange]);
  useEffect4(() => {
    if (error && onError) {
      console.error("=== InlineChat \u9519\u8BEF ===", error);
      onError(error);
    }
  }, [error, onError]);
  useEffect4(() => {
    if (messages.length > 0 && onMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !lastMessage.isStreaming) {
        console.log("=== InlineChat \u65B0\u6D88\u606F ===", {
          id: lastMessage.id,
          role: lastMessage.role,
          contentLength: lastMessage.content.length
        });
        onMessage(lastMessage);
      }
    }
  }, [messages, onMessage]);
  useEffect4(() => {
    if (isExpanded && chatInputRef.current) {
      const inputElement = chatInputRef.current.querySelector("input, textarea");
      if (inputElement instanceof HTMLElement) {
        inputElement.focus();
      }
    }
  }, [isExpanded]);
  useEffect4(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleExpanded();
      }
      if (e.key === "Escape" && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);
  const updateContext = () => {
    if (contextManager) {
      console.log("=== InlineChat \u66F4\u65B0\u4E0A\u4E0B\u6587 ===");
      contextManager.updateContextFromVisibleElements();
    }
  };
  const handleSendMessage = async (content) => {
    console.log("=== InlineChat.handleSendMessage \u5F00\u59CB ===");
    console.log("\u6D88\u606F\u5185\u5BB9:", content.substring(0, 50) + (content.length > 50 ? "..." : ""));
    console.log("\u5F15\u64CE\u914D\u7F6E:", {
      botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + "..." : "undefined",
      apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + "..." : "undefined",
      hasSystemPrompt: !!engineConfig.systemPrompt
    });
    try {
      if (enableContext && contextManager) {
        const context = contextManager.getCurrentContext();
        console.log("\u4F7F\u7528\u4E0A\u4E0B\u6587\u53D1\u9001\u6D88\u606F\uFF0C\u4E0A\u4E0B\u6587\u957F\u5EA6:", context.length);
        sendContextualMessage(content, context, engineConfig);
      } else {
        console.log("\u76F4\u63A5\u53D1\u9001\u6D88\u606F\uFF0C\u65E0\u4E0A\u4E0B\u6587");
        sendMessage(content, engineConfig);
      }
      if (onMessage) {
        const message = {
          id: uuidv4(),
          role: "user",
          content,
          timestamp: Date.now()
        };
        console.log("\u901A\u77E5\u7236\u7EC4\u4EF6\u65B0\u6D88\u606F");
        onMessage(message);
      }
      console.log("=== InlineChat.handleSendMessage \u5B8C\u6210 ===");
    } catch (err) {
      console.error("=== InlineChat.handleSendMessage \u9519\u8BEF ===", err);
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && contextManager) {
      updateContext();
    }
  };
  return /* @__PURE__ */ jsx5(
    "div",
    {
      className: chat_default.inlineChatContainer,
      style: {
        width,
        maxHeight: isExpanded ? maxHeight : "auto"
      },
      "data-theme": activeTheme,
      children: !isExpanded ? /* @__PURE__ */ jsxs3(
        "button",
        {
          className: chat_default.searchBar,
          onClick: toggleExpanded,
          "aria-label": "Open chat",
          children: [
            /* @__PURE__ */ jsxs3("div", { className: chat_default.searchPlaceholder, children: [
              /* @__PURE__ */ jsx5(SearchIcon, {}),
              /* @__PURE__ */ jsx5("span", { children: "Ask me anything..." })
            ] }),
            /* @__PURE__ */ jsx5("div", { className: chat_default.searchShortcut, children: /* @__PURE__ */ jsx5("span", { children: "/" }) })
          ]
        }
      ) : /* @__PURE__ */ jsxs3("div", { className: chat_default.chatContainer, children: [
        /* @__PURE__ */ jsxs3("div", { className: chat_default.chatHeader, children: [
          /* @__PURE__ */ jsx5("div", { className: chat_default.chatTitle, children: "Ask me" }),
          /* @__PURE__ */ jsx5(
            "button",
            {
              className: chat_default.closeButton,
              onClick: toggleExpanded,
              "aria-label": "Close chat",
              children: /* @__PURE__ */ jsx5(CloseIcon, {})
            }
          )
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: chat_default.messageList, children: [
          /* @__PURE__ */ jsx5(MessageList, { messages, scrollToBottom: true }),
          error && /* @__PURE__ */ jsx5("div", { className: chat_default.errorMessage, children: /* @__PURE__ */ jsxs3("span", { children: [
            "Error: ",
            error.message
          ] }) }),
          /* @__PURE__ */ jsx5("div", { ref: messageEndRef })
        ] }),
        /* @__PURE__ */ jsx5("div", { className: chat_default.inputContainer, ref: chatInputRef, children: /* @__PURE__ */ jsx5(
          ChatInput,
          {
            onSendMessage: handleSendMessage,
            isLoading,
            placeholder: "Type a message..."
          }
        ) })
      ] })
    }
  );
};

// src/components/StandaloneChat.tsx
import { useEffect as useEffect5 } from "react";
import { useChatStore as useChatStore2 } from "@llmknow/core";

// src/styles/standalone.module.css
var standalone_default = {};

// src/components/StandaloneChat.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var BackIcon = () => /* @__PURE__ */ jsx6("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx6("path", { d: "M19 12H5M12 19L5 12L12 5", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
var StandaloneChat = ({
  engineConfig = {},
  theme: themeProp = "system",
  onMessage,
  onError,
  onStateChange,
  onBack
}) => {
  const { activeThemeClass } = useTheme();
  const { messages, isLoading, error, sendMessage } = useChatStore2();
  console.log("=== StandaloneChat \u521D\u59CB\u5316 ===");
  console.log("\u5F15\u64CE\u914D\u7F6E:", {
    botId: engineConfig.botId ? engineConfig.botId.substring(0, 5) + "..." : "undefined",
    apiKey: engineConfig.apiKey ? engineConfig.apiKey.substring(0, 5) + "..." : "undefined",
    hasSystemPrompt: !!engineConfig.systemPrompt
  });
  useEffect5(() => {
    if (onStateChange) {
      onStateChange({ messages, isLoading, error });
    }
  }, [messages, isLoading, error, onStateChange]);
  useEffect5(() => {
    if (error && onError) {
      console.error("=== StandaloneChat \u9519\u8BEF ===", error);
      onError(error);
    }
  }, [error, onError]);
  useEffect5(() => {
    if (messages.length > 0 && onMessage) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !lastMessage.isStreaming) {
        console.log("=== StandaloneChat \u65B0\u6D88\u606F ===", {
          id: lastMessage.id,
          role: lastMessage.role,
          contentLength: lastMessage.content.length
        });
        onMessage(lastMessage);
      }
    }
  }, [messages, onMessage]);
  const handleSendMessage = async (content) => {
    console.log("=== StandaloneChat.handleSendMessage \u5F00\u59CB ===");
    console.log("\u6D88\u606F\u5185\u5BB9:", content.substring(0, 50) + (content.length > 50 ? "..." : ""));
    try {
      console.log("\u53D1\u9001\u6D88\u606F\u5230\u804A\u5929\u5F15\u64CE");
      await sendMessage(content, engineConfig);
      console.log("=== StandaloneChat.handleSendMessage \u5B8C\u6210 ===");
    } catch (err) {
      console.error("=== StandaloneChat.handleSendMessage \u9519\u8BEF ===", err);
      if (onError) {
        onError(err);
      }
    }
  };
  return /* @__PURE__ */ jsxs4("div", { className: `${standalone_default.chatContainer} ${activeThemeClass}`, children: [
    /* @__PURE__ */ jsx6("header", { className: standalone_default.chatHeader, children: onBack && /* @__PURE__ */ jsxs4("button", { onClick: onBack, className: standalone_default.backButton, children: [
      /* @__PURE__ */ jsx6(BackIcon, {}),
      /* @__PURE__ */ jsx6("span", { children: "Back" })
    ] }) }),
    /* @__PURE__ */ jsx6("div", { className: standalone_default.messageList, children: /* @__PURE__ */ jsx6(MessageList, { messages }) }),
    error && /* @__PURE__ */ jsx6("div", { className: standalone_default.error, children: error.message })
  ] });
};
export {
  ChatInput,
  ChatMessage,
  InlineChat,
  MessageList,
  StandaloneChat,
  ThemeProvider,
  useTheme
};
