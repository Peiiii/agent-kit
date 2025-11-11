import * as React from 'react'
import { useImperativeHandle, useState } from 'react'
import { useAgentSessionManagerState } from '../core/hooks/use-agent-chat'
import type {
  AgentChatProps,
  AgentChatRef,
  ComposerDraft,
} from '../core/types/component-types'
import '../styles/globals.css'
import { ChatInterface } from './chat-interface'
import { AgentSessionManagerContext } from './contexts'

export const AgentChat = React.forwardRef<AgentChatRef, AgentChatProps>(
  (
    {
      agentChatController,
      toolRenderers,
      className,
      senderProps,
      promptsProps,
      messageItemProps,
      aboveInputComponent,
      inputExtensions,
      onBeforeSend,
      meta,
      onMetaChange,
    },
    ref,
  ) => {
    const [input, setInput] = useState('')

    const { messages, isAgentResponding } = useAgentSessionManagerState(agentChatController)
    const { handleSendMessage, handleAddToolResult, reset, addMessages, abortAgentRun, handleAddMessages } = agentChatController

    const handleSend = async () => {
      if (!isAgentResponding) {
        await handleSendMessage(input)
        setInput('')
      }
    }

    const handleSendDraft = async (draft: ComposerDraft) => {
      if (!isAgentResponding) {
        const text = (draft?.text ?? '').toString()
        if (text.trim().length === 0) return
        await handleSendMessage(text)
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
        <AgentSessionManagerContext.Provider value={agentChatController}>
          <ChatInterface
            senderProps={senderProps}
            uiMessages={messages}
            toolRenderers={toolRenderers}
            onToolResult={handleAddToolResult}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onSendDraft={handleSendDraft}
            isAgentResponding={isAgentResponding}
            onAbort={abortAgentRun}
            promptsProps={promptsProps}
            messageItemProps={messageItemProps}
            aboveInputComponent={aboveInputComponent}
            inputExtensions={inputExtensions}
            onBeforeSend={onBeforeSend}
            meta={meta}
            onMetaChange={onMetaChange}
          />  
        </AgentSessionManagerContext.Provider>
      </div>
    )
  },
)
