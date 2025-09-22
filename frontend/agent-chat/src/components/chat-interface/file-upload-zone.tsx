import { Upload, File, Image, X, CheckCircle, AlertCircle } from 'lucide-react'
import * as React from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

interface FileUploadZoneProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  onRemove: (index: number) => void
  maxFiles?: number
  maxFileSize?: number
  acceptedTypes?: string[]
  className?: string
}

interface FilePreviewProps {
  file: File
  onRemove: () => void
  isValid: boolean
  error?: string
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, isValid, error }) => {
  const [preview, setPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn(
      'relative flex items-center gap-3 p-3 rounded-lg border transition-colors',
      isValid ? 'bg-muted/50 border-border' : 'bg-destructive/10 border-destructive/20'
    )}>
      {/* 文件预览 */}
      <div className="flex-shrink-0">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
            {getFileIcon()}
          </div>
        )}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{file.name}</p>
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <Badge variant="outline" className="text-xs">
            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
          </Badge>
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>

      {/* 删除按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  files,
  onFilesChange,
  onRemove,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', '.pdf', '.txt', '.md', '.json', '.csv'],
  className
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<number, string>>({})
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // 验证文件
  const validateFile = (file: File, index: number): boolean => {
    const newErrors = { ...errors }
    
    // 检查文件大小
    if (file.size > maxFileSize) {
      newErrors[index] = `文件大小超过 ${Math.round(maxFileSize / 1024 / 1024)}MB 限制`
      setErrors(newErrors)
      return false
    }

    // 检查文件类型
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace('*', '.*'))
    })

    if (!isValidType) {
      newErrors[index] = '不支持的文件类型'
      setErrors(newErrors)
      return false
    }

    // 清除错误
    delete newErrors[index]
    setErrors(newErrors)
    return true
  }

  // 处理文件选择
  const handleFiles = (newFiles: File[]) => {
    const validFiles: File[] = []

    newFiles.forEach((file, index) => {
      const globalIndex = files.length + index
      if (validateFile(file, globalIndex)) {
        validFiles.push(file)
      }
    })

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }
  }

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (files.length + droppedFiles.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个文件`)
      return
    }
    
    handleFiles(droppedFiles)
  }

  // 处理文件输入
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个文件`)
      return
    }
    
    handleFiles(selectedFiles)
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理删除文件
  const handleRemove = (index: number) => {
    onRemove(index)
    // 清除对应的错误
    const newErrors = { ...errors }
    delete newErrors[index]
    setErrors(newErrors)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => handleRemove(index)}
              isValid={!errors[index]}
              error={errors[index]}
            />
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {files.length < maxFiles && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            点击或拖拽文件到此处上传
          </p>
          <p className="text-xs text-muted-foreground">
            支持 {acceptedTypes.join(', ')}，最大 {Math.round(maxFileSize / 1024 / 1024)}MB
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            还可上传 {maxFiles - files.length} 个文件
          </p>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
