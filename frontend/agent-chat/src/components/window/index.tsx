import type { ReactNode } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '../ui/button'

export interface WindowProps {
  title: string
  isMaximized: boolean
  onMaximize: () => void
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
  width?: number
  height?: number
}

export const Window: React.FC<WindowProps> = ({
  title,
  isMaximized,
  onMaximize,
  onClose,
  children,
  actions,
  width = 400,
  height = 600,
}) => {
  return (
    <div
      className="fixed bottom-5 right-5 flex flex-col rounded-lg bg-background shadow-lg transition-all duration-300 ease-in-out z-50"
      style={{
        width: isMaximized ? 'calc(100vw - 40px)' : `${width}px`,
        height: isMaximized ? 'calc(100vh - 40px)' : `${height}px`,
        bottom: isMaximized ? '20px' : '20px',
        right: isMaximized ? '20px' : '20px',
      }}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3 cursor-pointer select-none">
        <span className="font-medium text-foreground">{title}</span>
        <div
          className="flex items-center space-x-2"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {actions}
          <Button size="icon" variant="ghost" onClick={onMaximize}>
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  )
}
