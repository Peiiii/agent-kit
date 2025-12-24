import type { OpenAIChatChunk } from '../streams/openai-to-agent-event'

type ToolCallDeltaLike = {
  id?: string | null
  index: number
  type?: string | null
  function?: { name?: string | null; arguments?: string | null } | null
}

type ChoiceDeltaLike = {
  content?: string | null
  tool_calls?: ToolCallDeltaLike[] | null
}

type ChoiceLike = {
  delta?: ChoiceDeltaLike | null
  finish_reason?: string | null
  index?: number
}

export type ChatCompletionChunkLike = {
  choices?: ChoiceLike[] | null
}

export async function* normalizeChatCompletionStream(
  stream: AsyncIterable<ChatCompletionChunkLike>
): AsyncGenerator<OpenAIChatChunk> {
  for await (const chunk of stream) {
    const choices = (chunk.choices ?? []).map(choice => {
      const finishReasonRaw = choice.finish_reason ?? undefined
      const finishReason = normalizeFinishReason(finishReasonRaw)

      const delta = choice.delta ?? undefined
      const content = delta?.content ?? undefined
      const toolCalls = (delta?.tool_calls ?? []).map(tc => ({
        id: tc.id ?? undefined,
        index: tc.index,
        type: tc.type === 'function' ? ('function' as const) : undefined,
        function: {
          name: tc.function?.name ?? undefined,
          arguments: tc.function?.arguments ?? undefined,
        },
      }))

      return {
        delta: {
          content: content ?? undefined,
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        },
        finish_reason: finishReason,
      }
    })

    yield { choices }
  }
}

function normalizeFinishReason(value: string | undefined): 'stop' | 'length' | 'tool_calls' | 'content_filter' | null | undefined {
  if (!value) return undefined
  if (value === 'function_call') return 'tool_calls'
  if (value === 'stop' || value === 'length' || value === 'tool_calls' || value === 'content_filter') return value
  return undefined
}
