import { convertMessagesToUIMessages } from '../utils/ui-message'
import {
  EventType,
  type BaseEvent,
  type HttpAgent,
  type Message,
} from '@ag-ui/client'
import type { UIMessage } from '@ai-sdk/ui-utils'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Observable } from 'rxjs'
import { v4 } from 'uuid'
import type { Context, ToolDefinition, ToolResult } from '../types/agent'
import { AgentSessionManager } from './agent-session-manager'
import { AgentContextManagerContext } from './use-provide-agent-contexts'
import { AgentToolDefManagerContext } from './use-provide-agent-tool-defs'

interface UseAgentChatProps {
  agent: HttpAgent
  tools: ToolDefinition[]
  contexts?: Context[]
  initialMessages?: Message[]
}

interface UseAgentChatReturn {
  messages: Message[]
  uiMessages: UIMessage[]
  isLoading: boolean
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
}

export function useAgentChat({
  agent,
  tools,
  contexts = [],
  initialMessages = [],
}: UseAgentChatProps): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const contextManager = useContext(AgentContextManagerContext)
  const toolDefManager = useContext(AgentToolDefManagerContext)
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
    setIsLoading(false)
  }, [])

  const getContexts = useCallback(() => {
    const dynamicContexts = contextManager.getContexts()
    return [...contexts, ...dynamicContexts]
  }, [contexts, contextManager])

  const getToolDefs = useCallback(() => {
    const dynamicToolDefs = toolDefManager.getToolDefs()
    return [...tools, ...dynamicToolDefs]
  }, [tools, toolDefManager])

  const handleAgentResponse = useCallback((response: Observable<BaseEvent>) => {
    response.subscribe((event: BaseEvent) => {
      sessionManager.current.handleEvent(event)

      if (
        event.type === EventType.RUN_FINISHED ||
        event.type === EventType.RUN_ERROR
      ) {
        setIsLoading(false)
      }
    })
  }, [])

  const runAgent = useCallback(
    async (currentThreadId?: string) => {
      setIsLoading(true)
      
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
        console.error('Error running agent:', error)
        setIsLoading(false)
      }
    },
    [agent, getToolDefs, getContexts, handleAgentResponse],
  )

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

      if (!threadId) return

      try {
        const toolMessage: Message = {
          id: v4(),
          role: 'tool',
          content: JSON.stringify(result.result),
          toolCallId: result.toolCallId,
        }

        sessionManager.current.addMessages([toolMessage])

        if (triggerAgent) {
          await runAgent(threadId)
        }
      } catch (error) {
        console.error('Error handling tool result:', error)
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
          setIsLoading(false)
        }
      }
    },
    [threadId, runAgent],
  )

  const uiMessages = useMemo(() => {
    return convertMessagesToUIMessages(messages)
  }, [messages])

  return {
    messages,
    uiMessages,
    isLoading,
    threadId,
    sendMessage,
    addToolResult,
    addMessages,
    reset,
  }
}
