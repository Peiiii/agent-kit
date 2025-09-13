import { Button } from '@/components/ui/button'
import { HttpAgent } from '@ag-ui/client'
import { AgentChatWindow, AgentChatRef } from '@agent-labs/agent-chat'
import { Bot, MessageSquare, Settings, Users, Zap } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { createGreetingTool, createWeatherTool, createCalculatorTool, createUserConfirmationTool } from './tools'

// 创建 HTTP 代理实例
const agent = new HttpAgent({
    url: 'http://localhost:8000/openai-agent',
})

const DEFAULT_PROMPTS = [
    { id: '1', prompt: '待办事项' },
    { id: '2', prompt: '23455*34=?' },
    { id: '3', prompt: '源代码管理' },
]

export function AgentChatWindowDemo() {
    const chatRef = useRef<AgentChatRef | null>(null)

    // 创建工具列表
    const tools = useMemo(() => [
        createGreetingTool(),
        createWeatherTool(),
        createCalculatorTool(),
        createUserConfirmationTool(),
    ], [])

    // 定义上下文信息
    const contexts = useMemo(() => [
        {
            description: '用户信息',
            value: JSON.stringify({
                name: '访客',
                role: '用户',
                preferences: {
                    language: 'zh-CN',
                    responseStyle: '友好',
                    enableEmojis: true
                }
            })
        },
        {
            description: '系统信息',
            value: JSON.stringify({
                version: '1.0.0',
                features: ['聊天', '工具调用', '上下文管理'],
                lastUpdate: new Date().toISOString()
            })
        }
    ], [])

    // 拍一拍功能
    const handlePoke = async () => {
        if (chatRef.current?.addMessages) {
            await chatRef.current.addMessages([
                {
                    id: uuidv4(),
                    role: 'system',
                    parts: [{
                        type: 'text',
                        text: `用户使用了"拍一拍"功能。请以友好、热情的方式回应，可以：
1. 简单打招呼并询问如何帮助
2. 介绍一些你能提供的功能
3. 主动提供一些有趣的对话话题
4. 展示你的工具能力

请保持回答简洁、友好且有用。`,
                    }],
                },
                {
                    id: uuidv4(),
                    role: 'user',
                    parts: [{
                        type: 'text',
                        text: '[action:poke]',
                    }],
                },
            ], { triggerAgent: true })
        }
    }

    // 快速问候功能
    const handleQuickGreeting = async () => {
        if (chatRef.current?.addMessages) {
            await chatRef.current.addMessages([
                {
                    id: uuidv4(),
                    role: 'user',
                    parts: [{
                        type: 'text',
                        text: '你好！请介绍一下你自己和你能做什么。',
                    }],
                },
            ], { triggerAgent: true })
        }
    }

    // 测试工具功能
    const handleTestTools = async () => {
        if (chatRef.current?.addMessages) {
            await chatRef.current.addMessages([
                {
                    id: uuidv4(),
                    role: 'user',
                    parts: [{
                        type: 'text',
                        text: '请演示一下你的工具功能，比如问候、天气查询和计算器。',
                    }],
                },
            ], { triggerAgent: true })
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            {/* 头部信息 */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Agent Chat Window Demo
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        基于 AgentChatWindow 组件的浮动聊天窗口演示
                    </p>

                    {/* 功能按钮区域 */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <Button
                            onClick={handlePoke}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            拍一拍
                        </Button>

                        <Button
                            onClick={handleQuickGreeting}
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            快速问候
                        </Button>

                        <Button
                            onClick={handleTestTools}
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                            <Bot className="h-4 w-4 mr-2" />
                            测试工具
                        </Button>
                    </div>

                    {/* 特性说明 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">浮动窗口</h3>
                            <p className="text-gray-600 text-sm">
                                可拖拽、最大化、最小化的浮动聊天窗口，不占用主界面空间
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Settings className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">工具集成</h3>
                            <p className="text-gray-600 text-sm">
                                内置问候、天气查询、计算器等实用工具，支持自然语言调用
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">上下文感知</h3>
                            <p className="text-gray-600 text-sm">
                                智能上下文管理，记住用户偏好和对话历史，提供个性化体验
                            </p>
                        </div>
                    </div>

                    {/* 使用说明 */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">使用说明</h3>
                        <div className="text-left space-y-2 text-sm text-gray-600">
                            <p>• <strong>拍一拍</strong>：唤醒 AI 助手，获得主动帮助</p>
                            <p>• <strong>快速问候</strong>：开始对话，了解 AI 助手能力</p>
                            <p>• <strong>测试工具</strong>：体验内置工具功能</p>
                            <p>• <strong>窗口控制</strong>：可拖拽、最大化、最小化聊天窗口</p>
                            <p>• <strong>自然对话</strong>：用自然语言描述需求，AI 会自动选择合适的工具</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agent Chat Window 组件 */}
            <AgentChatWindow
                ref={chatRef}
                agent={agent}
                tools={tools}
                contexts={contexts}
                className="z-50"
                promptsProps={{
                    items: DEFAULT_PROMPTS,
                    onItemClick: (item) => {
                        console.log('onItemClick', item)
                        chatRef.current?.addMessages([
                            {
                                id: uuidv4(),
                                role: 'user',
                                parts: [{
                                    type: 'text',
                                    text: item.prompt,
                                }],
                            },
                        ], { triggerAgent: true })
                    },
                }}

            />
        </div>
    )
}
