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

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    await updateTodo(todo.id, editTitle)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
      />
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <Input
            value={editTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditTitle(e.target.value)
            }
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleSave}>
            保存
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            取消
          </Button>
        </div>
      ) : (
        <>
          <span
            className={`flex-1 ${
              todo.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {todo.title}
          </span>
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