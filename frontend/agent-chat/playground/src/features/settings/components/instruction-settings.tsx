import { Button } from '@/components/ui/button'
import { ChevronDown, Settings, X, Edit2, Check } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'

interface Instruction {
  description: string
  value: string
}

interface InstructionSettingsProps {
  instructions: Array<Instruction>
  onInstructionsChange: (instructions: Array<Instruction>) => void
}

const STORAGE_KEY = 'aiInstructions'

export function InstructionSettings({ onInstructionsChange }: Omit<InstructionSettingsProps, 'instructions'>) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newInstruction, setNewInstruction] = useState<Instruction>({ description: '', value: '' })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingInstruction, setEditingInstruction] = useState<Instruction>({ description: '', value: '' })

  // 使用 useLocalStorage Hook 管理指令列表
  const { data: storedInstructions, setData: setStoredInstructions } = useLocalStorage<Instruction[]>({
    key: STORAGE_KEY,
    initialValue: [],
    onLoad: (loadedInstructions) => {
      if (loadedInstructions.length > 0) {
        onInstructionsChange(loadedInstructions)
      }
    },
  })

  const handleAddInstruction = () => {
    if (newInstruction.description && newInstruction.value) {
      const updatedInstructions = [...storedInstructions, newInstruction]
      setStoredInstructions(updatedInstructions)
      onInstructionsChange(updatedInstructions)
      setNewInstruction({ description: '', value: '' })
    }
  }

  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = [...storedInstructions]
    updatedInstructions.splice(index, 1)
    setStoredInstructions(updatedInstructions)
    onInstructionsChange(updatedInstructions)
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditingInstruction(storedInstructions[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updatedInstructions = [...storedInstructions]
      updatedInstructions[editingIndex] = editingInstruction
      setStoredInstructions(updatedInstructions)
      onInstructionsChange(updatedInstructions)
      setEditingIndex(null)
      setEditingInstruction({ description: '', value: '' })
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingInstruction({ description: '', value: '' })
  }

  return (
    <div className="border rounded-lg p-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
          <h3 className="text-sm font-medium">自定义 AI 助手指令</h3>
        </div>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
            {/* 现有指令列表 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">当前指令</h3>
            {storedInstructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                {editingIndex === index ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editingInstruction.description}
                      onChange={(e) =>
                        setEditingInstruction({
                          ...editingInstruction,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                    />
                    <textarea
                      value={editingInstruction.value}
                      onChange={(e) =>
                        setEditingInstruction({
                          ...editingInstruction,
                          value: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md h-24"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 mr-1" />
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{instruction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {instruction.value}
                    </p>
                  </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(index)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInstruction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                    </div>
                  </>
                )}
                </div>
              ))}
            </div>

            {/* 添加新指令 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">添加新指令</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="指令描述"
                  value={newInstruction.description}
                  onChange={(e) =>
                    setNewInstruction({
                      ...newInstruction,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
                <textarea
                  placeholder="指令内容"
                  value={newInstruction.value}
                  onChange={(e) =>
                    setNewInstruction({
                      ...newInstruction,
                      value: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-md h-24"
                />
                <Button onClick={handleAddInstruction}>添加指令</Button>
              </div>
            </div>
          </div>
      )}
    </div>
  )
} 