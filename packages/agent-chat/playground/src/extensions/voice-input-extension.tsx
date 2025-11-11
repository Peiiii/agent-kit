import React, { useState, useCallback, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'
import type { ChatInputExtension } from '@agent-labs/agent-chat'

interface VoiceInputExtensionProps {
  onVoiceResult?: (text: string) => void
  className?: string
}

export const VoiceInputExtension: React.FC<VoiceInputExtensionProps> = ({
  onVoiceResult,
  className
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
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
        stream.getTracks().forEach(track => track.stop())
        
        if (onVoiceResult) {
          onVoiceResult('Voice recording completed')
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting voice recording:', error)
    }
  }, [onVoiceResult])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const handleToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        'h-8 w-8 transition-colors',
        isRecording
          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
          : 'hover:bg-accent/50',
        className
      )}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
}

export const createVoiceInputExtension = (props?: VoiceInputExtensionProps): ChatInputExtension => ({
  id: 'voice-input',
  placement: 'bottom-right',
  render: (ctx) => (
    <VoiceInputExtension
      {...props}
      onVoiceResult={(text) => {
        ctx.setDraft(prev => ({
          ...prev,
          text: prev.text + text
        }))
      }}
    />
  )
})
