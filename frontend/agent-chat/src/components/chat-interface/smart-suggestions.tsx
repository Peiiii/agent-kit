import { Code, Zap, Palette, FileText, Search, Lightbulb, TrendingUp, Clock } from 'lucide-react'
import * as React from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

export interface SmartSuggestion {
  id: string
  text: string
  icon: React.ReactNode
  category: 'action' | 'question' | 'creative' | 'technical' | 'recent' | 'trending'
  description?: string
  tags?: string[]
  usage?: number
}

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[]
  onSuggestionClick: (suggestion: SmartSuggestion) => void
  onCategoryFilter?: (category: string) => void
  selectedCategory?: string
  maxSuggestions?: number
  showCategories?: boolean
  className?: string
}

const CATEGORY_CONFIG = {
  action: {
    label: '操作',
    icon: <Zap className="h-3 w-3" />,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
  },
  question: {
    label: '问题',
    icon: <Search className="h-3 w-3" />,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  },
  creative: {
    label: '创作',
    icon: <Palette className="h-3 w-3" />,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
  },
  technical: {
    label: '技术',
    icon: <Code className="h-3 w-3" />,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
  },
  recent: {
    label: '最近',
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
  },
  trending: {
    label: '热门',
    icon: <TrendingUp className="h-3 w-3" />,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
  }
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  onCategoryFilter,
  selectedCategory,
  maxSuggestions = 8,
  showCategories = true,
  className
}) => {
  const [hoveredSuggestion, setHoveredSuggestion] = React.useState<string | null>(null)

  // 获取分类列表
  const categories = React.useMemo(() => {
    const categorySet = new Set(suggestions.map(s => s.category))
    return Array.from(categorySet).map(category => ({
      key: category,
      ...CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
    }))
  }, [suggestions])

  // 过滤建议
  const filteredSuggestions = React.useMemo(() => {
    let filtered = suggestions
    
    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory)
    }
    
    return filtered.slice(0, maxSuggestions)
  }, [suggestions, selectedCategory, maxSuggestions])

  // 按使用频率排序
  const sortedSuggestions = React.useMemo(() => {
    return [...filteredSuggestions].sort((a, b) => {
      if (a.usage && b.usage) {
        return b.usage - a.usage
      }
      return 0
    })
  }, [filteredSuggestions])

  return (
    <div className={cn('space-y-3', className)}>
      {/* 分类过滤器 */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryFilter?.('')}
            className="h-7 px-3 text-xs"
          >
            全部
          </Button>
          {categories.map(category => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryFilter?.(category.key)}
              className="h-7 px-3 text-xs"
            >
              {category.icon}
              <span className="ml-1">{category.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* 建议列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sortedSuggestions.map((suggestion) => {
          const categoryConfig = CATEGORY_CONFIG[suggestion.category]
          const isHovered = hoveredSuggestion === suggestion.id
          
          return (
            <div
              key={suggestion.id}
              className="group"
              onMouseEnter={() => setHoveredSuggestion(suggestion.id)}
              onMouseLeave={() => setHoveredSuggestion(null)}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className={cn(
                  'w-full h-auto p-3 text-left justify-start hover:bg-accent/50 transition-all duration-200',
                  isHovered && 'shadow-md scale-[1.02]'
                )}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* 图标 */}
                  <div className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                    categoryConfig.color
                  )}>
                    {suggestion.icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {suggestion.text}
                      </p>
                      {suggestion.usage && suggestion.usage > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.usage}
                        </Badge>
                      )}
                    </div>
                    
                    {suggestion.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {suggestion.description}
                      </p>
                    )}

                    {/* 标签 */}
                    {suggestion.tags && suggestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {suggestion.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs px-1.5 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {suggestion.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            +{suggestion.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 悬停时的操作提示 */}
                  {isHovered && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lightbulb className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Button>
            </div>
          )
        })}
      </div>

      {/* 空状态 */}
      {filteredSuggestions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无建议</p>
          <p className="text-xs">尝试输入一些内容来获取智能建议</p>
        </div>
      )}
    </div>
  )
}

// 默认建议数据
export const DEFAULT_SUGGESTIONS: SmartSuggestion[] = [
  {
    id: '1',
    text: '帮我写一个React组件',
    icon: <Code className="h-3 w-3" />,
    category: 'technical',
    description: '创建一个可复用的React组件，包含最佳实践',
    tags: ['React', '组件', '前端'],
    usage: 15
  },
  {
    id: '2',
    text: '解释一下这个概念',
    icon: <Search className="h-3 w-3" />,
    category: 'question',
    description: '用简单易懂的方式解释复杂概念',
    tags: ['解释', '学习', '概念'],
    usage: 12
  },
  {
    id: '3',
    text: '创作一个故事',
    icon: <Palette className="h-3 w-3" />,
    category: 'creative',
    description: '根据你的想法创作有趣的故事',
    tags: ['故事', '创作', '文学'],
    usage: 8
  },
  {
    id: '4',
    text: '分析这个数据',
    icon: <FileText className="h-3 w-3" />,
    category: 'action',
    description: '对数据进行深入分析和可视化',
    tags: ['数据', '分析', '可视化'],
    usage: 20
  },
  {
    id: '5',
    text: '优化这段代码',
    icon: <Zap className="h-3 w-3" />,
    category: 'technical',
    description: '提高代码性能和可读性',
    tags: ['优化', '性能', '代码'],
    usage: 18
  },
  {
    id: '6',
    text: '生成API文档',
    icon: <FileText className="h-3 w-3" />,
    category: 'action',
    description: '为API接口生成详细的文档',
    tags: ['API', '文档', '开发'],
    usage: 10
  }
]

export { SmartSuggestions }
