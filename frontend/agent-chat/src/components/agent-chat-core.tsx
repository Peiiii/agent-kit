import { getToolDefFromTool } from '../core/utils/tool'
import * as React from 'react'
import { useImperativeHandle, useMemo, useState } from 'react'
import { useAgentChat } from '../core/hooks/use-agent-chat'
import type {
  AgentChatProps,
  AgentChatRef,
} from '../core/types/component-types'
import '../styles/globals.css'
import { ChatInterface } from './chat-interface'

export const AgentChatCore = React.forwardRef<AgentChatRef, AgentChatProps>(
  (
    {
      agent,
      tools = [],
      contexts: defaultContexts = [],
      initialMessages = [],
      className,
      senderProps,
      promptsProps,
    },
    ref,
  ) => {
    const [input, setInput] = useState('')
    const toolDefs = useMemo(() => tools.map((tool) => {
      return {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      }
    }), [])
    const toolExecutors = useMemo(() => {
      return Object.fromEntries(tools.filter((tool) => tool.execute).map((tool) => [tool.name, tool.execute!]))
    }, [])
    const renderers = useMemo(() => {
      return Object.fromEntries(tools.filter((tool) => tool.render).map((tool) => [tool.name, {
        render: tool.render!,
        definition: getToolDefFromTool(tool),
      }]))
    }, [])
    const {
      messages,
      isAgentResponding,
      sendMessage,
      addToolResult: sendToolResult,
      addMessages,
      reset,
      abortAgentRun,
    } = useAgentChat({
      agent,
      toolDefs,
      toolExecutors,
      contexts: defaultContexts,
      initialMessages,
    })

    const handleSend = async () => {
      if (!isAgentResponding) {
        await sendMessage(input)
        setInput('')
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        reset,
        addMessages,
      }),
      [reset, addMessages],
    )

    return (
      <div className={className}>
        <ChatInterface
          senderProps={senderProps}
          uiMessages={messages}
          toolRenderers={renderers}
          onToolResult={sendToolResult}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isAgentResponding={isAgentResponding}
          onAbort={abortAgentRun}
          promptsProps={promptsProps}
        />
      </div>
    )
  },
)
