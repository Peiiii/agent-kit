import {
  EventType,
  type BaseEvent,
  type Message,
  type RunAgentInput
} from '@ag-ui/client'
import type { UIMessage } from '@ai-sdk/ui-utils'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Observable, Observer, Unsubscribable } from 'rxjs'
import { v4 } from 'uuid'
import type { Context, ToolDefinition, ToolResult } from '../types/agent'
import { convertMessagesToUIMessages } from '../utils/ui-message'
import { AgentSessionManager } from './agent-session-manager'
import { AgentContextManagerContext } from './use-provide-agent-contexts'
import { AgentToolDefManagerContext } from './use-provide-agent-tool-defs'
import { AgentToolExecutorManagerContext } from './use-provide-agent-tool-executors'


export interface IObservable<T> {
  subscribe: (observer: Partial<Observer<T>>) => Unsubscribable
}

export interface IAgent {
  run: (input: RunAgentInput) => IObservable<BaseEvent>
}

interface UseAgentChatProps {
  agent: IAgent
  tools: ToolDefinition[]
  contexts?: Context[]
  initialMessages?: Message[]
}

interface UseAgentChatReturn {
  messages: Message[]
  uiMessages: UIMessage[]
  isAgentResponding: boolean
  threadId: string | null
  sendMessage: (content: string) => Promise<void>
  addToolResult: (
    result: ToolResult,
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
  addMessages: (
    messages: Message[],
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
  reset: () => void
  abortAgentRun: () => void
}

export function useAgentChat({
  agent,
  tools,
  contexts = [],
  initialMessages = [],
}: UseAgentChatProps): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isAgentResponding, setIsAgentResponding] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const contextManager = useContext(AgentContextManagerContext)
  const toolDefManager = useContext(AgentToolDefManagerContext)
  const toolExecutorManager = useContext(AgentToolExecutorManagerContext)
  const sessionManager = useRef(new AgentSessionManager())

  useEffect(() => {
    const subscription = sessionManager.current.subscribeMessages(setMessages)
    return () => subscription.unsubscribe()
  }, [])

  // 初始化时添加预加载消息
  useEffect(() => {
    if (initialMessages.length > 0) {
      sessionManager.current.addMessages(initialMessages)
    }
  }, [initialMessages])

  const reset = useCallback(() => {
    sessionManager.current.reset()
    setThreadId(null)
    setIsAgentResponding(false)
  }, [])

  const getContexts = useCallback(() => {
    const dynamicContexts = contextManager.getContexts()
    return [...contexts, ...dynamicContexts]
  }, [contexts, contextManager])

  const getToolDefs = useCallback(() => {
    const dynamicToolDefs = toolDefManager.getToolDefs()
    return [...tools, ...dynamicToolDefs]
  }, [tools, toolDefManager])

  // 记录当前订阅
  const agentRunSubscriptionRef = useRef<any>(null)
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
        setIsAgentResponding(false)
        agentRunSubscriptionRef.current = null
      }
    })
  }, [])

  const runAgent = useCallback(
    async (currentThreadId?: string) => {
      setIsAgentResponding(true)
      try {
        let targetThreadId = currentThreadId
        if (!targetThreadId) {
          // 如果没有 threadId，创建新的 thread
          targetThreadId = v4()
          setThreadId(targetThreadId)
        }
        const response = await agent.run({
          threadId: targetThreadId,
          runId: v4(),
          messages: sessionManager.current.getMessages(),
          tools: getToolDefs(),
          context: getContexts(),
          state: {},
          forwardedProps: {},
        })
        handleAgentResponse(response as unknown as Observable<BaseEvent>)
      } catch (error) {
        if ((error as any)?.name === 'AbortError') {
          // 用户主动终止
          console.info('Agent run aborted')
        } else {
          console.error('Error running agent:', error)
        }
        setIsAgentResponding(false)
      }
    },
    [agent, getToolDefs, getContexts, handleAgentResponse],
  )

  // 终止 agent 响应
  const abortAgentRun = useCallback(() => {
    if (agentRunSubscriptionRef.current) {
      agentRunSubscriptionRef.current.unsubscribe()
      agentRunSubscriptionRef.current = null
      setIsAgentResponding(false)
    }
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: Message = {
        id: v4(),
        role: 'user',
        content,
      }

      sessionManager.current.addMessages([userMessage])
      await runAgent(threadId || undefined)
    },
    [threadId, runAgent],
  )

  const addToolResult = useCallback(
    async (result: ToolResult, options?: { triggerAgent?: boolean }) => {
      const { triggerAgent = true } = options || {}
      await sessionManager.current.addToolResult(result, { triggerAgent })
      if (triggerAgent && threadId) {
        await runAgent(threadId)
      }
    },
    [threadId, runAgent],
  )

  const addMessages = useCallback(
    async (messages: Message[], options?: { triggerAgent?: boolean }) => {
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
          setIsAgentResponding(false)
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
          sessionManager.current.addToolResult({ toolCallId: toolCall.id, result, status: 'success' })
          if (threadId) await runAgent(threadId)
        } catch (err) {
          sessionManager.current.addToolResult({ toolCallId: toolCall.id, result: { error: err instanceof Error ? err.message : String(err) }, status: 'error' })
          if (threadId) await runAgent(threadId)
        }
      }
    })
    return () => sub.unsubscribe()
  }, [toolExecutorManager, runAgent, threadId])

  const uiMessages = useMemo(() => {
    return convertMessagesToUIMessages(messages)
  }, [messages])

  return {
    messages,
    uiMessages,
    isAgentResponding,
    threadId,
    sendMessage,
    addToolResult,
    addMessages,
    reset,
    abortAgentRun,
  }
}
