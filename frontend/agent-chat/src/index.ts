import { codeRenderer, codeTool } from './code'
import {
  userConfirmationRenderer,
  userConfirmationTool,
} from './user-confirmation'
import type {
  Context,
  ToolCall,
  ToolDefinition,
  ToolRenderer,
  ToolResult,
} from './types'

// 导出工具定义和渲染器
export const tools: ToolDefinition[] = [userConfirmationTool, codeTool]

export const toolRenderers: Record<string, ToolRenderer> = {
  user_confirmation: userConfirmationRenderer,
  generate_code: codeRenderer,
}

// 导出主要组件
export { AgentChat } from './agent-chat'
export { ChatWindow } from './chat-window'

// 导出 hooks
export * from './hooks'

// 导出服务
export * from './services'

// 导出类型
export type { Context, ToolCall, ToolDefinition, ToolRenderer, ToolResult }

// 导出 UI 组件
export * from './components/chat-interface'
export * from './components/markdown-renderer'
