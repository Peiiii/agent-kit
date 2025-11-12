import {
  EventType,
  Message,
  Tool,
  type Context,
  type RunAgentInput,
  type ToolCall,
} from '@ag-ui/core';
import { EventEncoder } from '@ag-ui/encoder';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import type { AgentConfig } from '../config/index';
import { TextMessageHandler } from './handlers/text-message.handler';
import { ToolCallHandler } from './handlers/tool-call.handler';
import { StreamProcessor } from './stream-processor';
import { EventData } from './types';
import { toAgentEvents$ } from './streams/rx-agent-pipeline';
import { firstValueFrom, lastValueFrom } from 'rxjs';

export interface OpenAIAgentOptions {
  apiKey: string;
  baseURL: string;
  model: string;
}

export class OpenAIAgent {
  private client: OpenAI;

  constructor(private config: AgentConfig) {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true,
    });
  }

  private convertToolsToOpenAIFormat(tools: Tool[]) {
    return tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  private convertMessagesToOpenAIFormat(
    messages: Message[],
  ): ChatCompletionMessageParam[] {
    return messages.map((message) => {
      if (message.role === 'tool' && 'toolCallId' in message) {
        return {
          role: message.role,
          content: message.content,
          tool_call_id: message.toolCallId,
        };
      }
      if (message.role === 'developer' || message.role === 'system' || message.role === 'user') {
        return {
          role: message.role,
          content: message.content,
          id: message.id,
        };
      }
      return {
        role: message.role,
        content: message.content,
        id: message.id,
        tool_calls:
          'toolCalls' in message
            ? message.toolCalls?.map((toolCall: ToolCall) => ({
                id: toolCall.id,
                type: 'function' as const,
                function: {
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments,
                },
              }))
            : undefined,
      };
    });
  }

  private addContextToMessages(messages: ChatCompletionMessageParam[], context: Context[]) {
    const contextMessage = {
      role: 'system' as const,
      content: context
        .map((ctx) => `${ctx.description}: ${ctx.value}`)
        .join('\n'),
    };
    return [contextMessage, ...messages];
  }

  async *run(
    inputData: RunAgentInput,
    acceptHeader: string,
  ): AsyncGenerator<string, void, unknown> {
    const encoder = new EventEncoder({ accept: acceptHeader });

    // 发送开始事件
    const startEvent: EventData = {
      type: EventType.RUN_STARTED,
      threadId: inputData.threadId,
      runId: inputData.runId,
      toolCalls: [],
      messages: [],
      toolCallArgs: '',
      content: '',
    };
    yield encoder.encode(startEvent);

    try {
      // 准备消息和工具
      let messages = inputData.messages
        ? this.convertMessagesToOpenAIFormat(inputData.messages)
        : [];
      if (inputData.context) {
        messages = this.addContextToMessages(messages, inputData.context);
      }
      const tools = inputData.tools && inputData.tools.length > 0
        ? this.convertToolsToOpenAIFormat(inputData.tools)
        : undefined;

      // 创建流
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        stream: true,
        tools,
      });

      // 新的单链路流式转换：将原始 chunk 流转为 Agent 事件流
      const events$ = toAgentEvents$(stream, inputData, { /* messageId 由管道生成 */ });
      // 逐个事件进行编码输出
      // 使用 for-await bridge 订阅 Observable（lastValueFrom 不会逐个推送）
      const abort = new AbortController();
      const iterator = (async function* () {
        let resolve: ((v: IteratorResult<string>) => void) | null = null;
        let reject: ((e: any) => void) | null = null;
        let done = false;
        const q: Array<string> = [];

        const sub = events$.subscribe({
          next: (evt) => {
            const encoded = encoder.encode(evt);
            // EventEncoder.encode 可能返回 Promise<string> | string
            Promise.resolve(encoded).then((s) => {
              if (resolve) {
                resolve({ value: s, done: false });
                resolve = null;
              } else {
                q.push(s);
              }
            }).catch(err => {
              if (reject) reject(err);
            });
          },
          error: (err) => {
            if (reject) reject(err);
          },
          complete: () => {
            done = true;
            if (resolve) resolve({ value: undefined as any, done: true });
          }
        });

        try {
          while (true) {
            if (q.length > 0) {
              const v = q.shift()!;
              yield v;
              continue;
            }
            if (done) break;
            const v = await new Promise<IteratorResult<string>>((res, rej) => {
              resolve = res;
              reject = rej;
            });
            if (v.done) break;
            yield v.value;
          }
        } finally {
          sub.unsubscribe();
        }
      })();

      for await (const s of iterator) {
        yield s;
      }
    } catch (error) {
      yield* this.handleError(error as Error, encoder);
    }

    // 发送结束事件
    const endEvent: EventData = {
      type: EventType.RUN_FINISHED,
      threadId: inputData.threadId,
      runId: inputData.runId,
      toolCalls: [],
      messages: [],
      toolCallArgs: '',
      content: '',
    };
    yield encoder.encode(endEvent);
  }

  private async *handleError(
    error: Error,
    encoder: EventEncoder,
  ): AsyncGenerator<string, void, unknown> {
    const event: EventData = {
      type: EventType.RUN_ERROR,
      error: {
        message: error.message,
      },
    };
    console.error('[OpenAIAgent][handleError]:', error);
    yield encoder.encode(event);
  }
}
