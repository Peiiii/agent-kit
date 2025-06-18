import { HttpAgent } from '@ag-ui/client'
import { AgentChatCore, useProvideAgentContexts } from '@agent-labs/agent-chat'
import { VSCodeLayout } from "composite-kit"
import { Bell, GitBranch as BranchIcon, CheckCircle, ChevronDown, Folder, GitBranch, LayoutGrid, Play, Search, Wifi } from 'lucide-react'
import { useMemo, useState } from 'react'
import { InstructionSettings } from './features/settings/components/instruction-settings'
import { TodoList } from './features/todo/components/todo-list'
import { TodoProvider } from './features/todo/hooks/use-todo'
import { todoToolRenderers } from './features/todo/tool-renderers'
import { todoTools } from './features/todo/tools'
import { useTodo } from './features/todo/hooks/use-todo'

const { Activity,
  Controls,
  Editor,
  Layout,
  Panel,
  Status,
  Utils,
  Workspace,
} = VSCodeLayout

const agent = new HttpAgent({
  url: 'http://localhost:8000/openai-agent',
})

function AgentChatWithContext({ allInstructions }: { allInstructions: Array<{ description: string; value: string }> }) {
  const { state } = useTodo()
  const todoListContext = useMemo(() => ({
    todos: state.todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    }))
  }), [state.todos])

  useProvideAgentContexts([
    {
      description: '待办事项列表',
      value: JSON.stringify(todoListContext),
    },
  ])

  return (
    <AgentChatCore
      agent={agent}
      tools={todoTools}
      toolRenderers={todoToolRenderers}
      contexts={allInstructions}
      className='flex-1 overflow-y-auto'
    />
  )
}

export function App() {
  // 使用 Hook 管理面板状态
  const leftPanel = Utils.usePanelControls()
  const rightPanel = Utils.usePanelControls()
  const bottomPanel = Utils.usePanelControls()

  const [activeActivityItem, setActiveActivityItem] = useState("explorer")
  const [isActivityBarExpanded, setIsActivityBarExpanded] = useState(false)

  // 定义系统指令和用户偏好
  const defaultInstructions = useMemo(() => [
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
  ], [])

  const [customInstructions, setCustomInstructions] = useState<Array<{ description: string; value: string }>>([])

  const allInstructions = useMemo(() => {
    return [...defaultInstructions, ...customInstructions]
  }, [defaultInstructions, customInstructions])

  // 活动栏数据
  const activityItems = [
    {
      id: "explorer",
      icon: <Folder className="h-5 w-5" />,
      title: "资源管理器",
    },
    { id: "search", icon: <Search className="h-5 w-5" />, title: "搜索" },
    { id: "git", icon: <GitBranch className="h-5 w-5" />, title: "源代码管理" },
    { id: "debug", icon: <Play className="h-5 w-5" />, title: "运行和调试" },
    {
      id: "extensions",
      icon: <LayoutGrid className="h-5 w-5" />,
      title: "扩展",
    },
  ]

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
                        <Editor.Tab
                          title="AI 助手"
                          isActive={true}
                        />
                      </Editor.Header>
                      <Editor.Content>
                        <div className="relative h-full flex flex-col">
                          <InstructionSettings
                            instructions={customInstructions}
                            onInstructionsChange={setCustomInstructions}
                          />
                          <AgentChatWithContext allInstructions={allInstructions} />
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
