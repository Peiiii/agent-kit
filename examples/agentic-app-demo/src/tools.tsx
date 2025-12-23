import { useMemo } from 'react'
import type { Tool } from '@agent-labs/agent-chat'
import { ToolInvocationStatus } from '@agent-labs/agent-chat'
import { ReminderRenderer } from './renderers/reminder-renderer'

type CalculatorArgs = { expression: string }
type WeatherArgs = { city: string }
type ReminderArgs = { task: string; defaultPriority?: 'low' | 'medium' | 'high' }

const calculatorTool: Tool<CalculatorArgs, { value: number }> = {
  name: 'calculator',
  description: 'Evaluate a math expression with + - * / ( ) and %.',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Math expression, e.g. 12*(3+4)/2',
      },
    },
    required: ['expression'],
  },
  execute: async ({ expression }) => {
    const safeExpression = expression.trim()
    if (!/^[0-9+\-*/().\s%]+$/.test(safeExpression)) {
      throw new Error('Invalid expression')
    }
    const evaluator = new Function(`"use strict"; return (${safeExpression});`)
    const value = Number(evaluator())
    if (Number.isNaN(value)) {
      throw new Error('Expression did not evaluate to a number')
    }
    return { value }
  },
}

const weatherTool: Tool<WeatherArgs, { forecast: string }> = {
  name: 'weather_lookup',
  description: 'Return a mock weather forecast for a city.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name' },
    },
    required: ['city'],
  },
  execute: async ({ city }) => {
    const normalized = city.trim() || 'unknown city'
    return { forecast: `${normalized}：晴，24℃，微风。` }
  },
}

const reminderTool: Tool<ReminderArgs, { task: string; priority: 'low' | 'medium' | 'high' }> = {
  name: 'set_reminder_priority',
  description: 'Ask the user to confirm a priority for the task.',
  parameters: {
    type: 'object',
    properties: {
      task: { type: 'string', description: 'Task to schedule' },
      defaultPriority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Suggested priority',
      },
    },
    required: ['task'],
  },
  render: (tool, onResult) => {
    const rawArgs = typeof tool.args === 'string' ? tool.args : ''
    let task = ''
    let defaultPriority: 'low' | 'medium' | 'high' | undefined
    try {
      const obj = JSON.parse(rawArgs) as ReminderArgs
      task = obj.task
      defaultPriority = obj.defaultPriority
    } catch {
      task = rawArgs
    }
    return (
      <ReminderRenderer
        task={task}
        defaultPriority={defaultPriority}
        onSelect={(priority) =>
          onResult({
            toolCallId: tool.toolCallId,
            status: ToolInvocationStatus.RESULT,
            result: { task, priority },
          })
        }
      />
    )
  },
}

export const demoTools = [calculatorTool, weatherTool, reminderTool]

export const useDemoTools = () => useMemo(() => demoTools, [])
