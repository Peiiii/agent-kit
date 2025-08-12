import {
  type BaseEvent
} from '@ag-ui/client'
import type { UIMessage } from '@ai-sdk/ui-utils'
import { BehaviorSubject, Subject } from 'rxjs'
import type { ToolCall } from '../types/agent'
import { AgentEventHandler } from './agent-event-handler'

export class AgentSessionManager {
  private messages$ = new BehaviorSubject<UIMessage[]>([])
  // 工具调用事件流
  public toolCall$ = new Subject<{ toolCall: ToolCall }>()

  private eventHandler: AgentEventHandler = new AgentEventHandler(this)

  constructor() {
    this.messages$.next([])
  }

  // 订阅消息流
  subscribeMessages(callback: (messages: UIMessage[]) => void) {
    return this.messages$.subscribe(callback)
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
  addToolResult(result: { toolCallId: string, result: unknown, status: string, error?: string }, _options?: { triggerAgent?: boolean }): void {
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
              status: result.status,
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