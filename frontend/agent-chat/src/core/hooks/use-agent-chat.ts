import { useRef } from 'react'
import { useValueFromBehaviorSubject } from '../hooks/use-value-from-behavior-subject'
import { AgentSessionManager } from '../services/agent-session-manager'
import type { Context, IAgent, ToolDefinition, ToolExecutor, UIMessage, UseAgentChatProps, UseAgentChatReturn } from '../types'


export const useMemoizedFn = <T extends ((...args: any[]) => any)>(fn: T) => {
  const ref = useRef<T>(null)
  const innerFn = useRef(fn)
  innerFn.current = fn
  if (!ref.current) {
    ref.current = ((...args: Parameters<typeof fn>) => {
      return innerFn.current(...args)
    }) as T
  }
  return ref.current!
}

export const useAgentSessionManager = (options: { agent: IAgent, getToolDefs: () => ToolDefinition[], getContexts: () => Context[], initialMessages: UIMessage[], getToolExecutor: (name: string) => ToolExecutor | undefined }) => {
  const { agent, getToolDefs, getContexts, initialMessages, getToolExecutor } = options
  const memoizedGetToolDefs = useMemoizedFn(getToolDefs)
  const memoizedGetContexts = useMemoizedFn(getContexts)
  const memoizedGetToolExecutor = useMemoizedFn(getToolExecutor)
  const sessionManager = useRef(new AgentSessionManager({ agent, getToolDefs: memoizedGetToolDefs, getContexts: memoizedGetContexts, getToolExecutor: memoizedGetToolExecutor }, {
    initialMessages
  }))
  return sessionManager.current
}

export const useAgentSessionManagerState = (sessionManager: AgentSessionManager) => {
  const messages = useValueFromBehaviorSubject(sessionManager.messages$)
  const isAgentResponding = useValueFromBehaviorSubject(sessionManager.isAgentResponding$)
  const threadId = useValueFromBehaviorSubject(sessionManager.threadId$)
  return {
    messages,
    isAgentResponding,
    threadId,
  }
}


export function useAgentChat({
  agent,
  toolDefs,
  toolExecutors,
  contexts = [],
  initialMessages = [],
}: UseAgentChatProps): UseAgentChatReturn {
  const sessionManager = useAgentSessionManager({ agent, getToolDefs: () => toolDefs, getContexts: () => contexts, initialMessages, getToolExecutor: (name: string) => toolExecutors?.[name] })
  const { reset,
    abortAgentRun,
    runAgent,
    handleAddToolResult: addToolResult,
    handleAddMessages: addMessages,
    handleSendMessage: sendMessage,
    setMessages,
    removeMessages } = sessionManager
  const sessionManagerState = useAgentSessionManagerState(sessionManager)
  return {
    ...sessionManagerState,
    sendMessage,
    addToolResult,
    addMessages,
    reset,
    abortAgentRun,
    setMessages,
    runAgent,
    removeMessages,
  }
}
