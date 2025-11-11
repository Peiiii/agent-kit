import { AgentChat, AgentChatRef, Tool, useAgentChatController, useParseTools } from '@agent-labs/agent-chat'
import { VSCodeLayout } from 'composite-kit'
import {
  Bell,
  GitBranch as BranchIcon,
  CheckCircle,
  ChevronDown,
  Folder,
  GitBranch,
  LayoutGrid,
  Play,
  Search,
  Wifi,
  Zap,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from './components/ui/button'
import { ThemeToggle } from './components/theme-toggle'
import { AgentChatWindowDemo } from './features/agent-chat-window-demo'
import { EnhancedInputDemo } from './features/enhanced-input-demo'
import { InstructionSettings } from './features/settings/components/instruction-settings'
import { TodoList } from './features/todo/components/todo-list'
import { TodoProvider, useTodo } from './features/todo/hooks/use-todo'
import { createAddTodoTool } from './features/todo/tools/add-todo.tool'
import { createDeleteTodoTool } from './features/todo/tools/delete-todo.tool'
import { createListTodosTool } from './features/todo/tools/list-todos.tool'
import { createToggleTodoTool } from './features/todo/tools/toggle-todo.tool'
import { createUpdateTodoTool } from './features/todo/tools/update-todo.tool'
import { MappedHttpAgent } from './lib/mapped-http-agent'

const { Activity, Controls, Editor, Layout, Panel, Status, Utils, Workspace } =
  VSCodeLayout

const agent = new MappedHttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

function AgentChatWithContext({
  allInstructions,
  agentChatRef,
  tools,
}: {
  tools: Tool[]
  allInstructions: Array<{ description: string; value: string }>
  agentChatRef: React.RefObject<AgentChatRef | null>
}) {
  const { toolDefs, toolExecutors, toolRenderers } = useParseTools(tools)
  const agentChatController = useAgentChatController({ agent, getToolDefs: () => toolDefs, getContexts: () => [...allInstructions, { description: '待办事项列表', value: JSON.stringify(todoListContext) }], initialMessages: [], getToolExecutor: (name: string) => toolExecutors?.[name] })
  const { state, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodo()
  const todoListContext = useMemo(
    () => ({
      todos: state.todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
        startTime: todo.startTime,
        endTime: todo.endTime,
      })),
    }),
    [state.todos],
  )

  const todoTools = useMemo(
    () => [
      createAddTodoTool({ addTodo }),
      createToggleTodoTool({ toggleTodo }),
      createDeleteTodoTool({ deleteTodo }),
      createUpdateTodoTool({ updateTodo }),
      createListTodosTool({ state }),
    ],
    [addTodo, toggleTodo, deleteTodo, updateTodo, state],
  )

  return (
    <AgentChat
      ref={agentChatRef}
      agentChatController={agentChatController}
      toolRenderers={toolRenderers}
      className="flex-1 overflow-y-auto"
      promptsProps={{
        items: [
          { id: '1', prompt: '待办事项' },
          { id: '2', prompt: '23455*34=?' },
          { id: '3', prompt: '源代码管理' },
        ],
        onItemClick: (item) => {
          agentChatRef.current?.addMessages(
            [
              {
                id: uuidv4(),
                role: 'user',
                parts: [
                  {
                    type: 'text',
                    text: item.prompt,
                  },
                ],
              },
            ],
            { triggerAgent: true },
          )
        },
      }}
      aboveInputComponent={
        <div className="flex items-center justify-between px-3 py-1 text-xs text-muted-foreground border-b">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            <span>快速操作</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                agentChatRef.current?.addMessages(
                  [
                    {
                      id: uuidv4(),
                      role: 'user',
                      parts: [
                        {
                          type: 'text',
                          text: '帮我总结一下今天的待办事项',
                        },
                      ],
                    },
                  ],
                  { triggerAgent: true },
                )
              }}
              className="h-6 px-2 text-xs"
            >
              总结待办
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                agentChatRef.current?.addMessages(
                  [
                    {
                      id: uuidv4(),
                      role: 'user',
                      parts: [
                        {
                          type: 'text',
                          text: '帮我创建一个新的待办事项',
                        },
                      ],
                    },
                  ],
                  { triggerAgent: true },
                )
              }}
              className="h-6 px-2 text-xs"
            >
              新建待办
            </Button>
          </div>
        </div>
      }
    />
  )
}

