import { EventEncoder } from '@ag-ui/encoder';
import { EventType } from '@ag-ui/core';
import { v4 as uuidv4 } from 'uuid';
import { StreamHandler, StreamContext, StateSnapshot, EventData, StreamProcessor as IStreamProcessor } from './types';
import { TextMessageHandler } from './handlers/text-message.handler';
import { ToolCallHandler } from './handlers/tool-call.handler';
import type { RunAgentInput } from '@ag-ui/core';
import OpenAI from 'openai';

export class StreamProcessor implements IStreamProcessor {
  private handlers: Map<string, StreamHandler> = new Map();
  private context: StreamContext;

  constructor(
    private encoder: EventEncoder,
    private inputData: RunAgentInput
  ) {
    this.context = {
      messageId: uuidv4(),
      toolCallId: '',
      isMessageStarted: false,
      isToolCallStarted: false,
      fullResponse: '',
      toolCallArgs: '',
      toolCallName: '',
      getSnapshot: () => ({
        last_response: this.context.fullResponse,
        last_tool_call: this.context.isToolCallStarted ? {
          name: this.context.toolCallName,
          arguments: this.context.toolCallArgs
        } : null,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      })
    };
  }

  addHandler(type: string, handler: StreamHandler) {
    this.handlers.set(type, handler);
  }

  async *process(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>): AsyncGenerator<string, void, unknown> {
    try {
      for await (const chunk of stream) {
        const type = this.getChunkType(chunk);
        const handler = this.handlers.get(type);
        if (handler) {
          yield* handler.handle(chunk, this.context);
        }
      }

      // 完成所有处理
      for (const handler of this.handlers.values()) {
        yield* handler.finalize(this.context);
      }

      // 发送状态快照
      const event: EventData = {
        type: EventType.STATE_SNAPSHOT,
        snapshot: this.context.getSnapshot(),
        content: this.context.fullResponse,
        toolCalls: this.context.isToolCallStarted ? [{
          id: this.context.toolCallId,
          type: 'function',
          function: {
            name: this.context.toolCallName,
            arguments: this.context.toolCallArgs
          }
        }] : undefined,
        messages: [{
          id: this.context.messageId,
          role: 'assistant',
          content: this.context.fullResponse,
          toolCalls: this.context.isToolCallStarted ? [{
            id: this.context.toolCallId,
            type: 'function',
            function: {
              name: this.context.toolCallName,
              arguments: this.context.toolCallArgs
            }
          }] : undefined
        }]
      };
      yield this.encoder.encode(event);
    } catch (error) {
      yield* this.handleError(error as Error);
    }
  }

  private getChunkType(chunk: any): string {
    if (chunk.choices[0].delta.tool_calls) return 'tool';
    if (chunk.choices[0].delta.content) return 'text';
    return 'unknown';
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