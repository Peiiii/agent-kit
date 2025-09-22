import { Mic, MicOff, Square, Play, Pause } from 'lucide-react'
import * as React from 'react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface VoiceRecorderProps {
  isRecording: boolean
  isPlaying: boolean
  audioBlob?: Blob
  onStart: () => void
  onStop: () => void
  onPlay?: () => void
  onPause?: () => void
  onClear?: () => void
  className?: string
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  isPlaying,
  audioBlob,
  onStart,
  onStop,
  onPlay,
  onPause,
  onClear,
  className
}) => {
  const [recordingTime, setRecordingTime] = React.useState(0)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  // 录音时间计时器
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // 处理音频播放
  React.useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [audioBlob])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.()
      audioRef.current?.pause()
    } else {
      onPlay?.()
      audioRef.current?.play()
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 录音状态指示器 */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>录音中 {formatTime(recordingTime)}</span>
        </div>
      )}

      {/* 录音控制按钮 */}
      <div className="flex items-center gap-1">
        {!isRecording ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStart}
            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="开始录音"
          >
            <Mic className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="h-8 w-8 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
            title="停止录音"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 音频播放控制 */}
      {audioUrl && !isRecording && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className="h-8 w-8"
            title={isPlaying ? '暂停播放' : '播放录音'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="清除录音"
            >
              <MicOff className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* 隐藏的音频元素 */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => onPause?.()}
          className="hidden"
        />
      )}
    </div>
  )
}
