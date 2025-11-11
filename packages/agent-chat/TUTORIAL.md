# @agent-labs/agent-chat 使用教程

## 简介

`@agent-labs/agent-chat` 是一个功能强大的 React 组件库，用于构建 AI 代理聊天界面。它支持多种工具执行模式、实时消息流、上下文管理等功能。

## 安装

```bash
npm install @agent-labs/agent-chat
# 或
yarn add @agent-labs/agent-chat
# 或
pnpm add @agent-labs/agent-chat
```

## 基础使用

### 1. 最简单的聊天窗口

```tsx
import React from 'react'
import { AgentChatWindow } from '@agent-labs/agent-chat'

// 创建一个简单的 HTTP 代理
const agent = new HttpAgent({
  url: 'https://your-api-endpoint.com/chat'
})

function App() {
  return (
    <div className="h-screen">
      <AgentChatWindow
        agent={agent}
        className="h-full"
      />
    </div>
  )
}
```

### 2. 使用核心组件构建自定义界面

```tsx
import React from 'react'
import { AgentChat, useAgentChat } from '@agent-labs/agent-chat'

const agent = new HttpAgent({
  url: 'https://your-api-endpoint.com/chat'
})

function CustomChatApp() {
  const {
    messages,
    isAgentResponding,
    sendMessage,
    reset
  } = useAgentChat({
    agent,
    toolDefs: [], // 工具定义
    contexts: []  // 上下文信息
  })

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="p-4">
            {message.content}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="输入消息..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage(e.target.value)
              e.target.value = ''
            }
          }}
          disabled={isAgentResponding}
        />
        <button onClick={reset}>重置</button>
      </div>
    </div>
  )
}
```

## 工具系统

### 工具类型

Agent Chat 支持三种工具执行模式：

#### 1. 前端执行工具 (Frontend-Execution Tools)

适用于轻量级操作，如计算、数据处理等：

```tsx
import { Tool, ToolCall, ToolResult } from '@agent-labs/agent-chat'

const createCalculatorTool = (): Tool => ({
  name: 'calculate',
  description: '执行基本的数学计算',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: '数学表达式，如 "2 + 3 * 4"'
      }
    },
    required: ['expression']
  },
  // 实现 execute 函数
  execute: async (toolCall: ToolCall) => {
    try {
      const args = JSON.parse(toolCall.function.arguments)
      const { expression } = args
      
      // 安全地执行数学表达式
      const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')
      const result = new Function(`return ${sanitizedExpression}`)()
      
      return {
        toolCallId: toolCall.id,
        result: `计算结果：${expression} = ${result}`,
        state: 'result'
      }
    } catch (error) {
      return {
        toolCallId: toolCall.id,
        result: '计算失败',
        state: 'result',
        error: String(error)
      }
    }
  },
  // 可选的渲染函数
  render: (toolInvocation, onResult) => (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="font-bold mb-2 text-blue-800">🧮 数学计算器</h3>
      <p>表达式: {toolInvocation.args.expression}</p>
    </div>
  )
})
```

#### 2. 用户交互工具 (User-Interaction Tools)

需要用户确认、输入或决策的工具：

```tsx
import { Tool, ToolResult } from '@agent-labs/agent-chat'
import { useState } from 'react'

const createUserConfirmationTool = (): Tool => ({
  name: 'userConfirmation',
  description: '请求用户确认某个操作',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: '需要用户确认的操作描述'
      },
      importance: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: '操作的重要程度'
      }
    },
    required: ['action']
  },
  // 只实现 render 函数，包含用户交互逻辑
  render: (toolInvocation, onResult) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null)
    const params = toolInvocation.args as {
      action: string
      importance?: 'low' | 'medium' | 'high' | 'critical'
    }

    const handleConfirm = () => {
      onResult({
        toolCallId: toolInvocation.toolCallId,
        result: `用户已确认操作：${params.action}`,
        state: 'result'
      })
      setIsConfirmed(true)
    }

    const handleReject = () => {
      onResult({
        toolCallId: toolInvocation.toolCallId,
        result: `用户已拒绝操作：${params.action}`,
        state: 'result'
      })
      setIsConfirmed(false)
    }

    return (
      <div className="p-4 border rounded-lg bg-orange-50">
        <h3 className="font-bold mb-2 text-orange-800">⚠️ 需要用户确认</h3>
        <p><strong>操作:</strong> {params.action}</p>
        {params.importance && (
          <p><strong>重要程度:</strong> {params.importance}</p>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            确认
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            拒绝
          </button>
        </div>
      </div>
    )
  }
})
```

