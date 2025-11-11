import { useState, useCallback, useRef } from 'react'

// NOTE: Keep this hook UI-agnostic. Do not import UI components or icons here.

export interface Attachment {
  id: string
  type: 'image' | 'file'
  name: string
  size?: number
  file?: File
}

export interface EnhancedInputState {
  // Voice
  isVoiceRecording: boolean
  audioBlob?: Blob
  // Files
  attachments: Attachment[]
  // Emoji
  showEmojiPicker: boolean
}

export interface EnhancedInputActions {
  // Voice
  startVoiceRecording: () => void
  stopVoiceRecording: () => void
  setAudioBlob: (blob: Blob | undefined) => void
  // Files
  addAttachments: (files: File[]) => void
  removeAttachment: (id: string) => void
  clearAttachments: () => void
  // Emoji
  setShowEmojiPicker: (show: boolean) => void
  insertEmoji: (emoji: string) => void
  // Reset
  reset: () => void
}

// Suggestions removed

export interface UseEnhancedInputOptions {
  maxAttachments?: number
  // Optional validators to keep this hook generic
  validateFile?: (file: File) => boolean
  classifyAttachment?: (file: File) => Attachment['type']
  // When inserting an emoji, append text to the host input
  onAppendText?: (text: string) => void
}

export const useEnhancedInput = (options: UseEnhancedInputOptions = {}): [EnhancedInputState, EnhancedInputActions] => {
  const {
    maxAttachments = 5,
    validateFile,
    classifyAttachment,
    onAppendText,
  } = options

  // Voice
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>()

  // Files
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // Emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Add files (with optional validation/classification)
  const addAttachments = useCallback((files: File[]) => {
    const items: Attachment[] = []
    for (const file of files) {
      if (validateFile && !validateFile(file)) continue
      const type: Attachment['type'] = classifyAttachment
        ? classifyAttachment(file)
        : file.type.startsWith('image/') ? 'image' : 'file'
      items.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        type,
        name: file.name,
        size: file.size,
        file,
      })
    }
    if (items.length === 0) return
    setAttachments(prev => [...prev, ...items].slice(0, maxAttachments))
  }, [maxAttachments, validateFile, classifyAttachment])

  // Remove a file
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }, [])

  const clearAttachments = useCallback(() => {
    setAttachments([])
  }, [])

  // Voice: start
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

  // Voice: stop
  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && isVoiceRecording) {
      mediaRecorderRef.current.stop()
      setIsVoiceRecording(false)
    }
  }, [isVoiceRecording])

  // Emoji: append and close
  const insertEmoji = useCallback((emoji: string) => {
    if (onAppendText) onAppendText(emoji)
    setShowEmojiPicker(false)
  }, [onAppendText])

  // Reset
  const reset = useCallback(() => {
    setAttachments([])
    setAudioBlob(undefined)
    setShowEmojiPicker(false)
    setIsVoiceRecording(false)
  }, [])

  const state: EnhancedInputState = {
    isVoiceRecording,
    audioBlob,
    attachments,
    showEmojiPicker,
  }

  const actions: EnhancedInputActions = {
    startVoiceRecording,
    stopVoiceRecording,
    setAudioBlob,
    addAttachments,
    removeAttachment,
    clearAttachments,
    setShowEmojiPicker,
    insertEmoji,
    reset,
  }

  return [state, actions]
}
