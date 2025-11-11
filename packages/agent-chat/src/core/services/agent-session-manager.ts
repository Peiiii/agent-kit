import { createRef } from 'react'
import { BehaviorSubject, Observable, Subject, type Unsubscribable } from 'rxjs'
import { v4 } from 'uuid'
import { EventType, ToolInvocationStatus, type AgentEvent, type IAgent, type ToolExecutor } from '../types'
import type { Context, ToolCall, ToolDefinition, ToolResult } from '../types/agent'
import type { UIMessage } from '../types/ui-message'
import { finalizePendingToolInvocations } from '../utils/ui-message'
import { AgentEventHandler } from './agent-event-handler'


export interface IAgentProvider {
  agent: IAgent,
  getToolDefs: () => ToolDefinition[],
  getContexts: () => Context[],
  getToolExecutor: (name: string) => ToolExecutor | undefined
}

export class Disposable {
  private disposables: (() => void)[] = []


  addDisposable = (disposable: () => void) => {
    this.disposables.push(disposable)
  }

  dispose = () => {
    this.disposables.forEach(disposable => disposable())
    this.disposables = []
  }
}

export class AgentSessionManager extends Disposable {
  _messages$ = new BehaviorSubject<UIMessage[]>([])

  messages$: Observable<UIMessage[]>
  

  threadId$ = new BehaviorSubject<string | null>(null)

  isAgentResponding$ = new BehaviorSubject<boolean>(false)

  agentRunSubscriptionRef = createRef<Unsubscribable | null>()

  addMessagesEvent$ = new Subject<{ messages: UIMessage[] }>()

  updateMessageEvent$ = new Subject<{ message: UIMessage }>()

  setMessagesEvent$ = new Subject<{ messages: UIMessage[] }>()

  public toolCall$ = new Subject<{ toolCall: ToolCall }>()

  private eventHandler: AgentEventHandler = new AgentEventHandler(this)

  constructor(private readonly agentProvider: IAgentProvider, options?: {
    initialMessages?: UIMessage[],
  }) {
    super()
    const { initialMessages = [] } = options || {}
    this._messages$.next(initialMessages)
    this.messages$ = this._messages$.asObservable()
    this.addDisposable(this.connectToolExecutor())
  }


  getMessages = () => {
    return this._messages$.getValue()
  }

  setMessages = (messages: UIMessage[]): void => {
    this._messages$.next(messages)
    this.setMessagesEvent$.next({ messages })
  }

  handleEvent = (event: AgentEvent) => {
    this.eventHandler.handleEvent(event)
  }


  reset = () => {
    this._messages$.next([])
    this.eventHandler.reset()
    this.threadId$.next(null)
    this.isAgentResponding$.next(false)
    this.abortAgentRun()
  }

  addMessages = (messages: UIMessage[]) => {
    this._messages$.next([...this.getMessages(), ...messages])
    this.addMessagesEvent$.next({ messages })
  }

  removeMessages = (messageIds: string[]) => {
    if (messageIds.length === 0) return
    this._messages$.next(this.getMessages().filter(msg => !messageIds.includes(msg.id)))
  }

  updateMessage = (message: UIMessage) => {
    this._messages$.next(this.getMessages().map(msg => msg.id === message.id ? message : msg))
    this.updateMessageEvent$.next({ message })
  }

  /**
   * 添加 tool result 消息
   * @param result { toolCallId, result, state, error? }
   * @param options { triggerAgent?: boolean }
   */
  addToolResult = (result: ToolResult, _options?: { triggerAgent?: boolean }): void => {
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
              result: result.result ?? undefined,
              status: result.status,
              error: result.error ?? undefined,
              cancelled: result.cancelled ?? undefined,
            },
          }
        }
        return part
      }),
    }
    this.updateMessage(newMessage)
  }

  handleAgentResponse = (response: Observable<AgentEvent>) => {
    if (this.agentRunSubscriptionRef.current) {
      this.agentRunSubscriptionRef.current.unsubscribe()
    }
    this.agentRunSubscriptionRef.current = response.subscribe((event: AgentEvent) => {
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
    this.agentProvider.agent.abortRun?.()
    if (this.agentRunSubscriptionRef.current) {
      this.agentRunSubscriptionRef.current.unsubscribe()
      this.agentRunSubscriptionRef.current = null
      this.isAgentResponding$.next(false)
    }
  }


  runAgent = async () => {
    this.isAgentResponding$.next(true)
    try {
      // Repair incomplete tool calls to satisfy providers that require tool results
      const safeMessages = finalizePendingToolInvocations(this.getMessages())
      const response = await this.agentProvider.agent.run({
        threadId: this.threadId$.getValue() ?? "",
        runId: v4(),
        messages: safeMessages,
        tools: this.agentProvider.getToolDefs(),
        context: this.agentProvider.getContexts(),
      })
      this.handleAgentResponse(response as unknown as Observable<AgentEvent>)
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') {
        console.info('Agent run aborted')
      } else {
        console.error('Error running agent:', error)
      }
      this.isAgentResponding$.next(false)
    }
  }

  handleAddToolResult = async (result: ToolResult, options?: { triggerAgent?: boolean }) => {
    const { triggerAgent = true } = options || {}
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
      parts: [{
        type: 'text',
        text: content,
      }],
    }])
    await this.runAgent()
  }

  private connectToolExecutor = () => {
    const sub = this.toolCall$.subscribe(async ({ toolCall }) => {
      const executor = this.agentProvider.getToolExecutor(toolCall.function.name)
      if (executor) {
        try {
          const toolCallArgs = JSON.parse(toolCall.function.arguments)
          const result = await executor(toolCallArgs)
          this.addToolResult({ toolCallId: toolCall.id, result, status: ToolInvocationStatus.RESULT })
          this.runAgent()
        } catch (err) {
          console.error('[AgentSessionManager] handleAddToolResult error', err)
          this.addToolResult({ toolCallId: toolCall.id, error: err instanceof Error ? err.message : String(err), status: ToolInvocationStatus.ERROR })
          this.runAgent()
        }
      }
    })
    return () => sub.unsubscribe()

  }
} 
