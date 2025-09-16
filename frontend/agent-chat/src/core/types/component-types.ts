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
}

export interface MessageInputProps {
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  isAgentResponding: boolean
  onAbort?: () => void
}

export interface MessageItemProps {
  uiMessage: UIMessage
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
  className?: string
  showAvatar?: boolean
}

