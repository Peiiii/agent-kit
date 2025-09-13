import {
  BaseEvent,
  EventType,
  HttpAgent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  TextMessageStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  ToolCallStartEvent,
} from '@ag-ui/client'
import { AgentEvent, EventType as AgentEventType } from '@agent-labs/agent-chat'
import { EMPTY, map, Subscribable } from 'rxjs'

export class MappedHttpAgent {
  private agent: HttpAgent
  constructor(...args: ConstructorParameters<typeof HttpAgent>) {
    this.agent = new HttpAgent(...args)
  }

  run(...args: Parameters<HttpAgent['run']>): Subscribable<AgentEvent> {
    console.log('[mapped-http-agent] run', args)
    return this.agent.run(...args).pipe(map(this.mapEvent))
  }

  private mapEvent = (event: BaseEvent): AgentEvent | typeof EMPTY => {
    console.log('[mapped-http-agent] event', event)
    if (event.type === EventType.TEXT_MESSAGE_START) {
      const typedEvent = event as TextMessageStartEvent
      return {
        type: AgentEventType.TEXT_START,
        messageId: typedEvent.messageId,
      }
    } else if (event.type === EventType.TEXT_MESSAGE_CONTENT) {
      const typedEvent = event as TextMessageContentEvent
      return {
        type: AgentEventType.TEXT_DELTA,
        messageId: typedEvent.messageId,
        delta: typedEvent.delta,
      }
    } else if (event.type === EventType.TEXT_MESSAGE_END) {
      const typedEvent = event as TextMessageEndEvent
      return {
        type: AgentEventType.TEXT_END,
        messageId: typedEvent.messageId,
      }
    } else if (event.type === EventType.TOOL_CALL_START) {
      const typedEvent = event as ToolCallStartEvent
      return {
        type: AgentEventType.TOOL_CALL_START,
        messageId: typedEvent.parentMessageId,
        toolName: typedEvent.toolCallName,
        toolCallId: typedEvent.toolCallId,
      }
    } else if (event.type === EventType.TOOL_CALL_ARGS) {
      const typedEvent = event as ToolCallArgsEvent
      return {
        type: AgentEventType.TOOL_CALL_ARGS_DELTA,
        toolCallId: typedEvent.toolCallId,
        argsDelta: typedEvent.delta,
      }
    } else if (event.type === EventType.TOOL_CALL_END) {
      const typedEvent = event as ToolCallEndEvent
      return {
        type: AgentEventType.TOOL_CALL_END,
        toolCallId: typedEvent.toolCallId,
      }
    } else if (event.type === EventType.TOOL_CALL_RESULT) {
      const typedEvent = event as ToolCallResultEvent
      return {
        type: AgentEventType.TOOL_CALL_RESULT,
        toolCallId: typedEvent.toolCallId,
        content: typedEvent.content,
      }
    } else if (event.type === EventType.RUN_STARTED) {
      return {
        type: AgentEventType.RUN_STARTED,
      }
    } else if (event.type === EventType.RUN_FINISHED) {
      return {
        type: AgentEventType.RUN_FINISHED,
      }
    } else if (event.type === EventType.RUN_ERROR) {
      return {
        type: AgentEventType.RUN_ERROR,
      }
    }
    return EMPTY
  }
}
