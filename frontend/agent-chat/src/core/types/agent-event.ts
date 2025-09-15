

export  enum EventType {
    TEXT_START = "TEXT_START",
    TEXT_DELTA = "TEXT_DELTA",
    TEXT_END = "TEXT_END",
    TOOL_CALL_START = "TOOL_CALL_START",
    TOOL_CALL_ARGS = "TOOL_CALL_ARGS",
    TOOL_CALL_ARGS_DELTA = "TOOL_CALL_ARGS_DELTA",
    TOOL_CALL_END = "TOOL_CALL_END",
    TOOL_CALL_RESULT = "TOOL_CALL_RESULT",
    RUN_STARTED = "RUN_STARTED",
    RUN_FINISHED = "RUN_FINISHED",
    RUN_ERROR = "RUN_ERROR",
}
export interface BaseAgentEvent {
    type: EventType
}

export interface TextStartEvent extends BaseAgentEvent {
    type: EventType.TEXT_START
    messageId: string

}

export interface TextDeltaEvent extends BaseAgentEvent {
    type: EventType.TEXT_DELTA
    messageId: string
    delta: string
}

export interface TextEndEvent extends BaseAgentEvent {
    type: EventType.TEXT_END
    messageId: string
}

export interface ToolCallStartEvent extends BaseAgentEvent {
    type: EventType.TOOL_CALL_START
    messageId?: string
    toolCallId: string
    toolName: string
}

export interface ToolCallArgsEvent extends BaseAgentEvent {
    type: EventType.TOOL_CALL_ARGS
    toolCallId: string
    args: string
}

export interface ToolCallArgsDeltaEvent extends BaseAgentEvent {
    type: EventType.TOOL_CALL_ARGS_DELTA
    toolCallId: string
    argsDelta: string
}

export interface ToolCallEndEvent extends BaseAgentEvent {
    type: EventType.TOOL_CALL_END
    toolCallId: string
}

export interface ToolCallResultEvent extends BaseAgentEvent {
    type: EventType.TOOL_CALL_RESULT
    toolCallId: string
    content: unknown
}

export interface RunStartedEvent extends BaseAgentEvent {
    type: EventType.RUN_STARTED
    threadId?: string
}

export interface RunFinishedEvent extends BaseAgentEvent {
    type: EventType.RUN_FINISHED
    threadId?: string
}

export interface RunErrorEvent extends BaseAgentEvent {
    type: EventType.RUN_ERROR
    error?: string
    threadId?: string
}

export type AgentEvent = TextStartEvent | TextDeltaEvent | TextEndEvent | ToolCallStartEvent | ToolCallArgsEvent | ToolCallArgsDeltaEvent | ToolCallEndEvent | ToolCallResultEvent | RunStartedEvent | RunFinishedEvent | RunErrorEvent