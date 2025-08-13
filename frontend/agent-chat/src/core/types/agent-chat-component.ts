import type { UIMessage } from "@ai-sdk/ui-utils";
import type { Tool, ToolCall, ToolRenderer } from "./agent";

import {
  type BaseEvent,
  type RunAgentInput
} from '@ag-ui/client';
import type { Subscribable } from "rxjs";
import type { Context, ToolDefinition, ToolResult } from '../types/agent';

export type ToolExecutor = (
  toolCall: ToolCall,
  context?: Record<string, unknown>
) => ToolResult | Promise<ToolResult>


export interface AgentChatProps {
  agent: IAgent
  tools?: Tool[]
  contexts?: Array<{ description: string; value: string }>
  initialMessages?: UIMessage[]
  className?: string
}

export interface AgentChatRef {
  reset: () => void
  addMessages: (
    messages: UIMessage[],
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
}


export interface IAgent {
  run: (input: RunAgentInput) => Subscribable<BaseEvent>
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
  onInputChange: (value: string) => void
  onSend: () => void
  isAgentResponding: boolean
  onAbort?: () => void
}

