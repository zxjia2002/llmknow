/**
 * Context manager interface
 */
export interface ContextManager {
  // Get the current visible content's context
  getCurrentContext(): string;
  
  // Update the context based on an element
  updateContext(element: HTMLElement): void;
  
  // Clear the context
  clearContext(): void;
}

/**
 * Default implementation of the context manager
 */
export class DefaultContextManager implements ContextManager {
  private context: string = '';
  private selector: string;
  
  constructor(selector: string = '[data-context]') {
    this.selector = selector;
  }
  
  /**
   * Get the current context
   */
  getCurrentContext(): string {
    return this.context;
  }
  
  /**
   * Update the context based on an element
   */
  updateContext(element: HTMLElement): void {
    if (!element) return;
    
    // Get the text content of the element
    this.context = element.textContent || '';
    
    // Clean up the context (remove excessive whitespace)
    this.context = this.context.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Update context based on the currently visible elements
   */
  updateContextFromVisibleElements(): void {
    // Find all elements matching the selector
    const contextElements = document.querySelectorAll<HTMLElement>(this.selector);
    if (!contextElements.length) return;
    
    // Determine which elements are currently visible in the viewport
    const visibleElements = Array.from(contextElements).filter(element => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    });
    
    if (visibleElements.length === 0) return;
    
    // Get the content from the visible elements
    const visibleContext = visibleElements
      .map(element => element.textContent || '')
      .join('\n\n')
      .trim()
      .replace(/\s+/g, ' ');
    
    this.context = visibleContext;
  }
  
  /**
   * Clear the context
   */
  clearContext(): void {
    this.context = '';
  }
} 