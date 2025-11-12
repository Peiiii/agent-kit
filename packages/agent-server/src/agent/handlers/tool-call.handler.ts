import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import OpenAI from 'openai';
import { EventData, StreamContext, StreamHandler, ToolCallState } from '../types';

export class ToolCallHandler implements StreamHandler {
  constructor(private encoder: EventEncoder) {}

  async *handle(
    chunk: OpenAI.Chat.Completions.ChatCompletionChunk,
    context: StreamContext,
  ): AsyncGenerator<string, void, unknown> {
    const toolCalls = chunk.choices?.[0]?.delta?.tool_calls || [];
    if (!toolCalls.length) return;

    for (const tc of toolCalls) {
      // Each tc delta refers to a tool call by its index, with optional id/name and streaming arguments
      const idx = tc.index as number | undefined;
      if (idx === undefined) continue;

      // Ensure state for this index
      let state = context.toolCalls.get(idx);
      if (!state) {
        state = {
          id: tc.id ?? '',
          name: tc.function?.name ?? '',
          arguments: '',
          started: false,
        } satisfies ToolCallState;
        context.toolCalls.set(idx, state);
      } else {
        // Update id/name if they appear later in the stream
        if (!state.id && tc.id) state.id = tc.id;
        if (!state.name && tc.function?.name) state.name = tc.function.name;
      }

      // Mark last updated tool call index for snapshot purposes
      context.lastToolCallIndex = idx;

      // Emit start once per tool call
      if (!state.started) {
        state.started = true;
        const startEvent: EventData = {
          type: EventType.TOOL_CALL_START,
          toolCallId: state.id,
          toolCallName: state.name,
          toolCallArgs: '',
          toolCalls: [
            {
              id: state.id,
              type: 'function',
              function: {
                name: state.name,
                arguments: '',
              },
            },
          ],
          messages: [
            {
              id: context.messageId,
              role: 'assistant',
              toolCalls: [
                {
                  id: state.id,
                  type: 'function',
                  function: {
                    name: state.name,
                    arguments: '',
                  },
                },
              ],
            },
          ],
        };
        yield this.encoder.encode(startEvent);
      }

      // Append streaming arguments if present
      const argsDelta = tc.function?.arguments;
      if (argsDelta) {
        state.arguments += argsDelta;
        const argsEvent: EventData = {
          type: EventType.TOOL_CALL_ARGS,
          toolCallId: state.id,
          toolCallName: state.name,
          toolCallArgs: state.arguments,
          delta: argsDelta,
          toolCalls: [
            {
              id: state.id,
              type: 'function',
              function: {
                name: state.name,
                arguments: state.arguments,
              },
            },
          ],
          messages: [
            {
              id: context.messageId,
              role: 'assistant',
              toolCalls: [
                {
                  id: state.id,
                  type: 'function',
                  function: {
                    name: state.name,
                    arguments: state.arguments,
                  },
                },
              ],
            },
          ],
        };
        yield this.encoder.encode(argsEvent);
      }
    }
  }

  async *finalize(
    context: StreamContext,
  ): AsyncGenerator<string, void, unknown> {
    // Emit TOOL_CALL_END for all tool calls that started
    for (const state of context.toolCalls.values()) {
      if (!state.started) continue;
      const endEvent: EventData = {
        type: EventType.TOOL_CALL_END,
        toolCallId: state.id,
        toolCallName: state.name,
        toolCallArgs: state.arguments,
        toolCalls: [
          {
            id: state.id,
            type: 'function',
            function: {
              name: state.name,
              arguments: state.arguments,
            },
          },
        ],
        messages: [
          {
            id: context.messageId,
            role: 'assistant',
            toolCalls: [
              {
                id: state.id,
                type: 'function',
                function: {
                  name: state.name,
                  arguments: state.arguments,
                },
              },
            ],
          },
        ],
      };
      yield this.encoder.encode(endEvent);
    }
  }
}
