import {
  EventType,
  type BaseEvent,
  type HttpAgent,
  type Message,
} from '@ag-ui/client'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
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
}

interface UseAgentChatReturn {
  messages: Message[]
  isLoading: boolean
  threadId: string | null
  sendMessage: (content: string) => Promise<void>
  addToolResult: (
    result: ToolResult,
    options?: { triggerAgent?: boolean },
  ) => Promise<void>
  reset: () => void
}

export function useAgentChat({
  agent,
  tools,
  contexts = [],
}: UseAgentChatProps): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const contextManager = useContext(AgentContextManagerContext)
  const toolDefManager = useContext(AgentToolDefManagerContext)
  const sessionManager = useRef(new AgentSessionManager())

  useEffect(() => {
    const subscription = sessionManager.current.subscribeMessages(setMessages)
    return () => subscription.unsubscribe()
  }, [])

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

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setIsLoading(true)
      try {
        const userMessage: Message = {
          id: v4(),
          role: 'user',
          content,
        }

        sessionManager.current.addMessages([userMessage])

        if (!threadId) {
          const newThreadId = v4()
          setThreadId(newThreadId)
          const response = await agent.run({
            threadId: newThreadId,
            runId: v4(),
            messages: sessionManager.current.getMessages(),
            tools: getToolDefs(),
            context: getContexts(),
            state: {},
            forwardedProps: {},
          })
          handleAgentResponse(response as unknown as Observable<BaseEvent>)
        } else {
          const response = await agent.run({
            threadId,
            runId: v4(),
            messages: sessionManager.current.getMessages(),
            tools,
            context: getContexts(),
            state: {},
            forwardedProps: {},
          })
          handleAgentResponse(response as unknown as Observable<BaseEvent>)
        }
      } catch (error) {
        console.error('Error sending message:', error)
        setIsLoading(false)
      }
    },
    [threadId, agent, getToolDefs, getContexts, handleAgentResponse, tools],
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
          const response = await agent.run({
            threadId,
            runId: v4(),
            messages: sessionManager.current.getMessages(),
            tools,
            context: getContexts(),
            state: {},
            forwardedProps: {},
          })
          handleAgentResponse(response as unknown as Observable<BaseEvent>)
        }
      } catch (error) {
        console.error('Error handling tool result:', error)
      }
    },
    [agent, threadId, tools, handleAgentResponse, getContexts],
  )

  return {
    messages,
    isLoading,
    threadId,
    sendMessage,
    addToolResult,
    reset,
  }
}