#### 3. 后端工具 (Backend-Only Tools)

完全由后端处理的工具，前端只显示状态：

```tsx
const createDatabaseQueryTool = (): Tool => ({
  name: 'databaseQuery',
  description: '执行数据库查询',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'SQL 查询语句'
      }
    },
    required: ['query']
  },
  // 只实现 render 函数，显示工具状态
  render: (toolInvocation) => (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2 text-gray-800">🗄️ 数据库查询</h3>
      <p><strong>查询:</strong> <code>{toolInvocation.args.query}</code></p>
      <p className="text-sm text-gray-600">
        状态: {toolInvocation.state === 'call' ? '执行中...' : '已完成'}
      </p>
    </div>
  )
})
```

### 使用工具

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'

const tools = [
  createCalculatorTool(),
  createUserConfirmationTool(),
  createDatabaseQueryTool()
]

function App() {
  return (
    <AgentChatWindow
      agent={agent}
      tools={tools}
      className="h-full"
    />
  )
}
```

## 上下文管理

上下文信息可以传递给 AI 代理，提供额外的背景信息：

```tsx
const contexts = [
  {
    description: '用户信息',
    value: JSON.stringify({
      name: '张三',
      role: '管理员',
      preferences: {
        language: 'zh-CN',
        responseStyle: '专业'
      }
    })
  },
  {
    description: '系统信息',
    value: JSON.stringify({
      version: '1.0.0',
      features: ['聊天', '工具调用', '上下文管理'],
      lastUpdate: new Date().toISOString()
    })
  }
]

<AgentChatWindow
  agent={agent}
  tools={tools}
  contexts={contexts}
/>
```

## 快速提示 (Prompts)

为聊天界面添加快捷提示按钮：

```tsx
const promptsProps = {
  items: [
    { id: '1', prompt: '帮我计算 123 * 456' },
    { id: '2', prompt: '查看今天的天气' },
    { id: '3', prompt: '创建一个待办事项' }
  ],
  onItemClick: (item) => {
    // 处理提示点击
    console.log('用户选择了提示:', item.prompt)
  }
}

<AgentChatWindow
  agent={agent}
  tools={tools}
  promptsProps={promptsProps}
/>
```

## 自定义样式

### 使用 Tailwind CSS

```tsx
<AgentChatWindow
  agent={agent}
  className="h-screen bg-gray-100"
  senderProps={{
    placeholder: "输入您的问题..."
  }}
/>
```

### 自定义消息输入

```tsx
import { AgentChat, useAgentChat } from '@agent-labs/agent-chat'

function CustomChatInterface() {
  const {
    messages,
    isAgentResponding,
    sendMessage,
    input,
    onInputChange
  } = useAgentChat({
    agent,
    toolDefs: [],
    contexts: []
  })

  return (
    <div className="flex flex-col h-screen">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-4 p-3 rounded-lg bg-blue-50">
            {message.content}
          </div>
        ))}
      </div>
      
      {/* 自定义输入框 */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAgentResponding}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isAgentResponding || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAgentResponding ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 高级功能

### 1. 消息管理

```tsx
const {
  messages,
  addMessages,
  setMessages,
  removeMessages,
  reset
} = useAgentChat({
  agent,
  toolDefs: [],
  contexts: []
})

// 添加消息
await addMessages([
  {
    id: '1',
    role: 'user',
    content: 'Hello!',
    parts: [{ type: 'text', text: 'Hello!' }]
  }
])

// 设置消息列表
setMessages(newMessages)

// 删除特定消息
removeMessages(['message-id-1', 'message-id-2'])

// 重置聊天
reset()
```

### 2. 工具结果处理

```tsx
const {
  addToolResult
} = useAgentChat({
  agent,
  toolDefs: [],
  contexts: []
})

// 手动添加工具结果
await addToolResult({
  toolCallId: 'tool-call-123',
  result: '工具执行成功',
  state: 'result'
}, {
  triggerAgent: true // 是否触发代理继续处理
})
```

### 3. 代理控制

