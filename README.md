# LLMKnow

A React component library for LLM chat interfaces that provides two types of chat components:

1. **Inline Chat** - Embedded within content like a resume
2. **Standalone Chat** - A full dialog interface that can be opened from a button

## Features

- Two chat interface modes: inline and standalone
- Context-aware responses based on surrounding content
- Stream responses from LLMs in real-time
- Responsive design for desktop and mobile
- Themeable with light and dark modes
- Markdown and code syntax highlighting

## Project Structure

This is a monorepo containing the following packages:

- `packages/core` - Core logic and state management
- `packages/web` - Web implementation of the chat components
- `packages/h5` - H5 optimized components for mobile web

And example applications:

- `examples/resume` - A resume page with embedded chat
- `examples/standalone` - A standalone chat example

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Run the resume example
pnpm --filter "llmknow-resume-example" dev
```

## Usage

```jsx
import { InlineChat, StandaloneChat } from '@llmknow/web';

// Inline chat embedded in content
<section data-context="This section contains information about React.">
  <h2>React</h2>
  <p>React is a JavaScript library for building user interfaces.</p>
  
  <InlineChat 
    mode="inline"
    position="right"
    enableContext={true}
    contextSelector="[data-context]"
  />
</section>

// Standalone chat with a floating button
<StandaloneChat 
  mode="standalone"
  theme="system"
  width="400px"
  enableHistory={true}
/>
```

## License

MIT 