import React, { useContext, useMemo } from 'react'
import { BotIcon, UserIcon } from './components/icons'
import { MarkdownRenderer } from './components/markdown-renderer'
import { Avatar, AvatarFallback } from './components/ui/avatar'
import { AgentToolRendererManagerContext } from './hooks/use-provide-agent-tool-renderers'
import type { ToolCall, ToolRenderer, ToolResult } from './types'
import type { Message } from '@ag-ui/client'

interface ChatWindowProps {
  messages: Message[]
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
}

const ToolCallRenderer: React.FC<{
  tool: ToolCall
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
}> = ({ tool, toolRenderers, onToolResult }) => {
  const renderer = toolRenderers[tool.function.name]
  if (!renderer) {
    return (
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-sm text-muted-foreground">
          Unknown tool: {tool.function.name}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {renderer.render(tool, (result) => {
        if (onToolResult) {
          onToolResult(result)
        }
      })}
    </div>
  )
}

const MessageItem: React.FC<{
  message: Message
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
}> = ({ message, toolRenderers, onToolResult }) => {
  const isUser = message.role === 'user'

  const toolRendererManager = useContext(AgentToolRendererManagerContext)
  const allToolRenderers = useMemo(() => {
    return {
      ...Object.fromEntries(
        toolRendererManager
          .getToolRenderers()
          .map((renderer) => [renderer.definition.name, renderer]),
      ),
      ...toolRenderers,
    }
  }, [toolRenderers, toolRendererManager])

  return (
    <div className="flex w-full justify-end p-3">
      <div
        className={`flex max-w-[80%] items-start gap-3 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback
            className={
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-success text-success-foreground'
            }
          >
            {isUser ? <UserIcon /> : <BotIcon />}
          </AvatarFallback>
        </Avatar>
        <div
          className={`flex-1 overflow-hidden rounded-lg p-3 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-card-foreground'
          }`}
        >
          {message.content && (
            <div className="break-words">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
          {!isUser &&
            'toolCalls' in message &&
            message.toolCalls &&
            message.toolCalls.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.toolCalls.map((tool: ToolCall) => (
                  <ToolCallRenderer
                    key={`${message.id}-${tool.id}`}
                    tool={tool}
                    toolRenderers={allToolRenderers}
                    onToolResult={onToolResult}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  toolRenderers,
  onToolResult,
}) => {
  return (
    <div className="flex-1 overflow-y-auto pb-5">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          toolRenderers={toolRenderers}
          onToolResult={onToolResult}
        />
      ))}
    </div>
  )
}
