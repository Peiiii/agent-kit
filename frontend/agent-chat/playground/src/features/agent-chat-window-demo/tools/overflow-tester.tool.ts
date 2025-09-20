import type { Tool, ToolCall } from "@agent-labs/agent-chat"

type Args = {
  mode?: 'args_only' | 'with_result'
  lineLength?: number
  lines?: number
  nested?: boolean
  useArray?: boolean
  contentChar?: string
}

const makeLongString = (length: number, ch: string) => {
  const c = (ch && ch.length > 0 ? ch[0] : 'A')
  return new Array(Math.max(0, length)).fill(c).join('')
}

const buildPayload = (args: Required<Pick<Args, 'lineLength' | 'lines' | 'nested' | 'useArray' | 'contentChar'>>) => {
  const { lineLength, lines, nested, useArray, contentChar } = args
  const sampleLine = makeLongString(lineLength, contentChar)
  const dataLines = new Array(lines).fill(0).map((_, i) => `${i + 1}:${sampleLine}`)
  if (nested) {
    const deep = {
      level1: {
        level2: {
          level3: {
            longToken: sampleLine + sampleLine,
            lines: dataLines,
          },
        },
      },
    }
    return useArray ? [deep, deep, deep] : deep
  }
  return useArray ? dataLines : { lines: dataLines, longToken: sampleLine + sampleLine }
}

export const createOverflowTesterTool = (): Tool => ({
  name: 'overflow_tester',
  description: '生成超长参数和结果，验证默认工具展示的换行与滚动行为（无自定义 render）',
  parameters: {
    type: 'object' as const,
    properties: {
      mode: { type: 'string' as const, enum: ['args_only', 'with_result'], description: '是否返回结果' },
      lineLength: { type: 'number' as const, description: '每行字符数，默认 4000' },
      lines: { type: 'number' as const, description: '行数，默认 4' },
      nested: { type: 'boolean' as const, description: '是否嵌套对象' },
      useArray: { type: 'boolean' as const, description: '是否返回数组结构' },
      contentChar: { type: 'string' as const, description: '使用的字符，例如 A/Z/0 等' },
    },
  },
  execute: async (toolCall: ToolCall) => {
    const args = JSON.parse(toolCall.function.arguments) as Args
    const {
      mode = 'with_result',
      lineLength = 4000,
      lines = 4,
      nested = false,
      useArray = false,
      contentChar = 'A',
    } = args || {}

    if (mode === 'args_only') {
      // 不返回任何结果，便于只看参数渲染
      return { note: 'no result returned by design' } as any
    }

    const payload = buildPayload({ lineLength, lines, nested, useArray, contentChar })
    return {
      ok: true,
      meta: { lineLength, lines, nested, useArray },
      payload,
    } as any
  },
})

