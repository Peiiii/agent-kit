import { Tool, ToolResult } from "@agent-labs/agent-chat";
import { ToolInvocation } from "@ai-sdk/ui-utils";
import React from "react";

export const createCalculatorTool = (): Tool => ({
    name: 'calculate',
    description: '执行基本的数学计算',
    parameters: {
        type: 'object' as const,
        properties: {
            expression: {
                type: 'string' as const,
                description: '数学表达式，如 "2 + 3 * 4"'
            }
        },
        required: ['expression']
    },
    execute: async (toolCall) => {
        try {
            const args = JSON.parse(toolCall.function.arguments)
            const { expression } = args

            // 使用 Function 构造函数来安全地执行数学表达式
            const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')
            const calculateFunction = new Function(`return ${sanitizedExpression}`)
            const result = calculateFunction()

            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error('计算结果无效')
            }

            return {
                toolCallId: toolCall.id,
                result: `计算结果：${expression} = ${result}`,
                status: 'success' as const
            }
        } catch (error) {
            return {
                toolCallId: toolCall.id,
                result: '计算失败',
                status: 'error' as const,
                error: String(error)
            }
        }
    },
    render: (toolInvocation: ToolInvocation, onResult: (result: ToolResult) => void) => {
        const params = toolInvocation.args as {
            expression: string
        }

        // 自动执行计算并返回结果
        React.useEffect(() => {
            const executeCalculation = async () => {
                try {
                    const { expression } = params

                    // 使用 Function 构造函数来安全地执行数学表达式
                    const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')
                    const calculateFunction = new Function(`return ${sanitizedExpression}`)
                    const result = calculateFunction()

                    if (typeof result !== 'number' || !isFinite(result)) {
                        throw new Error('计算结果无效')
                    }

                    onResult({
                        toolCallId: toolInvocation.toolCallId,
                        result: `计算结果：${expression} = ${result}`,
                        status: 'success',
                    })
                } catch (error) {
                    onResult({
                        toolCallId: toolInvocation.toolCallId,
                        result: '计算失败',
                        status: 'error',
                        error: String(error)
                    })
                }
            }

            executeCalculation()
        }, [params, toolInvocation.toolCallId, onResult])

        return (
            <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-bold mb-2 text-blue-800">🧮 数学计算器</h3>
                <div className="mb-4 space-y-2">
                    <p><strong>表达式:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{params.expression}</code></p>
                </div>
                <div className="text-sm text-blue-600">
                    正在计算中...
                </div>
            </div>
        )
    }
})
