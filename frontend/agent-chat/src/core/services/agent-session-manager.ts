import {
  type BaseEvent
} from '@ag-ui/client'
import type { UIMessage } from '@ai-sdk/ui-utils'
import { BehaviorSubject, Subject } from 'rxjs'
import type { ToolCall, ToolInvocationState, ToolResult } from '../types/agent'
import { AgentEventHandler } from './agent-event-handler'
import { useCallback } from 'react'

export class AgentSessionManager {
  messages$ = new BehaviorSubject<UIMessage[]>([])

  threadId$ = new BehaviorSubject<string | null>(null)

  isAgentResponding$ = new BehaviorSubject<boolean>(false)

  public toolCall$ = new Subject<{ toolCall: ToolCall }>()

  private eventHandler: AgentEventHandler = new AgentEventHandler(this)

  constructor(options?: {
    initialMessages?: UIMessage[],
  }) {
    const { initialMessages = [] } = options || {}
    this.messages$.next(initialMessages)
  }


  // 获取当前消息
  getMessages() {
    return this.messages$.getValue()
  }

  // 允许外部直接设置消息列表
  public setMessages(messages: UIMessage[]): void {
    this.messages$.next(messages)
  }

  handleEvent(event: BaseEvent) {
    this.eventHandler.handleEvent(event)
  }


  // 重置会话
  reset() {
    this.messages$.next([])
    this.eventHandler.reset()
    this.threadId$.next(null)
    this.isAgentResponding$.next(false)
  }

  addMessages(messages: UIMessage[]) {
    this.messages$.next([...this.getMessages(), ...messages])
  }

  removeMessages(messageIds: string[]) {
    if (messageIds.length === 0) return
    this.messages$.next(this.getMessages().filter(msg => !messageIds.includes(msg.id)))
  }

  /**
   * 添加 tool result 消息
   * @param result { toolCallId, result, status, error? }
   * @param options { triggerAgent?: boolean }
   */
  addToolResult(result: { toolCallId: string, result: unknown, state: ToolInvocationState, error?: string }, _options?: { triggerAgent?: boolean }): void {
    const targetMessage = this.getMessages().find(msg => msg.parts.find(part => part.type === "tool-invocation" && part.toolInvocation.toolCallId === result.toolCallId))
    if (!targetMessage) {
      return
    }

    const newMessage: UIMessage = {
      ...targetMessage,
      parts: targetMessage.parts.map(part => {
        if (part.type === "tool-invocation" && part.toolInvocation.toolCallId === result.toolCallId) {
          return {
            ...part,
            toolInvocation: {
              ...part.toolInvocation,
              result: result.result,
              state: result.state,
              error: result.error,
            },
          }
        }
        return part
      }),
    }
    this.messages$.next(this.getMessages().map(msg => msg.id === targetMessage.id ? newMessage : msg))
  }

} 