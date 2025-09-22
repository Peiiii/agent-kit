import { Smile, Search, Clock, Heart, ThumbsUp } from 'lucide-react'
import * as React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn } from '../../lib/utils'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
  className?: string
}

interface EmojiCategory {
  name: string
  icon: React.ReactNode
  emojis: string[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: '最近使用',
    icon: <Clock className="h-4 w-4" />,
    emojis: ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥']
  },
  {
    name: '表情符号',
    icon: <Smile className="h-4 w-4" />,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
    ]
  },
  {
    name: '手势',
    icon: <ThumbsUp className="h-4 w-4" />,
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '👎', '👍', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊'
    ]
  },
  {
    name: '心形',
    icon: <Heart className="h-4 w-4" />,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
    ]
  }
]

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  onClose,
  className
}) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState(0)
  const [recentEmojis, setRecentEmojis] = React.useState<string[]>([])

  // 从本地存储加载最近使用的表情
  React.useEffect(() => {
    const stored = localStorage.getItem('recent-emojis')
    if (stored) {
      try {
        setRecentEmojis(JSON.parse(stored))
      } catch (e) {
        console.warn('Failed to load recent emojis:', e)
      }
    }
  }, [])

  // 保存最近使用的表情
  const saveRecentEmoji = (emoji: string) => {
    const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 8)
    setRecentEmojis(updated)
    localStorage.setItem('recent-emojis', JSON.stringify(updated))
  }

  // 处理表情选择
  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji)
    saveRecentEmoji(emoji)
  }

  // 过滤表情
  const filteredEmojis = React.useMemo(() => {
    if (!searchTerm) {
      return EMOJI_CATEGORIES[selectedCategory]?.emojis || []
    }
    
    // 简单的表情搜索（实际应用中可能需要更复杂的搜索逻辑）
    return EMOJI_CATEGORIES.flatMap(cat => cat.emojis)
      .filter(emoji => emoji.includes(searchTerm))
      .slice(0, 50) // 限制搜索结果数量
  }, [searchTerm, selectedCategory])

  // 更新分类数据（包含最近使用的表情）
  const categoriesWithRecent = React.useMemo(() => {
    if (recentEmojis.length === 0) {
      return EMOJI_CATEGORIES
    }
    
    return [
      { ...EMOJI_CATEGORIES[0], emojis: recentEmojis },
      ...EMOJI_CATEGORIES.slice(1)
    ]
  }, [recentEmojis])

  return (
    <div className={cn(
      'w-80 h-96 bg-background border rounded-lg shadow-lg flex flex-col',
      className
    )}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium">选择表情</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索表情..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* 分类标签 */}
      {!searchTerm && (
        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          {categoriesWithRecent.map((category, index) => (
            <Button
              key={index}
              variant={selectedCategory === index ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(index)}
              className="h-7 px-2 text-xs whitespace-nowrap"
            >
              {category.icon}
              <span className="ml-1 hidden sm:inline">{category.name}</span>
            </Button>
          ))}
        </div>
      )}

      {/* 表情网格 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleEmojiSelect(emoji)}
              className="h-8 w-8 p-0 text-lg hover:bg-accent/50 transition-colors"
              title={emoji}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {/* 空状态 */}
        {filteredEmojis.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Smile className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">未找到表情</p>
          </div>
        )}
      </div>
    </div>
  )
}
