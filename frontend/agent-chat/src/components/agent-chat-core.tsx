import * as React from 'react'
import { useImperativeHandle, useState } from 'react'
import { useAgentChat } from '../hooks/use-agent-chat'
import type { AgentChatProps, AgentChatRef } from '../types/agent-chat-component'
import { ChatInterface } from './chat-interface'
import '../styles/globals.css'
import { v4 } from 'uuid'
import type { Message } from '@ag-ui/client'

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
    const { uiMessages, isLoading, sendMessage, addToolResult: sendToolResult, addMessages, reset } =
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

    const handlePoke = async () => {
      // 创建一个拍一拍的系统消息来唤醒AI
      const pokeMessage: Message = {
        id: v4(),
        role: 'system',
        content: `用户使用了"拍一拍"功能唤醒AI助手。这通常表示用户想要开始对话但不知道说什么，或者希望AI主动提供帮助。请以友好、热情的方式回应，可以：
1. 简单打招呼并询问如何帮助
2. 根据当前上下文（如待办事项、时间等）主动提供建议
3. 介绍一些你能提供的功能

请保持回答简洁、友好且有用。`,
      }

      // 添加消息并触发AI响应
      await addMessages([pokeMessage], { triggerAgent: true })
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
          onPoke={handlePoke}
          isLoading={isLoading}
        />
      </div>
    )
  },
)
