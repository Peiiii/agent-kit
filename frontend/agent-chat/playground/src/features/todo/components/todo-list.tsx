import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useTodo } from '../hooks/use-todo'
import { TodoItem } from './todo-item'

export function TodoList() {
  const { state, addTodo } = useTodo()
  const [newTodoTitle, setNewTodoTitle] = useState('')

  const handleAddTodo = async () => {
    if (newTodoTitle.trim()) {
      await addTodo(newTodoTitle.trim())
      setNewTodoTitle('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newTodoTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTodoTitle(e.target.value)
          }
          placeholder="添加新的待办事项..."
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              handleAddTodo()
            }
          }}
        />
        <Button onClick={handleAddTodo}>添加</Button>
      </div>

      <div className="space-y-2">
        {state.todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>

      {state.error && (
        <div className="text-destructive text-sm">{state.error}</div>
      )}
    </div>
  )
} 