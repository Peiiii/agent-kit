import { EventType, type RunAgentInput } from '@ag-ui/core';
import { from, of } from 'rxjs';
import { catchError, finalize, mergeMap, scan } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import type { EventData } from '../types';

// Narrowed types for streaming deltas to avoid using `any`
type ChatFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter' | null | undefined;
interface ToolCallFunctionDelta { name?: string; arguments?: string }
interface ToolCallDelta { id?: string; index: number; type?: 'function'; function?: ToolCallFunctionDelta }
interface ChoiceDelta { content?: string; tool_calls?: ToolCallDelta[] }
interface Choice { delta?: ChoiceDelta; finish_reason?: ChatFinishReason }
interface Chunk { choices?: Choice[] }

interface ToolCallState {
  id: string;
  name: string;
  args: string;
  started: boolean;
  ended: boolean;
}

interface ReduceState {
  // Identity
  threadId?: string;
  runId?: string;
  messageId: string;

  // Text
  textStarted: boolean;
  textEnded: boolean;
  fullText: string;

  // Tools by index
  toolCalls: Map<number, ToolCallState>;

  // Events emitted for current step (flushed downstream then cleared)
  stepEvents: EventData[];
}

function initState(input: RunAgentInput, messageId?: string): ReduceState {
  return {
    threadId: input.threadId,
    runId: input.runId,
    messageId: messageId ?? uuidv4(),
    textStarted: false,
    textEnded: false,
    fullText: '',
    toolCalls: new Map<number, ToolCallState>(),
    stepEvents: [],
  };
}

function push(arr: EventData[], e: EventData | undefined) {
  if (e) arr.push(e);
}

function reduceChunk(state: ReduceState, chunk: Chunk): ReduceState {
  const events: EventData[] = [];
  const choice = chunk.choices?.[0];
  const delta = choice?.delta ?? {};

  // Text streaming
  if (delta.content) {
    if (!state.textStarted) {
      push(events, {
        type: EventType.TEXT_MESSAGE_START,
        messageId: state.messageId,
        role: 'assistant',
        content: '',
        messages: [{ id: state.messageId, role: 'assistant', content: '' }],
      });
      state.textStarted = true;
    }
    state.fullText += delta.content;
    push(events, {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: state.messageId,
      role: 'assistant',
      delta: delta.content,
      content: state.fullText,
      messages: [{ id: state.messageId, role: 'assistant', content: state.fullText }],
    });
  }

  // Tool calls, possibly multiple per chunk
  const toolCalls = Array.isArray(delta.tool_calls) ? delta.tool_calls : [];
  for (const tc of toolCalls) {
    const idx = tc.index as number | undefined;
    if (idx === undefined) continue;
    const existing = state.toolCalls.get(idx) ?? { id: '', name: '', args: '', started: false, ended: false };
    const id = existing.id || tc.id || '';
    const name = existing.name || tc.function?.name || '';
    const argsDelta = tc.function?.arguments || '';

    // Accumulate args first (even if id not present yet)
    if (argsDelta) {
      existing.args += argsDelta;
    }
    // Persist id/name as soon as available
    if (!existing.id && id) existing.id = id;
    if (!existing.name && name) existing.name = name;

    // Only emit events when id is available to keep toolCallId stable
    if (!existing.started && existing.id) {
      push(events, {
        type: EventType.TOOL_CALL_START,
        toolCallId: existing.id,
        toolCallName: existing.name,
        toolCallArgs: '',
        toolCalls: [ { id: existing.id, type: 'function', function: { name: existing.name, arguments: '' } } ],
        messages: [ { id: state.messageId, role: 'assistant', toolCalls: [ { id: existing.id, type: 'function', function: { name: existing.name, arguments: '' } } ] } ],
      });
      // If there were accumulated args before id appeared, emit a consolidated args delta now
      if (existing.args) {
        push(events, {
          type: EventType.TOOL_CALL_ARGS,
          toolCallId: existing.id,
          toolCallName: existing.name,
          toolCallArgs: existing.args,
          // Important: mapped-http-agent uses `delta` to build args; send full args here to catch up
          delta: existing.args,
          toolCalls: [ { id: existing.id, type: 'function', function: { name: existing.name, arguments: existing.args } } ],
          messages: [ { id: state.messageId, role: 'assistant', toolCalls: [ { id: existing.id, type: 'function', function: { name: existing.name, arguments: existing.args } } ] } ],
        });
      }
      existing.started = true;
    } else if (argsDelta && existing.started) {
      push(events, {
        type: EventType.TOOL_CALL_ARGS,
        toolCallId: existing.id,
        toolCallName: existing.name,
        toolCallArgs: existing.args,
        delta: argsDelta,
        toolCalls: [ { id: existing.id, type: 'function', function: { name: existing.name, arguments: existing.args } } ],
        messages: [ { id: state.messageId, role: 'assistant', toolCalls: [ { id: existing.id, type: 'function', function: { name: existing.name, arguments: existing.args } } ] } ],
      });
    }

    state.toolCalls.set(idx, existing);
  }

  // Finish signals: when tool_calls, flush endings for all started tool calls
  if (choice?.finish_reason === 'tool_calls') {
    if (state.textStarted && !state.textEnded) {
      push(events, {
        type: EventType.TEXT_MESSAGE_END,
        messageId: state.messageId,
        role: 'assistant',
        content: state.fullText,
        messages: [{ id: state.messageId, role: 'assistant', content: state.fullText }],
      });
      state.textEnded = true;
    }
    for (const tc of state.toolCalls.values()) {
      if (tc.started && !tc.ended) {
        push(events, {
          type: EventType.TOOL_CALL_END,
          toolCallId: tc.id,
          toolCallName: tc.name,
          toolCallArgs: tc.args,
          toolCalls: [ { id: tc.id, type: 'function', function: { name: tc.name, arguments: tc.args } } ],
          messages: [ { id: state.messageId, role: 'assistant', toolCalls: [ { id: tc.id, type: 'function', function: { name: tc.name, arguments: tc.args } } ] } ],
        });
        tc.ended = true;
      }
    }
  }

  state.stepEvents = events;
  return state;
}

export function toAgentEvents$(
  stream: AsyncIterable<Chunk>,
  input: RunAgentInput,
  options?: { messageId?: string }
) {
  const initial = initState(input, options?.messageId);

  return from(stream).pipe(
    scan((acc, chunk) => reduceChunk(acc, chunk), initial),
    mergeMap(s => from(s.stepEvents)),
    catchError((err) => of({ type: EventType.RUN_ERROR, error: { message: String(err?.message || err) } } as EventData)),
    finalize(() => {
      // completion handled by upstream; caller可在外部补 RUN_FINISHED
    })
  );
}
