import * as React from 'react'
import { useImperativeHandle, useState } from 'react'
import { useAgentSessionManagerState } from '../core/hooks/use-agent-chat'
import type {
  AgentChatProps,
  AgentChatRef,
} from '../core/types/component-types'
import '../styles/globals.css'
import { ChatInterface } from './chat-interface'

export const AgentChatCore = React.forwardRef<AgentChatRef, AgentChatProps>(
  (
    {
      agentSessionManager,
      toolRenderers,
      className,
      senderProps,
      promptsProps,
      messageItemProps,
    },
    ref,
  ) => {
    const [input, setInput] = useState('')

    const { messages, isAgentResponding } = useAgentSessionManagerState(agentSessionManager)
    const { handleSendMessage, handleAddToolResult, reset, addMessages, abortAgentRun, handleAddMessages } = agentSessionManager

    const handleSend = async () => {
      if (!isAgentResponding) {
        await handleSendMessage(input)
        setInput('')
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        reset,
        addMessages: handleAddMessages,
      }),
      [reset, addMessages],
    )

    return (
      <div className={className}>
        <ChatInterface
          senderProps={senderProps}
          uiMessages={messages}
          toolRenderers={toolRenderers}
          onToolResult={handleAddToolResult}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isAgentResponding={isAgentResponding}
          onAbort={abortAgentRun}
          promptsProps={promptsProps}
          messageItemProps={messageItemProps}
        />
      </div>
    )
  },
)
