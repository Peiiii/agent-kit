import type { PromptsProps } from '@/core/types/component-types'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Prompts = ({ promptsProps }: { promptsProps: PromptsProps }) => {
  const { items, onItemClick } = promptsProps

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <Button
            key={item.id}
            variant="outline"
            size="sm"
            className={cn(
              "h-auto p-3 text-left justify-start hover:bg-accent/50 transition-all duration-200",
              "group hover:shadow-sm hover:border-primary/20 hover:scale-[1.02]",
              "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40"
            )}
            onClick={() => onItemClick?.(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onItemClick?.(item)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`选择提示: ${item.prompt}`}
          >
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 leading-relaxed">
              {item.prompt}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}