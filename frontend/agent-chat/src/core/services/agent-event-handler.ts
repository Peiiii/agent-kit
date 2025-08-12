import { EventType, type BaseEvent, type MessagesSnapshotEvent, type StateSnapshotEvent, type TextMessageContentEvent, type TextMessageStartEvent, type ToolCallArgsEvent, type ToolCallStartEvent } from "@ag-ui/core"
import { AgentSessionManager } from "./agent-session-manager"
import type { ToolCall } from "../types"
import { v4 } from "uuid"

export class AgentEventHandler {
    private currentMessageId?: string
    private currentMessageContent: string = ''
    private currentToolCallId?: string
    private currentToolCallName?: string
    private currentToolCallArgs: string = ''

    constructor(private readonly sessionManager: AgentSessionManager) {
    }


    reset() {
        this.currentMessageId = undefined
        this.currentMessageContent = ''
        this.currentToolCallId = undefined
        this.currentToolCallName = undefined
        this.currentToolCallArgs = ''
    }

    // 推送工具调用事件到 toolCall$
    private emitToolCallEvents() {
        const currentMessages = this.sessionManager.getMessages()
        const lastMsg = currentMessages[currentMessages.length - 1]
        if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.toolCalls) return
        for (const toolCall of lastMsg.toolCalls as ToolCall[]) {
            this.sessionManager.toolCall$.next({ toolCall })
        }
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

    private handleTextMessageStart(event: TextMessageStartEvent) {
        this.currentMessageId = event.messageId
        this.currentMessageContent = ''
    }

    private handleTextMessageContent(event: TextMessageContentEvent) {
        if (!event.delta || this.currentMessageId !== event.messageId) return

        this.currentMessageContent += event.delta
        const messageContent = this.currentMessageContent
        const messageId = this.currentMessageId

        const currentMessages = this.sessionManager.getMessages()
        const lastMessage = currentMessages[currentMessages.length - 1]

        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === messageId) {
            this.sessionManager.setMessages([
                ...currentMessages.slice(0, -1),
                {
                    ...lastMessage,
                    content: messageContent
                }
            ])
        } else {
            this.sessionManager.setMessages([
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

            const currentMessages = this.sessionManager.getMessages()
            const lastMessage = currentMessages[currentMessages.length - 1]

            if (lastMessage && lastMessage.role === 'assistant') {
                this.sessionManager.setMessages(
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
                this.sessionManager.setMessages([
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
            this.sessionManager.setMessages(event.snapshot.messages)
        }
    }

    private handleMessagesSnapshot(event: MessagesSnapshotEvent) {
        if (event.messages) {
            this.sessionManager.setMessages(event.messages)
        }
    }
}