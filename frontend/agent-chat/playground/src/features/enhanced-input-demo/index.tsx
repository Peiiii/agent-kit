import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedMessageInput } from '@agent-labs/agent-chat'
import { Mic, Paperclip, Smile, Code, FileText, Zap, Palette, Search } from 'lucide-react'
import { useState } from 'react'

const DEMO_SUGGESTIONS = [
  {
    id: '1',
    text: '帮我写一个React组件',
    icon: <Code className="h-3 w-3" />,
    category: 'technical',
    description: '创建一个可复用的React组件，包含最佳实践',
    tags: ['React', '组件', '前端'],
    usage: 15
  },
  {
    id: '2',
    text: '解释一下这个概念',
    icon: <Search className="h-3 w-3" />,
    category: 'question',
    description: '用简单易懂的方式解释复杂概念',
    tags: ['解释', '学习', '概念'],
    usage: 12
  },
  {
    id: '3',
    text: '创作一个故事',
    icon: <Palette className="h-3 w-3" />,
    category: 'creative',
    description: '根据你的想法创作有趣的故事',
    tags: ['故事', '创作', '文学'],
    usage: 8
  },
  {
    id: '4',
    text: '分析这个数据',
    icon: <FileText className="h-3 w-3" />,
    category: 'action',
    description: '对数据进行深入分析和可视化',
    tags: ['数据', '分析', '可视化'],
    usage: 20
  }
]

export function EnhancedInputDemo() {
  const [input, setInput] = useState('')
  const [isAgentResponding, setIsAgentResponding] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return
    
    console.log('发送消息:', { input, attachments })
    setIsAgentResponding(true)
    
    // 模拟AI响应
    setTimeout(() => {
      setIsAgentResponding(false)
      setInput('')
      setAttachments([])
    }, 2000)
  }

  const handleVoiceStart = () => {
    setIsVoiceRecording(true)
    console.log('开始录音')
  }

  const handleVoiceStop = () => {
    setIsVoiceRecording(false)
    console.log('停止录音')
  }

  const handleFileUpload = (files: File[]) => {
    const newAttachments = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
      size: file.size,
      file
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const handleAttachmentRemove = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleSuggestionClick = (suggestion: any) => {
    setInput(prev => prev + suggestion.text)
    setShowSuggestions(false)
  }

  const handleAdvancedOption = (option: string) => {
    console.log('高级选项:', option)
    if (option === 'emoji') {
      // 这里可以显示表情选择器
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            增强输入体验演示
          </h1>
          <p className="text-lg text-gray-600">
            体验世界级的AI对话输入界面
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 功能展示 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  核心功能
                </CardTitle>
                <CardDescription>
                  体验多模态输入和智能建议
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Mic className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">语音输入</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Paperclip className="h-4 w-4 text-green-600" />
                    <span className="text-sm">文件上传</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Smile className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">表情选择</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Search className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">智能建议</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>设计特色</CardTitle>
                <CardDescription>
                  参考顶级AI产品的设计理念
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">多模态交互</h4>
                    <p className="text-sm text-muted-foreground">
                      支持文本、语音、文件等多种输入方式
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">智能建议</h4>
                    <p className="text-sm text-muted-foreground">
                      基于上下文的智能提示和建议
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">流畅动画</h4>
                    <p className="text-sm text-muted-foreground">
                      精心设计的微交互和过渡效果
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">无障碍访问</h4>
                    <p className="text-sm text-muted-foreground">
                      完整的键盘导航和屏幕阅读器支持
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 输入演示 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>增强输入组件</CardTitle>
                <CardDescription>
                  体验完整的输入功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedMessageInput
                  input={input}
                  onInputChange={setInput}
                  onSend={handleSend}
                  isAgentResponding={isAgentResponding}
                  onAbort={() => setIsAgentResponding(false)}
                  placeholder="输入消息或使用下方功能..."
                  // 多模态功能
                  onVoiceStart={handleVoiceStart}
                  onVoiceStop={handleVoiceStop}
                  isVoiceRecording={isVoiceRecording}
                  onFileUpload={handleFileUpload}
                  maxFileSize={10 * 1024 * 1024}
                  acceptedFileTypes={['image/*', '.pdf', '.txt', '.md', '.json']}
                  // 智能建议
                  suggestions={DEMO_SUGGESTIONS}
                  onSuggestionClick={handleSuggestionClick}
                  // 附件管理
                  attachments={attachments}
                  onAttachmentRemove={handleAttachmentRemove}
                  // 高级功能
                  showAdvancedOptions={true}
                  onAdvancedOptionClick={handleAdvancedOption}
                  isProcessing={false}
                  variant="default"
                  size="md"
                />
              </CardContent>
            </Card>

            {/* 状态显示 */}
            <Card>
              <CardHeader>
                <CardTitle>当前状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">输入内容:</span>
                  <span className="text-sm font-mono">{input || '(空)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">附件数量:</span>
                  <span className="text-sm">{attachments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">语音录制:</span>
                  <span className="text-sm">{isVoiceRecording ? '进行中' : '未开始'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">AI响应:</span>
                  <span className="text-sm">{isAgentResponding ? '处理中' : '空闲'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
