import { ChatEngineConfig, Message } from '../types/chat';

/**
 * Chat service interface
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
 * Default implementation of the chat engine
 */
export class DefaultChatEngine implements ChatEngine {
  private controller: AbortController | null = null;
  private config: ChatEngineConfig;
  
  constructor(config: ChatEngineConfig) {
    this.config = config;
  }
  
  /**
   * Stream a response from the AI model
   */
  async *streamResponse(message: string): AsyncGenerator<string> {
    try {
      this.controller = new AbortController();
      const signal = this.controller.signal;
      
      // In a real implementation, this would call an actual API
      const response = await fetch(this.config.apiUrl || 'https://api.example.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
          stream: true,
        }),
        signal,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('Response body is null');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Process the chunk and yield parts of it
        const chunk = decoder.decode(value, { stream: true });
        // Here we would parse the SSE data from the chunk
        // For simplicity, we'll just yield the whole chunk
        yield chunk;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Stream error:', error);
        throw error;
      }
    } finally {
      this.controller = null;
    }
  }
  
  /**
   * Get a contextual response based on the message and context
   */
  async *getContextualResponse(message: string, context: string): AsyncGenerator<string> {
    // Combine the context and message
    const contextualMessage = `Context: ${context}\n\nQuestion: ${message}`;
    
    // Use the regular streamResponse method with the combined message
    for await (const chunk of this.streamResponse(contextualMessage)) {
      yield chunk;
    }
  }
  
  /**
   * Abort the current response
   */
  abort(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
} 