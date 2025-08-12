import {
  type BaseEvent,
  type Message
} from '@ag-ui/client'
import { BehaviorSubject, Subject } from 'rxjs'
import { v4 } from 'uuid'
import type { ToolCall } from '../types/agent'
import { AgentEventHandler } from './agent-event-handler'

export class AgentSessionManager {
  private messages$ = new BehaviorSubject<Message[]>([])
  // 工具调用事件流
  public toolCall$ = new Subject<{ toolCall: ToolCall }>()

  private eventHandler: AgentEventHandler = new AgentEventHandler(this)

  constructor() {
    this.messages$.next([])
  }

  // 订阅消息流
  subscribeMessages(callback: (messages: Message[]) => void) {
    return this.messages$.subscribe(callback)
  }

  // 获取当前消息
  getMessages() {
    return this.messages$.getValue()
  }

  // 允许外部直接设置消息列表
  public setMessages(messages: Message[]): void {
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

  addMessages(messages: Message[]) {
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
    this.messages$.next([
      ...this.getMessages(),
      {
        id: v4(),
        role: 'tool',
        content: typeof result.result === 'string' ? result.result : JSON.stringify(result.result),
        toolCallId: result.toolCallId,
      },
    ])
  }
} 