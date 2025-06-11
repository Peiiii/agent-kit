import * as React from 'react'
import { CloseIcon, MinimizeIcon } from '../icons'
import { Button } from '../ui/button'
import type { ReactNode } from 'react'

export interface WindowProps {
  title: string
  isMinimized: boolean
  onMinimize: () => void
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
  width?: number
  height?: number
  minimizedHeight?: number
}

export const Window: React.FC<WindowProps> = ({
  title,
  isMinimized,
  onMinimize,
  onClose,
  children,
  actions,
  width = 400,
  height = 600,
  minimizedHeight = 60,
}) => {
  return (
    <div
      className="fixed bottom-5 right-5 flex flex-col rounded-lg bg-[hsl(var(--background))] shadow-lg transition-all duration-300 ease-in-out z-50"
      style={{
        width: `${width}px`,
        height: isMinimized ? `${minimizedHeight}px` : `${height}px`,
      }}
    >
      <div
        className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 cursor-pointer select-none"
        onClick={onMinimize}
      >
        <span className="font-medium text-[hsl(var(--foreground))]">
          {title}
        </span>
        <div className="flex items-center space-x-2">
          {actions}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
          >
            <MinimizeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {!isMinimized && (
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      )}
    </div>
  )
}
