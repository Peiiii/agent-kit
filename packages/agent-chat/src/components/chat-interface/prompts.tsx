import type { PromptsProps } from '@/core/types/component-types'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 估算文字宽度的阈值（字符数），超过此长度视为"长文本"
const LONG_TEXT_THRESHOLD = 20

export const Prompts = ({ promptsProps }: { promptsProps: PromptsProps }) => {
  const { items, onItemClick } = promptsProps
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(1)

  // 计算合适的列数
  const calculateColumns = useCallback(() => {
    if (!items || items.length === 0) return

    // 检查是否所有 prompt 都是短文本
    const allShort = items.every(item => item.prompt.length <= LONG_TEXT_THRESHOLD)

    if (!allShort) {
      setColumns(1)
      return
    }

    // 所有都是短文本时，根据容器宽度决定列数
    const containerWidth = containerRef.current?.offsetWidth || 400
    const avgLength = items.reduce((sum, item) => sum + item.prompt.length, 0) / items.length

    // 估算每个 prompt 需要的宽度（每个字符约 14px + padding）
    const estimatedItemWidth = avgLength * 14 + 40

    // 计算能放下多少列
    const possibleColumns = Math.floor(containerWidth / estimatedItemWidth)
    setColumns(Math.max(1, Math.min(possibleColumns, items.length, 3))) // 最多3列
  }, [items])

  useEffect(() => {
    calculateColumns()

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(calculateColumns)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [calculateColumns])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div ref={containerRef}>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {items.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "group h-auto justify-start text-left py-1.5 px-3 w-full",
              "rounded-lg border border-transparent",
              "hover:bg-muted hover:border-border hover:shadow-sm",
              "transition-all duration-200 ease-out",
              "active:scale-[0.98]",
              columns > 1 ? "whitespace-nowrap overflow-hidden text-ellipsis" : ""
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
