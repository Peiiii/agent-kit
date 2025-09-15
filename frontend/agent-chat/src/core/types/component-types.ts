import type { Context, ToolDefinition, ToolResult } from './agent';
import type { IAgent, Tool, ToolCall, ToolRenderer } from "./agent";
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
  agent: IAgent
  tools?: Tool[]
  contexts?: Array<{ description: string; value: string }>
  initialMessages?: UIMessage[]
  className?: string
  senderProps?: SenderProps
  promptsProps?: PromptsProps
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
}
export interface MessageInputProps {
  input: string
  onInputChange: (v: string) => void
  onSend: () => void
  isAgentResponding: boolean
  onAbort?: () => void
}

