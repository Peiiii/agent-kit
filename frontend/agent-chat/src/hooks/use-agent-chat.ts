import {
  EventType,
  type BaseEvent,
  type HttpAgent,
  type Message,
  type MessagesSnapshotEvent,
  type StateSnapshotEvent,
  type TextMessageContentEvent,
  type TextMessageStartEvent,
  type ToolCallArgsEvent,
  type ToolCallStartEvent,
} from '@ag-ui/client'
import { useCallback, useContext, useState } from 'react'
import { v4 } from 'uuid'
import type { Context, ToolDefinition, ToolResult } from '../types'
import { AgentContextManagerContext } from './use-provide-agent-contexts'
import { AgentToolDefManagerContext } from './use-provide-agent-tool-defs'
import type { Observable } from 'rxjs'

interface UseAgentChatProps {
  agent: HttpAgent
  tools: ToolDefinition[]
  staticContext?: Context[]
}

interface UseAgentChatReturn {
  messages: Message[]
  isLoading: boolean
  threadId: string | null
  sendMessage: (content: string) => Promise<void>
  sendToolResult: (result: ToolResult) => Promise<void>
  reset: () => void
}

export function useAgentChat({
  agent,
  tools,
  staticContext = [],
}: UseAgentChatProps): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const contextManager = useContext(AgentContextManagerContext)
  const toolDefManager = useContext(AgentToolDefManagerContext)

  const reset = useCallback(() => {
    setMessages([])
    setThreadId(null)
    setIsLoading(false)
  }, [])

  const getContexts = useCallback(() => {
    const dynamicContexts = contextManager.getContexts()
    return [...staticContext, ...dynamicContexts]
  }, [staticContext, contextManager])

  const getToolDefs = useCallback(() => {
    const dynamicToolDefs = toolDefManager.getToolDefs()
    return [...tools, ...dynamicToolDefs]
  }, [tools, toolDefManager])

  const handleAgentResponse = useCallback((response: Observable<BaseEvent>) => {
    let currentMessageId: string | undefined
    let currentMessageContent = ''
    let startEvent: TextMessageStartEvent
    let contentEvent: TextMessageContentEvent
    let stateEvent: StateSnapshotEvent
    let messagesEvent: MessagesSnapshotEvent
    let toolCallStartEvent: ToolCallStartEvent
    let toolCallArgsEvent: ToolCallArgsEvent
    let currentToolCallId: string | undefined
    let currentToolCallArgs = ''
    let currentToolCallName: string | undefined

    response.subscribe((event: BaseEvent) => {
      switch (event.type) {
        case EventType.RUN_STARTED:
          break
        case EventType.TEXT_MESSAGE_START:
          startEvent = event as TextMessageStartEvent
          currentMessageId = startEvent.messageId
          currentMessageContent = ''
          break
        case EventType.TEXT_MESSAGE_CONTENT:
          contentEvent = event as TextMessageContentEvent
          if (
            contentEvent.delta &&
            currentMessageId === contentEvent.messageId
          ) {
            currentMessageContent += contentEvent.delta
            setMessages((prev) => {
              const newMessages = [...prev]
              const lastMessage = newMessages.at(-1)
              if (
                lastMessage &&
                lastMessage.role === 'assistant' &&
                lastMessage.id === currentMessageId
              ) {
                lastMessage.content = currentMessageContent
                return newMessages
              }
              return [
                ...prev,
                {
                  id: currentMessageId!,
                  content: currentMessageContent,
                  role: 'assistant',
                },
              ]
            })
          }
          break
        case EventType.TEXT_MESSAGE_END:
          currentMessageId = undefined
          currentMessageContent = ''
          break
        case EventType.TOOL_CALL_START:
          toolCallStartEvent = event as ToolCallStartEvent
          currentToolCallId = toolCallStartEvent.toolCallId
          currentToolCallName = toolCallStartEvent.toolCallName
          currentToolCallArgs = ''
          break
        case EventType.TOOL_CALL_ARGS:
          toolCallArgsEvent = event as ToolCallArgsEvent
          if (currentToolCallId === toolCallArgsEvent.toolCallId) {
            currentToolCallArgs += toolCallArgsEvent.delta
          }
          break
        case EventType.TOOL_CALL_END:
          if (currentToolCallId && currentToolCallName) {
            try {
              const toolCall = {
                id: currentToolCallId,
                type: 'function' as const,
                function: {
                  name: currentToolCallName,
                  arguments: currentToolCallArgs,
                },
              }
              setMessages((prev) => {
                const newMessages = [...prev]
                const lastMessage = newMessages.at(-1)
                if (lastMessage && lastMessage.role === 'assistant') {
                  if (!lastMessage.toolCalls) {
                    lastMessage.toolCalls = []
                  }
                  lastMessage.toolCalls.push(toolCall)
                  return [...newMessages]
                }
                return [
                  ...prev,
                  {
                    id: v4(),
                    role: 'assistant',
                    toolCalls: [toolCall],
                  },
                ]
              })
            } catch (error) {
              console.error('Error parsing tool call args:', error)
            }
          }
          currentToolCallId = undefined
          currentToolCallName = undefined
          currentToolCallArgs = ''
          break
        case EventType.RUN_FINISHED:
        case EventType.RUN_ERROR:
          setIsLoading(false)
          break
        case EventType.STATE_SNAPSHOT:
          stateEvent = event as StateSnapshotEvent
          if (stateEvent.snapshot?.messages) {
            setMessages(stateEvent.snapshot.messages)
          }
          break
        case EventType.MESSAGES_SNAPSHOT:
          messagesEvent = event as MessagesSnapshotEvent
          if (messagesEvent.messages) {
            setMessages(messagesEvent.messages)
          }
          break
        default:
          console.info('Unknown event type:', event.type)
          break
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

        setMessages((prev) => [...prev, userMessage])

        if (!threadId) {
          const newThreadId = v4()
          setThreadId(newThreadId)
          const response = await agent.run({
            threadId: newThreadId,
            runId: v4(),
            messages: [...messages, userMessage],
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
            messages: [...messages, userMessage],
            tools,
            context: getContexts(),
            state: {},
            forwardedProps: {},
          })
          handleAgentResponse(response as unknown as Observable<BaseEvent>)
        }
      } catch (error) {
        console.error('Error sending message:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [
      threadId,
      agent,
      messages,
      getToolDefs,
      getContexts,
      handleAgentResponse,
      tools,
    ],
  )

  const sendToolResult = useCallback(
    async (result: ToolResult) => {
      if (!threadId) return

      try {
        const toolMessage: Message = {
          id: v4(),
          role: 'tool',
          content: JSON.stringify(result.result),
          toolCallId: result.toolCallId,
        }

        setMessages((prev) => [...prev, toolMessage])

        const response = await agent.run({
          threadId,
          runId: v4(),
          messages: [...messages, toolMessage],
          tools,
          context: getContexts(),
          state: {},
          forwardedProps: {},
        })
        handleAgentResponse(response as unknown as Observable<BaseEvent>)
      } catch (error) {
        console.error('Error handling tool result:', error)
      }
    },
    [agent, threadId, tools, handleAgentResponse, messages, getContexts],
  )

  return {
    messages,
    isLoading,
    threadId,
    sendMessage,
    sendToolResult,
    reset,
  }
}
