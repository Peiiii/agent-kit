# 一键复制功能

## 概述

为AI回复消息添加了一键复制功能，让用户可以轻松复制AI的回复内容。该功能遵循现代UI设计最佳实践，提供优雅的用户体验。

## 功能特性

### 🎯 智能显示
- **悬停显示**：复制按钮只在鼠标悬停在AI消息上时显示
- **仅AI消息**：只对AI助手（assistant）的消息显示复制按钮
- **排除生成中**：正在生成的消息不显示复制按钮

### 🎨 优雅设计
- **半透明背景**：使用 `bg-background/80 backdrop-blur-sm` 创建毛玻璃效果
- **平滑过渡**：按钮显示/隐藏有平滑的透明度过渡
- **状态反馈**：复制成功后显示绿色勾选图标，2秒后自动恢复

### 🔧 技术实现
- **现代API**：优先使用 `navigator.clipboard.writeText()`
- **降级支持**：为旧浏览器提供 `document.execCommand('copy')` 降级方案
- **错误处理**：完善的错误处理和用户反馈机制

## 使用方法

### 基本用法

```tsx
import { CopyButton } from '@/components/ui/copy-button'

<CopyButton 
  text="要复制的文本内容"
  onCopy={(text) => console.log('已复制:', text)}
  onError={(error) => console.error('复制失败:', error)}
/>
```

### 在消息组件中的集成

复制按钮已自动集成到 `MessageItem` 组件中：

```tsx
// 在 MessageItem 组件中自动显示
<MessageItem 
  uiMessage={message}
  toolRenderers={toolRenderers}
  onToolResult={onToolResult}
/>
```

## 组件API

### CopyButton Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `text` | `string` | - | 要复制的文本内容（必需） |
| `className` | `string` | - | 自定义CSS类名 |
| `size` | `'sm' \| 'default' \| 'lg' \| 'icon'` | `'icon'` | 按钮尺寸 |
| `variant` | `'ghost' \| 'outline' \| 'secondary'` | `'ghost'` | 按钮样式变体 |
| `showText` | `boolean` | `false` | 是否显示文本标签 |
| `onCopy` | `(text: string) => void` | - | 复制成功回调 |
| `onError` | `(error: Error) => void` | - | 复制失败回调 |

## 工具函数

### message-utils.ts

提供消息文本提取的实用函数：

```tsx
import { 
  extractTextFromMessage, 
  hasCopyableText, 
  getMessagePreview 
} from '@/core/utils/message-utils'

// 提取消息中的纯文本
const text = extractTextFromMessage(uiMessage)

// 检查消息是否包含可复制的文本
const canCopy = hasCopyableText(uiMessage)

// 获取消息预览（用于工具提示）
const preview = getMessagePreview(uiMessage, 100)
```

## 设计原则

### 1. 非侵入性
- 复制按钮不影响原有的消息布局
- 只在需要时显示，不占用额外空间

### 2. 直观性
- 使用通用的复制图标（Copy/Check）
- 清晰的状态反馈（复制成功/失败）

### 3. 可访问性
- 支持键盘导航
- 提供适当的ARIA标签
- 良好的颜色对比度

### 4. 性能优化
- 使用React.useCallback优化事件处理
- 避免不必要的重渲染
- 轻量级实现

## 浏览器兼容性

| 功能 | 现代浏览器 | 旧版浏览器 |
|------|------------|------------|
| 主要复制功能 | ✅ navigator.clipboard | ✅ document.execCommand |
| 毛玻璃效果 | ✅ backdrop-blur | ⚠️ 降级为普通背景 |
| 状态反馈 | ✅ 完整支持 | ✅ 完整支持 |

## 最佳实践

### 1. 用户体验
- 复制按钮位置固定（右上角）
- 悬停时平滑显示，避免突兀感
- 复制成功后提供明确的视觉反馈

### 2. 错误处理
- 优雅处理复制失败的情况
- 提供降级方案确保功能可用性
- 记录错误信息便于调试

### 3. 性能考虑
- 避免在每次渲染时重新创建事件处理函数
- 使用适当的依赖数组优化useCallback
- 最小化DOM操作

## 未来扩展

### 可能的增强功能
1. **批量复制**：支持选择多条消息进行批量复制
2. **格式化选项**：提供不同的复制格式（纯文本、Markdown等）
3. **快捷键支持**：添加键盘快捷键（如Ctrl+C）
4. **复制历史**：记录最近的复制内容
5. **自定义样式**：允许用户自定义复制按钮的外观

### 技术改进
1. **Web Share API**：在支持的设备上使用原生分享功能
2. **剪贴板监控**：监听剪贴板变化提供更好的反馈
3. **离线支持**：在离线环境下提供基本的复制功能
