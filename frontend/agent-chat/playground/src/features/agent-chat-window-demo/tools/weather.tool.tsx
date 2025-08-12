import { Tool, ToolCall, ToolResult } from "@agent-labs/agent-chat";
import { ToolInvocation } from "@ai-sdk/ui-utils";
import React from "react";

export const createWeatherTool = (): Tool => ({
    name: 'getWeather',
    description: '获取指定城市的天气信息',
    parameters: {
        type: 'object' as const,
        properties: {
            city: {
                type: 'string' as const,
                description: '城市名称'
            }
        },
        required: ['city']
    },
    execute: async (toolCall: ToolCall) => {
        try {
            const args = JSON.parse(toolCall.function.arguments)
            const { city } = args

            // 模拟天气数据
            const weatherData = {
                '北京': { temperature: '22°C', condition: '晴天', humidity: '45%' },
                '上海': { temperature: '25°C', condition: '多云', humidity: '60%' },
                '广州': { temperature: '28°C', condition: '小雨', humidity: '75%' },
                '深圳': { temperature: '27°C', condition: '晴天', humidity: '50%' }
            }

            const weather = weatherData[city as keyof typeof weatherData] || { temperature: '20°C', condition: '未知', humidity: '50%' }
            const result = `${city}的天气：${weather.condition}，温度${weather.temperature}，湿度${weather.humidity}`

            return {
                toolCallId: toolCall.id,
                result,
                status: 'success' as const
            }
        } catch (error) {
            return {
                toolCallId: toolCall.id,
                result: '天气查询失败',
                status: 'error' as const,
                error: String(error)
            }
        }
    },
    render: (toolInvocation: ToolInvocation, onResult: (result: ToolResult) => void) => {
        const params = toolInvocation.args as {
            city: string
        }

        // 自动执行天气查询并返回结果
        React.useEffect(() => {
            const executeWeatherQuery = async () => {
                try {
                    const { city } = params

                    // 模拟天气数据
                    const weatherData = {
                        '北京': { temperature: '22°C', condition: '晴天', humidity: '45%' },
                        '上海': { temperature: '25°C', condition: '多云', humidity: '60%' },
                        '广州': { temperature: '28°C', condition: '小雨', humidity: '75%' },
                        '深圳': { temperature: '27°C', condition: '晴天', humidity: '50%' }
                    }

                    const weather = weatherData[city as keyof typeof weatherData] || { temperature: '20°C', condition: '未知', humidity: '50%' }
                    const result = `${city}的天气：${weather.condition}，温度${weather.temperature}，湿度${weather.humidity}`

                    onResult({
                        toolCallId: toolInvocation.toolCallId,
                        result,
                        status: 'success',
                    })
                } catch (error) {
                    onResult({
                        toolCallId: toolInvocation.toolCallId,
                        result: '天气查询失败',
                        status: 'error',
                        error: String(error)
                    })
                }
            }

            executeWeatherQuery()
        }, [params, toolInvocation.toolCallId, onResult])

        return (
            <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-bold mb-2 text-green-800">🌤️ 天气查询</h3>
                <div className="mb-4 space-y-2">
                    <p><strong>城市:</strong> <code className="bg-green-100 px-2 py-1 rounded">{params.city}</code></p>
                </div>
                <div className="text-sm text-green-600">
                    正在查询天气信息...
                </div>
            </div>
        )
    }
})
