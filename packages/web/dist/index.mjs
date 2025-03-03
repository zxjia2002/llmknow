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
import { useEffect as useEffect4, useState as useState3 } from "react";
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
  return /* @__PURE__ */ jsx3("div", { className: chat_default.messageList, ref: listRef, children: messages.length === 0 ? /* @__PURE__ */ jsx3("div", { className: "text-center text-gray-500 p-4", children: /* @__PURE__ */ jsx3("p", { children: "No messages yet. Start a conversation!" }) }) : messages.map((message) => /* @__PURE__ */ jsx3(ChatMessage, { message }, message.id)) });
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
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
var InlineChat = ({
  position = "right",
  width = "360px",
  height = "400px",
  maxHeight = "500px",
  enableContext = true,
  engineConfig = {},
  theme: themeProp = "system",
  onMessage,
  onError,
  onStateChange,
  contextSelector
}) => {
  const { setTheme } = useTheme();
  useEffect4(() => {
    setTheme(themeProp);
  }, [themeProp, setTheme]);
  const [contextManager] = useState3(
    () => enableContext ? new DefaultContextManager(contextSelector) : null
  );
  const { messages, isLoading, error, sendMessage, sendContextualMessage } = useChatStore();
  useEffect4(() => {
    if (enableContext && contextManager) {
      const updateContext = () => {
        contextManager.updateContextFromVisibleElements();
      };
      window.addEventListener("scroll", updateContext);
      window.addEventListener("resize", updateContext);
      updateContext();
      return () => {
        window.removeEventListener("scroll", updateContext);
        window.removeEventListener("resize", updateContext);
      };
    }
  }, [enableContext, contextManager]);
  useEffect4(() => {
    onStateChange?.({ messages, isLoading, error });
  }, [messages, isLoading, error, onStateChange]);
  useEffect4(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);
  const handleSendMessage = async (content) => {
    try {
      onMessage?.({ id: "", role: "user", content, timestamp: Date.now() });
      if (enableContext && contextManager) {
        const context = contextManager.getCurrentContext();
        await sendContextualMessage(content, context, engineConfig);
      } else {
        await sendMessage(content, engineConfig);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: chat_default.inlineChatContainer,
      style: {
        width,
        height,
        maxHeight,
        ...position === "left" ? { left: 0 } : { right: 0 }
      },
      children: [
        /* @__PURE__ */ jsx5(MessageList, { messages }),
        /* @__PURE__ */ jsx5(
          ChatInput,
          {
            onSendMessage: handleSendMessage,
            isLoading
          }
        )
      ]
    }
  );
};

// src/components/StandaloneChat.tsx
import React6, { useEffect as useEffect5 } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore as useChatStore2 } from "@llmknow/core";

// src/styles/standalone.module.css
var standalone_default = {};

// src/components/StandaloneChat.tsx
import { Fragment, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var CloseIcon = () => /* @__PURE__ */ jsxs4("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsx6("path", { d: "M18 6L6 18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ jsx6("path", { d: "M6 6L18 18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var ChatIcon = () => /* @__PURE__ */ jsx6("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx6("path", { d: "M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
var StandaloneChat = ({
  isOpen = false,
  onOpenChange,
  width = "360px",
  height = "500px",
  maxHeight = "80vh",
  engineConfig = {},
  theme: themeProp = "system",
  enableHistory = true,
  onMessage,
  onError,
  onStateChange
}) => {
  const { setTheme } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = React6.useState(isOpen);
  const isOpenState = onOpenChange ? isOpen : internalIsOpen;
  const handleOpenChange = (open) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  useEffect5(() => {
    setTheme(themeProp);
  }, [themeProp, setTheme]);
  const { messages, isLoading, error, sendMessage } = useChatStore2();
  useEffect5(() => {
    onStateChange?.({ messages, isLoading, error });
  }, [messages, isLoading, error, onStateChange]);
  useEffect5(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);
  const handleSendMessage = async (content) => {
    try {
      onMessage?.({ id: "", role: "user", content, timestamp: Date.now() });
      await sendMessage(content, engineConfig);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  return /* @__PURE__ */ jsxs4(Fragment, { children: [
    /* @__PURE__ */ jsx6(
      "button",
      {
        className: standalone_default.chatTrigger,
        onClick: () => handleOpenChange(true),
        "aria-label": "Open chat",
        children: /* @__PURE__ */ jsx6(ChatIcon, {})
      }
    ),
    /* @__PURE__ */ jsx6(AnimatePresence, { children: isOpenState && /* @__PURE__ */ jsxs4(
      motion.div,
      {
        className: standalone_default.standaloneChatContainer,
        style: { width, height, maxHeight },
        initial: { opacity: 0, scale: 0.9, x: 20, y: 20 },
        animate: { opacity: 1, scale: 1, x: 0, y: 0 },
        exit: { opacity: 0, scale: 0.9, x: 20, y: 20 },
        transition: { type: "spring", stiffness: 300, damping: 30 },
        children: [
          /* @__PURE__ */ jsxs4("div", { className: standalone_default.standaloneChatHeader, children: [
            /* @__PURE__ */ jsx6("h3", { className: standalone_default.standaloneChatTitle, children: "Chat" }),
            /* @__PURE__ */ jsx6(
              "button",
              {
                className: standalone_default.closeButton,
                onClick: () => handleOpenChange(false),
                "aria-label": "Close chat",
                children: /* @__PURE__ */ jsx6(CloseIcon, {})
              }
            )
          ] }),
          /* @__PURE__ */ jsx6(MessageList, { messages }),
          /* @__PURE__ */ jsx6(
            ChatInput,
            {
              onSendMessage: handleSendMessage,
              isLoading
            }
          )
        ]
      }
    ) })
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
