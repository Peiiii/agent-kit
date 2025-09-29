# 工具系统指南（Tool System）

本指南详细介绍：如何定义工具、如何执行工具、如何自定义渲染，以及如何在 UI 中展示“正在生成中的工具调用（tool call）”。

## 核心概念与类型

- ToolDefinition
  - `{ name: string; description: string; parameters: JSONSchema }`
  - 提供给模型用于选择与调用工具

- Tool（扩展）
  - `ToolDefinition & { execute?: (toolCall) => ToolResult | Promise; render?: (invocation, onResult) => ReactNode }`
  - `execute`：前端直接执行工具逻辑（无需模型二次调用）
  - `render`：自定义 UI 渲染（用于用户交互型工具）

- ToolExecutor
  - `(toolCall, context?) => ToolResult | Promise`
  - 将工具名映射到对应的执行函数（非 UI 场景）

- ToolRenderer
  - `{ definition: ToolDefinition; render: (invocation, onResult) => ReactNode }`
  - 将工具名映射到对应的渲染器（UI 场景）

## 从 Tool 列表解析出三件事

```tsx
import { useParseTools } from '@agent-labs/agent-chat'
import type { Tool } from '@agent-labs/agent-chat'

const tools: Tool[] = [
  {
    name: 'search',
    description: '搜索网络信息',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string', description: '关键词' } },
      required: ['query'],
    },
    execute: async (toolCall) => {
      const { query } = JSON.parse(toolCall.function.arguments)
      // 调用你的后端/第三方 API
      return { results: [`关于 ${query} 的结果 A`, `结果 B`] }
    },
  },
]

const { toolDefs, toolExecutors, toolRenderers } = useParseTools(tools)
```

- `toolDefs` 交给模型选择与调用工具
- `toolExecutors` 接到工具调用后在前端执行逻辑
- `toolRenderers` 用于渲染 UI（如果工具需要自定义交互界面）

## 连接到会话与 UI

```tsx
import { useAgentSessionManager, AgentChatWindow } from '@agent-labs/agent-chat'

const sessionManager = useAgentSessionManager({
  agent,
  getToolDefs: () => toolDefs,
  getContexts: () => [],
  initialMessages: [],
  getToolExecutor: (name) => toolExecutors[name],
})

return (
  <AgentChatWindow agentSessionManager={sessionManager} toolRenderers={toolRenderers} />
)
```

## 如何展示“正在生成中的工具调用”

组件库内置了 ToolCallRenderer（位于消息项 MessageItem 内部）：
- 当工具参数流式生成时，工具调用的 `state` 为 `partial-call`，UI 文案显示“准备参数中…”，并展示已解析/拼接的参数
- 当工具开始执行时，`state` 为 `call`，UI 显示“执行中…”
- 当工具返回结果后，`state` 为 `result`，UI 展示结果（默认以 JSON 形式展示；如提供了自定义渲染器，则展示你的 UI）

你无需手动管理这些状态。`AgentEventHandler` 已自动在消息流中注入/更新 tool-invocation 部分，`MessageItem -> ToolCallRenderer` 会根据状态渲染合适的 UI。

> 提示：如果你提供了某个工具的 `toolRenderers[name]`，则在该工具 `state` 转入 `result` 时，按你的渲染器展示结果。否则使用内置的默认结果卡片样式。

## 在渲染器中返回结果

当你实现 `render` 以提供交互式 UI 时，通过 `onResult` 回传结果：

```tsx
const toolRenderers = {
  search: {
    definition: toolDefs.find(d => d.name === 'search')!,
    render: (invocation, onResult) => {
      const args = typeof invocation.args === 'string'
        ? invocation.args
        : JSON.stringify(invocation.args)

      return (
        <div className="p-3 border rounded">
          <div className="text-sm text-muted-foreground mb-2">搜索参数: {args}</div>
          <button
            onClick={() => onResult({
              toolCallId: invocation.toolCallId,
              result: { ok: true, items: [] },
              state: 'result',
            })}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            执行搜索
          </button>
        </div>
      )
    },
  },
}
```

- `onResult` 会调用库内的 `addToolResult`，从而把对应的 tool-invocation 更新为 `result` 状态并触发后续流程。

## 关于不完整的工具调用

当用户在工具未完成时继续对话，某些 Provider（如 OpenAI）要求每个工具调用后必须紧跟一个 `role=tool` 的结果消息。库已内置修复：
- 在发送给 Provider 之前，会将所有未结束（`state !== 'result'`）的 tool-invocation 自动补齐为 `result`，并附带一个占位结果
- 真实结果一旦生成，会覆盖该占位结果

你无需额外处理。

## 小贴士

- 工具参数较大时，ToolCallRenderer 内部对 code block/JSON 做了滚动限制，避免撑破布局
- 如果你有更复杂的渲染需求，可忽略内置渲染器，直接针对某个工具名提供自定义 `render`
- 如果只需前端执行，不需要 UI，提供 `execute` 即可；如需用户交互，提供 `render` 并使用 `onResult` 回传
