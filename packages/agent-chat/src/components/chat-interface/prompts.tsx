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
    <div>
      <div className="flex flex-col">
        {items.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "group w-full h-auto justify-start text-left py-1.5 px-3",
              "rounded-lg border border-transparent",
              "hover:bg-muted hover:border-border hover:shadow-sm",
              "transition-all duration-200 ease-out",
              "active:scale-[0.98]",
              "whitespace-normal break-words"
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
            <span className="text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors duration-200 leading-relaxed">
              {item.prompt}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
