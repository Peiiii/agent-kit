import * as React from 'react'
import { cn } from '../../lib/utils'

interface AIGeneratingIndicatorProps {
  className?: string
}

export const AIGeneratingIndicator: React.FC<AIGeneratingIndicatorProps> = ({
  className
}) => {
  return (
    <div className={cn('flex items-center py-1', className)}>
      <style>{`
        @keyframes dotBounce {
          0%, 100% {
            transform: translateY(2px);
          }
          50% {
            transform: translateY(-2px);
          }
        }
      `}</style>
      <div className="flex items-center space-x-1">
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full"
          style={{
            animation: 'dotBounce 1.4s infinite',
            animationDelay: '-0.3s'
          }}
        ></div>
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full"
          style={{
            animation: 'dotBounce 1.4s infinite',
            animationDelay: '-0.15s'
          }}
        ></div>
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full"
          style={{
            animation: 'dotBounce 1.4s infinite',
            animationDelay: '0s'
          }}
        ></div>
      </div>
    </div>
  )
}
