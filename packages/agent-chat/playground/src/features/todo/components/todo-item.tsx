import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Todo } from '../types'
import { useTodo } from '../hooks/use-todo'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo, updateTodo } = useTodo()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editStartTime, setEditStartTime] = useState(todo.startTime ? todo.startTime.slice(0, 16) : '')
  const [editEndTime, setEditEndTime] = useState(todo.endTime ? todo.endTime.slice(0, 16) : '')

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    await updateTodo({
      id: todo.id,
      title: editTitle,
      startTime: editStartTime ? new Date(editStartTime).toISOString() : undefined,
      endTime: editEndTime ? new Date(editEndTime).toISOString() : undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setEditStartTime(todo.startTime ? todo.startTime.slice(0, 16) : '')
    setEditEndTime(todo.endTime ? todo.endTime.slice(0, 16) : '')
    setIsEditing(false)
  }

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return ''
    return new Date(dateTimeString).toLocaleString('zh-CN')
  }

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
      />
      {isEditing ? (
        <div className="flex-1 space-y-2">
          <Input
            value={editTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditTitle(e.target.value)
            }
            placeholder="待办事项标题"
          />
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={editStartTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditStartTime(e.target.value)
              }
              placeholder="开始时间（可选）"
              className="flex-1"
            />
            <Input
              type="datetime-local"
              value={editEndTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditEndTime(e.target.value)
              }
              placeholder="结束时间（可选）"
            className="flex-1"
          />
          </div>
          <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            保存
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            取消
          </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1">
          <span
              className={`block ${
              todo.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {todo.title}
          </span>
            {(todo.startTime || todo.endTime) && (
              <div className="text-xs text-muted-foreground mt-1">
                {todo.startTime && <span>开始: {formatDateTime(todo.startTime)}</span>}
                {todo.startTime && todo.endTime && <span> | </span>}
                {todo.endTime && <span>结束: {formatDateTime(todo.endTime)}</span>}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              编辑
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTodo(todo.id)}
            >
              删除
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 