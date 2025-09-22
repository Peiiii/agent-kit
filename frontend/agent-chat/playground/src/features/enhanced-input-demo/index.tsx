import { EnhancedMessageInput } from '@agent-labs/agent-chat'
import { Zap } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { createEmojiExtension, createFileUploadExtension, createVoiceInputExtension } from '../../extensions'

export function EnhancedInputDemo() {
  const [input, setInput] = useState('')
  const [isAgentResponding, setIsAgentResponding] = useState(false)

  const inputExtensions = [
    createVoiceInputExtension({
      onVoiceResult: (text) => {
        setInput(prev => prev + text)
      }
    }),
    createFileUploadExtension({
      maxFileSize: 10 * 1024 * 1024,
      acceptedFileTypes: ['image/*', '.pdf', '.txt', '.md', '.json']
    }),
    createEmojiExtension()
  ]

  const handleSend = () => {
    if (!input.trim()) return

    console.log('Send message:', input)
    setIsAgentResponding(true)

    setTimeout(() => {
      setIsAgentResponding(false)
      setInput('')
    }, 2000)
  }


  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Enhanced Input Experience Demo
          </h1>
          <p className="text-lg text-gray-600">
            Experience world-class AI conversation input interface
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          {/* 功能展示 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Core Features
                </CardTitle>
                <CardDescription>
                  Experience multimodal input
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Voice Input</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">文件上传</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">表情选择</span>
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
                {/* 建议功能已移除 */}
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
          <div className="space-y-6 flex flex-col min-h-0">
            <Card>
              <CardHeader>
                <CardTitle>增强输入组件</CardTitle>
                <CardDescription>
                  体验完整的输入功能
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <EnhancedMessageInput
                  input={input}
                  onInputChange={setInput}
                  onSend={handleSend}
                  isAgentResponding={isAgentResponding}
                  onAbort={() => setIsAgentResponding(false)}
                  placeholder="输入消息或使用下方功能..."
                  isProcessing={false}
                  variant="default"
                  size="md"
                  inputExtensions={inputExtensions}
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
