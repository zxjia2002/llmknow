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

/**
 * Create the chat store
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      let chatEngine: DefaultChatEngine | null = null;
      
      return {
        // Initial state
        messages: [],
        isLoading: false,
        error: null,
        conversationId: null,
        
        // State setters
        setMessages: (messages: Message[]) => set({ messages }),
        addMessage: (message: Message) => set((state) => ({ 
          messages: [...state.messages, message] 
        })),
        updateMessage: (id: string, content: string) => set((state) => ({
          messages: state.messages.map((message: Message) =>
            message.id === id ? { ...message, content } : message
          ),
        })),
        setIsLoading: (isLoading: boolean) => set({ isLoading }),
        setError: (error: Error | null) => set({ error }),
        setConversationId: (conversationId: string | null) => set({ conversationId }),
        clearMessages: () => set({ messages: [] }),
        
        // Stream handling
        appendToLastMessage: (content: string) => set((state) => {
          const messages = [...state.messages];
          if (messages.length === 0) return { messages };
          
          const lastMessage = messages[messages.length - 1];
          messages[messages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + content,
          };
          
          return { messages };
        }),
        startStreamingMessage: (message: Message) => set((state) => ({
          messages: [...state.messages, { ...message, isStreaming: true }],
        })),
        stopStreamingMessage: (id: string) => set((state) => ({
          messages: state.messages.map((message: Message) =>
            message.id === id ? { ...message, isStreaming: false } : message
          ),
        })),
        
        // Chat operations
        sendMessage: async (content: string, engineConfig: ChatEngineConfig) => {
          try {
            // Create a new user message
            const userMessage: Message = {
              id: uuidv4(),
              role: 'user',
              content,
              timestamp: Date.now(),
            };
            
            // Add the user message to the state
            get().addMessage(userMessage);
            
            // Create a placeholder for the AI response
            const aiMessageId = uuidv4();
            const aiMessage: Message = {
              id: aiMessageId,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
              isStreaming: true,
            };
            
            // Add the AI message to the state
            get().addMessage(aiMessage);
            
            // Set loading state
            get().setIsLoading(true);
            
            // Initialize the chat engine if needed
            chatEngine = new DefaultChatEngine(engineConfig);
            
            // Get the response stream
            const stream = chatEngine.streamResponse(content);
            
            // Process the stream
            let result = await stream.next();
            while (!result.done) {
              const chunk = result.value;
              // Append the chunk to the AI message
              const currentMessage = get().messages.find((m) => m.id === aiMessageId);
              if (currentMessage) {
                get().updateMessage(aiMessageId, currentMessage.content + chunk);
              }
              // Get the next chunk
              result = await stream.next();
            }
            
            // Mark the message as no longer streaming
            get().stopStreamingMessage(aiMessageId);
          } catch (error) {
            console.error('Error sending message:', error);
            get().setError(error as Error);
          } finally {
            get().setIsLoading(false);
          }
        },
        
        sendContextualMessage: async (content: string, context: string, engineConfig: ChatEngineConfig) => {
          try {
            // Create a new user message
            const userMessage: Message = {
              id: uuidv4(),
              role: 'user',
              content,
              timestamp: Date.now(),
            };
            
            // Add the user message to the state
            get().addMessage(userMessage);
            
            // Create a placeholder for the AI response
            const aiMessageId = uuidv4();
            const aiMessage: Message = {
              id: aiMessageId,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
              isStreaming: true,
            };
            
            // Add the AI message to the state
            get().addMessage(aiMessage);
            
            // Set loading state
            get().setIsLoading(true);
            
            // Initialize the chat engine if needed
            chatEngine = new DefaultChatEngine(engineConfig);
            
            // Get the response stream
            const stream = chatEngine.getContextualResponse(content, context);
            
            // Process the stream
            let result = await stream.next();
            while (!result.done) {
              const chunk = result.value;
              // Append the chunk to the AI message
              const currentMessage = get().messages.find((m) => m.id === aiMessageId);
              if (currentMessage) {
                get().updateMessage(aiMessageId, currentMessage.content + chunk);
              }
              // Get the next chunk
              result = await stream.next();
            }
            
            // Mark the message as no longer streaming
            get().stopStreamingMessage(aiMessageId);
          } catch (error) {
            console.error('Error sending contextual message:', error);
            get().setError(error as Error);
          } finally {
            get().setIsLoading(false);
          }
        },
        
        abortResponse: () => {
          if (chatEngine) {
            chatEngine.abort();
          }
        },
      };
    },
    {
      name: 'llmknow-chat-store',
      partialize: (state) => ({
        messages: state.messages,
        conversationId: state.conversationId,
      }),
    }
  )
); 