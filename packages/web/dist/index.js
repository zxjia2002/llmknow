"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ChatInput: () => ChatInput,
  ChatMessage: () => ChatMessage,
  InlineChat: () => InlineChat,
  MessageList: () => MessageList,
  StandaloneChat: () => StandaloneChat,
  ThemeProvider: () => ThemeProvider,
  useTheme: () => useTheme
});
module.exports = __toCommonJS(index_exports);

// react-import.js
var import_react = __toESM(require("react"));

// src/components/ThemeProvider.tsx
var import_react2 = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var ThemeContext = (0, import_react2.createContext)({
  theme: "system",
  setTheme: () => {
  },
  activeThemeClass: "light-theme"
});
var useTheme = () => (0, import_react2.useContext)(ThemeContext);
var ThemeProvider = ({
  initialTheme = "system",
  children
}) => {
  const [theme, setTheme] = (0, import_react2.useState)(initialTheme);
  const [activeThemeClass, setActiveThemeClass] = (0, import_react2.useState)("light-theme");
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, { value: { theme, setTheme, activeThemeClass }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: activeThemeClass, children }) });
};

// src/components/InlineChat.tsx
var import_react5 = require("react");
var import_core = require("@llmknow/core");

// src/styles/chat.module.css
var chat_default = {};

// src/components/MessageList.tsx
var import_react3 = require("react");

// src/components/ChatMessage.tsx
var import_react_markdown = __toESM(require("react-markdown"));
var import_clsx = __toESM(require("clsx"));
var import_jsx_runtime2 = require("react/jsx-runtime");
var UserIcon = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var AssistantIcon = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var LoadingIndicator = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: chat_default.loadingIndicator, children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: chat_default.dot, children: "." }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: chat_default.dot, children: "." }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: chat_default.dot, children: "." })
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: (0, import_clsx.default)(messageClass, "animate-fade-in"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex-shrink-0", children: role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UserIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AssistantIcon, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xs text-gray-500", children: timestamp })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "prose prose-sm max-w-none dark:prose-invert", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_markdown.default, { children: content }),
      isStreaming && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LoadingIndicator, {})
    ] })
  ] });
};

// src/components/MessageList.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var MessageList = ({
  messages,
  scrollToBottom = true
}) => {
  const listRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    if (scrollToBottom && listRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" || lastMessage.isStreaming) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }
  }, [messages, scrollToBottom]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: chat_default.messageList, ref: listRef, children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-center text-gray-500 p-4", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: "No messages yet. Start a conversation!" }) }) : messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ChatMessage, { message }, message.id)) });
};

// src/components/ChatInput.tsx
var import_react4 = require("react");
var import_clsx2 = __toESM(require("clsx"));
var import_jsx_runtime4 = require("react/jsx-runtime");
var SendIcon = () => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M22 2L11 13", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "M22 2L15 22L11 13L2 9L22 2Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var ChatInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = (0, import_react4.useState)("");
  const textareaRef = (0, import_react4.useRef)(null);
  (0, import_react4.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: chat_default.inputContainer, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        className: (0, import_clsx2.default)(chat_default.sendButton, {
          "opacity-50 cursor-not-allowed": isLoading || !message.trim()
        }),
        onClick: handleSendMessage,
        disabled: isLoading || !message.trim(),
        "aria-label": "Send message",
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(SendIcon, {})
      }
    )
  ] });
};

// src/components/InlineChat.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
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
  (0, import_react5.useEffect)(() => {
    setTheme(themeProp);
  }, [themeProp, setTheme]);
  const [contextManager] = (0, import_react5.useState)(
    () => enableContext ? new import_core.DefaultContextManager(contextSelector) : null
  );
  const { messages, isLoading, error, sendMessage, sendContextualMessage } = (0, import_core.useChatStore)();
  (0, import_react5.useEffect)(() => {
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
  (0, import_react5.useEffect)(() => {
    onStateChange?.({ messages, isLoading, error });
  }, [messages, isLoading, error, onStateChange]);
  (0, import_react5.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
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
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(MessageList, { messages }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_react6 = __toESM(require("react"));
var import_framer_motion = require("framer-motion");
var import_core2 = require("@llmknow/core");

// src/styles/standalone.module.css
var standalone_default = {};

// src/components/StandaloneChat.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var CloseIcon = () => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M18 6L6 18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M6 6L18 18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var ChatIcon = () => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
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
  const [internalIsOpen, setInternalIsOpen] = import_react6.default.useState(isOpen);
  const isOpenState = onOpenChange ? isOpen : internalIsOpen;
  const handleOpenChange = (open) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  (0, import_react6.useEffect)(() => {
    setTheme(themeProp);
  }, [themeProp, setTheme]);
  const { messages, isLoading, error, sendMessage } = (0, import_core2.useChatStore)();
  (0, import_react6.useEffect)(() => {
    onStateChange?.({ messages, isLoading, error });
  }, [messages, isLoading, error, onStateChange]);
  (0, import_react6.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        className: standalone_default.chatTrigger,
        onClick: () => handleOpenChange(true),
        "aria-label": "Open chat",
        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ChatIcon, {})
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_framer_motion.AnimatePresence, { children: isOpenState && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
      import_framer_motion.motion.div,
      {
        className: standalone_default.standaloneChatContainer,
        style: { width, height, maxHeight },
        initial: { opacity: 0, scale: 0.9, x: 20, y: 20 },
        animate: { opacity: 1, scale: 1, x: 0, y: 0 },
        exit: { opacity: 0, scale: 0.9, x: 20, y: 20 },
        transition: { type: "spring", stiffness: 300, damping: 30 },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: standalone_default.standaloneChatHeader, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: standalone_default.standaloneChatTitle, children: "Chat" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
              "button",
              {
                className: standalone_default.closeButton,
                onClick: () => handleOpenChange(false),
                "aria-label": "Close chat",
                children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CloseIcon, {})
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(MessageList, { messages }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChatInput,
  ChatMessage,
  InlineChat,
  MessageList,
  StandaloneChat,
  ThemeProvider,
  useTheme
});
