import { Bot, User } from 'lucide-react'
import * as React from 'react'
import { useContext, useMemo } from 'react'
import { AgentToolRendererManagerContext } from '../../hooks/use-provide-agent-tool-renderers'

import { MarkdownRenderer } from '../markdown-renderer'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import type { ToolCall, ToolRenderer, ToolResult } from '../../types'
import { ToolCallRenderer } from './tool-call-renderer'
import type { Message } from '@ag-ui/client'

interface MessageItemProps {
  message: Message
  toolRenderers: Record<string, ToolRenderer>
  onToolResult?: (result: ToolResult) => void
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  toolRenderers,
  onToolResult,
}) => {
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
    <div className={`flex w-full justify-${isUser ? 'end' : 'start'} p-2`}>
      <div
        className={`flex max-w-[80%] w-fit items-start gap-2 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src="" alt={isUser ? 'User' : 'Assistant'} />
          <AvatarFallback
            className={`${
              isUser ? 'bg-primary' : 'bg-success'
            } text-primary-foreground`}
          >
            {isUser ? (
              <User className="h-5 w-5" />
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>
        <div
          className={`min-w-0 flex-1 max-w-full overflow-hidden rounded-lg p-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
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
              <div className="mt-1">
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
