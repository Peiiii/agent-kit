import type { ContextLike, OpenAIChatMessage, OpenAIToolCall, OpenAIToolDefinition, ToolDefinitionLike, ToolInvocationLike, UIMessageLike } from './types'
import { isRecord } from './utils'

function isTextPart(part: unknown): part is { type: 'text'; text: string } {
  return isRecord(part) && part.type === 'text' && typeof part.text === 'string'
}

function isToolInvocationPart(part: unknown): part is { type: 'tool-invocation'; toolInvocation: ToolInvocationLike } {
  if (!isRecord(part)) return false
  if (part.type !== 'tool-invocation') return false
  const inv = part.toolInvocation
  return (
    isRecord(inv) &&
    typeof inv.toolCallId === 'string' &&
    typeof inv.toolName === 'string' &&
    typeof inv.args === 'string' &&
    typeof inv.status === 'string'
  )
}

export function mapToolDefinitionsToOpenAITools(tools: ToolDefinitionLike[]): OpenAIToolDefinition[] {
  return tools.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: (tool.parameters ?? {}) as Record<string, unknown>,
    },
  }))
}

function extractMessageText(msg: UIMessageLike): string {
  return msg.parts
    .filter(isTextPart)
    .map(p => p.text)
    .filter(Boolean)
    .join('\n\n')
}

interface ExtractedToolCalls {
  calls: OpenAIToolCall[]
  toolResults: OpenAIChatMessage[]
}

function extractToolCalls(msg: UIMessageLike): ExtractedToolCalls {
  const callsById = new Map<string, OpenAIToolCall>()
  const toolResults: OpenAIChatMessage[] = []

  for (const part of msg.parts) {
    if (!isToolInvocationPart(part)) continue
    const inv = part.toolInvocation

    const registerToolCall = () => {
      if (!inv.toolCallId || !inv.toolName) return
      if (callsById.has(inv.toolCallId)) return
      callsById.set(inv.toolCallId, {
        id: inv.toolCallId,
        type: 'function',
        function: { name: inv.toolName, arguments: inv.args },
      })
    }

    switch (inv.status) {
      case 'result':
        registerToolCall()
        toolResults.push({
          role: 'tool',
          tool_call_id: inv.toolCallId,
          content: JSON.stringify(inv.result ?? { success: true }),
        })
        break
      case 'call':
      case 'partial-call':
        registerToolCall()
        break
    }
  }

  return { calls: Array.from(callsById.values()), toolResults }
}

export function serializeUIMessagesToOpenAIChatMessages(params: {
  messages: UIMessageLike[]
  context?: ContextLike[]
}): OpenAIChatMessage[] {
  const result: OpenAIChatMessage[] = []

  const contextText = params.context?.map(c => `${c.description}: ${c.value}`).join('\n')
  if (contextText?.trim()) {
    result.push({ role: 'system', content: contextText })
  }

  for (const msg of params.messages) {
    if (msg.role === 'data') continue

    const text = extractMessageText(msg)

    if (msg.role === 'assistant') {
      const { calls, toolResults } = extractToolCalls(msg)
      const hasContent = text.trim().length > 0 || calls.length > 0
      if (hasContent) {
        result.push({
          role: 'assistant',
          content: text,
          ...(calls.length > 0 ? { tool_calls: calls } : {}),
        })
      }
      result.push(...toolResults)
      continue
    }

    const role = msg.role === 'system' ? 'system' : 'user'
    if (text.trim()) {
      result.push({ role, content: text })
    }
  }

  return result
}
