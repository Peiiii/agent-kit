# 贡献指南

感谢您对 @agent-labs/agent-chat 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 报告 bug
- 提出新功能建议
- 改进文档
- 提交代码修复
- 添加新功能

## 开发环境设置

1. Fork 本仓库
2. Clone 你的 fork：
   ```bash
   git clone https://github.com/你的用户名/agent-chat.git
   ```
3. 安装依赖：
   ```bash
   pnpm install
   ```

## 开发流程

1. 创建新的分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 进行开发并确保通过所有测试：
   ```bash
   pnpm test
   ```

3. 提交你的更改：
   ```bash
   git commit -m "feat: 添加新功能"
   ```

4. 推送到你的 fork：
   ```bash
   git push origin feature/your-feature-name
   ```

5. 创建 Pull Request

## 代码规范

- 使用 TypeScript 编写代码
- 遵循项目的 ESLint 和 Prettier 配置
- 编写单元测试
- 保持代码简洁和可维护性

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动

## 发布流程

1. 确保所有测试通过
2. 更新版本号（使用 `pnpm release`）
3. 更新 CHANGELOG.md
4. 创建新的发布标签

## 行为准则

请参阅我们的 [行为准则](./CODE_OF_CONDUCT.md)。

## 问题反馈

如果你发现任何问题或有任何建议，请通过以下方式反馈：

1. 在 GitHub Issues 中创建新的 issue
2. 提供详细的问题描述和复现步骤
3. 如果可能，提供相关的代码示例

## 许可证

通过贡献代码，你同意你的贡献将被许可在项目的 MIT 许可证下。 