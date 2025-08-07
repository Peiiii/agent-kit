import type {
  Context,
  ToolCall,
  ToolDefinition,
  ToolRenderer,
  ToolResult,
} from './core/types/agent'

// 导出空的默认工具定义和渲染器
export const defaultToolDefs: ToolDefinition[] = []

export const defaultToolRenderers: Record<string, ToolRenderer> = {}

// 导出组件
export { AgentChatWindow } from './components/agent-chat-window'
export { AgentDemo } from './demos/agent-demo'

// 导出类型
export type {
  Context,
  ToolCall,
  ToolDefinition,
  ToolRenderer,
  ToolResult
}

// 导出 hooks
export * from './core'


// 导出 UI 组件
export * from './components/chat-interface'

export * from './components/markdown-renderer'

export * from './components/agent-chat-core'


