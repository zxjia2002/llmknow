import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChatTheme } from '@llmknow/core';

// Theme context
interface ThemeContextType {
  theme: ChatTheme;
  setTheme: (theme: ChatTheme) => void;
  activeThemeClass: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  activeThemeClass: 'light-theme',
});

// Hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Theme provider props
interface ThemeProviderProps {
  initialTheme?: ChatTheme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  initialTheme = 'system',
  children,
}) => {
  const [theme, setTheme] = useState<ChatTheme>(initialTheme);
  const [activeThemeClass, setActiveThemeClass] = useState<string>('light-theme');

  // Update the active theme class based on the theme preference
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'system') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setActiveThemeClass(isDarkMode ? 'dark-theme' : 'light-theme');
      } else {
        setActiveThemeClass(theme === 'dark' ? 'dark-theme' : 'light-theme');
      }
    };

    updateTheme();

    // Listen for system theme changes if 'system' is selected
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Define the event handler
      const handleChange = () => updateTheme();
      
      // Add the event listener with the correct API
      // Using addListener for older browsers and addEventListener for newer ones
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        // @ts-ignore - For older browsers
        mediaQuery.addListener(handleChange);
      }

      // Clean up the event listener
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else if (mediaQuery.removeListener) {
          // @ts-ignore - For older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, activeThemeClass }}>
      <div className={activeThemeClass}>{children}</div>
    </ThemeContext.Provider>
  );
}; 