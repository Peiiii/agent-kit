import { Send, Square } from 'lucide-react'
import * as React from 'react'

import type { MessageInputProps } from '@/core/types/component-types'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

// A modern, high-UX chat input: multiline with autosize, IME-safe Enter-to-send,
// Shift+Enter for newline, and quick abort while streaming.
export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  onInputChange,
  onSend,
  isAgentResponding,
  onAbort,
  placeholder,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const isComposingRef = React.useRef(false)

  const autosize = React.useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    // Reset then grow up to max height
    el.style.height = 'auto'
    const maxHeight = 200 // ~8-10 lines depending on styles
    const next = Math.min(el.scrollHeight, maxHeight)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [])

  React.useLayoutEffect(() => {
    autosize()
  }, [input, autosize])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Respect IME composition and allow Shift+Enter for newline
    const isEnter = e.key === 'Enter'
    const sendHotkey = (e.metaKey || e.ctrlKey) && isEnter
    const plainEnter = isEnter && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey

    if ((plainEnter || sendHotkey) && !isComposingRef.current) {
      e.preventDefault()
      if (!isAgentResponding && input.trim()) {
        onSend()
      }
    }

    // ESC to abort streaming (if provided)
    if (e.key === 'Escape' && isAgentResponding && onAbort) {
      e.preventDefault()
      onAbort()
    }
  }

  const handleCompositionStart = () => {
    isComposingRef.current = true
  }
  const handleCompositionEnd = () => {
    isComposingRef.current = false
  }

  const canSend = !!input.trim() && !isAgentResponding

  return (
    <div
      className={cn(
        'relative w-full rounded-xl border border-input bg-background/80 px-2 py-1.5 shadow-xs',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition'
      )}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder ?? '发送消息...'}
        rows={1}
        aria-label="消息输入"
        aria-multiline="true"
        aria-busy={isAgentResponding}
        className={cn(
          'min-h-[2.5rem] w-full resize-none bg-transparent px-3 py-2 pr-12 text-sm',
          'placeholder:text-muted-foreground outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />

      <div className="absolute bottom-2 right-2 z-10">
        {!isAgentResponding ? (
          <Button
            variant={canSend ? 'default' : 'ghost'}
            size="icon"
            onClick={onSend}
            disabled={!canSend}
            title="发送 (Enter)"
            type="button"
            className={cn(
              'pointer-events-auto rounded-full transition-transform duration-150',
              canSend
                ? 'shadow-sm hover:shadow-md active:scale-95'
                : 'text-muted-foreground'
            )}
            aria-label="发送"
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAbort?.()
            }}
            title="停止响应 (Esc)"
            aria-label="停止响应"
            className={cn(
              'pointer-events-auto rounded-full transition-transform duration-150',
              'text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95'
            )}
            type="button"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
