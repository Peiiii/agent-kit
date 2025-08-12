import type { HttpAgent, Message } from "@ag-ui/client";
import type { UIMessage } from "@ai-sdk/ui-utils";
import type { Tool, ToolCall } from "./agent";

import {
  type BaseEvent,
  type RunAgentInput
} from '@ag-ui/client';
import type { Observer, Unsubscribable } from 'rxjs';
import type { Context, ToolDefinition, ToolResult } from '../types/agent';

export type ToolExecutor = (
  toolCall: ToolCall,
  context?: Record<string, unknown>
) => ToolResult | Promise<ToolResult>


export interface AgentChatProps {
  agent: HttpAgent
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


export interface IObservable<T> {
  subscribe: (observer: Partial<Observer<T>>) => Unsubscribable
}

export interface IAgent {
  run: (input: RunAgentInput) => IObservable<BaseEvent>
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
  // uiMessages: UIMessage[]
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
