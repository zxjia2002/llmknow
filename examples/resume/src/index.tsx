import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@llmknow/web';
import './styles.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider initialTheme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 