export function App() {
  // 使用 Hook 管理面板状态
  const leftPanel = Utils.usePanelControls()
  const rightPanel = Utils.usePanelControls()
  const bottomPanel = Utils.usePanelControls()

  const [activeActivityItem, setActiveActivityItem] = useState('explorer')
  const [isActivityBarExpanded, setIsActivityBarExpanded] = useState(false)
  const [activeDemo, setActiveDemo] = useState<'todo' | 'window' | 'input'>('window')

  // 定义系统指令和用户偏好
  const defaultInstructions = useMemo(
    () => [
      {
        description: '系统设置',
        value: JSON.stringify({
          language: 'zh-CN',
          responseStyle: 'professional',
          maxResponseLength: 1000,
          enableCodeHighlight: true,
          enableMarkdown: true,
        }),
      },
      {
        description: '用户偏好',
        value: JSON.stringify({
          name: '张三',
          role: 'developer',
          preferences: {
            conciseResponses: true,
            technicalLevel: 'advanced',
            preferredTopics: ['编程', '技术', '效率工具'],
          },
        }),
      },
      {
        description: '系统环境',
        value: JSON.stringify({
          os: 'macOS',
          version: '12.0',
          environment: 'development',
        }),
      },
      {
        description: '当前时间',
        value: JSON.stringify({
          time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        }),
      },
      {
        description: 'AI 助手行为指南',
        value: JSON.stringify({
          personality: '专业、友好、高效',
          responseFormat: {
            codeBlocks: true,
            bulletPoints: true,
            examples: true,
          },
          constraints: [
            '保持回答简洁明了',
            '优先使用中文回答',
            '提供具体的代码示例',
            '解释关键概念',
          ],
        }),
      },
    ],
    [],
  )

  const [customInstructions, setCustomInstructions] = useState<
    Array<{ description: string; value: string }>
  >([])

  const allInstructions = useMemo(() => {
    return [...defaultInstructions, ...customInstructions]
  }, [defaultInstructions, customInstructions])

  // 活动栏数据
  const activityItems = [
    {
      id: 'explorer',
      icon: <Folder className="h-5 w-5" />,
      title: '资源管理器',
    },
    { id: 'search', icon: <Search className="h-5 w-5" />, title: '搜索' },
    { id: 'git', icon: <GitBranch className="h-5 w-5" />, title: '源代码管理' },
    { id: 'debug', icon: <Play className="h-5 w-5" />, title: '运行和调试' },
    {
      id: 'extensions',
      icon: <LayoutGrid className="h-5 w-5" />,
      title: '扩展',
    },
  ]

  const agentChatRef = useRef<AgentChatRef | null>(null)

  // 拍一拍业务逻辑
  const handlePoke = async () => {
    if (agentChatRef.current?.addMessages) {
      await agentChatRef.current.addMessages(
        [
          {
            id: uuidv4(),
            role: 'system',
            parts: [
              {
                type: 'text',
                text: `用户使用了"拍一拍"功能唤醒AI助手。这通常表示用户想要开始对话但不知道说什么，或者希望AI主动提供帮助。请以友好、热情的方式回应，可以：\n1. 简单打招呼并询问如何帮助\n2. 根据当前上下文（如待办事项、时间等）主动提供建议\n3. 介绍一些你能提供的功能\n\n请保持回答简洁、友好且有用。`,
              },
            ],
          },
          {
            id: uuidv4(),
            role: 'user',
            parts: [
              {
                type: 'text',
                text: '[action:poke]',
              },
            ],
          },
        ],
        { triggerAgent: true },
      )
    }
  }

  return (
    <TodoProvider>
      <Workspace.Layout>
        <Controls.Layout
          onToggleLeftSidebar={leftPanel.toggle}
          onToggleRightSidebar={rightPanel.toggle}
          onToggleBottomPanel={bottomPanel.toggle}
          isLeftSidebarCollapsed={leftPanel.isCollapsed}
          isRightSidebarCollapsed={rightPanel.isCollapsed}
          isBottomPanelCollapsed={bottomPanel.isCollapsed}
        />
        <Layout.Main>
          <Activity.Bar
            isExpanded={isActivityBarExpanded}
            onToggle={() => setIsActivityBarExpanded(!isActivityBarExpanded)}
            expandable={true}
          >
            {activityItems.map((item) => (
              <Activity.Item
                key={item.id}
                icon={item.icon}
                title={item.title}
                isActive={activeActivityItem === item.id}
                onClick={() => setActiveActivityItem(item.id)}
                isExpanded={isActivityBarExpanded}
                expandable={true}
              />
            ))}
          </Activity.Bar>

          <Layout.MainContent>
            <Layout.Horizontal>
              <Layout.Sidebar
                ref={leftPanel.ref}
                onCollapse={leftPanel.collapse}
                onExpand={leftPanel.expand}
              >
                <Workspace.Panel
                  title="待办事项"
                  isCollapsed={leftPanel.isCollapsed}
                  onCollapse={leftPanel.collapse}
                  onExpand={leftPanel.expand}
                >
                  <Panel.Content>
                    <TodoList />
                  </Panel.Content>
                </Workspace.Panel>
              </Layout.Sidebar>

              <Layout.ResizeHandle />

              <Panel.Resizable>
                <Layout.Vertical>
                  <Panel.Resizable>
                    <Workspace.Panel>
                      <Editor.Header>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex space-x-1">
                            <Editor.Tab
                              title="待办事项 Demo"
                              isActive={activeDemo === 'todo'}
                              onClick={() => setActiveDemo('todo')}
                            />
                            <Editor.Tab
                              title="浮动窗口 Demo"
                              isActive={activeDemo === 'window'}
                              onClick={() => setActiveDemo('window')}
                            />
                            <Editor.Tab
                              title="增强输入 Demo"
                              isActive={activeDemo === 'input'}
                              onClick={() => setActiveDemo('input')}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <ThemeToggle />
                            {activeDemo === 'todo' && (
                              <button
                                onClick={handlePoke}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-muted bg-muted hover:bg-accent transition-colors"
                                title="拍一拍唤醒 AI 助手"
                                style={{ lineHeight: 1 }}
                              >
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span>拍一拍</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </Editor.Header>
                      <Editor.Content>
                        <div className="relative h-full flex flex-col">
                          {activeDemo === 'todo' ? (
                            <>
                              <InstructionSettings
                                onInstructionsChange={setCustomInstructions}
                              />
                              <AgentChatWithContext
                                allInstructions={allInstructions}
                                agentChatRef={agentChatRef}
                                tools={[]}
                              />
                            </>
                          ) : activeDemo === 'window' ? (
                            <AgentChatWindowDemo />
                          ) : (
                            <EnhancedInputDemo />
                          )}
                        </div>
                      </Editor.Content>
                    </Workspace.Panel>
                  </Panel.Resizable>

                  {/* <Layout.ResizeHandle orientation="horizontal" />

                  <Layout.Sidebar
                    ref={bottomPanel.ref}
                    defaultSize={25}
                    onCollapse={bottomPanel.collapse}
                    onExpand={bottomPanel.expand}
                  >
                    <Workspace.Panel
                      title="设置"
                      isCollapsed={bottomPanel.isCollapsed}
                      onCollapse={bottomPanel.collapse}
                      onExpand={bottomPanel.expand}
                    >
                      <Panel.Content>
                        <div className="p-4">
                          <ThemeSwitcher
                            themes={[
                              'light',
                              'dark',
                              'material',
                              'nord',
                              'dracula',
                              'one-dark',
                              'tokyo-night',
                              'catppuccin',
                              'wechat',
                              'telegram',
                              'github',
                              'twitter',
                              'discord',
                              'notion',
                              'monokai-pro',
                              'gruvbox',
                              'solarized',
                              'aurora',
                              'forest',
                              'ocean',
                              'starlight',
                              'desert',
                              'neon',
                              'ink-wash',
                              'sakura',
                              'moonlight',
                              'bamboo',
                              'landscape',
                              'autumn',
                            ]}
                          >
                            <ThemeSwitcher.Dropdown />
                          </ThemeSwitcher>
                        </div>
                      </Panel.Content>
                    </Workspace.Panel>
                  </Layout.Sidebar> */}
                </Layout.Vertical>
              </Panel.Resizable>

              <Layout.ResizeHandle />

              <Layout.Sidebar
                ref={rightPanel.ref}
                onCollapse={rightPanel.collapse}
                onExpand={rightPanel.expand}
              >
                <Workspace.Panel
                  title="指令设置"
                  isCollapsed={rightPanel.isCollapsed}
                  onCollapse={rightPanel.collapse}
                  onExpand={rightPanel.expand}
                >
                  <Panel.Content>
                    <div className="p-4">
                      <h3 className="text-sm font-medium mb-2">系统指令</h3>
                      {defaultInstructions.map((instruction, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex items-center mb-1">
                            <ChevronDown className="h-3 w-3 mr-1" />
                            <span className="text-sm font-medium">
                              {instruction.description}
                            </span>
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded">
                            {instruction.value}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </Panel.Content>
                </Workspace.Panel>
              </Layout.Sidebar>
            </Layout.Horizontal>
          </Layout.MainContent>
        </Layout.Main>

        <Status.Bar>
          <Status.Group>
            <Status.IconItem
              icon={<BranchIcon className="h-3.5 w-3.5" />}
              label="main"
            />
            <Status.IconItem
              icon={<CheckCircle className="h-3.5 w-3.5 text-green-500" />}
              label="就绪"
            />
          </Status.Group>
          <Status.Group>
            <Status.Item>UTF-8</Status.Item>
            <Status.Item>TSX</Status.Item>
            <Status.Item>
              <Wifi className="h-3.5 w-3.5 text-green-500" />
            </Status.Item>
            <Status.Item>
              <Bell className="h-3.5 w-3.5" />
            </Status.Item>
          </Status.Group>
        </Status.Bar>
      </Workspace.Layout>
    </TodoProvider>
  )
}
