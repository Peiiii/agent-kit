import * as React from 'react'
import { useImperativeHandle, useState } from 'react'
import { useAgentChat } from '../core/hooks/use-agent-chat'
import '../styles/globals.css'
import type {
  AgentChatProps,
  AgentChatRef,
} from '../core/types/agent-chat-component'
import { ChatInterface } from './chat-interface'

export const AgentChatCore = React.forwardRef<AgentChatRef, AgentChatProps>(
  (
    {
      agent,
      defaultToolRenderers: renderers = {},
      defaultToolDefs: toolsList = [],
      defaultToolExecutors = {},
      defaultContexts = [],
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
      abortAgentRun,
    } = useAgentChat({
      agent,
      defaultToolDefs: toolsList,
      defaultToolExecutors,
      defaultContexts: defaultContexts,
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
          onAbort={abortAgentRun}
        />
      </div>
    )
  },
)
