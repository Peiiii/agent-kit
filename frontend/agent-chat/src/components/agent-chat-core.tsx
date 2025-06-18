import * as React from 'react'
import { useImperativeHandle, useState } from 'react'
import { useAgentChat } from '../hooks/use-agent-chat'
import '../styles/globals.css'
import type {
  AgentChatProps,
  AgentChatRef,
} from '../types/agent-chat-component'
import { ChatInterface } from './chat-interface'

export const AgentChatCore = React.forwardRef<AgentChatRef, AgentChatProps>(
  (
    {
      agent,
      toolRenderers: renderers = {},
      tools: toolsList = [],
      contexts = [],
      initialMessages = [],
      className,
    },
    ref,
  ) => {
    const [input, setInput] = useState('')
    const {
      uiMessages,
      isAgentResponding,
      sendMessage,
      addToolResult: sendToolResult,
      addMessages,
      reset,
    } = useAgentChat({
      agent,
      tools: toolsList,
      contexts: contexts,
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
          uiMessages={uiMessages}
          toolRenderers={renderers}
          onToolResult={sendToolResult}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isAgentResponding={isAgentResponding}
        />
      </div>
    )
  },
)
