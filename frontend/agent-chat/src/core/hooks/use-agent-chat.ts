import type { UIMessage } from '@ai-sdk/ui-utils'
import { useCallback, useContext, useEffect, useRef } from 'react'
import { v4 } from 'uuid'
import { useValueFromBehaviorSubject } from '../hooks/use-value-from-behavior-subject'
import { AgentSessionManager } from '../services/agent-session-manager'
import type { UseAgentChatProps, UseAgentChatReturn } from '../types'
import type { ToolResult } from '../types/agent'
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

  const sessionManager = useRef(new AgentSessionManager({ agent, getToolDefs: memoizedGetToolDefs, getContexts: memoizedGetContexts }))
  const { reset, abortAgentRun, runAgent } = sessionManager.current

  const messages = useValueFromBehaviorSubject(sessionManager.current.messages$)
  const isAgentResponding = useValueFromBehaviorSubject(sessionManager.current.isAgentResponding$)
  const threadId = useValueFromBehaviorSubject(sessionManager.current.threadId$)

  useEffect(() => {
    if (initialMessages.length > 0) {
      sessionManager.current.addMessages(initialMessages)
    }
    return () => {
      sessionManager.current.removeMessages(initialMessages.map(msg => msg.id))
    }
  }, [initialMessages])


  useEffect(() => {
    if (toolExecutors && Object.keys(toolExecutors).length > 0) {
      const removeExecutors = toolExecutorManager.addToolExecutors(toolExecutors)
      return () => {
        removeExecutors()
      }
    }
  }, [toolExecutorManager, toolExecutors])



  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      sessionManager.current.addMessages([{
        id: v4(),
        role: 'user',
        content,
        parts: [{
          type: 'text',
          text: content,
        }],
      }])
      await runAgent()
    },
    [threadId, runAgent],
  )

  const addToolResult = useCallback(
    async (result: ToolResult, options?: { triggerAgent?: boolean }) => {
      const { triggerAgent } = options || {}
      await sessionManager.current.addToolResult(result, { triggerAgent })
      if (triggerAgent && threadId) {
        await runAgent()
      }
    },
    [threadId, runAgent],
  )

  const addMessages = useCallback(
    async (messages: UIMessage[], options?: { triggerAgent?: boolean }) => {
      const { triggerAgent = true } = options || {}
      console.log('[useAgentChat] addMessages', messages)

      try {
        sessionManager.current.addMessages(messages)

        if (triggerAgent) {
          await runAgent()
        }
      } catch (error) {
        console.error('Error adding messages:', error)
        if (triggerAgent) {
          sessionManager.current.isAgentResponding$.next(false)
        }
      }
    },
    [threadId, runAgent],
  )

  // 自动工具执行与 agent 触发
  useEffect(() => {
    const sub = sessionManager.current.toolCall$.subscribe(async ({ toolCall }) => {
      const executor = toolExecutorManager.getToolExecutor(toolCall.function.name)
      if (executor) {
        try {
          const result = await executor(toolCall)
          sessionManager.current.addToolResult({ toolCallId: toolCall.id, result, state: "result" })
          if (threadId) await runAgent()
        } catch (err) {
          sessionManager.current.addToolResult({ toolCallId: toolCall.id, result: { error: err instanceof Error ? err.message : String(err) }, state: "result" })
          if (threadId) await runAgent()
        }
      }
    })
    return () => sub.unsubscribe()
  }, [toolExecutorManager, runAgent, threadId])

  const setMessagesExternal = useCallback((msgs: UIMessage[]) => {
    sessionManager.current.setMessages(msgs)
  }, [])

  const removeMessages = useCallback((messageIds: string[]) => {
    sessionManager.current.removeMessages(messageIds)
  }, [])

  return {
    messages,
    isAgentResponding,
    threadId,
    sendMessage,
    addToolResult,
    addMessages,
    reset,
    abortAgentRun,
    setMessages: setMessagesExternal,
    runAgent,
    removeMessages,
  }
}
