import type { RunAgentInput } from '@ag-ui/core';
import { EventType } from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { TextMessageHandler } from './handlers/text-message.handler';
import { EventData, StreamProcessor as IStreamProcessor, StreamContext, StreamHandler, ToolCallState } from './types';

export class StreamProcessor implements IStreamProcessor {
  private handlers: Map<string, StreamHandler> = new Map();
  private context: StreamContext;

  constructor(
    private encoder: EventEncoder,
    private inputData: RunAgentInput
  ) {
    this.context = {
      messageId: uuidv4(),
      isMessageStarted: false,
      fullResponse: '',
      toolCalls: new Map<number, ToolCallState>(),
      lastToolCallIndex: undefined,
      getSnapshot: () => {
        const lastIdx = this.context.lastToolCallIndex;
        const last = lastIdx !== undefined ? this.context.toolCalls.get(lastIdx) : undefined;
        return {
          last_response: this.context.fullResponse,
          last_tool_call: last
            ? {
                name: last.name,
                arguments: last.arguments,
              }
            : null,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        };
      },
    };
  }

  addHandler(type: string, handler: StreamHandler) {
    this.handlers.set(type, handler);
  }

  async *process(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>): AsyncGenerator<string, void, unknown> {
    try {
      for await (const chunk of stream) {
        // A single chunk may contain both text delta and multiple tool_calls deltas
        const hasText = !!chunk.choices?.[0]?.delta?.content;
        const hasTools = Array.isArray(chunk.choices?.[0]?.delta?.tool_calls) && chunk.choices[0].delta.tool_calls.length > 0;

        if (hasText) {
          const textHandler = this.handlers.get('text');
          if (textHandler) {
            yield* textHandler.handle(chunk, this.context);
          }
        }

        if (hasTools) {
          const toolHandler = this.handlers.get('tool');
          if (toolHandler) {
            yield* toolHandler.handle(chunk, this.context);
          }
        }
      }

      // 完成所有处理
      for (const handler of this.handlers.values()) {
        yield* handler.finalize(this.context);
      }

      // 发送状态快照
      const aggregatedToolCalls = Array.from(this.context.toolCalls.values()).map(tc => ({
        id: tc.id,
        type: 'function' as const,
        function: {
          name: tc.name,
          arguments: tc.arguments,
        },
      }));

      const event: EventData = {
        type: EventType.STATE_SNAPSHOT,
        snapshot: this.context.getSnapshot(),
        content: this.context.fullResponse,
        toolCalls: aggregatedToolCalls.length ? aggregatedToolCalls : undefined,
        messages: [{
          id: this.context.messageId,
          role: 'assistant',
          content: this.context.fullResponse,
          toolCalls: aggregatedToolCalls.length ? aggregatedToolCalls : undefined,
        }],
      };
      yield this.encoder.encode(event);
    } catch (error) {
      yield* this.handleError(error as Error);
    }
  }

  async *handleError(error: Error): AsyncGenerator<string, void, unknown> {
    const errorHandler = new TextMessageHandler(this.encoder);
    yield* errorHandler.handle({
      id: '',
      created: 0,
      model: '',
      object: 'chat.completion.chunk' as const,
      choices: [{
        delta: { content: `Error: ${error.message}` },
        finish_reason: 'stop',
        index: 0,
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    }, this.context);
    yield* errorHandler.finalize(this.context);

    // 发送错误事件
    const event: EventData = {
      type: EventType.RUN_ERROR,
      error: {
        message: error.message
      }
    };
    yield this.encoder.encode(event);
  }
} 
