import { useContext, useEffect, useRef } from 'react'
import { useValueFromBehaviorSubject } from '../hooks/use-value-from-behavior-subject'
import { AgentSessionManager } from '../services/agent-session-manager'
import type { UseAgentChatProps, UseAgentChatReturn } from '../types'
import { AgentToolExecutorManagerContext } from './use-provide-agent-tool-executors'


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

export function useAgentChat({
  agent,
  toolDefs,
  toolExecutors,
  contexts = [],
  initialMessages = [],
}: UseAgentChatProps): UseAgentChatReturn {

  const toolExecutorManager = useContext(AgentToolExecutorManagerContext)
  const memoizedGetToolDefs = useMemoizedFn(() => toolDefs)
  const memoizedGetContexts = useMemoizedFn(() => contexts)

  const sessionManager = useRef(new AgentSessionManager({ agent, getToolDefs: memoizedGetToolDefs, getContexts: memoizedGetContexts }, {
    initialMessages
  }))
  const { reset,
    abortAgentRun,
    runAgent,
    handleAddToolResult: addToolResult,
    handleAddMessages: addMessages,
    handleSendMessage: sendMessage,
    setMessages,
    removeMessages } = sessionManager.current

  const messages = useValueFromBehaviorSubject(sessionManager.current.messages$)
  const isAgentResponding = useValueFromBehaviorSubject(sessionManager.current.isAgentResponding$)
  const threadId = useValueFromBehaviorSubject(sessionManager.current.threadId$)

  useEffect(() => {
    if (toolExecutors && Object.keys(toolExecutors).length > 0) {
      return toolExecutorManager.addToolExecutors(toolExecutors)
    }
  }, [toolExecutorManager, toolExecutors])

  useEffect(() => sessionManager.current.connectToolExecutor(toolExecutorManager), [toolExecutorManager])

  return {
    messages,
    isAgentResponding,
    threadId,
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
