import { useValueFromBehaviorSubject } from '../hooks/use-value-from-behavior-subject'
import {
  EventType,
  type BaseEvent
} from '@ag-ui/client'
import type { UIMessage } from '@ai-sdk/ui-utils'
import { useCallback, useContext, useEffect, useRef } from 'react'
import type { Observable, Unsubscribable } from 'rxjs'
import { v4 } from 'uuid'
import { AgentSessionManager } from '../services/agent-session-manager'
import type { UseAgentChatProps, UseAgentChatReturn } from '../types'
import type { ToolResult } from '../types/agent'
import { convertUIMessagesToMessages } from '../utils/ui-message'
import { AgentToolExecutorManagerContext } from './use-provide-agent-tool-executors'


export function useAgentChat({
  agent,
  toolDefs,
  toolExecutors,
  contexts = [],
  initialMessages = [],
}: UseAgentChatProps): UseAgentChatReturn {

  const toolExecutorManager = useContext(AgentToolExecutorManagerContext)
  const sessionManager = useRef(new AgentSessionManager())
  const { reset } = sessionManager.current

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



  const getToolDefs = useCallback(() => {
    return toolDefs
  }, [toolDefs])

  // 记录当前订阅
  const agentRunSubscriptionRef = useRef<Unsubscribable | null>(null)
  const handleAgentResponse = useCallback((response: Observable<BaseEvent>) => {
    if (agentRunSubscriptionRef.current) {
      agentRunSubscriptionRef.current.unsubscribe()
    }
    agentRunSubscriptionRef.current = response.subscribe((event: BaseEvent) => {
      sessionManager.current.handleEvent(event)
      if (
        event.type === EventType.RUN_FINISHED ||
        event.type === EventType.RUN_ERROR
      ) {
        sessionManager.current.isAgentResponding$.next(false)
        agentRunSubscriptionRef.current = null
      }
    })
  }, [])

  const runAgent = useCallback(
    async (currentThreadId?: string) => {
      sessionManager.current.isAgentResponding$.next(true)
      try {
        let targetThreadId = currentThreadId
        if (!targetThreadId) {
          // 如果没有 threadId，创建新的 thread
          targetThreadId = v4()
          sessionManager.current.threadId$.next(targetThreadId)
        }
        const response = await agent.run({
          threadId: targetThreadId,
          runId: v4(),
          messages: convertUIMessagesToMessages(sessionManager.current.getMessages()),
          tools: getToolDefs(),
          context: contexts,
          state: {},
          forwardedProps: {},
        })
        handleAgentResponse(response as unknown as Observable<BaseEvent>)
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          // 用户主动终止
          console.info('Agent run aborted')
        } else {
          console.error('Error running agent:', error)
        }
        sessionManager.current.isAgentResponding$.next(false)
      }
    },
    [agent, toolDefs, contexts, handleAgentResponse],
  )

  // 终止 agent 响应
  const abortAgentRun = useCallback(() => {
    if (agentRunSubscriptionRef.current) {
      agentRunSubscriptionRef.current.unsubscribe()
      agentRunSubscriptionRef.current = null
      sessionManager.current.isAgentResponding$.next(false)
    }
  }, [])

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
      await runAgent(threadId || undefined)
    },
    [threadId, runAgent],
  )

  const addToolResult = useCallback(
    async (result: ToolResult, options?: { triggerAgent?: boolean }) => {
      const { triggerAgent } = options || {}
      await sessionManager.current.addToolResult(result, { triggerAgent })
      if (triggerAgent && threadId) {
        await runAgent(threadId)
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
          await runAgent(threadId || undefined)
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
          if (threadId) await runAgent(threadId)
        } catch (err) {
          sessionManager.current.addToolResult({ toolCallId: toolCall.id, result: { error: err instanceof Error ? err.message : String(err) }, state: "result" })
          if (threadId) await runAgent(threadId)
        }
      }
    })
    return () => sub.unsubscribe()
  }, [toolExecutorManager, runAgent, threadId])

  // 新增 setMessages 方法，允许外部直接设置消息列表
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