```tsx
const {
  runAgent,
  abortAgentRun,
  isAgentResponding
} = useAgentChat({
  agent,
  toolDefs: [],
  contexts: []
})

// 手动运行代理
await runAgent()

// 中止代理运行
abortAgentRun()

// 检查代理是否正在响应
if (isAgentResponding) {
  console.log('代理正在处理中...')
}
```

## 类型定义

### 核心类型

```tsx
import type {
  AgentChatProps,
  AgentChatRef,
  UseAgentChatProps,
  UseAgentChatReturn,
  Tool,
  ToolCall,
  ToolResult,
  ToolDefinition,
  Context,
  UIMessage
} from '@agent-labs/agent-chat'
```

### 工具类型

```tsx
interface Tool extends ToolDefinition {
  execute?: (toolCall: ToolCall) => Promise<ToolResult>
  render?: (toolInvocation: ToolInvocation, onResult: (result: ToolResult) => void) => ReactNode
}
```

## 最佳实践

### 1. 工具设计

- **前端执行工具**: 适用于轻量级、安全的操作
- **用户交互工具**: 适用于需要用户确认或输入的操作
- **后端工具**: 适用于复杂、敏感或需要后端资源的操作

### 2. 错误处理

```tsx
const createRobustTool = (): Tool => ({
  name: 'robustTool',
  description: '一个健壮的工具示例',
  parameters: {
    type: 'object',
    properties: {
      input: { type: 'string' }
    },
    required: ['input']
  },
  execute: async (toolCall: ToolCall) => {
    try {
      const args = JSON.parse(toolCall.function.arguments)
      // 工具逻辑
      const result = await processInput(args.input)
      
      return {
        toolCallId: toolCall.id,
        result,
        state: 'result'
      }
    } catch (error) {
      console.error('工具执行失败:', error)
      return {
        toolCallId: toolCall.id,
        result: '工具执行失败',
        state: 'result',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
})
```

### 3. 性能优化

```tsx
// 使用 useMemo 缓存工具定义
const tools = useMemo(() => [
  createCalculatorTool(),
  createWeatherTool(),
  createUserConfirmationTool()
], [])

// 使用 useCallback 缓存回调函数
const handlePromptClick = useCallback((item) => {
  sendMessage(item.prompt)
}, [sendMessage])
```

## 完整示例

```tsx
import React, { useMemo, useRef } from 'react'
import { AgentChatWindow, HttpAgent } from '@agent-labs/agent-chat'
import { createCalculatorTool, createUserConfirmationTool } from './tools'

const agent = new HttpAgent({
  url: 'https://your-api-endpoint.com/chat'
})

const tools = [
  createCalculatorTool(),
  createUserConfirmationTool()
]

const contexts = [
  {
    description: '用户信息',
    value: JSON.stringify({
      name: '用户',
      preferences: { language: 'zh-CN' }
    })
  }
]

const promptsProps = {
  items: [
    { id: '1', prompt: '计算 100 + 200' },
    { id: '2', prompt: '需要确认的操作' }
  ],
  onItemClick: (item) => {
    // 处理提示点击
  }
}

function App() {
  const chatRef = useRef(null)

  return (
    <div className="h-screen">
      <AgentChatWindow
        ref={chatRef}
        agent={agent}
        tools={tools}
        contexts={contexts}
        promptsProps={promptsProps}
        className="h-full"
        senderProps={{
          placeholder: "输入您的问题..."
        }}
      />
    </div>
  )
}

export default App
```

## 故障排除

### 常见问题

1. **工具不执行**: 检查工具定义是否正确，确保 `name` 和 `description` 字段正确
2. **消息不显示**: 确保 `UIMessage` 格式正确，包含必要的 `id`、`role`、`content` 字段
3. **代理不响应**: 检查代理 URL 是否正确，网络连接是否正常

### 调试技巧

```tsx
// 启用详细日志
const agent = new HttpAgent({
  url: 'https://your-api-endpoint.com/chat',
  // 添加调试选项
  debug: true
})

// 监听消息变化
useEffect(() => {
  console.log('消息更新:', messages)
}, [messages])

// 监听工具调用
useEffect(() => {
  console.log('代理状态:', isAgentResponding)
}, [isAgentResponding])
```

## 更新日志

- **v1.17.4**: 最新版本，包含完整的工具系统和上下文管理
- 支持三种工具执行模式
- 改进的消息管理和状态控制
- 增强的类型定义和错误处理

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个库！

## 许可证

MIT License
