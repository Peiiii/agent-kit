import type { AgentEvent, IAgent, RunAgentInput } from '@agent-labs/agent-chat'
import { EventType } from '@agent-labs/agent-chat'
import {
  AgentEventType as ToolkitEventType,
  convertOpenAIChunksToAgentEventObservable,
  type AgentEvent as ToolkitAgentEvent,
  type OpenAIChatChunk,
} from '@agent-labs/agent-toolkit'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import type { ChatCompletionChunk } from 'openai/resources/chat/completions'
import { Observable, type Subscription, type Unsubscribable } from 'rxjs'

type TextUIPart = Extract<RunAgentInput['messages'][number]['parts'][number], { type: 'text' }>

interface OpenAIBrowserAgentOptions {
  apiKey: string
  model?: string
  systemPrompt?: string
  baseUrl?: string
}

export class OpenAIBrowserAgent implements IAgent {
  private readonly client: OpenAI
  private readonly model: string
  private readonly systemPrompt?: string
  private abortController: AbortController | null = null

  constructor(options: OpenAIBrowserAgentOptions) {
    this.model = options.model ?? 'gpt-4o-mini'
    this.client = new OpenAI({
      apiKey: options.apiKey,
      dangerouslyAllowBrowser: true,
      baseURL: options.baseUrl,
    })
    this.systemPrompt = options.systemPrompt
  }

  run(input: RunAgentInput) {
    this.abortRun()

    const controller = new AbortController()
    this.abortController = controller

    const messages = this.buildMessages(input)
    const threadId = input.threadId && input.threadId.trim().length > 0 ? input.threadId : crypto.randomUUID()
    const messageId = input.runId && input.runId.trim().length > 0 ? input.runId : crypto.randomUUID()

    const streamPromise = this.client.chat.completions.create(
      {
        model: this.model,
        messages,
        stream: true,
      },
      { signal: controller.signal },
    )

    return new Observable<AgentEvent>(subscriber => {
      let innerSub: Subscription | Unsubscribable | null = null

      streamPromise
        .then(stream => {
          const normalizedStream = this.normalizeStream(stream)
          innerSub = convertOpenAIChunksToAgentEventObservable(normalizedStream, { messageId, threadId }).subscribe({
            next: event => subscriber.next(this.mapToolkitEvent(event, threadId)),
            error: error => {
              subscriber.next(this.toErrorEvent(error, threadId))
              subscriber.complete()
            },
            complete: () => {
              this.resetAbortController(controller)
              subscriber.complete()
            },
          })
        })
        .catch(error => {
          if (error instanceof Error && error.name === 'AbortError') {
            this.resetAbortController(controller)
            subscriber.complete()
            return
          }
          subscriber.next(this.toErrorEvent(error, threadId))
          this.resetAbortController(controller)
          subscriber.complete()
        })

      return () => {
        controller.abort()
        if (innerSub) {
          innerSub.unsubscribe()
        }
        this.resetAbortController(controller)
      }
    })
  }

  abortRun() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  private async *normalizeStream(stream: AsyncIterable<ChatCompletionChunk>): AsyncGenerator<OpenAIChatChunk> {
    for await (const chunk of stream) {
      const normalizedChoices = chunk.choices?.map(choice => {
        const finishReason = choice.finish_reason === 'function_call' ? 'tool_calls' : choice.finish_reason ?? undefined
        const toolCalls = choice.delta?.tool_calls?.map(tc => ({
          id: tc.id ?? undefined,
          index: tc.index,
          type: tc.type === 'function' ? 'function' as const : undefined,
          function: {
            name: tc.function?.name ?? undefined,
            arguments: tc.function?.arguments ?? undefined,
          },
        })) ?? []
        return {
          delta: {
            content: choice.delta?.content ?? undefined,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
          },
          finish_reason: finishReason,
          index: choice.index,
        }
      }) ?? []
      yield { choices: normalizedChoices }
    }
  }

  private mapToolkitEvent(event: ToolkitAgentEvent, threadId: string): AgentEvent {
    switch (event.type) {
      case ToolkitEventType.TEXT_START:
        return { type: EventType.TEXT_START, messageId: event.messageId }
      case ToolkitEventType.TEXT_DELTA:
        return { type: EventType.TEXT_DELTA, messageId: event.messageId, delta: event.delta }
      case ToolkitEventType.TEXT_END:
        return { type: EventType.TEXT_END, messageId: event.messageId }
      case ToolkitEventType.TOOL_CALL_START:
        return {
          type: EventType.TOOL_CALL_START,
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          messageId: event.messageId,
        }
      case ToolkitEventType.TOOL_CALL_ARGS:
        return { type: EventType.TOOL_CALL_ARGS, toolCallId: event.toolCallId, args: event.args }
      case ToolkitEventType.TOOL_CALL_ARGS_DELTA:
        return { type: EventType.TOOL_CALL_ARGS_DELTA, toolCallId: event.toolCallId, argsDelta: event.argsDelta }
      case ToolkitEventType.TOOL_CALL_END:
        return { type: EventType.TOOL_CALL_END, toolCallId: event.toolCallId }
      case ToolkitEventType.TOOL_CALL_RESULT:
        return { type: EventType.TOOL_CALL_RESULT, toolCallId: event.toolCallId, content: event.content }
      case ToolkitEventType.RUN_STARTED:
        return { type: EventType.RUN_STARTED, threadId }
      case ToolkitEventType.RUN_FINISHED:
        return { type: EventType.RUN_FINISHED, threadId }
      case ToolkitEventType.RUN_ERROR:
      default:
        return this.toErrorEvent(event.error ?? 'Unknown error', threadId)
    }
  }

  private resetAbortController(controller: AbortController) {
    if (this.abortController === controller) {
      this.abortController = null
    }
  }

  private buildMessages(input: RunAgentInput): ChatCompletionMessageParam[] {
    const contextText = input.context?.map(ctx => `${ctx.description}: ${ctx.value}`).join('\n\n')
    const messages: ChatCompletionMessageParam[] = []

    if (this.systemPrompt) {
      messages.push({ role: 'system', content: this.systemPrompt })
    }

    if (contextText) {
      messages.push({
        role: 'system',
        content: `Additional context for this conversation:\n${contextText}`,
      })
    }

    input.messages.forEach(msg => {
      if (msg.role === 'data') return

      const content = this.extractTextContent(msg.parts)
      if (!content) return

      const role: ChatCompletionMessageParam['role'] =
        msg.role === 'assistant' || msg.role === 'system' ? msg.role : 'user'

      messages.push({ role, content })
    })

    return messages
  }

  private extractTextContent(parts: RunAgentInput['messages'][number]['parts']): string {
    const texts = parts
      .filter((part): part is TextUIPart => part.type === 'text')
      .map(part => part.text.trim())
      .filter(Boolean)
    return texts.join('\n')
  }

  private toErrorEvent(error: unknown, threadId: string): AgentEvent {
    return {
      type: EventType.RUN_ERROR,
      error: error instanceof Error ? error.message : String(error),
      threadId,
    }
  }
}
