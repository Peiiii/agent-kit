import { ToolInvocationStatus, type ToolCall } from '../types/agent'
import type { ToolInvocation, UIMessage } from '../types/ui-message'

const tryParseJson = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return undefined
  }
}

export const toolCallToToolInvocation = (toolCall: ToolCall): ToolInvocation => {
  return {
    toolCallId: toolCall.id,
    toolName: toolCall.function.name,
    args: toolCall.function.arguments,
    parsedArgs: tryParseJson(toolCall.function.arguments),
    status: ToolInvocationStatus.CALL,
  }
}

/**
 * Ensure all tool-invocation parts have a terminal 'result' state before sending to providers
 * that require each assistant tool call to be followed by a tool role message (e.g., OpenAI).
 *
 * - For any tool-invocation with state !== 'result', mark it as 'result' with a stub payload.
 * - This is safe: if a real result arrives later, it will overwrite the stub via addToolResult().
 * - Handles partial-call states where args might be incomplete JSON strings.
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
        if (part.toolInvocation.status === ToolInvocationStatus.RESULT) return part

        // For partial-call or call states, ensure args are properly formatted
        let parsedArgs;

        // If args is a string (from partial-call), try to parse it
        if (typeof part.toolInvocation.args === 'string') {
          try {
            parsedArgs = JSON.parse(part.toolInvocation.args)
          } catch {

          }
        }

        return {
          ...part,
          toolInvocation: {
            ...part.toolInvocation,
            args: part.toolInvocation.args,
            parsedArgs: parsedArgs,
            status: ToolInvocationStatus.RESULT,
            result: stub,
          },
        }
      }),
    }
  })
}
