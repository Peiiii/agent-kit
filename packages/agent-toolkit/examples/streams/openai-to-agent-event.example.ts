import { openAIChunksToAgentEvents$, AgentEventType, type OpenAIChatChunk } from '../../src/streams/openai-to-agent-event'

// Fake OpenAI ChatCompletionChunk stream to demonstrate TEXT and TOOL_CALL events
async function* fakeOpenAIChunks(): AsyncGenerator<OpenAIChatChunk> {
  // Text deltas
  yield { choices: [{ delta: { content: 'Hello ' } }] }
  yield { choices: [{ delta: { content: 'world!' } }] }

  // Tool call args before id (id comes later)
  yield { choices: [{ delta: { tool_calls: [{ index: 0, function: { name: 'calculator', arguments: '{"expression":"' } }] } }] }
  // Provide id and close JSON, finish tools
  yield { choices: [{ delta: { tool_calls: [{ index: 0, id: 'call_abc', function: { arguments: '1+2"}' } }] }, finish_reason: 'tool_calls' }] }
}

async function main() {
  const events$ = openAIChunksToAgentEvents$(fakeOpenAIChunks(), { messageId: 'msg-1' })
  const sub = events$.subscribe({
    next: (e) => console.log('[AgentEvent]', e),
    error: (err) => console.error(err),
    complete: () => console.log('done'),
  })
}

main().catch(console.error)

