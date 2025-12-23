import { useState } from 'react'

export function ReminderRenderer({
  task,
  defaultPriority,
  onSelect,
}: {
  task: string
  defaultPriority?: string
  onSelect: (priority: 'low' | 'medium' | 'high') => void
}) {
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    defaultPriority === 'high' || defaultPriority === 'low' ? defaultPriority : 'medium',
  )
  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
      <div className="font-semibold">确认任务优先级</div>
      <div className="text-gray-600">任务：{task || '未提供任务描述'}</div>
      <div className="flex gap-2">
        {(['low', 'medium', 'high'] as const).map(level => (
          <button
            key={level}
            type="button"
            className={`rounded px-3 py-1 text-xs border ${priority === level ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700'}`}
            onClick={() => setPriority(level)}
          >
            {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="self-start rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
        onClick={() => onSelect(priority)}
      >
        确认
      </button>
    </div>
  )
}
