import { useState, useCallback, useRef, useEffect } from 'react'
import type { SmartSuggestion } from '../../components/chat-interface/smart-suggestions'
import { DEFAULT_SUGGESTIONS } from '../../components/chat-interface/smart-suggestions'

export interface Attachment {
  id: string
  type: 'image' | 'file' | 'code'
  name: string
  preview?: string
  size?: number
  file?: File
}

export interface EnhancedInputState {
  // 基础状态
  input: string
  isFocused: boolean
  isProcessing: boolean
  
  // 多模态状态
  isVoiceRecording: boolean
  voiceText: string
  audioBlob?: Blob
  
  // 文件状态
  attachments: Attachment[]
  isDragOver: boolean
  
  // 智能建议状态
  suggestions: SmartSuggestion[]
  showSuggestions: boolean
  selectedSuggestionIndex: number
  
  // 表情选择器状态
  showEmojiPicker: boolean
  
  // 高级功能状态
  showAdvancedOptions: boolean
  currentMode: 'text' | 'voice' | 'image' | 'file'
}

export interface EnhancedInputActions {
  // 基础操作
  setInput: (input: string) => void
  setFocused: (focused: boolean) => void
  setProcessing: (processing: boolean) => void
  
  // 多模态操作
  startVoiceRecording: () => void
  stopVoiceRecording: () => void
  setVoiceText: (text: string) => void
  setAudioBlob: (blob: Blob | undefined) => void
  
  // 文件操作
  addAttachments: (files: File[]) => void
  removeAttachment: (id: string) => void
  setDragOver: (dragOver: boolean) => void
  
  // 智能建议操作
  setSuggestions: (suggestions: SmartSuggestion[]) => void
  setShowSuggestions: (show: boolean) => void
  selectSuggestion: (index: number) => void
  applySuggestion: (suggestion: SmartSuggestion) => void
  
  // 表情选择器操作
  setShowEmojiPicker: (show: boolean) => void
  insertEmoji: (emoji: string) => void
  
  // 高级功能操作
  setShowAdvancedOptions: (show: boolean) => void
  setCurrentMode: (mode: 'text' | 'voice' | 'image' | 'file') => void
  
  // 工具操作
  clearAll: () => void
  reset: () => void
}

export interface UseEnhancedInputOptions {
  initialInput?: string
  maxAttachments?: number
  maxFileSize?: number
  acceptedFileTypes?: string[]
  enableVoiceRecording?: boolean
  enableFileUpload?: boolean
  enableSmartSuggestions?: boolean
  enableEmojiPicker?: boolean
  customSuggestions?: SmartSuggestion[]
}

export const useEnhancedInput = (options: UseEnhancedInputOptions = {}): [EnhancedInputState, EnhancedInputActions] => {
  const {
    initialInput = '',
    maxAttachments = 5,
    customSuggestions = DEFAULT_SUGGESTIONS
  } = options

  // 基础状态
  const [input, setInput] = useState(initialInput)
  const [isFocused, setIsFocused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // 多模态状态
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>()
  
  // 文件状态
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  
  // 智能建议状态
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>(customSuggestions)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  
  // 表情选择器状态
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  // 高级功能状态
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [currentMode, setCurrentMode] = useState<'text' | 'voice' | 'image' | 'file'>('text')

  // 语音录制相关
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // 处理文件上传
  const addAttachments = useCallback((files: File[]) => {
    const newAttachments: Attachment[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith('image/') ? 'image' : 
            file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.jsx') ? 'code' : 'file',
      name: file.name,
      size: file.size,
      file
    }))

    setAttachments(prev => [...prev, ...newAttachments].slice(0, maxAttachments))
  }, [maxAttachments])

  // 删除附件
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }, [])

  // 语音录制开始
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsVoiceRecording(true)
    } catch (error) {
      console.error('Error starting voice recording:', error)
    }
  }, [])

  // 语音录制停止
  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && isVoiceRecording) {
      mediaRecorderRef.current.stop()
      setIsVoiceRecording(false)
    }
  }, [isVoiceRecording])

  // 应用智能建议
  const applySuggestion = useCallback((suggestion: SmartSuggestion) => {
    setInput(prev => prev + suggestion.text)
    setShowSuggestions(false)
    
    // 更新建议使用频率
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id 
          ? { ...s, usage: (s.usage || 0) + 1 }
          : s
      )
    )
  }, [])

  // 插入表情
  const insertEmoji = useCallback((emoji: string) => {
    setInput(prev => prev + emoji)
    setShowEmojiPicker(false)
  }, [])

  // 清空所有
  const clearAll = useCallback(() => {
    setInput('')
    setAttachments([])
    setVoiceText('')
    setAudioBlob(undefined)
    setShowSuggestions(false)
    setShowEmojiPicker(false)
  }, [])

  // 重置
  const reset = useCallback(() => {
    setInput(initialInput)
    setAttachments([])
    setVoiceText('')
    setAudioBlob(undefined)
    setShowSuggestions(false)
    setShowEmojiPicker(false)
    setIsVoiceRecording(false)
    setIsProcessing(false)
    setCurrentMode('text')
  }, [initialInput])

  // 自动显示建议
  useEffect(() => {
    if (input.length === 0 && isFocused) {
      setShowSuggestions(true)
    } else if (input.length > 0) {
      setShowSuggestions(false)
    }
  }, [input, isFocused])

  // 状态对象
  const state: EnhancedInputState = {
    input,
    isFocused,
    isProcessing,
    isVoiceRecording,
    voiceText,
    audioBlob,
    attachments,
    isDragOver,
    suggestions,
    showSuggestions,
    selectedSuggestionIndex,
    showEmojiPicker,
    showAdvancedOptions,
    currentMode
  }

  // 操作对象
  const actions: EnhancedInputActions = {
    setInput,
    setFocused: setIsFocused,
    setProcessing: setIsProcessing,
    startVoiceRecording,
    stopVoiceRecording,
    setVoiceText,
    setAudioBlob,
    addAttachments,
    removeAttachment,
    setDragOver: setIsDragOver,
    setSuggestions,
    setShowSuggestions,
    selectSuggestion: setSelectedSuggestionIndex,
    applySuggestion,
    setShowEmojiPicker,
    insertEmoji,
    setShowAdvancedOptions,
    setCurrentMode,
    clearAll,
    reset
  }

  return [state, actions]
}
