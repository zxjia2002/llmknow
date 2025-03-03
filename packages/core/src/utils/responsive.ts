/**
 * Breakpoint configuration
 */
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Default breakpoints
 */
export const defaultBreakpoints: Breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

/**
 * Responsive configuration
 */
export interface ResponsiveConfig {
  fontSize: number;
  spacing: number;
  chatWidth: string;
  chatHeight: string;
  avatarSize: number;
  buttonSize: number;
}

/**
 * Get a responsive configuration based on screen width and platform
 */
export const getResponsiveConfig = (
  width: number,
  platform: 'web' | 'h5' = 'web'
): ResponsiveConfig => {
  // Base configuration
  const baseConfig: ResponsiveConfig = {
    fontSize: 16,
    spacing: 16,
    chatWidth: '360px',
    chatHeight: '400px',
    avatarSize: 32,
    buttonSize: 40,
  };
  
  // Apply platform-specific adjustments
  const platformAdjustments = platform === 'h5' ? {
    // H5 specific adjustments
    spacing: 12,
    buttonSize: 36,
  } : {};
  
  // Apply width-based adjustments
  let widthAdjustments = {};
  
  if (width < defaultBreakpoints.mobile) {
    widthAdjustments = {
      fontSize: 14,
      spacing: 8,
      chatWidth: '100%',
      chatHeight: '300px',
      avatarSize: 24,
      buttonSize: 32,
    };
  } else if (width < defaultBreakpoints.tablet) {
    widthAdjustments = {
      fontSize: 14,
      spacing: 12,
      chatWidth: '90%',
      chatHeight: '350px',
      avatarSize: 28,
      buttonSize: 36,
    };
  } else if (width < defaultBreakpoints.desktop) {
    widthAdjustments = {
      chatWidth: '320px',
    };
  }
  
  // Combine configurations
  return {
    ...baseConfig,
    ...platformAdjustments,
    ...widthAdjustments,
  };
};

/**
 * Hook to get the current window width (browser-only)
 */
export const getWindowWidth = (): number => {
  if (typeof window === 'undefined') return defaultBreakpoints.desktop;
  return window.innerWidth;
}; 