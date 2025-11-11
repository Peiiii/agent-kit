# Agent Chat API Reference

Complete API documentation for the Agent Chat library.

## Table of Contents

1. [Components](#components)
2. [Hooks](#hooks)
3. [Types](#types)
4. [Utilities](#utilities)
5. [Services](#services)

## Components

### AgentChatWindow

The main chat window component with built-in UI.

```tsx
import { AgentChatWindow, AgentChatRef } from '@agent-labs/agent-chat'

interface AgentChatWindowProps {
  agent: Agent
  tools: Tool[]
  contexts?: Context[]
  toolRenderers?: Record<string, ToolRenderer>
  className?: string
  ref?: Ref<AgentChatRef>
}
```

**Props:**

- `agent`: The AI agent instance
- `tools`: Array of available tools
- `contexts`: Optional context information
- `toolRenderers`: Custom tool rendering overrides
- `className`: CSS class name for styling
- `ref`: Reference to access chat methods

**Methods (via ref):**

```tsx
interface AgentChatRef {
  addMessages: (messages: Message[], options?: { triggerAgent?: boolean }) => Promise<void>
  removeMessages: (messageIds: string[]) => Promise<void>
  getMessages: () => Message[]
  clearMessages: () => Promise<void>
}
```

**Example:**

```tsx
import { useRef } from 'react'
import { AgentChatWindow, AgentChatRef } from '@agent-labs/agent-chat'

function ChatApp() {
  const chatRef = useRef<AgentChatRef>(null)
  
  const sendMessage = async (content: string) => {
    await chatRef.current?.addMessages([
      {
        id: Date.now().toString(),
        role: 'user',
        content
      }
    ], { triggerAgent: true })
  }
  
  return (
    <AgentChatWindow
      ref={chatRef}
      agent={agent}
      tools={tools}
      contexts={contexts}
    />
  )
}
```

### AgentChat

Core chat functionality without UI, for custom implementations.

```tsx
import { AgentChat } from '@agent-labs/agent-chat'

interface AgentChatCoreProps {
  agent: Agent
  tools: Tool[]
  contexts?: Context[]
  toolRenderers?: Record<string, ToolRenderer>
  children: (props: AgentChatCoreRenderProps) => ReactNode
}

interface AgentChatCoreRenderProps {
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  toolResults: ToolResult[]
  isLoading: boolean
  error: Error | null
}
```

**Example:**

```tsx
function CustomChat() {
  return (
    <AgentChat
      agent={agent}
      tools={tools}
      contexts={contexts}
    >
      {({ messages, sendMessage, isLoading, error }) => (
        <div>
          {messages.map(message => (
            <div key={message.id}>
              <strong>{message.role}:</strong> {message.content}
            </div>
          ))}
          
          <input
            placeholder="Type message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
          />
          
          {isLoading && <div>AI is thinking...</div>}
          {error && <div>Error: {error.message}</div>}
        </div>
      )}
    </AgentChat>
  )
}
```

## Hooks

### useAgentChat

Main hook for chat functionality.

```tsx
import { useAgentChat } from '@agent-labs/agent-chat'

interface UseAgentChatOptions {
  agent: Agent
  tools: Tool[]
  contexts?: Context[]
}

interface UseAgentChatReturn {
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  toolResults: ToolResult[]
  isLoading: boolean
  error: Error | null
  addMessage: (message: Message) => void
  removeMessage: (messageId: string) => void
  clearMessages: () => void
}

const {
  messages,
  sendMessage,
  toolResults,
  isLoading,
  error,
  addMessage,
  removeMessage,
  clearMessages
} = useAgentChat({
  agent,
  tools,
  contexts
})
```

**Example:**

```tsx
function ChatWithHook() {
  const {
    messages,
    sendMessage,
    isLoading,
    error
  } = useAgentChat({
    agent,
    tools,
    contexts
  })
  
  const handleSend = async (content: string) => {
    try {
      await sendMessage(content)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }
  
  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>{message.content}</div>
      ))}
      
      <button
        onClick={() => handleSend('Hello AI!')}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Message'}
      </button>
      
      {error && <div>Error: {error.message}</div>}
    </div>
  )
}
```

### useProvideAgentToolExecutors

Hook for providing custom tool executors.

```tsx
import { useProvideAgentToolExecutors } from '@agent-labs/agent-chat'

interface ToolExecutor {
  (toolCall: ToolCall, context?: Record<string, unknown>): ToolResult | Promise<ToolResult>
}

interface UseProvideAgentToolExecutorsReturn {
  registerExecutor: (toolName: string, executor: ToolExecutor) => void
  unregisterExecutor: (toolName: string) => void
  getExecutor: (toolName: string) => ToolExecutor | undefined
}

const { registerExecutor, unregisterExecutor, getExecutor } = useProvideAgentToolExecutors()
```

**Example:**

```tsx
function ToolProvider() {
  const { registerExecutor, unregisterExecutor } = useProvideAgentToolExecutors()
  
  useEffect(() => {
    // Register custom executor
    registerExecutor('customTool', async (toolCall, context) => {
      const args = JSON.parse(toolCall.function.arguments)
      
      // Custom execution logic
      const result = await performCustomOperation(args)
      
      return {
        toolCallId: toolCall.id,
        result,
        status: 'success'
      }
    })
    
    // Cleanup
    return () => {
      unregisterExecutor('customTool')
    }
  }, [])
  
  return <div>Tool executor registered</div>
}
```

### useProvideAgentContexts

Hook for providing agent contexts.

```tsx
import { useProvideAgentContexts } from '@agent-labs/agent-chat'

interface UseProvideAgentContextsReturn {
  contexts: Context[]
  addContext: (context: Context) => void
  removeContext: (description: string) => void
  updateContext: (description: string, value: string) => void
}

const { contexts, addContext, removeContext, updateContext } = useProvideAgentContexts()
```

**Example:**

```tsx
function ContextProvider() {
  const { contexts, addContext, updateContext } = useProvideAgentContexts()
  
  useEffect(() => {
    // Add user context
    addContext({
      description: 'User Profile',
      value: JSON.stringify({
        name: 'John Doe',
        preferences: { language: 'en' }
      })
    })
  }, [])
  
  const updateUserPreferences = (preferences: any) => {
    updateContext('User Profile', JSON.stringify({
      name: 'John Doe',
      preferences
    }))
  }
  
  return (
    <div>
      <button onClick={() => updateUserPreferences({ language: 'es' })}>
        Change to Spanish
      </button>
    </div>
  )
}
```

## Types

### Core Types

#### Agent

```tsx
interface Agent {
  runAgent: (options: RunAgentOptions) => Promise<void>
  stopAgent: () => void
  isRunning: boolean
}

interface RunAgentOptions {
  messages: Message[]
  tools?: Tool[]
  contexts?: Context[]
  onMessage?: (message: Message) => void
  onToolCall?: (toolCall: ToolCall) => void
  onToolResult?: (result: ToolResult) => void
  onError?: (error: Error) => void
}
```

#### Tool

```tsx
interface Tool extends ToolDefinition {
  execute?: (toolCall: ToolCall) => Promise<ToolResult>
  render?: ToolRenderFn
}

interface ToolDefinition {
  name: string
  description: string
  parameters: JSONSchema7
}

type ToolRenderFn = (
  toolInvocation: ToolInvocation, 
  onResult: (result: ToolResult) => void
) => ReactNode
```

#### Message

```tsx
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content?: string
  toolCalls?: ToolCall[]
  toolCallId?: string
  timestamp?: string
}

interface UIMessage extends Message {
  parts: Array<TextUIPart | ToolInvocationUIPart>
}

interface TextUIPart {
  type: 'text'
  text: string
}

interface ToolInvocationUIPart {
  type: 'tool-invocation'
  toolInvocation: ToolInvocation
}
```

#### ToolCall & ToolResult

```tsx
interface ToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}

interface ToolResult {
  toolCallId: string
  result: string | boolean | number | object
  status: 'success' | 'error' | 'cancelled'
  error?: string
}

interface ToolInvocation {
  state: 'call' | 'result' | 'partial-call'
  toolCallId: string
  toolName: string
  args: any
  result?: any
}
```

#### Context

```tsx
interface Context {
  description: string
  value: string
}
```

### Utility Types

```tsx
// Component props
interface AgentChatWindowProps {
  agent: Agent
  tools: Tool[]
  contexts?: Context[]
  toolRenderers?: Record<string, ToolRenderer>
  className?: string
  ref?: Ref<AgentChatRef>
}

interface AgentChatCoreProps {
  agent: Agent
  tools: Tool[]
  contexts?: Context[]
  toolRenderers?: Record<string, ToolRenderer>
  children: (props: AgentChatCoreRenderProps) => ReactNode
}

// Tool renderer
interface ToolRenderer {
  render: ToolRenderFn
  definition: ToolDefinition
}

// Event handlers
type MessageHandler = (message: Message) => void
type ToolCallHandler = (toolCall: ToolCall) => void
type ToolResultHandler = (result: ToolResult) => void
type ErrorHandler = (error: Error) => void
```

## Utilities

### Tool Utilities

#### getToolDefFromTool

Extract tool definition from a tool instance.

```tsx
import { getToolDefFromTool } from '@agent-labs/agent-chat'

const tool = createCalculatorTool()
const definition = getToolDefFromTool(tool)
// Returns: { name: 'calculate', description: '...', parameters: {...} }
```

#### toolInvocationToToolCall

Convert ToolInvocation to ToolCall format.

```tsx
import { toolInvocationToToolCall } from '@agent-labs/agent-chat'

const toolCall = toolInvocationToToolCall(toolInvocation)
// Returns: { id: '...', type: 'function', function: { name: '...', arguments: '...' } }
```

### Message Utilities

#### convertMessagesToUIMessages

Convert Message array to UIMessage array with tool invocation parts.

```tsx
import { convertMessagesToUIMessages } from '@agent-labs/agent-chat'

const uiMessages = convertMessagesToUIMessages(messages)
// Returns: UIMessage[] with parts array
```

## Services

### AgentChatController

Service for managing chat sessions and messages.

```tsx
import { AgentChatController } from '@agent-labs/agent-chat'

class AgentChatController {
  // Subscribe to message updates
  subscribeMessages(callback: (messages: Message[]) => void): Subscription
  
  // Add message to session
  addMessage(message: Message, options?: { triggerAgent?: boolean }): void
  
  // Add multiple messages
  addMessages(messages: Message[], options?: { triggerAgent?: boolean }): void
  
  // Remove messages by ID
  removeMessages(messageIds: string[]): void
  
  // Get current messages
  getMessages(): Message[]
  
  // Clear all messages
  clearMessages(): void
  
  // Add tool result
  addToolResult(result: ToolResult, options?: { triggerAgent?: boolean }): void
}
```

**Example:**

```tsx
function ChatService() {
  const sessionManager = useMemo(() => new AgentChatController(), [])
  
  useEffect(() => {
    const subscription = sessionManager.subscribeMessages((messages) => {
      console.log('Messages updated:', messages)
    })
    
    return () => subscription.unsubscribe()
  }, [sessionManager])
  
  const sendMessage = (content: string) => {
    sessionManager.addMessage({
      id: Date.now().toString(),
      role: 'user',
      content
    }, { triggerAgent: true })
  }
  
  return (
    <div>
      <button onClick={() => sendMessage('Hello!')}>
        Send Message
      </button>
    </div>
  )
}
```

### AgentToolExecutorManager

Service for managing tool executors.

```tsx
import { AgentToolExecutorManager } from '@agent-labs/agent-chat'

class AgentToolExecutorManager {
  // Register tool executor
  registerExecutor(toolName: string, executor: ToolExecutor): void
  
  // Unregister tool executor
  unregisterExecutor(toolName: string): void
  
  // Get tool executor
  getExecutor(toolName: string): ToolExecutor | undefined
  
  // Execute tool
  executeTool(toolCall: ToolCall, context?: Record<string, unknown>): Promise<ToolResult>
  
  // Get all registered executors
  getExecutors(): Record<string, ToolExecutor>
}
```

**Example:**

```tsx
function ToolManager() {
  const toolManager = useMemo(() => new AgentToolExecutorManager(), [])
  
  useEffect(() => {
    // Register calculator tool
    toolManager.registerExecutor('calculate', async (toolCall) => {
      const args = JSON.parse(toolCall.function.arguments)
      const result = eval(args.expression)
      
      return {
        toolCallId: toolCall.id,
        result: `Result: ${result}`,
        status: 'success'
      }
    })
    
    return () => {
      toolManager.unregisterExecutor('calculate')
    }
  }, [])
  
  return <div>Tool manager initialized</div>
}
```

## Error Handling

### Common Error Types

```tsx
class AgentChatError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message)
    this.name = 'AgentChatError'
  }
}

class ToolExecutionError extends AgentChatError {
  constructor(message: string, public toolName: string, public toolCallId: string) {
    super(message, 'TOOL_EXECUTION_ERROR', { toolName, toolCallId })
    this.name = 'ToolExecutionError'
  }
}

class AgentConnectionError extends AgentChatError {
  constructor(message: string, public url: string) {
    super(message, 'AGENT_CONNECTION_ERROR', { url })
    this.name = 'AgentConnectionError'
  }
}
```

### Error Handling Example

```tsx
function ChatWithErrorHandling() {
  const [error, setError] = useState<Error | null>(null)
  
  const handleError = (error: Error) => {
    if (error instanceof ToolExecutionError) {
      console.error(`Tool ${error.toolName} failed:`, error.message)
      setError(error)
    } else if (error instanceof AgentConnectionError) {
      console.error('Agent connection failed:', error.message)
      setError(error)
    } else {
      console.error('Unknown error:', error)
      setError(error)
    }
  }
  
  return (
    <AgentChatWindow
      agent={agent}
      tools={tools}
      onError={handleError}
    />
  )
}
```

## Configuration

### Agent Configuration

```tsx
// HTTP Agent
const httpAgent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
  headers: {
    'Authorization': 'Bearer your-api-key'
  },
  timeout: 30000,
  debug: process.env.NODE_ENV === 'development'
})

// Custom Agent
class CustomAgent implements Agent {
  constructor(private config: CustomAgentConfig) {}
  
  async runAgent(options: RunAgentOptions) {
    // Custom implementation
  }
  
  stopAgent() {
    // Custom stop logic
  }
  
  get isRunning() {
    return this.running
  }
}
```

### Tool Configuration

```tsx
// Tool with configuration
const createConfigurableTool = (config: ToolConfig) => (): Tool => ({
  name: config.name,
  description: config.description,
  parameters: config.parameters,
  execute: config.execute,
  render: config.render
})

const calculatorConfig: ToolConfig = {
  name: 'calculate',
  description: 'Perform calculations',
  parameters: {
    type: 'object',
    properties: {
      expression: { type: 'string' }
    },
    required: ['expression']
  },
  execute: async (toolCall) => {
    // Implementation
  },
  render: (toolInvocation, onResult) => {
    // UI implementation
  }
}

const calculatorTool = createConfigurableTool(calculatorConfig)()
```

---

This API reference covers all the essential interfaces and methods provided by the Agent Chat library. For implementation details and advanced usage patterns, refer to the tutorial and source code.
