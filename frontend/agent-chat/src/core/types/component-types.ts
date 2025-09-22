import * as React from 'react'
import type { AgentSessionManager } from '../services/agent-session-manager';
import type { Context, IAgent, ToolCall, ToolDefinition, ToolRenderer, ToolResult } from './agent';
import type { UIMessage } from "./ui-message";

export type ToolExecutor = (
  toolCall: ToolCall,
  context?: Record<string, unknown>
) => ToolResult | Promise<ToolResult>


export interface SenderProps {
  placeholder?: string
}

// --- Composer extensibility (input area plugins) ---
// Lightweight types to support pluggable input extensions without
// introducing hard-coded business logic in the library.

export type ChatInputExtensionPlacement =
  | 'inside-left'      // tiny elements inside input (avoid for complex UI)
  | 'inside-right'     // tiny elements near send/stop
  | 'top-left'         // header toolbar inside composer (best for tools)
  | 'top-right'        // header toolbar right area
  | 'bottom-left'      // footer bar inside composer (best for model switch)
  | 'bottom-right'     // footer bar right area (token, cost, counter)
  | 'below'            // legacy: separate row below composer (maps to bottom-left)
  | 'above'            // legacy: separate row above composer
  | 'toolbar-left'     // legacy alias for top-left
  | 'toolbar-right'    // legacy alias for top-right

export interface ComposerDraft {
  text: string
  meta?: Record<string, unknown>
}

export interface ChatInputExtensionContext {
  draft: ComposerDraft
  setDraft: (next: ComposerDraft | ((d: ComposerDraft) => ComposerDraft)) => void
  isAgentResponding: boolean
  requestAbort?: () => void
}

export interface ChatInputExtension {
  id: string
  placement?: ChatInputExtensionPlacement
  render: (ctx: ChatInputExtensionContext) => React.ReactNode
  beforeSend?: (
    draft: ComposerDraft
  ) => Promise<ComposerDraft | { abort: true }> | ComposerDraft | { abort: true }
}

export interface PromptsProps {
  items: Array<{
    id: string
    prompt: string
  }>
  onItemClick?: (item: { id: string; prompt: string }) => void
}

export interface AgentChatProps {
  agentSessionManager: AgentSessionManager
  toolRenderers: Record<string, ToolRenderer>
  className?: string
  senderProps?: SenderProps
  promptsProps?: PromptsProps
  messageItemProps?: Partial<MessageItemProps>
  aboveInputComponent?: React.ReactNode
  // Extensibility hooks
  inputExtensions?: ChatInputExtension[]
  onBeforeSend?: (
    draft: ComposerDraft,
  ) => Promise<ComposerDraft | { abort: true }> | ComposerDraft | { abort: true }
  // Optional external control of draft.meta if the host app wants to sync
  meta?: Record<string, unknown>
  onMetaChange?: (meta: Record<string, unknown>) => void
}

export interface AgentChatRef {
  reset: () => void
  addMessages: (
    messages: UIMessage[],
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
}


export interface UseAgentChatProps {
  agent: IAgent
  toolDefs: ToolDefinition[]
  toolExecutors?: Record<string, ToolExecutor>
  contexts?: Context[]
  initialMessages?: UIMessage[]
}

export interface UseAgentChatReturn {
  messages: UIMessage[]
  isAgentResponding: boolean
  threadId: string | null
  sendMessage: (content: string) => Promise<void>
  addToolResult: (
    result: ToolResult,
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
  addMessages: (
    messages: UIMessage[],
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
  reset: () => void
  abortAgentRun: () => void
  setMessages: (msgs: UIMessage[]) => void
  runAgent: (currentThreadId?: string) => Promise<void>
  removeMessages: (messageIds: string[]) => void
}

export interface ChatInterfaceProps {
  uiMessages: UIMessage[]
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
  input: string
  senderProps?: SenderProps
  onInputChange: (value: string) => void
  onSend: () => void
  isAgentResponding: boolean
  onAbort?: () => void
  promptsProps?: PromptsProps
  messageItemProps?: Partial<MessageItemProps>
  aboveInputComponent?: React.ReactNode
  // Extensibility hooks
  inputExtensions?: ChatInputExtension[]
  onBeforeSend?: (
    draft: ComposerDraft,
  ) => Promise<ComposerDraft | { abort: true }> | ComposerDraft | { abort: true }
  // Allow ChatInterface to send a processed draft instead of plain text
  onSendDraft?: (draft: ComposerDraft) => void
  // Optional external control of draft.meta if the host app wants to sync
  meta?: Record<string, unknown>
  onMetaChange?: (meta: Record<string, unknown>) => void
}

export interface MessageInputProps {
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  isAgentResponding: boolean
  onAbort?: () => void
  placeholder?: string
  // Slots inside input container for extensions
  insideLeftSlot?: React.ReactNode
  insideRightSlot?: React.ReactNode
  // Header/Footer rows inside the composer (tools/status)
  headerLeftSlot?: React.ReactNode
  headerRightSlot?: React.ReactNode
  footerLeftSlot?: React.ReactNode
  footerRightSlot?: React.ReactNode
  isProcessing?: boolean
  processingMessage?: string
  variant?: 'default' | 'minimal' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

export interface MessageItemProps {
  uiMessage: UIMessage
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
  className?: string
  showAvatar?: boolean
}
