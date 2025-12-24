import type { IAgent, RunAgentInput } from '@agent-labs/agent-chat'
import { Observable, type Subscription, type Unsubscribable } from 'rxjs'
import { convertOpenAIChunksToAgentEventObservable, type AgentEvent as ToolkitAgentEvent } from '../streams/openai-to-agent-event'
import { normalizeChatCompletionStream } from './normalize'
import { mapToolDefinitionsToOpenAITools, serializeUIMessagesToOpenAIChatMessages } from './serialize'

export type OpenAIChatAgentOptions = {
  apiKey: string
  model?: string
  baseUrl?: string
}

type OpenAIClientLike = {
  chat: {
    completions: {
      create: (
        params: {
          model: string
          stream: true
          messages: unknown
          tools?: unknown
          tool_choice?: 'auto'
        },
        opts: { signal: AbortSignal }
      ) => Promise<AsyncIterable<unknown>>
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function errorName(err: unknown): string | undefined {
  if (!isRecord(err)) return undefined
  const name = err['name']
  return typeof name === 'string' ? name : undefined
}

function isAbortLikeError(err: unknown): boolean {
  const name = errorName(err)
  return name === 'AbortError' || name === 'APIUserAbortError'
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (isRecord(err) && typeof err['message'] === 'string') return err['message']
  return String(err)
}

async function createOpenAIClient(options: { apiKey: string; baseURL: string }): Promise<OpenAIClientLike> {
  const mod = (await import('openai')) as unknown
  if (!isRecord(mod) || !('default' in mod)) {
    throw new Error('Failed to load OpenAI SDK (missing default export).')
  }
  const OpenAI = (mod as { default: unknown }).default
  if (typeof OpenAI !== 'function') {
    throw new Error('Failed to load OpenAI SDK (default export is not a constructor).')
  }

  const client = new (OpenAI as unknown as new (opts: Record<string, unknown>) => OpenAIClientLike)({
    apiKey: options.apiKey,
    baseURL: options.baseURL,
    dangerouslyAllowBrowser: true,
  })

  return client
}

export function createOpenAIChatAgent(options: OpenAIChatAgentOptions): IAgent {
  const model = options.model ?? 'gpt-4o-mini'
  const baseURL = (options.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '')

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
        subscriber.next({ type: 'RUN_FINISHED', threadId })
        subscriber.complete()
      }

      const finishAsError = (err: unknown) => {
        subscriber.next({ type: 'RUN_ERROR', threadId, error: errorMessage(err) })
        subscriber.complete()
      }

      createOpenAIClient({ apiKey: options.apiKey, baseURL })
        .then(client =>
          client.chat.completions.create(
            {
              model,
              stream: true,
              messages,
              tools,
              tool_choice: tools ? 'auto' : undefined,
            },
            { signal: controller.signal },
          ),
        )
        .then(stream => {
          innerSub = convertOpenAIChunksToAgentEventObservable(
            normalizeChatCompletionStream(stream as AsyncIterable<any>),
            { messageId, threadId },
          ).subscribe({
            next: evt => subscriber.next(evt),
            error: err => (isAbortLikeError(err) ? finishAsAborted() : finishAsError(err)),
            complete: () => subscriber.complete(),
          })
        })
        .catch(err => {
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

