import { Tool } from "@agent-labs/agent-chat";

export interface GreetingToolArgs {
    name: string
    time?: string
}

export const createGreetingTool = (): Tool<GreetingToolArgs, string> => ({
    name: 'greeting',
    description: '生成友好的问候语',
    parameters: {
        type: 'object' as const,
        properties: {
            name: {
                type: 'string' as const,
                description: '要问候的人名'
            },
            time: {
                type: 'string' as const,
                description: '问候的时间（早上、下午、晚上）'
            }
        },
        required: ['name']
    },
    execute: async (toolCallArgs: GreetingToolArgs) => {
        try {
            const { name, time } = toolCallArgs

            const currentTime = time || getCurrentTimeOfDay()
            const greeting = generateGreeting(name, currentTime)

            return greeting
        } catch (error) {
            throw new Error('问候语生成失败')
        }
    },
    render: (toolInvocation) => {
        if (!toolInvocation.parsedArgs) return 
        const params = toolInvocation.parsedArgs
        return (
            <div className="p-4 border rounded-lg bg-yellow-50">
                <h3 className="font-bold mb-2 text-yellow-800">👋 问候语生成</h3>
                <div className="mb-4 space-y-2">
                    <p><strong>姓名:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{params.name}</code></p>
                    {params.time && (
                        <p><strong>时间:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{params.time}</code></p>
                    )}
                </div>
                <div className="text-sm text-yellow-600">
                    工具已执行，结果已返回给AI助手
                </div>
            </div>
        )
    }
})

// 辅助函数
function getCurrentTimeOfDay(): string {
    const hour = new Date().getHours()
    if (hour < 12) return '早上'
    if (hour < 18) return '下午'
    return '晚上'
}

function generateGreeting(name: string, time: string): string {
    const greetings = {
        '早上': `早上好，${name}！祝你今天心情愉快，工作顺利！`,
        '下午': `下午好，${name}！下午时光美好，继续保持好心情！`,
        '晚上': `晚上好，${name}！今天辛苦了，好好休息！`
    }
    return greetings[time as keyof typeof greetings] || `你好，${name}！祝你开心每一天！`
}
