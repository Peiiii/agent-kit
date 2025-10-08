import { Copy, RotateCcw, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface MessageAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export interface MessageActionsProps {
  actions: MessageAction[]
  className?: string
  showOnHover?: boolean
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  actions,
  className,
  showOnHover = true,
}) => {
  const [isVisible, setIsVisible] = React.useState(!showOnHover)

  const handleMouseEnter = React.useCallback(() => {
    if (showOnHover) {
      setIsVisible(true)
    }
  }, [showOnHover])

  const handleMouseLeave = React.useCallback(() => {
    if (showOnHover) {
      setIsVisible(false)
    }
  }, [showOnHover])

  if (actions.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 transition-all duration-200 ease-in-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className="flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          title={action.label}
        >
          {action.icon}
          <span className="sr-only">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

// 预定义的动作类型
export const MessageActionTypes = {
  COPY: 'copy',
  REGENERATE: 'regenerate',
  LIKE: 'like',
  DISLIKE: 'dislike',
  SHARE: 'share',
} as const

// 预定义的动作图标
export const MessageActionIcons = {
  copy: <Copy className="h-4 w-4" />,
  regenerate: <RotateCcw className="h-4 w-4" />,
  like: <ThumbsUp className="h-4 w-4" />,
  dislike: <ThumbsDown className="h-4 w-4" />,
  share: <Share2 className="h-4 w-4" />,
} as const
