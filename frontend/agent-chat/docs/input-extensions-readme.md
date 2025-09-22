# Input Extensions

Input Extensions 是 `@agent-labs/agent-chat` 的扩展系统，允许开发者通过插件化的方式为聊天输入组件添加自定义功能。

## 快速开始

```typescript
import { EnhancedMessageInput } from '@agent-labs/agent-chat'
import { createVoiceInputExtension } from './extensions'

const voiceExtension = createVoiceInputExtension({
  onVoiceResult: (text) => console.log('语音识别:', text)
})

function MyChat() {
  return (
    <EnhancedMessageInput
      input={input}
      onInputChange={setInput}
      onSend={handleSend}
      inputExtensions={[voiceExtension]}
    />
  )
}
```

## 内置扩展

- **语音输入** - 浏览器原生语音录制
- **文件上传** - 拖拽和选择文件上传
- **表情选择** - 快速插入表情符号

## 创建自定义扩展

```typescript
const myExtension: ChatInputExtension = {
  id: 'my-extension',
  placement: 'bottom-left',
  render: ({ draft, setDraft }) => (
    <button onClick={() => setDraft({ ...draft, text: draft.text + 'Hello!' })}>
      Add Hello
    </button>
  )
}
```

## 扩展位置

- `inside-left/right` - 输入框内部
- `top-left/right` - 头部工具栏
- `bottom-left/right` - 底部工具栏

## 详细文档

查看 [完整文档](./input-extensions.md) 了解：
- 详细的API参考
- 高级用法和最佳实践
- 完整的示例代码
- 常见问题解答
