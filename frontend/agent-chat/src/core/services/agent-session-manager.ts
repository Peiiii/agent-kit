
import {
  EventType,
  type BaseEvent
} from '@ag-ui/client'
import type { UIMessage } from '@ai-sdk/ui-utils'
import { createRef } from 'react'
import { BehaviorSubject, Observable, Subject, type Unsubscribable } from 'rxjs'
import { v4 } from 'uuid'
import type { AgentToolExecutorManager } from '../hooks'
import type { IAgent } from '../types'
import type { Context, ToolCall, ToolDefinition, ToolInvocationState, ToolResult } from '../types/agent'
import { convertUIMessagesToMessages } from '../utils'
import { AgentEventHandler } from './agent-event-handler'


export interface IAgentProvider {
  agent: IAgent,
  getToolDefs: () => ToolDefinition[],
  getContexts: () => Context[],
}

export class AgentSessionManager {
  messages$ = new BehaviorSubject<UIMessage[]>([])

  threadId$ = new BehaviorSubject<string | null>(null)

  isAgentResponding$ = new BehaviorSubject<boolean>(false)
  agentRunSubscriptionRef = createRef<Unsubscribable | null>()

  public toolCall$ = new Subject<{ toolCall: ToolCall }>()

  private eventHandler: AgentEventHandler = new AgentEventHandler(this)

  constructor(private readonly agentProvider: IAgentProvider, options?: {
    initialMessages?: UIMessage[],
  }) {
    const { initialMessages = [] } = options || {}
    this.messages$.next(initialMessages)
  }


  // 获取当前消息
  getMessages() {
    return this.messages$.getValue()
  }

  // 允许外部直接设置消息列表
  public setMessages(messages: UIMessage[]): void {
    this.messages$.next(messages)
  }

  handleEvent(event: BaseEvent) {
    this.eventHandler.handleEvent(event)
  }


  // 重置会话
  reset() {
    this.messages$.next([])
    this.eventHandler.reset()
    this.threadId$.next(null)
    this.isAgentResponding$.next(false)
  }

  addMessages(messages: UIMessage[]) {
    this.messages$.next([...this.getMessages(), ...messages])
  }

  removeMessages(messageIds: string[]) {
    if (messageIds.length === 0) return
    this.messages$.next(this.getMessages().filter(msg => !messageIds.includes(msg.id)))
  }

  /**
   * 添加 tool result 消息
   * @param result { toolCallId, result, status, error? }
   * @param options { triggerAgent?: boolean }
   */
  addToolResult(result: { toolCallId: string, result: unknown, state: ToolInvocationState, error?: string }, _options?: { triggerAgent?: boolean }): void {
    const targetMessage = this.getMessages().find(msg => msg.parts.find(part => part.type === "tool-invocation" && part.toolInvocation.toolCallId === result.toolCallId))
    if (!targetMessage) {
      return
    }

    const newMessage: UIMessage = {
      ...targetMessage,
      parts: targetMessage.parts.map(part => {
        if (part.type === "tool-invocation" && part.toolInvocation.toolCallId === result.toolCallId) {
          return {
            ...part,
            toolInvocation: {
              ...part.toolInvocation,
              result: result.result,
              state: result.state,
              error: result.error,
            },
          }
        }
        return part
      }),
    }
    this.messages$.next(this.getMessages().map(msg => msg.id === targetMessage.id ? newMessage : msg))
  }

  handleAgentResponse = (response: Observable<BaseEvent>) => {
    if (this.agentRunSubscriptionRef.current) {
      this.agentRunSubscriptionRef.current.unsubscribe()
    }
    this.agentRunSubscriptionRef.current = response.subscribe((event: BaseEvent) => {
      this.handleEvent(event)
      if (
        event.type === EventType.RUN_FINISHED ||
        event.type === EventType.RUN_ERROR
      ) {
        this.isAgentResponding$.next(false)
        this.agentRunSubscriptionRef.current = null
      }
    })
  }

  abortAgentRun = () => {
    if (this.agentRunSubscriptionRef.current) {
      this.agentRunSubscriptionRef.current.unsubscribe()
      this.agentRunSubscriptionRef.current = null
      this.isAgentResponding$.next(false)
    }
  }


  runAgent = async () => {
    this.isAgentResponding$.next(true)
    try {
      const response = await this.agentProvider.agent.run({
        threadId: this.threadId$.getValue() ?? "",
        runId: v4(),
        messages: convertUIMessagesToMessages(this.getMessages()),
        tools: this.agentProvider.getToolDefs(),
        context: this.agentProvider.getContexts(),
        state: {},
        forwardedProps: {},
      })
      this.handleAgentResponse(response as unknown as Observable<BaseEvent>)
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        // 用户主动终止
        console.info('Agent run aborted')
      } else {
        console.error('Error running agent:', error)
      }
      this.isAgentResponding$.next(false)
    }
  }

  handleAddToolResult = async (result: ToolResult, options?: { triggerAgent?: boolean }) => {
    const { triggerAgent } = options || {}
    await this.addToolResult(result, { triggerAgent })
    if (triggerAgent) {
      await this.runAgent()
    }
  }
  handleAddMessages = async (messages: UIMessage[], options?: { triggerAgent?: boolean }) => {
    const { triggerAgent = true } = options || {}
    console.log('[useAgentChat] addMessages', messages)

    try {
      this.addMessages(messages)

      if (triggerAgent) {
        await this.runAgent()
      }
    } catch (error) {
      console.error('Error adding messages:', error)
      if (triggerAgent) {
        this.isAgentResponding$.next(false)
      }
    }
  }

  handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    this.addMessages([{
      id: v4(),
      role: 'user',
      content,
      parts: [{
        type: 'text',
        text: content,
      }],
    }])
    await this.runAgent()
  }

  connectToolExecutor = (toolExecutorManager: AgentToolExecutorManager) => {
    const sub = this.toolCall$.subscribe(async ({ toolCall }) => {
      const executor = toolExecutorManager.getToolExecutor(toolCall.function.name)
      if (executor) {
        try {
          const result = await executor(toolCall)
          this.addToolResult({ toolCallId: toolCall.id, result, state: "result" })
          if (this.threadId$.getValue()) await this.runAgent()
        } catch (err) {
          this.addToolResult({ toolCallId: toolCall.id, result: { error: err instanceof Error ? err.message : String(err) }, state: "result" })
          if (this.threadId$.getValue()) await this.runAgent()
        }
      }
    })
    return () => sub.unsubscribe()

  }
} 