import { codeRenderer, codeTool } from './code'
import type {
  Context,
  ToolCall,
  ToolDefinition,
  ToolRenderer,
  ToolResult,
} from './types/agent'
import {
  userConfirmationRenderer,
  userConfirmationTool,
} from './user-confirmation'

// 导出工具定义和渲染器
export const tools: ToolDefinition[] = [userConfirmationTool, codeTool]

export const toolRenderers: Record<string, ToolRenderer> = {
  user_confirmation: userConfirmationRenderer,
  generate_code: codeRenderer,
}

// 导出组件
export { AgentChatWindow } from './components/agent-chat-window'
export { AgentDemo } from './demos/agent-demo'

// 导出类型
export type {
  Context,
  ToolCall,
  ToolDefinition,
  ToolRenderer,
  ToolResult,
}

// 导出 hooks
export { useProvideAgentContexts } from './hooks/use-provide-agent-contexts'
export { useProvideAgentToolDefs } from './hooks/use-provide-agent-tool-defs'
export { useProvideAgentToolRenderers } from './hooks/use-provide-agent-tool-renderers'

// 导出 UI 组件
export * from './components/chat-interface'

export * from './components/markdown-renderer'

export * from './components/agent-chat-core'

// 导出服务
export * from './services'
