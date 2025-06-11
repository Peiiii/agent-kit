import { EventEncoder } from '@ag-ui/encoder';
import {
  EventType,
  type RunAgentInput,
  type Context,
  type RunStartedEvent,
  type RunFinishedEvent,
  type TextMessageStartEvent,
  type TextMessageContentEvent,
  type TextMessageEndEvent,
  type StateSnapshotEvent,
  type ToolCallStartEvent,
  type ToolCallArgsEvent,
  type ToolCallEndEvent,
} from '@ag-ui/core';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import type { AgentConfig } from '../config/index';

export interface OpenAIAgentOptions {
  apiKey: string;
  baseURL: string;
  model: string;
}

export class OpenAIAgent {
  private client: OpenAI;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = {
      ...config,
    };
    this.client = new OpenAI({
      apiKey: this.config.openaiApiKey,
      baseURL: config.baseURL,
    });
  }

  private convertToolsToOpenAIFormat(tools: any[]): any[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  private convertMessagesToOpenAIFormat(messages: any[]): any[] {
    return messages.map((message: any) => ({
      role: message.role,
      content: message.content || '',
      ...(message.role === 'assistant' && message.tool_calls
        ? { tool_calls: message.tool_calls }
        : {}),
      ...(message.role === 'tool'
        ? { tool_call_id: message.tool_call_id }
        : {}),
    }));
  }

  private addContextToMessages(messages: any[], context: Context[]): any[] {
    if (!context || context.length === 0) return messages;
    let contextContent = '以下是当前对话的上下文信息：\n';
    for (const ctx of context) {
      contextContent += `- ${ctx.description}: ${ctx.value}\n`;
    }
    return [{ role: 'system', content: contextContent }, ...messages];
  }

  async *run(inputData: RunAgentInput, acceptHeader: string) {
    const encoder = new EventEncoder({ accept: acceptHeader });
    const runStarted: RunStartedEvent = {
      type: EventType.RUN_STARTED,
      threadId: inputData.threadId,
      runId: inputData.runId,
    };
    yield encoder.encode(runStarted);
    try {
      let messages = inputData.messages
        ? this.convertMessagesToOpenAIFormat(inputData.messages)
        : [];
      if (inputData.context) {
        messages = this.addContextToMessages(messages, inputData.context);
      }
      const tools = inputData.tools
        ? this.convertToolsToOpenAIFormat(inputData.tools)
        : [];
      const messageId = uuidv4();
      const textMessageStart: TextMessageStartEvent = {
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: 'assistant',
      };
      yield encoder.encode(textMessageStart);
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        stream: true,
        tools,
      });
      let fullResponse = '';
      let toolCallStarted = false;
      let currentToolCallId = '';
      let currentToolCallName = '';
      let currentToolCallArgs = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta;
        if (delta.tool_calls) {
          const toolCall = delta.tool_calls[0];
          if (!toolCallStarted) {
            toolCallStarted = true;
            currentToolCallId = uuidv4();
            currentToolCallName = toolCall.function?.name || '';
            const toolCallStart: ToolCallStartEvent = {
              type: EventType.TOOL_CALL_START,
              toolCallId: currentToolCallId,
              toolCallName: currentToolCallName,
            };
            yield encoder.encode(toolCallStart);
          }
          if (toolCall.function?.arguments) {
            currentToolCallArgs += toolCall.function.arguments;
            const toolCallArgs: ToolCallArgsEvent = {
              type: EventType.TOOL_CALL_ARGS,
              toolCallId: currentToolCallId,
              delta: toolCall.function.arguments,
            };
            yield encoder.encode(toolCallArgs);
          }
        } else if (delta.content) {
          const content = delta.content;
          fullResponse += content;
          const textMessageContent: TextMessageContentEvent = {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId,
            delta: content,
          };
          yield encoder.encode(textMessageContent);
        }
      }
      if (toolCallStarted) {
        const toolCallEnd: ToolCallEndEvent = {
          type: EventType.TOOL_CALL_END,
          toolCallId: currentToolCallId,
        };
        yield encoder.encode(toolCallEnd);
      }
      const textMessageEnd: TextMessageEndEvent = {
        type: EventType.TEXT_MESSAGE_END,
        messageId,
      };
      yield encoder.encode(textMessageEnd);
      const state: StateSnapshotEvent = {
        type: EventType.STATE_SNAPSHOT,
        snapshot: {
          last_response: fullResponse,
          last_tool_call: toolCallStarted
            ? {
                name: currentToolCallName,
                arguments: currentToolCallArgs,
              }
            : null,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        },
      };
      yield encoder.encode(state);
    } catch (e: any) {
      const errorMessageId = uuidv4();
      const textMessageStart: TextMessageStartEvent = {
        type: EventType.TEXT_MESSAGE_START,
        messageId: errorMessageId,
        role: 'assistant',
      };
      yield encoder.encode(textMessageStart);
      const textMessageContent: TextMessageContentEvent = {
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId: errorMessageId,
        delta: `Error: ${e.message}`,
      };
      yield encoder.encode(textMessageContent);
      const textMessageEnd: TextMessageEndEvent = {
        type: EventType.TEXT_MESSAGE_END,
        messageId: errorMessageId,
      };
      yield encoder.encode(textMessageEnd);
    }
    const runFinished: RunFinishedEvent = {
      type: EventType.RUN_FINISHED,
      threadId: inputData.threadId,
      runId: inputData.runId,
    };
    yield encoder.encode(runFinished);
  }
}
