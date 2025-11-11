import React, { useState } from 'react'
import { Smile } from 'lucide-react'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'
import type { ChatInputExtension } from '@agent-labs/agent-chat'

interface EmojiExtensionProps {
  className?: string
  onEmojiSelect?: (emoji: string) => void
}

export const EmojiExtension: React.FC<EmojiExtensionProps> = ({
  className,
  onEmojiSelect
}) => {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowPicker(!showPicker)}
        className={cn('h-8 w-8 hover:bg-accent/50', className)}
        title="Emoji"
      >
        <Smile className="h-4 w-4" />
      </Button>
      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2 z-50 bg-background border rounded-lg shadow-lg p-2">
          <div className="grid grid-cols-6 gap-1">
            {['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '😊', '😢', '😮', '😡'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onEmojiSelect?.(emoji)
                  setShowPicker(false)
                }}
                className="p-2 hover:bg-accent rounded text-lg"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export const createEmojiExtension = (props?: EmojiExtensionProps): ChatInputExtension => ({
  id: 'emoji-picker',
  placement: 'bottom-right',
  render: (ctx) => (
    <div className="relative">
      <EmojiExtension
        {...props}
        onEmojiSelect={(emoji) => {
          ctx.setDraft(prev => ({
            ...prev,
            text: prev.text + emoji
          }))
        }}
      />
    </div>
  )
})
