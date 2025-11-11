# Agent Chat Documentation

Welcome to the Agent Chat library documentation. This library provides a powerful and flexible way to build AI-powered chat interfaces with tool integration.

## What is Agent Chat?

Agent Chat is a React library that enables you to create sophisticated AI chat interfaces with the following features:

- 🤖 **AI Agent Integration**: Connect to various AI agents (OpenAI, Claude, etc.)
- 🛠️ **Tool System**: Execute functions and tools through natural language
- 🎨 **Flexible UI**: Built-in components or build your own custom interface
- 🔄 **Real-time Chat**: Stream responses and handle tool execution
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **TypeScript Support**: Full type safety and IntelliSense

## Documentation Structure

### 🚀 Getting Started
- **[Quick Start](./quick-start.md)** - Get up and running in minutes
- **[Installation](./quick-start.md#installation)** - Package installation and setup

### 📚 Core Concepts
- **[Tutorial](./tutorial.md)** - Comprehensive guide to all features
- **[Tool System](./tutorial.md#tool-system)** - Understanding the three tool patterns
- **[Components](./tutorial.md#component-usage)** - Using built-in components

### 🔧 API Reference
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Types](./api-reference.md#types)** - TypeScript interfaces and types
- **[Hooks](./api-reference.md#hooks)** - React hooks for chat functionality
- **[Input Extensions](./input-extensions.md)** - Extensible input system documentation

### 🎯 Advanced Topics
- **[Tool Patterns](./tutorial.md#tool-system)** - Frontend, backend, and user-interaction tools
- **[Custom Rendering](./tutorial.md#custom-tool-renderers)** - Override default tool UI
- **[Context Management](./tutorial.md#context-management)** - Provide additional agent context
- **[Input Extensions](./input-extensions.md)** - Create custom input features and plugins

## Quick Examples

### Basic Chat Interface

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { HttpAgent } from '@ag-ui/client'

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent'
})

function App() {
  return (
    <AgentChatWindow
      agent={agent}
      tools={[]}
      contexts={[]}
    />
  )
}
```

### With Custom Tools

```tsx
const createCalculatorTool = (): Tool => ({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: {
    type: 'object',
    properties: {
      expression: { type: 'string', description: 'Math expression' }
    },
    required: ['expression']
  },
  execute: async (toolCall) => {
    const args = JSON.parse(toolCall.function.arguments)
    const result = eval(args.expression)
    return {
      toolCallId: toolCall.id,
      result: `Result: ${result}`,
      status: 'success'
    }
  }
})

const tools = [createCalculatorTool()]
```

## Key Features

### 🔄 Three Tool Patterns

1. **Frontend-Execution Tools**: Logic runs in the browser
2. **Backend-Execution Tools**: Logic runs on the server  
3. **User-Interaction Tools**: Require user input or confirmation

### 🎨 Flexible Components

- **AgentChatWindow**: Complete chat interface with built-in UI
- **AgentChatCore**: Core functionality for custom UI implementations
- **Custom Tool Renderers**: Override default tool display

### 🚀 Performance Features

- **Streaming Responses**: Real-time message updates
- **Tool Execution**: Parallel tool processing
- **Context Management**: Efficient context updates
- **Memory Management**: Optimized message handling

## Use Cases

- **Customer Support**: AI-powered help desks with tool integration
- **Data Analysis**: Chat-based data exploration and visualization
- **Content Creation**: AI writing assistants with research tools
- **Process Automation**: Workflow automation through natural language
- **Educational Tools**: Interactive learning experiences
- **Developer Tools**: Code generation and debugging assistance

## Getting Help

### 📖 Documentation
- Start with the [Quick Start Guide](./quick-start.md)
- Read the [Tutorial](./tutorial.md) for comprehensive coverage
- Reference the [API Documentation](./api-reference.md) for specific details

### 🐛 Troubleshooting
- Check the [Common Issues](./tutorial.md#troubleshooting) section
- Review [Best Practices](./tutorial.md#best-practices) for guidance
- Enable debug mode for detailed logging

### 💬 Community
- [GitHub Repository](https://github.com/agent-labs/agent-chat) - Source code and issues
- [Discussions](https://github.com/agent-labs/agent-chat/discussions) - Community support
- [Examples](https://github.com/agent-labs/agent-chat/examples) - Sample implementations

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/agent-labs/agent-chat/blob/main/CONTRIBUTING.md) for details on:

- Code style and standards
- Testing requirements
- Pull request process
- Development setup

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/agent-labs/agent-chat/blob/main/LICENSE) file for details.

---

**Ready to get started?** Begin with the [Quick Start Guide](./quick-start.md) to create your first AI chat interface in minutes!
