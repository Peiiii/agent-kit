import type { IAgent, RunAgentInput } from '@agent-labs/agent-chat'
import OpenAI from 'openai'
import { Observable, type Subscription, type Unsubscribable } from 'rxjs'
import { AgentEventType, convertOpenAIChunksToAgentEventObservable, type AgentEvent as ToolkitAgentEvent } from '../streams/openai-to-agent-event'
import { normalizeChatCompletionStream } from './normalize'
import { mapToolDefinitionsToOpenAITools, serializeUIMessagesToOpenAIChatMessages } from './serialize'
import { errorMessage, isAbortLikeError } from './utils'

export type OpenAIChatAgentOptions = {
  apiKey: string
  model?: string
  baseUrl?: string
}

export function createOpenAIChatAgent(options: OpenAIChatAgentOptions): IAgent {
  const model = options.model ?? 'gpt-4o-mini'
  const baseURL = (options.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '')

  const client = new OpenAI({
    apiKey: options.apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  })

  let abortController: AbortController | null = null

  const abortRun = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  const run = (input: RunAgentInput) => {
    abortRun()
    const controller = new AbortController()
    abortController = controller

    const threadId = input.threadId && input.threadId.trim() ? input.threadId : crypto.randomUUID()
    const messageId = input.runId && input.runId.trim() ? input.runId : crypto.randomUUID()

    const messages = serializeUIMessagesToOpenAIChatMessages({
      messages: input.messages,
      context: input.context,
    })

    const tools =
      input.tools && input.tools.length > 0
        ? mapToolDefinitionsToOpenAITools(input.tools)
        : undefined

    return new Observable<ToolkitAgentEvent>(subscriber => {
      let innerSub: Subscription | Unsubscribable | null = null

      const finishAsAborted = () => {
        subscriber.next({ type: AgentEventType.RUN_FINISHED, threadId })
        subscriber.complete()
      }

      const finishAsError = (err: unknown) => {
        subscriber.next({ type: AgentEventType.RUN_ERROR, threadId, error: errorMessage(err) })
        subscriber.complete()
      }

      client.chat.completions.create(
        {
          model,
          stream: true,
          messages,
          tools,
          tool_choice: tools ? 'auto' : undefined,
        },
        { signal: controller.signal },
      )
        .then((stream) => {
          innerSub = convertOpenAIChunksToAgentEventObservable(
            normalizeChatCompletionStream(stream as AsyncIterable<any>),
            { messageId, threadId },
          ).subscribe({
            next: evt => subscriber.next(evt),
            error: (err: unknown) => (isAbortLikeError(err) ? finishAsAborted() : finishAsError(err)),
            complete: () => subscriber.complete(),
          })
        })
        .catch((err: unknown) => {
          if (isAbortLikeError(err)) finishAsAborted()
          else finishAsError(err)
        })

      return () => {
        controller.abort()
        innerSub?.unsubscribe()
      }
    }) as unknown as ReturnType<IAgent['run']>
  }

  return { run, abortRun }
}


