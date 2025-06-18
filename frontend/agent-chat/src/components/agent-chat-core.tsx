import * as React from 'react'
import { useImperativeHandle, useState } from 'react'
import { useAgentChat } from '../hooks/use-agent-chat'
import type { AgentChatProps, AgentChatRef } from '../types/agent-chat-component'
import { ChatInterface } from './chat-interface'
import '../styles/globals.css'

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
    const { uiMessages, isLoading, sendMessage, addToolResult: sendToolResult, reset } =
      useAgentChat({
        agent,
        tools: toolsList,
        contexts: contexts,
        initialMessages,
      })

    const handleSend = async () => {
      await sendMessage(input)
      setInput('')
    }

    useImperativeHandle(
      ref,
      () => ({
        reset,
      }),
      [],
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
          isLoading={isLoading}
        />
      </div>
    )
  },
)
