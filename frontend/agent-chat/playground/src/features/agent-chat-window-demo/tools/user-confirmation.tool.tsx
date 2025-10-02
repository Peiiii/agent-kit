import { Tool, ToolInvocationStatus, ToolResult } from "@agent-labs/agent-chat";
import { useState } from "react";

export interface UserConfirmationToolArgs {
    action: string
    importance?: 'low' | 'medium' | 'high' | 'critical'
}

export const createUserConfirmationTool = (): Tool<UserConfirmationToolArgs, string> => ({
    name: 'userConfirmation',
    description: '请求用户确认某个操作',
    parameters: {
        type: 'object' as const,
        properties: {
            action: {
                type: 'string' as const,
                description: '需要用户确认的操作描述'
            },
            importance: {
                type: 'string' as const,
                enum: ['low', 'medium', 'high', 'critical'],
                description: '操作的重要程度'
            }
        },
        required: ['action']
    },
    // 注意：这个工具没有 execute 函数，因为需要用户介入
    render: (toolInvocation, onResult: (result: ToolResult<string>) => void) => {
        const params = toolInvocation.args

        const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null)
        const [isLoading, setIsLoading] = useState(false)

        const handleConfirm = async () => {
            setIsLoading(true)
            try {
                // 模拟一些处理时间
                await new Promise(resolve => setTimeout(resolve, 1000))

                onResult({
                    toolCallId: toolInvocation.toolCallId,
                    result: `用户已确认操作：${params.action}`,
                    status: ToolInvocationStatus.RESULT,
                })
                setIsConfirmed(true)
            } catch (error) {
                onResult({
                    toolCallId: toolInvocation.toolCallId,
                    result: '操作确认失败',
                    status: ToolInvocationStatus.ERROR,
                    error: String(error)
                })
                setIsConfirmed(false)
            } finally {
                setIsLoading(false)
            }
        }

        const handleReject = async () => {
            setIsLoading(true)
            try {
                await new Promise(resolve => setTimeout(resolve, 500))

                onResult({
                    toolCallId: toolInvocation.toolCallId,
                    result: `用户已拒绝操作：${params.action}`,
                    status: ToolInvocationStatus.RESULT,
                })
                setIsConfirmed(false)
            } catch (error) {
                onResult({
                    toolCallId: toolInvocation.toolCallId,
                    result: '操作拒绝失败',
                    status: ToolInvocationStatus.ERROR,
                    error: String(error)
                })
            } finally {
                setIsLoading(false)
            }
        }

        // 如果已经有结果，显示结果状态
        if (isConfirmed !== null) {
            return (
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-bold mb-2 text-gray-800">✅ 用户确认工具</h3>
                    <div className="mb-4 space-y-2">
                        <p><strong>操作:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{params.action}</code></p>
                        <p><strong>状态:</strong>
                            <span className={`ml-2 px-2 py-1 rounded text-sm ${isConfirmed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {isConfirmed ? '已确认' : '已拒绝'}
                            </span>
                        </p>
                    </div>
                </div>
            )
        }

        // 显示确认界面
        return (
            <div className="p-4 border rounded-lg bg-orange-50">
                <h3 className="font-bold mb-2 text-orange-800">⚠️ 需要用户确认</h3>
                <div className="mb-4 space-y-2">
                    <p><strong>操作:</strong> <code className="bg-orange-100 px-2 py-1 rounded">{params.action}</code></p>
                    {params.importance && (
                        <p><strong>重要程度:</strong>
                            <span className={`ml-2 px-2 py-1 rounded text-sm ${params.importance === 'critical' ? 'bg-red-100 text-red-800' :
                                    params.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                                        params.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                }`}>
                                {params.importance === 'critical' ? '关键' :
                                    params.importance === 'high' ? '高' :
                                        params.importance === 'medium' ? '中' : '低'}
                            </span>
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '处理中...' : '确认'}
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '处理中...' : '拒绝'}
                    </button>
                </div>
            </div>
        )
    }
})
