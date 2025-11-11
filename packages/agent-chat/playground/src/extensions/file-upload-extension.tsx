import React, { useRef, useCallback } from 'react'
import { Paperclip } from 'lucide-react'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'
import type { ChatInputExtension } from '@agent-labs/agent-chat'

interface FileUploadExtensionProps {
  maxFileSize?: number
  acceptedFileTypes?: string[]
  className?: string
}

export const FileUploadExtension: React.FC<FileUploadExtensionProps> = ({
  maxFileSize = 10 * 1024 * 1024,
  acceptedFileTypes = ['image/*', '.pdf', '.txt', '.md', '.json'],
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        console.warn(`File ${file.name} exceeds size limit`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      console.log('Upload files:', validFiles)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [maxFileSize])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className={cn('h-8 w-8 hover:bg-accent/50', className)}
        title="Upload file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  )
}

export const createFileUploadExtension = (props?: FileUploadExtensionProps): ChatInputExtension => ({
  id: 'file-upload',
  placement: 'bottom-right',
  render: () => <FileUploadExtension {...props} />
})
