# AG-UI Server

A Node.js server with OpenAI integration for AG-UI applications.

## Features

- 🚀 TypeScript + ESM support
- 🔌 OpenAI integration
- ⚡️ Express server
- 📦 Easy to use API
- 🔒 Environment-based configuration

## Installation

```bash
npm install ag-ui-server
# or
pnpm add ag-ui-server
# or
yarn add ag-ui-server
```

## Quick Start

```typescript
import { OpenAIAgent, createServer } from 'ag-ui-server';

// Create an OpenAI agent
const agent = new OpenAIAgent({
  openaiApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
});

// Create and start the server
const app = createServer(agent);
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## API Reference

### OpenAIAgent

```typescript
import { OpenAIAgent } from 'ag-ui-server';

const agent = new OpenAIAgent({
  openaiApiKey: string,
  model?: string,
  temperature?: number,
  maxTokens?: number,
});
```

### Server

```typescript
import { createServer } from 'ag-ui-server';

const app = createServer(agent);
```

## Configuration

Environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: Model to use (default: 'gpt-3.5-turbo')
- `OPENAI_TEMPERATURE`: Temperature for generation (default: 0.7)
- `OPENAI_MAX_TOKENS`: Max tokens per response (default: 1000)

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build
pnpm run build

# Start production server
pnpm start
```

## License

MIT 