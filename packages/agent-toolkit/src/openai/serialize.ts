import type { ContextLike, OpenAIChatMessage, OpenAIToolCall, OpenAIToolDefinition, ToolDefinitionLike, ToolInvocationLike, UIMessageLike } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTextPart(part: unknown): part is { type: 'text'; text: string } {
  return isRecord(part) && part.type === 'text' && typeof part.text === 'string'
}

function isToolInvocation(part: unknown): part is { toolInvocation: ToolInvocationLike } {
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

function messageText(msg: UIMessageLike): string {
  return msg.parts
    .filter(isTextPart)
    .map(p => p.text)
    .filter(Boolean)
    .join('\n\n')
}

function extractToolCalls(msg: UIMessageLike): { calls: OpenAIToolCall[]; toolResults: OpenAIChatMessage[] } {
  const calls: OpenAIToolCall[] = []
  const toolResults: OpenAIChatMessage[] = []

  for (const part of msg.parts) {
    if (!isToolInvocation(part)) continue
    const inv = part.toolInvocation
    if (inv.status === 'result') {
      toolResults.push({
        role: 'tool',
        tool_call_id: inv.toolCallId,
        content: JSON.stringify(inv.result ?? { success: true }),
      })
    } else if (inv.status === 'call' || inv.status === 'partial-call') {
      calls.push({
        id: inv.toolCallId,
        type: 'function',
        function: { name: inv.toolName, arguments: inv.args },
      })
    }
  }

  return { calls, toolResults }
}

export function serializeUIMessagesToOpenAIChatMessages(params: {
  messages: UIMessageLike[]
  context?: ContextLike[]
}): OpenAIChatMessage[] {
  const out: OpenAIChatMessage[] = []

  const contextText = params.context?.map(c => `${c.description}: ${c.value}`).join('\n')
  if (contextText && contextText.trim().length > 0) {
    out.push({ role: 'system', content: contextText })
  }

  for (const msg of params.messages) {
    if (msg.role === 'data') continue

    const text = messageText(msg)

    if (msg.role === 'assistant') {
      const { calls, toolResults } = extractToolCalls(msg)
      if (text.trim().length > 0 || calls.length > 0) {
        out.push({
          role: 'assistant',
          content: text,
          ...(calls.length > 0 ? { tool_calls: calls } : {}),
        })
      }
      out.push(...toolResults)
      continue
    }

    const role = msg.role === 'system' ? 'system' : 'user'
    if (text.trim().length > 0) {
      out.push({ role, content: text })
    }
  }

  return out
}
