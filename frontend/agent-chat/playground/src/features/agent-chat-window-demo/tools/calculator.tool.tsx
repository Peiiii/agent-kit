import { Tool, ToolInvocation, ToolResult } from "@agent-labs/agent-chat";

export interface CalculatorToolArgs {
    expression: string
}

export const createCalculatorTool = (): Tool<CalculatorToolArgs, string> => ({
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
    execute: async (toolCallArgs: CalculatorToolArgs) => {
        try {
            const { expression } = toolCallArgs
            // 使用 Function 构造函数来安全地执行数学表达式
            const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')
            const calculateFunction = new Function(`return ${sanitizedExpression}`)
            const result = calculateFunction()

            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error('计算结果无效')
            }
            return result.toString()
        } catch (error) {
            throw new Error('计算失败')
        }
    },
    render: (toolInvocation: ToolInvocation<CalculatorToolArgs, string>, _onResult: (result: ToolResult<string>) => void) => {
        const params = toolInvocation.args

        return (
            <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-bold mb-2 text-blue-800">🧮 数学计算器</h3>
                <div className="mb-4 space-y-2">
                    <p><strong>表达式:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{params.expression}</code></p>
                </div>
                <div className="text-sm text-blue-600">
                    工具已执行，结果已返回给AI助手
                </div>
            </div>
        )
    }
})
