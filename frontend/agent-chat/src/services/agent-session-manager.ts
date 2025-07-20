import {
  EventType,
  type BaseEvent,
  type Message,
  type MessagesSnapshotEvent,
  type StateSnapshotEvent,
  type TextMessageContentEvent,
  type TextMessageStartEvent,
  type ToolCallArgsEvent,
  type ToolCallStartEvent,
} from '@ag-ui/client'
import { BehaviorSubject, Subject } from 'rxjs'
import { v4 } from 'uuid'
import type { ToolCall } from '../types/agent'

export class AgentSessionManager {
  private messages$ = new BehaviorSubject<Message[]>([])
  private currentMessageId?: string
  private currentMessageContent: string = ''
  private currentToolCallId?: string
  private currentToolCallName?: string
  private currentToolCallArgs: string = ''
  // 工具调用事件流
  public toolCall$ = new Subject<{ toolCall: ToolCall}>()

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


  // 处理事件
  handleEvent(event: BaseEvent) {
    console.log('[AgentSessionManager] event', event)
    
    switch (event.type) {
      case EventType.RUN_STARTED:
        break
      case EventType.TEXT_MESSAGE_START:
        this.handleTextMessageStart(event as TextMessageStartEvent)
        break
      case EventType.TEXT_MESSAGE_CONTENT:
        this.handleTextMessageContent(event as TextMessageContentEvent)
        break
      case EventType.TEXT_MESSAGE_END:
        this.handleTextMessageEnd()
        break
      case EventType.TOOL_CALL_START:
        this.handleToolCallStart(event as ToolCallStartEvent)
        break
      case EventType.TOOL_CALL_ARGS:
        this.handleToolCallArgs(event as ToolCallArgsEvent)
        break
      case EventType.TOOL_CALL_END:
        this.handleToolCallEnd()
        // 检查是否有 tool call 需要自动执行，推送事件到 toolCall$
        this.emitToolCallEvents()
        break
      case EventType.STATE_SNAPSHOT:
        this.handleStateSnapshot(event as StateSnapshotEvent)
        break
      case EventType.MESSAGES_SNAPSHOT:
        this.handleMessagesSnapshot(event as MessagesSnapshotEvent)
        break
      default:
        console.info('Unknown event type:', event.type)
        break
    }
  }

  // 推送工具调用事件到 toolCall$
  private emitToolCallEvents() {
    const currentMessages = this.getMessages()
    const lastMsg = currentMessages[currentMessages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.toolCalls) return
    for (const toolCall of lastMsg.toolCalls as ToolCall[]) {
      this.toolCall$.next({ toolCall })
    }
  }

  private handleTextMessageStart(event: TextMessageStartEvent) {
    this.currentMessageId = event.messageId
    this.currentMessageContent = ''
  }

  private handleTextMessageContent(event: TextMessageContentEvent) {
    if (!event.delta || this.currentMessageId !== event.messageId) return

    this.currentMessageContent += event.delta
    const messageContent = this.currentMessageContent
    const messageId = this.currentMessageId

    const currentMessages = this.messages$.getValue()
    const lastMessage = currentMessages[currentMessages.length - 1]

    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === messageId) {
      this.messages$.next([
        ...currentMessages.slice(0, -1),
        {
          ...lastMessage,
          content: messageContent
        }
      ])
    } else {
      this.messages$.next([
        ...currentMessages,
        {
          id: messageId!,
          content: messageContent,
          role: 'assistant',
        }
      ])
    }
  }

  private handleTextMessageEnd() {
    this.currentMessageId = undefined
    this.currentMessageContent = ''
  }

  private handleToolCallStart(event: ToolCallStartEvent) {
    this.currentToolCallId = event.toolCallId
    this.currentToolCallName = event.toolCallName
    this.currentToolCallArgs = ''
  }

  private handleToolCallArgs(event: ToolCallArgsEvent) {
    if (this.currentToolCallId === event.toolCallId) {
      this.currentToolCallArgs += event.delta
    }
  }

  private handleToolCallEnd() {
    if (!this.currentToolCallId || !this.currentToolCallName) return

    try {
      const toolCall = {
        id: this.currentToolCallId,
        type: 'function' as const,
        function: {
          name: this.currentToolCallName,
          arguments: this.currentToolCallArgs,
        },
      }

      const currentMessages = this.messages$.getValue()
      const lastMessage = currentMessages[currentMessages.length - 1]

      if (lastMessage && lastMessage.role === 'assistant') {
        this.messages$.next(
          currentMessages.map((msg, index) => {
            if (index === currentMessages.length - 1 && msg.role === 'assistant') {
              return {
                ...msg,
                toolCalls: [...(msg.toolCalls || []), toolCall]
              }
            }
            return msg
          })
        )
      } else {
        this.messages$.next([
          ...currentMessages,
          {
            id: v4(),
            role: 'assistant',
            toolCalls: [toolCall],
          }
        ])
      }
    } catch (error) {
      console.error('Error parsing tool call args:', error)
    }

    this.currentToolCallId = undefined
    this.currentToolCallName = undefined
    this.currentToolCallArgs = ''
  }

  private handleStateSnapshot(event: StateSnapshotEvent) {
    if (event.snapshot?.messages) {
      this.messages$.next(event.snapshot.messages)
    }
  }

  private handleMessagesSnapshot(event: MessagesSnapshotEvent) {
    if (event.messages) {
      this.messages$.next(event.messages)
    }
  }

  // 重置会话
  reset() {
    this.messages$.next([])
    this.currentMessageId = undefined
    this.currentMessageContent = ''
    this.currentToolCallId = undefined
    this.currentToolCallName = undefined
    this.currentToolCallArgs = ''
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