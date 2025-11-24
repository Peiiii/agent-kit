import { from, Subscribable, of, Observable } from 'rxjs';
import { catchError, finalize, mergeMap, scan } from 'rxjs/operators';

// AgentEvent shape compatible with @agent-labs/agent-chat (runtime-only contract)
export const AgentEventType = {
  TEXT_START: 'TEXT_START',
  TEXT_DELTA: 'TEXT_DELTA',
  TEXT_END: 'TEXT_END',
  TOOL_CALL_START: 'TOOL_CALL_START',
  TOOL_CALL_ARGS: 'TOOL_CALL_ARGS',
  TOOL_CALL_ARGS_DELTA: 'TOOL_CALL_ARGS_DELTA',
  TOOL_CALL_END: 'TOOL_CALL_END',
  TOOL_CALL_RESULT: 'TOOL_CALL_RESULT',
  RUN_STARTED: 'RUN_STARTED',
  RUN_FINISHED: 'RUN_FINISHED',
  RUN_ERROR: 'RUN_ERROR',
} as const

export type AgentEvent =
  | { type: typeof AgentEventType.TEXT_START; messageId: string }
  | { type: typeof AgentEventType.TEXT_DELTA; messageId: string; delta: string }
  | { type: typeof AgentEventType.TEXT_END; messageId: string }
  | { type: typeof AgentEventType.TOOL_CALL_START; toolCallId: string; toolName: string; messageId?: string }
  | { type: typeof AgentEventType.TOOL_CALL_ARGS_DELTA; toolCallId: string; argsDelta: string }
  | { type: typeof AgentEventType.TOOL_CALL_ARGS; toolCallId: string; args: string }
  | { type: typeof AgentEventType.TOOL_CALL_END; toolCallId: string }
  | { type: typeof AgentEventType.TOOL_CALL_RESULT; toolCallId: string; content: unknown }
  | { type: typeof AgentEventType.RUN_STARTED; threadId?: string }
  | { type: typeof AgentEventType.RUN_FINISHED; threadId?: string }
  | { type: typeof AgentEventType.RUN_ERROR; error?: string; threadId?: string }

// Minimal OpenAI delta types (avoid importing SDK types)
type ChatFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter' | null | undefined
interface ToolCallFunctionDelta { name?: string; arguments?: string }
interface ToolCallDelta { id?: string; index: number; type?: 'function'; function?: ToolCallFunctionDelta }
interface ChoiceDelta { content?: string; tool_calls?: ToolCallDelta[] }
interface Choice { delta?: ChoiceDelta; finish_reason?: ChatFinishReason }
export interface OpenAIChatChunk { choices?: Choice[] }

interface ToolCallState { id: string; name: string; args: string; started: boolean; ended: boolean }
interface ReduceState {
  messageId: string
  textStarted: boolean
  textEnded: boolean
  toolCalls: Map<number, ToolCallState>
  stepEvents: AgentEvent[]
}

function push<T>(arr: T[], e?: T) { if (e) arr.push(e) }

function reduceChunk(state: ReduceState, chunk: OpenAIChatChunk): ReduceState {
  const evts: AgentEvent[] = []
  const choice = chunk.choices?.[0]
  const delta = choice?.delta ?? {}

  // Text
  if (delta.content) {
    if (!state.textStarted) push(evts, { type: AgentEventType.TEXT_START, messageId: state.messageId })
    push(evts, { type: AgentEventType.TEXT_DELTA, messageId: state.messageId, delta: delta.content })
    state.textStarted = true
  }

  // Tool calls (multiple per chunk)
  const toolCalls = Array.isArray(delta.tool_calls) ? delta.tool_calls : []
  for (const tc of toolCalls) {
    const idx = tc.index
    const st = state.toolCalls.get(idx) ?? { id: '', name: '', args: '', started: false, ended: false }
    const id = st.id || tc.id || ''
    const name = st.name || tc.function?.name || ''
    const argsDelta = tc.function?.arguments || ''

    if (argsDelta) st.args += argsDelta
    if (!st.id && id) st.id = id
    if (!st.name && name) st.name = name

    if (!st.started && st.id) {
      push(evts, { type: AgentEventType.TOOL_CALL_START, toolCallId: st.id, toolName: st.name })
      // If args were accumulated before id appeared, backfill first delta with the full snapshot
      if (st.args) {
        push(evts, { type: AgentEventType.TOOL_CALL_ARGS_DELTA, toolCallId: st.id, argsDelta: st.args })
      }
      st.started = true
    } else if (argsDelta && st.started) {
      push(evts, { type: AgentEventType.TOOL_CALL_ARGS_DELTA, toolCallId: st.id, argsDelta })
    }
    state.toolCalls.set(idx, st)
  }

  // Finish: only when tool_calls finish, end all started tool calls
  if (choice?.finish_reason === 'tool_calls') {
    if (state.textStarted && !state.textEnded) {
      push(evts, { type: AgentEventType.TEXT_END, messageId: state.messageId })
      state.textEnded = true
    }
    for (const st of state.toolCalls.values()) {
      if (st.started && !st.ended) {
        push(evts, { type: AgentEventType.TOOL_CALL_END, toolCallId: st.id })
        st.ended = true
      }
    }
  }

  state.stepEvents = evts
  return state
}

export function convertOpenAIChunksToAgentEventObservable(
  stream: AsyncIterable<OpenAIChatChunk>,
  options: { messageId: string; threadId?: string }
): Subscribable<AgentEvent> {
  const initial: ReduceState = {
    messageId: options.messageId,
    textStarted: false,
    textEnded: false,
    toolCalls: new Map(),
    stepEvents: [],
  }

  const base$ = from(stream).pipe(
    scan((acc, chunk) => reduceChunk(acc, chunk), initial),
    mergeMap(s => from(s.stepEvents)),
    catchError(err =>
      of({
        type: AgentEventType.RUN_ERROR,
        error: String((err as any)?.message || err),
        threadId: options.threadId,
      } as AgentEvent)
    ),
    finalize(() => {
      // noop
    })
  )

  // Wrap base$ to add RUN_STARTED / RUN_FINISHED boundaries.
  return new Observable<AgentEvent>(subscriber => {
    // Run start
    subscriber.next({
      type: AgentEventType.RUN_STARTED,
      threadId: options.threadId,
    } as AgentEvent)

    const sub = base$.subscribe({
      next: evt => subscriber.next(evt),
      error: err => subscriber.error(err),
      complete: () => {
        // Run finished
        subscriber.next({
          type: AgentEventType.RUN_FINISHED,
          threadId: options.threadId,
        } as AgentEvent)
        subscriber.complete()
      },
    })

    return () => sub.unsubscribe()
  })
}
