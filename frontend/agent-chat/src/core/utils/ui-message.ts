import type { ToolCall } from '../types/agent'
import type { UIMessage, ToolInvocation } from '../types/ui-message'


export const toolCallToToolInvocation = (toolCall: ToolCall): ToolInvocation => {
  return {
    toolCallId: toolCall.id,
    toolName: toolCall.function.name,
    args: JSON.parse(toolCall.function.arguments),
    state: "call",
  }
}

/**
 * Ensure all tool-invocation parts have a terminal 'result' state before sending to providers
 * that require each assistant tool call to be followed by a tool role message (e.g., OpenAI).
 *
 * - For any tool-invocation with state !== 'result', mark it as 'result' with a stub payload.
 * - This is safe: if a real result arrives later, it will overwrite the stub via addToolResult().
 */
export function finalizePendingToolInvocations(
  messages: UIMessage[],
  options?: { stubResult?: unknown }
): UIMessage[] {
  const stub = options?.stubResult ?? { error: 'tool_call_interrupted', note: 'User continued before tool produced a result.' }
  return messages.map((msg) => {
    if (!msg.parts?.length) return msg
    return {
      ...msg,
      parts: msg.parts.map((part) => {
        if (part.type !== 'tool-invocation') return part
        if (part.toolInvocation.state === 'result') return part
        return {
          ...part,
          toolInvocation: {
            ...part.toolInvocation,
            state: 'result',
            result: stub,
          },
        }
      }),
    }
  })
}
