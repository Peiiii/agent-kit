import { v4 } from "uuid"
import { EventType, type AgentEvent, type TextDeltaEvent, type TextStartEvent, type ToolCallArgsDeltaEvent, type ToolCallStartEvent, type ToolCallArgsEvent } from "../types"
import type { UIMessage } from "../types/ui-message"
import { toolCallToToolInvocation } from "../utils"
import { AgentSessionManager } from "./agent-session-manager"

export class AgentEventHandler {
    private currentMessageId?: string
    private currentMessageContent: string = ''
    private currentToolCallId?: string
    private currentToolCallName?: string
    private currentToolCallArgs: string = ''
    // Track which tool calls have been emitted to executors to avoid duplicates
    private emittedToolCallIds = new Set<string>()

    constructor(private readonly sessionManager: AgentSessionManager) {}


    reset() {
        this.currentMessageId = undefined
        this.currentMessageContent = ''
        this.currentToolCallId = undefined
        this.currentToolCallName = undefined
        this.currentToolCallArgs = ''
        this.emittedToolCallIds.clear()
    }

    // 推送工具调用事件到 toolCall$
    private emitToolCallEvents() {
        const currentMessages = this.sessionManager.getMessages()
        const lastMsg = currentMessages[currentMessages.length - 1]
        if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.parts) return
        for (const part of lastMsg.parts) {
            if (part.type !== 'tool-invocation') continue
            const inv = part.toolInvocation
            // Only emit once when the tool call is finalized (state === 'call')
            if (inv.status === 'call' && !this.emittedToolCallIds.has(inv.toolCallId)) {
                this.emittedToolCallIds.add(inv.toolCallId)
                
                // Ensure args can be safely stringified
                let safeArgs = inv.args
                try {
                    // If args is already an object, stringify it
                    if (typeof inv.args === 'object' && inv.args !== null) {
                        JSON.stringify(inv.args) // Test if it's serializable
                    } else if (typeof inv.args === 'string') {
                        // If it's a string, try to parse it first
                        safeArgs = JSON.parse(inv.args)
                    }
                } catch (error) {
                    console.warn(`Tool call ${inv.toolCallId} has invalid args, using empty object:`, error)
                    safeArgs = {}
                }
                
                this.sessionManager.toolCall$.next({
                    toolCall: {
                        id: inv.toolCallId,
                        type: 'function',
                        function: {
                            name: inv.toolName,
                            arguments: JSON.stringify(safeArgs),
                        },
                    }
                })
            }
        }
    }

    // 处理事件
    handleEvent(event: AgentEvent) {
        console.log('[AgentSessionManager] event', event)

        switch (event.type) {
            case EventType.RUN_STARTED:
                break
            case EventType.TEXT_START:
                this.handleTextStart(event as TextStartEvent)
                break
            case EventType.TEXT_DELTA:
                this.handleTextContent(event as TextDeltaEvent)
                break
            case EventType.TEXT_END:
                this.handleTextEnd()
                break
            case EventType.TOOL_CALL_START:
                this.handleToolCallStart(event as ToolCallStartEvent)
                break
            case EventType.TOOL_CALL_ARGS_DELTA:
                this.handleToolCallArgsDelta(event as ToolCallArgsDeltaEvent)
                break
            case EventType.TOOL_CALL_ARGS:
                this.handleToolCallArgs(event as ToolCallArgsEvent)
                break
            case EventType.TOOL_CALL_END:
                this.handleToolCallEnd()
                // 检查是否有 tool call 需要自动执行，推送事件到 toolCall$
                this.emitToolCallEvents()
                break
            default:
                console.info('Unknown event type:', event.type)
                break
        }
    }

    private handleTextStart(event: TextStartEvent) {
        this.currentMessageId = event.messageId
        this.currentMessageContent = ''
    }

    private updateTextPart(message: UIMessage, text: string) {
        const lastPart = message.parts?.[message.parts.length - 1]
        if (lastPart && lastPart.type === 'text') {
            return {
                ...message,
                parts: [...(message.parts.slice(0, -1) || []), { type: 'text' as const, text }]
            }
        }
        return {
            ...message,
            parts: [...(message.parts || []), { type: 'text' as const, text }],
        }
    }

    private handleTextContent(event: TextDeltaEvent) {
        if (!event.delta || this.currentMessageId !== event.messageId) return

        this.currentMessageContent += event.delta
        const messageContent = this.currentMessageContent
        const messageId = this.currentMessageId

        const currentMessages = this.sessionManager.getMessages()
        const lastMessage = currentMessages[currentMessages.length - 1]

        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === messageId) {
            this.sessionManager.setMessages([
                ...currentMessages.slice(0, -1),
                this.updateTextPart(lastMessage, messageContent)
            ])
        } else {
            this.sessionManager.setMessages([
                ...currentMessages,
                {
                    id: messageId!,
                    role: 'assistant',
                    parts: [{
                        type: 'text',
                        text: messageContent,
                    }],
                }
            ])
        }
    }

    private handleTextEnd() {
        this.currentMessageId = undefined
        this.currentMessageContent = ''
    }

    private handleToolCallStart(event: ToolCallStartEvent) {
        this.currentToolCallId = event.toolCallId
        this.currentToolCallName = event.toolName
        this.currentToolCallArgs = ''

        // Insert an early tool-invocation part so users see immediate feedback
        const currentMessages = this.sessionManager.getMessages()
        const lastMessage = currentMessages[currentMessages.length - 1]

        const invocationPart = {
            type: 'tool-invocation' as const,
            toolInvocation: {
                state: 'partial-call' as const,
                toolCallId: this.currentToolCallId,
                toolName: this.currentToolCallName,
                // While args stream in, store raw string for preview; will be parsed on end
                args: '' as unknown as Record<string, unknown>,
            },
        }

        if (lastMessage && lastMessage.role === 'assistant') {
            this.sessionManager.setMessages([
                ...currentMessages.slice(0, -1),
                {
                    ...lastMessage,
                    parts: [...(lastMessage.parts || []), invocationPart],
                }
            ])
        } else {
            this.sessionManager.setMessages([
                ...currentMessages,
                {
                    id: v4(),
                    role: 'assistant',
                    parts: [invocationPart],
                }
            ])
        }
    }

    private handleToolCallArgsDelta(event: ToolCallArgsDeltaEvent) {
        if (this.currentToolCallId !== event.toolCallId) return
        this.currentToolCallArgs += event.argsDelta

        // Update the last tool-invocation part with streaming args
        const currentMessages = this.sessionManager.getMessages()
        const lastMessage = currentMessages[currentMessages.length - 1]
        if (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.parts?.length) return

        const updatedParts = [...lastMessage.parts]
        for (let i = updatedParts.length - 1; i >= 0; i--) {
            const part = updatedParts[i]
            if (part.type === 'tool-invocation' && part.toolInvocation.toolCallId === event.toolCallId) {
                // Try to parse the partial JSON; if it fails, keep showing the raw string
                let parsed: any = part.toolInvocation.args
                try {
                    parsed = JSON.parse(this.currentToolCallArgs)
                } catch {
                    parsed = this.currentToolCallArgs as unknown as Record<string, unknown>
                }
                updatedParts[i] = {
                    ...part,
                    toolInvocation: {
                        ...part.toolInvocation,
                        status: 'partial-call',
                        args: parsed,
                    }
                }
                break
            }
        }

        this.sessionManager.setMessages([
            ...currentMessages.slice(0, -1),
            {
                ...lastMessage,
                parts: updatedParts,
            }
        ])
    }

    private handleToolCallArgs(event: ToolCallArgsEvent) {
        if (this.currentToolCallId !== event.toolCallId) return
        this.currentToolCallArgs = event.args
        // Reuse delta handler logic to update UI
        this.handleToolCallArgsDelta({
            type: EventType.TOOL_CALL_ARGS_DELTA,
            toolCallId: event.toolCallId,
            argsDelta: '',
        })
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
                // Update the existing invocation part to finalized 'call' state with parsed args
                const updatedParts = [...(lastMessage.parts || [])]
                for (let i = updatedParts.length - 1; i >= 0; i--) {
                    const part = updatedParts[i]
                    if (part.type === 'tool-invocation' && part.toolInvocation.toolCallId === this.currentToolCallId) {
                        updatedParts[i] = {
                            ...part,
                            toolInvocation: {
                                ...toolCallToToolInvocation(toolCall),
                                status: 'call',
                            },
                        }
                        break
                    }
                }
                this.sessionManager.setMessages([
                    ...currentMessages.slice(0, -1),
                    {
                        ...lastMessage,
                        parts: updatedParts,
                    }
                ])
            } else {
                // Fallback: if no assistant message exists, create one
                this.sessionManager.setMessages([
                    ...currentMessages,
                    {
                        id: v4(),
                        role: 'assistant',
                        parts: [{
                            type: 'tool-invocation',
                            toolInvocation: {
                                ...toolCallToToolInvocation(toolCall),
                                status: 'call',
                            },
                        }],
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
}
