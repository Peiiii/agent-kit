# Agent Chat Library Tutorial

A comprehensive guide to using the Agent Chat library for building AI-powered chat interfaces with tool integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [Tool System](#tool-system)
4. [Component Usage](#component-usage)
5. [Advanced Features](#advanced-features)
6. [API Reference](#api-reference)
7. [Examples](#examples)
8. [Best Practices](#best-practices)

## Quick Start

### Installation

```bash
npm install @agent-labs/agent-chat
# or
yarn add @agent-labs/agent-chat
# or
pnpm add @agent-labs/agent-chat
```

### Basic Usage

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

## Core Concepts

### Agent
An AI agent that can process messages and execute tools. The library supports various agent types:
- `HttpAgent`: HTTP-based agent for remote API calls
- Custom agents can be implemented by extending the base agent interface

### Tools
Functions that the AI agent can call to perform specific tasks. Tools can be:
- **Frontend-execution**: Logic runs in the browser
- **Backend-execution**: Logic runs on the server
- **User-interaction**: Requires user input or confirmation

### Contexts
Additional information provided to the agent to enhance its responses and tool execution.

### Messages
Communication units between users and the AI agent, including:
- User messages
- Assistant responses
- Tool calls and results

## Tool System

### Tool Types

#### 1. Frontend-Execution Tools
Tools that execute logic in the browser and return results immediately.

```tsx
import { Tool, ToolCall, ToolResult } from '@agent-labs/agent-chat'

export const createCalculatorTool = (): Tool => ({
  name: 'calculate',
  description: 'Perform mathematical calculations',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate'
      }
    },
    required: ['expression']
  },
  execute: async (toolCall: ToolCall) => {
    try {
      const args = JSON.parse(toolCall.function.arguments)
      const { expression } = args
      
      // Execute calculation logic
      const result = eval(expression) // Note: Use safer alternatives in production
      
      return {
        toolCallId: toolCall.id,
        result: `Result: ${expression} = ${result}`,
        status: 'success'
      }
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: 'Calculation failed',
        status: 'error',
        error: String(error)
      }
    }
  },
  render: (toolInvocation, onResult) => (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3>Calculator Tool</h3>
      <p>Expression: {toolInvocation.args.expression}</p>
      <p>Tool executed, result returned to AI assistant</p>
    </div>
  )
})
```

#### 2. User-Interaction Tools
Tools that require user input or confirmation.

```tsx
import { Tool, ToolResult } from '@agent-labs/agent-chat'
import { ToolInvocation } from '@ai-sdk/ui-utils'
import React, { useState } from 'react'

export const createUserConfirmationTool = (): Tool => ({
  name: 'userConfirmation',
  description: 'Request user confirmation for an action',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: 'Action description requiring confirmation'
      }
    },
    required: ['action']
  },
  render: (toolInvocation: ToolInvocation, onResult: (result: ToolResult) => void) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null)
    
    const handleConfirm = () => {
      onResult({
        toolCallId: toolInvocation.toolCallId,
        result: `User confirmed: ${toolInvocation.args.action}`,
        status: 'success'
      })
      setIsConfirmed(true)
    }
    
    const handleReject = () => {
      onResult({
        toolCallId: toolInvocation.toolCallId,
        result: `User rejected: ${toolInvocation.args.action}`,
        status: 'success'
      })
      setIsConfirmed(false)
    }
    
    if (isConfirmed !== null) {
      return (
        <div className="p-4 border rounded-lg bg-gray-50">
          <p>Action {isConfirmed ? 'confirmed' : 'rejected'}</p>
        </div>
      )
    }
    
    return (
      <div className="p-4 border rounded-lg bg-orange-50">
        <h3>Confirm Action</h3>
        <p>{toolInvocation.args.action}</p>
        <div className="flex gap-2 mt-4">
          <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 text-white rounded">
            Confirm
          </button>
          <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded">
            Reject
          </button>
        </div>
      </div>
    )
  }
})
```

#### 3. Backend-Only Tools
Tools that execute on the server, with frontend only displaying information.

```tsx
import { Tool } from '@agent-labs/agent-chat'

export const createBackendTool = (): Tool => ({
  name: 'backendOperation',
  description: 'Perform server-side operation',
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'Operation to perform'
      }
    },
    required: ['operation']
  },
  render: (toolInvocation) => (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3>Backend Operation</h3>
      <p>Operation: {toolInvocation.args.operation}</p>
      <p>Processing on server...</p>
    </div>
  )
})
```

### Tool Registration

```tsx
import { createCalculatorTool, createUserConfirmationTool } from './tools'

const tools = [
  createCalculatorTool(),
  createUserConfirmationTool()
]

<AgentChatWindow
  agent={agent}
  tools={tools}
  contexts={contexts}
/>
```

## Component Usage

### AgentChatWindow

The main component for displaying the chat interface.

```tsx
import { AgentChatWindow, AgentChatRef } from '@agent-labs/agent-chat'
import { useRef } from 'react'

function ChatApp() {
  const chatRef = useRef<AgentChatRef>(null)
  
  const handleAddMessage = async () => {
    if (chatRef.current?.addMessages) {
      await chatRef.current.addMessages([
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello, how can you help me?'
        }
      ], { triggerAgent: true })
    }
  }
  
  return (
    <div>
      <button onClick={handleAddMessage}>Send Message</button>
      <AgentChatWindow
        ref={chatRef}
        agent={agent}
        tools={tools}
        contexts={contexts}
        className="z-50"
      />
    </div>
  )
}
```

### AgentChat

For more control over the chat functionality.

```tsx
import { AgentChat } from '@agent-labs/agent-chat'

function CustomChatApp() {
  return (
    <AgentChat
      agent={agent}
      tools={tools}
      contexts={contexts}
    >
      {({ messages, sendMessage, toolResults }) => (
        <div>
          {/* Custom message display */}
          {messages.map(message => (
            <div key={message.id}>
              <strong>{message.role}:</strong> {message.content}
            </div>
          ))}
          
          {/* Custom input */}
          <input
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
          />
        </div>
      )}
    </AgentChat>
  )
}
```

## Advanced Features

### Context Management

Provide additional context to the AI agent.

```tsx
const contexts = [
  {
    description: 'User Preferences',
    value: JSON.stringify({
      language: 'en',
      timezone: 'UTC',
      preferences: {
        responseStyle: 'concise',
        enableEmojis: true
      }
    })
  },
  {
    description: 'System Information',
    value: JSON.stringify({
      version: '1.0.0',
      features: ['chat', 'tools', 'contexts'],
      lastUpdate: new Date().toISOString()
    })
  }
]
```

### Custom Tool Renderers

Override default tool rendering behavior.

```tsx
import { ToolRenderer, ToolResult } from '@agent-labs/agent-chat'

const customToolRenderers: Record<string, ToolRenderer> = {
  'customTool': {
    definition: {
      name: 'customTool',
      description: 'Custom tool with custom rendering',
      parameters: { type: 'object', properties: {} }
    },
    render: (toolInvocation, onResult) => (
      <div className="custom-tool-renderer">
        <h3>Custom Tool</h3>
        <button onClick={() => onResult({
          toolCallId: toolInvocation.toolCallId,
          result: 'Custom result',
          status: 'success'
        })}>
          Execute Custom Logic
        </button>
      </div>
    )
  }
}

<AgentChatWindow
  agent={agent}
  tools={tools}
  contexts={contexts}
  toolRenderers={customToolRenderers}
/>
```

### Message Management

Programmatically manage chat messages.

```tsx
const chatRef = useRef<AgentChatRef>(null)

// Add messages
await chatRef.current?.addMessages([
  {
    id: 'msg-1',
    role: 'user',
    content: 'User message'
  }
], { triggerAgent: true })

// Remove messages
await chatRef.current?.removeMessages(['msg-1'])

// Get current messages
const messages = chatRef.current?.getMessages() || []
```

## API Reference

### Types

#### Tool
```tsx
interface Tool extends ToolDefinition {
  execute?: (toolCall: ToolCall) => Promise<ToolResult>
  render?: ToolRenderFn
}
```

#### ToolCall
```tsx
interface ToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}
```

#### ToolResult
```tsx
interface ToolResult {
  toolCallId: string
  result: string | boolean | number | object
  status: 'success' | 'error' | 'cancelled'
  error?: string
}
```

#### ToolInvocation
```tsx
interface ToolInvocation {
  state: 'call' | 'result' | 'partial-call'
  toolCallId: string
  toolName: string
  args: any
  result?: any
}
```

### Hooks

#### useAgentChat
```tsx
const {
  messages,
  sendMessage,
  toolResults,
  isLoading,
  error
} = useAgentChat({
  agent,
  tools,
  contexts
})
```

#### useProvideAgentToolExecutors
```tsx
const { registerExecutor, unregisterExecutor } = useProvideAgentToolExecutors()

// Register a custom executor
registerExecutor('customTool', async (toolCall, context) => {
  // Custom execution logic
  return { toolCallId: toolCall.id, result: 'Custom result', status: 'success' }
})
```

### Components

#### AgentChatWindow Props
```tsx
interface AgentChatWindowProps {
  agent: Agent
  tools: Tool[]
  contexts?: Context[]
  toolRenderers?: Record<string, ToolRenderer>
  className?: string
  ref?: Ref<AgentChatRef>
}
```

#### AgentChat Props
```tsx
interface AgentChatCoreProps {
  agent: Agent
  tools: Tool[]
  contexts?: Context[]
  toolRenderers?: Record<string, ToolRenderer>
  children: (props: AgentChatCoreRenderProps) => ReactNode
}
```

## Examples

### Complete Chat Application

```tsx
import React, { useMemo } from 'react'
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { HttpAgent } from '@ag-ui/client'
import { createCalculatorTool, createUserConfirmationTool } from './tools'

function ChatApp() {
  const agent = useMemo(() => new HttpAgent({
    url: 'http://localhost:8000/openai-agent'
  }), [])
  
  const tools = useMemo(() => [
    createCalculatorTool(),
    createUserConfirmationTool()
  ], [])
  
  const contexts = useMemo(() => [
    {
      description: 'User Profile',
      value: JSON.stringify({
        name: 'John Doe',
        preferences: { language: 'en', theme: 'dark' }
      })
    }
  ], [])
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          AI Chat Assistant
        </h1>
        
        <AgentChatWindow
          agent={agent}
          tools={tools}
          contexts={contexts}
          className="z-50"
        />
      </div>
    </div>
  )
}

export default ChatApp
```

### Custom Message Input

```tsx
import React, { useState } from 'react'
import { AgentChat } from '@agent-labs/agent-chat'

function CustomInputChat() {
  const [inputValue, setInputValue] = useState('')
  
  return (
    <AgentChat
      agent={agent}
      tools={tools}
      contexts={contexts}
    >
      {({ messages, sendMessage, isLoading }) => (
        <div className="chat-container">
          {/* Messages */}
          <div className="messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="role">{message.role}</div>
                <div className="content">{message.content}</div>
              </div>
            ))}
          </div>
          
          {/* Custom Input */}
          <div className="input-container">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="message-input"
            />
            <button
              onClick={() => {
                if (inputValue.trim()) {
                  sendMessage(inputValue)
                  setInputValue('')
                }
              }}
              disabled={isLoading || !inputValue.trim()}
              className="send-button"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </AgentChat>
  )
}
```

## Best Practices

### Tool Design
1. **Clear Naming**: Use descriptive names for tools
2. **Parameter Validation**: Validate input parameters in execute functions
3. **Error Handling**: Always handle errors gracefully
4. **Security**: Sanitize inputs, especially for eval-like operations
5. **Performance**: Keep tool execution fast for better user experience

### State Management
1. **Immutable Updates**: Use immutable patterns for message updates
2. **Loading States**: Show loading indicators during tool execution
3. **Error Boundaries**: Implement error boundaries for tool failures
4. **Optimistic Updates**: Consider optimistic updates for better UX

### Performance
1. **Tool Lazy Loading**: Load tools only when needed
2. **Message Pagination**: Implement pagination for long chat histories
3. **Memoization**: Memoize expensive computations
4. **Debouncing**: Debounce user input when appropriate

### Accessibility
1. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
2. **Screen Reader Support**: Provide proper ARIA labels and descriptions
3. **Focus Management**: Manage focus appropriately during tool execution
4. **Color Contrast**: Ensure sufficient color contrast for all text

### Testing
1. **Unit Tests**: Test individual tools and components
2. **Integration Tests**: Test tool execution flow
3. **Mock Agents**: Use mock agents for testing without external dependencies
4. **Error Scenarios**: Test error handling and edge cases

## Troubleshooting

### Common Issues

#### Tool Not Executing
- Check if tool is properly registered in the tools array
- Verify tool name matches between definition and registration
- Ensure tool parameters match the expected schema

#### Messages Not Displaying
- Check if messages are being added to the state
- Verify message structure matches expected format
- Check for console errors in browser developer tools

#### Tool Results Not Updating
- Ensure onResult callback is being called
- Check if toolCallId matches between call and result
- Verify tool execution completed successfully

### Debug Mode

Enable debug logging to troubleshoot issues:

```tsx
// In development
const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
  debug: true // Enable debug logging
})
```

### Getting Help

- Check the [GitHub repository](https://github.com/agent-labs/agent-chat) for issues and discussions
- Review the source code for implementation details
- Create a minimal reproduction case for bug reports

---

This tutorial covers the essential aspects of using the Agent Chat library. For more advanced usage patterns and examples, refer to the source code and additional documentation.
