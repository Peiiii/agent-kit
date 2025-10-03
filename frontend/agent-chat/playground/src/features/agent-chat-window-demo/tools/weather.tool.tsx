import { Tool } from "@agent-labs/agent-chat";

export interface WeatherToolArgs {
    city: string
}

export const createWeatherTool = (): Tool<WeatherToolArgs, string> => ({
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
    execute: async (toolCallArgs) => {
        try {
            const { city } = toolCallArgs

            // 模拟天气数据
            const weatherData = {
                '北京': { temperature: '22°C', condition: '晴天', humidity: '45%' },
                '上海': { temperature: '25°C', condition: '多云', humidity: '60%' },
                '广州': { temperature: '28°C', condition: '小雨', humidity: '75%' },
                '深圳': { temperature: '27°C', condition: '晴天', humidity: '50%' }
            }

            const weather = weatherData[city as keyof typeof weatherData] || { temperature: '20°C', condition: '未知', humidity: '50%' }
            const result = `${city}的天气：${weather.condition}，温度${weather.temperature}，湿度${weather.humidity}`
            return result
        } catch (error) {
            throw new Error('天气查询失败')
        }
    },
    render: (toolInvocation, _onResult) => {
        if (!toolInvocation.parsedArgs) return 
        const params = toolInvocation.parsedArgs

        return (
            <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="font-bold mb-2 text-green-800">🌤️ 天气查询</h3>
                <div className="mb-4 space-y-2">
                    <p><strong>城市:</strong> <code className="bg-green-100 px-2 py-1 rounded">{params.city}</code></p>
                </div>
                <div className="text-sm text-green-600">
                    工具已执行，结果已返回给AI助手
                </div>
            </div>
        )
    }
})
