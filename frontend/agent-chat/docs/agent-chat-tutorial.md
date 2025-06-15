# @agent-labs/agent-chat 使用教程

@agent-labs/agent-chat 是一个功能强大的 React 组件库，用于快速构建 AI 助手聊天界面。本教程将帮助你了解如何安装和使用这个库。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [使用方式](#使用方式)
  - [基础组件 (AgentChatCore)](#基础组件-agentchatcore)
  - [窗口组件 (AgentChatWindow)](#窗口组件-agentchatwindow)
- [典型场景](#典型场景)
  - [基础聊天界面](#基础聊天界面)
  - [动态上下文管理](#动态上下文管理)
  - [插件式工具系统](#插件式工具系统)
  - [自定义工具界面](#自定义工具界面)
  - [组合使用场景](#组合使用场景)
- [API 参考](#api-参考)
- [Hooks 参考](#hooks-参考)

## 安装

使用 npm 或 yarn 安装必要的依赖：

```bash
# 安装 agent-chat 组件库
npm install @agent-labs/agent-chat
# 安装 HTTP Agent 客户端
npm install @ag-ui/client

# 或者使用 yarn
yarn add @agent-labs/agent-chat @ag-ui/client
```

注意：`@ag-ui/client` 是必需的依赖，用于创建 HTTP Agent 实例与后端服务通信。

## 快速开始

首先，创建一个 Agent 实例：

```tsx
import { HttpAgent } from '@ag-ui/client'

// 创建一个全局的 Agent 实例
export const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})
```

然后，在你的应用中使用它：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'

function App() {
  return (
    <AgentChatWindow
      agent={agent}
    />
  )
}
```

## 使用方式

### 基础组件 (AgentChatCore)

`AgentChatCore` 是一个基础的聊天组件，提供了核心的聊天功能，适合需要自定义 UI 的场景：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'

function BasicExample() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <AgentChatCore
          agent={agent}
          className="h-[600px]"
        />
      </div>
    </div>
  )
}
```

`AgentChatCore` 组件提供了：
- 消息列表显示
- 消息输入框
- 工具调用渲染
- 加载状态管理

你可以完全控制组件的样式和布局，适合需要深度定制的场景。

### 窗口组件 (AgentChatWindow)

`AgentChatWindow` 是一个完整的窗口组件，提供了开箱即用的聊天窗口体验：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'

function WindowExample() {
  return (
    <AgentChatWindow
      agent={agent}
      className="fixed bottom-4 right-4"
    />
  )
}
```

`AgentChatWindow` 组件提供了：
- 可拖拽的窗口
- 最大化/最小化功能
- 高度自适应
- 关闭/重新打开功能
- 清除对话功能

适合需要快速集成聊天功能的场景。

## 典型场景

### 基础聊天界面

使用 `AgentChatCore` 构建基础聊天界面：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'

function BasicChat() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">AI 助手</h1>
        </header>
        <div className="bg-white rounded-lg shadow-lg">
          <AgentChatCore
            agent={agent}
            className="h-[600px]"
          />
        </div>
      </div>
    </div>
  )
}
```

### 动态上下文管理

使用 hooks 来管理动态上下文：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useEffect, useState } from 'react'
import { useProvideAgentContexts } from '@agent-labs/agent-chat'

function DynamicContextChat() {
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    name: '张三',
    role: 'developer',
    lastActive: new Date().toISOString(),
  })

  // 使用 hook 提供上下文
  useProvideAgentContexts([
    {
      description: '用户信息',
      value: JSON.stringify(userInfo),
    },
  ])

  // 定期更新用户活跃时间
  useEffect(() => {
    const timer = setInterval(() => {
      setUserInfo(prev => ({
        ...prev,
        lastActive: new Date().toISOString(),
      }))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  return (
    <AgentChatWindow
      agent={agent}
    />
  )
}
```

### 插件式工具系统

使用 hooks 来管理动态工具：

```tsx
import { AgentChatCore } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useState } from 'react'
import type { ToolDefinition } from '@agent-labs/agent-chat'
import { useProvideAgentToolDefs } from '@agent-labs/agent-chat'

function PluginSystemChat() {
  // 基础工具
  const baseTools: ToolDefinition[] = [
    {
      name: 'search',
      description: '搜索网络信息',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词',
          },
        },
        required: ['query'],
      },
    },
  ]

  // 动态工具列表
  const [dynamicTools, setDynamicTools] = useState<ToolDefinition[]>([])

  // 使用 hook 提供工具定义
  useProvideAgentToolDefs([...baseTools, ...dynamicTools])

  // 添加新工具的函数
  const addNewTool = () => {
    const newTool: ToolDefinition = {
      name: 'getTime',
      description: '获取当前时间',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    }
    setDynamicTools(prev => [...prev, newTool])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg">
          <AgentChatCore
            agent={agent}
            className="h-[600px]"
          />
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={addNewTool}
          >
            添加时间工具
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 自定义工具界面

使用 hooks 来管理工具渲染器：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import type { ToolRenderer } from '@agent-labs/agent-chat'
import { useProvideAgentToolRenderers } from '@agent-labs/agent-chat'

function CustomToolUI() {
  // 自定义工具渲染器
  const customRenderers: ToolRenderer[] = [
    {
      render: (toolCall, onResult) => {
        const args = JSON.parse(toolCall.function.arguments)
        return (
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">高级搜索</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={args.query}
                className="w-full p-2 border rounded"
                placeholder="输入搜索关键词"
              />
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => {
                    onResult({
                      toolCallId: toolCall.id,
                      result: {
                        title: '搜索结果',
                        content: `这是关于 ${args.query} 的搜索结果...`,
                      },
                      status: 'success',
                    })
                  }}
                >
                  搜索
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                  onClick={() => {
                    onResult({
                      toolCallId: toolCall.id,
                      result: null,
                      status: 'cancelled',
                    })
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )
      },
      definition: {
        name: 'search',
        description: '搜索网络信息',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索关键词',
            },
          },
          required: ['query'],
        },
      },
    },
  ]

  // 使用 hook 提供工具渲染器
  useProvideAgentToolRenderers(customRenderers)

  return (
    <AgentChatWindow
      agent={agent}
    />
  )
}
```

### 组合使用场景

在实际应用中，通常需要组合使用多个功能：

```tsx
import { AgentChatWindow } from '@agent-labs/agent-chat'
import { agent } from './agent'
import { useEffect, useState } from 'react'
import type { ToolDefinition, ToolRenderer } from '@agent-labs/agent-chat'
import {
  useProvideAgentContexts,
  useProvideAgentToolDefs,
  useProvideAgentToolRenderers,
} from '@agent-labs/agent-chat'

function AdvancedChat() {
  // 1. 状态管理
  const [userInfo, setUserInfo] = useState({
    name: '张三',
    role: 'developer',
    preferences: {
      theme: 'dark',
      language: 'zh-CN',
    },
  })

  // 2. 动态工具
  const [tools, setTools] = useState<ToolDefinition[]>([
    {
      name: 'search',
      description: '搜索网络信息',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词',
          },
        },
        required: ['query'],
      },
    },
  ])

  // 3. 自定义渲染器
  const toolRenderers: ToolRenderer[] = [
    {
      render: (toolCall, onResult) => {
        const args = JSON.parse(toolCall.function.arguments)
        return (
          <div className="p-4 border rounded-lg">
            <h3 className="font-bold mb-2">搜索结果</h3>
            <p>正在搜索: {args.query}</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                onResult({
                  toolCallId: toolCall.id,
                  result: {
                    title: '搜索结果',
                    content: `这是关于 ${args.query} 的搜索结果...`,
                  },
                  status: 'success',
                })
              }}
            >
              搜索
            </button>
          </div>
        )
      },
      definition: tools[0],
    },
  ]

  // 4. 使用 hooks 提供各种资源
  useProvideAgentContexts([
    {
      description: '用户信息',
      value: JSON.stringify(userInfo),
    },
  ])
  useProvideAgentToolDefs(tools)
  useProvideAgentToolRenderers(toolRenderers)

  // 5. 动态更新
  useEffect(() => {
    const timer = setInterval(() => {
      setUserInfo(prev => ({
        ...prev,
        lastActive: new Date().toISOString(),
      }))
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            高级 AI 助手
          </h1>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <AgentChatWindow
            agent={agent}
          />
        </div>

        <div className="mt-4 flex gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              // 添加新工具
              const newTool: ToolDefinition = {
                name: 'getTime',
                description: '获取当前时间',
                parameters: {
                  type: 'object',
                  properties: {},
                  required: [],
                },
              }
              setTools(prev => [...prev, newTool])
            }}
          >
            添加时间工具
          </button>
        </div>
      </div>
    </div>
  )
}
```

## API 参考

### AgentChatCore Props

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| agent | HttpAgent | 是 | HTTP Agent 实例 |
| tools | ToolDefinition[] | 否 | 工具定义数组 |
| toolRenderers | Record<string, ToolRenderer> | 否 | 工具渲染器映射 |
| staticContext | Array<{description: string, value: string}> | 否 | 静态上下文信息 |
| className | string | 否 | 自定义 CSS 类名 |

### AgentChatWindow Props

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| agent | HttpAgent | 是 | HTTP Agent 实例 |
| tools | ToolDefinition[] | 否 | 工具定义数组 |
| toolRenderers | Record<string, ToolRenderer> | 否 | 工具渲染器映射 |
| staticContext | Array<{description: string, value: string}> | 否 | 静态上下文信息 |
| className | string | 否 | 自定义 CSS 类名 |

### 工具定义

工具定义需要符合以下格式：

```typescript
interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
}
```

### 工具渲染器

工具渲染器需要符合以下格式：

```typescript
interface ToolRenderer {
  render: (toolCall: ToolCall, onResult: (result: ToolResult) => void) => ReactNode
  definition: ToolDefinition
}
```

## Hooks 参考

### useProvideAgentContexts

用于提供动态上下文：

```typescript
function useProvideAgentContexts(contexts: Context[]): void
```

这个 hook 允许你在组件中动态提供上下文信息。当 contexts 数组发生变化时，上下文会自动更新。

### useProvideAgentToolDefs

用于提供动态工具定义：

```typescript
function useProvideAgentToolDefs(toolDefs: ToolDefinition[]): void
```

这个 hook 允许你在组件中动态提供工具定义。当 toolDefs 数组发生变化时，工具定义会自动更新。

### useProvideAgentToolRenderers

用于提供动态工具渲染器：

```typescript
function useProvideAgentToolRenderers(toolRenderers: ToolRenderer[]): void
```

这个 hook 允许你在组件中动态提供工具渲染器。当 toolRenderers 数组发生变化时，工具渲染器会自动更新。

## 故障排除

如果遇到问题，请检查：

1. 后端服务是否正常运行
2. Agent URL 配置是否正确
3. 工具定义是否符合规范
4. 网络连接是否正常

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT 