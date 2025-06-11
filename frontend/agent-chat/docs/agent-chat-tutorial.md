# @agent-labs/agent-chat 使用教程

@agent-labs/agent-chat 是一个功能强大的 React 组件库，用于快速构建 AI 助手聊天界面。本教程将帮助你了解如何安装和使用这个库。

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
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

以下是一个最基本的示例：

```tsx
import { HttpAgent } from '@ag-ui/client'
import { AgentChat, toolRenderers, tools } from '@agent-labs/agent-chat'

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

function App() {
  return (
    <AgentChat
      agent={agent}
      tools={tools}
      toolRenderers={toolRenderers}
    />
  )
}
```

## 典型场景

### 基础聊天界面

最简单的使用场景，只需要基本的聊天功能：

```tsx
import { HttpAgent } from '@ag-ui/client'
import { AgentChat } from '@agent-labs/agent-chat'

function BasicChat() {
  return (
    <AgentChat
      agent={new HttpAgent({
        url: 'http://localhost:8000/openai-agent',
      })}
      tools={[]}  // 不使用任何工具
      toolRenderers={{}}
    />
  )
}
```

### 动态上下文管理

当需要根据用户状态或系统环境动态更新上下文时：

```tsx
import { HttpAgent } from '@ag-ui/client'
import { AgentChat, useProvideAgentContexts } from '@agent-labs/agent-chat'
import { useEffect, useState } from 'react'

function DynamicContextChat() {
  // 用户信息状态
  const [userInfo, setUserInfo] = useState({
    name: '张三',
    role: 'developer',
    lastActive: new Date().toISOString(),
  })

  // 系统环境信息
  const [systemInfo, setSystemInfo] = useState({
    os: 'macOS',
    version: '12.0',
    timezone: 'Asia/Shanghai',
  })

  // 使用 hook 提供动态上下文
  useProvideAgentContexts([
    {
      description: '用户信息',
      value: JSON.stringify(userInfo),
    },
    {
      description: '系统环境',
      value: JSON.stringify(systemInfo),
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
    <AgentChat
      agent={new HttpAgent({
        url: 'http://localhost:8000/openai-agent',
      })}
      tools={[]}
      toolRenderers={{}}
    />
  )
}
```

### 插件式工具系统

当需要动态加载和管理工具时：

```tsx
import { HttpAgent } from '@ag-ui/client'
import { AgentChat, useProvideAgentToolDefs, type ToolDefinition } from '@agent-labs/agent-chat'
import { useState } from 'react'

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

  // 使用 hook 提供动态工具定义
  useProvideAgentToolDefs(dynamicTools)

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
    <div>
      <AgentChat
        agent={new HttpAgent({
          url: 'http://localhost:8000/openai-agent',
        })}
        tools={[...baseTools, ...dynamicTools]}
        toolRenderers={{}}
      />
      <button onClick={addNewTool}>添加时间工具</button>
    </div>
  )
}
```

### 自定义工具界面

当需要为工具提供自定义的交互界面时：

```tsx
import { HttpAgent } from '@ag-ui/client'
import { AgentChat, useProvideAgentToolRenderers, type ToolRenderer } from '@agent-labs/agent-chat'

function CustomToolUI() {
  // 自定义工具渲染器
  const customRenderers: Record<string, ToolRenderer> = {
    search: (toolCall, onResult) => {
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
  }

  // 使用 hook 提供工具渲染器
  useProvideAgentToolRenderers(Object.values(customRenderers))

  return (
    <AgentChat
      agent={new HttpAgent({
        url: 'http://localhost:8000/openai-agent',
      })}
      tools={[
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
      ]}
      toolRenderers={customRenderers}
    />
  )
}
```

### 组合使用场景

在实际应用中，通常需要组合使用多个功能：

```tsx
import { HttpAgent } from '@ag-ui/client'
import {
  AgentChat,
  useProvideAgentContexts,
  useProvideAgentToolDefs,
  useProvideAgentToolRenderers,
  type ToolDefinition,
  type ToolRenderer,
} from '@agent-labs/agent-chat'
import { useEffect, useState } from 'react'

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

  // 2. 动态上下文
  useProvideAgentContexts([
    {
      description: '用户信息',
      value: JSON.stringify(userInfo),
    },
  ])

  // 3. 动态工具
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

  useProvideAgentToolDefs(tools)

  // 4. 自定义渲染器
  const toolRenderers: Record<string, ToolRenderer> = {
    search: (toolCall, onResult) => {
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
  }

  useProvideAgentToolRenderers(Object.values(toolRenderers))

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
          <AgentChat
            agent={new HttpAgent({
              url: 'http://localhost:8000/openai-agent',
            })}
            tools={tools}
            toolRenderers={toolRenderers}
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

### AgentChat Props

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| agent | HttpAgent | 是 | HTTP Agent 实例 |
| tools | ToolDefinition[] | 是 | 工具定义数组 |
| toolRenderers | Record<string, ToolRenderer> | 是 | 工具渲染器映射 |
| staticContext | Array<{description: string, value: string}> | 否 | 静态上下文信息 |

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

## Hooks 参考

### useProvideAgentContexts

用于提供动态上下文：

```typescript
function useProvideAgentContexts(contexts: Context[]): void
```

### useProvideAgentToolDefs

用于提供动态工具定义：

```typescript
function useProvideAgentToolDefs(toolDefs: ToolDefinition[]): void
```

### useProvideAgentToolRenderers

用于提供动态工具渲染器：

```typescript
function useProvideAgentToolRenderers(toolRenderers: ToolRenderer[]): void
```

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