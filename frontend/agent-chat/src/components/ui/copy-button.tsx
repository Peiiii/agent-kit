import { Check, Copy } from 'lucide-react'
import * as React from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'default' | 'lg' | 'icon'
  variant?: 'ghost' | 'outline' | 'secondary'
  showText?: boolean
  onCopy?: (text: string) => void
  onError?: (error: Error) => void
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className,
  size = 'icon',
  variant = 'ghost',
  showText = false,
  onCopy,
  onError,
}) => {
  const [copied, setCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    if (!text || isLoading) return

    setIsLoading(true)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.(text)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
      onError?.(error as Error)
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        setCopied(true)
        onCopy?.(text)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        onError?.(fallbackError as Error)
      }
    } finally {
      setIsLoading(false)
    }
  }, [text, isLoading, onCopy, onError])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={isLoading || !text}
      className={cn(
        'transition-all duration-200',
        copied && 'text-green-600 dark:text-green-400',
        className
      )}
      title={copied ? '已复制' : '复制'}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {copied ? '已复制' : '复制'}
        </span>
      )}
    </Button>
  )
}
