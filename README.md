# 🚀 Multi-Tab Query Agent

一个基于 Electron 的多标签 AI 查询聚合工具，支持在多个 AI 平台同时提问并获取答案。

![Technology Stack](https://img.shields.io/badge/Electron-Latest-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC)

## ✨ 核心功能

### 1. 📑 多标签管理
- **创建多个 AI 平台标签页**：支持同时打开多个 AI 平台（元宝、DeepSeek、Gemini、ChatGPT、Qwen、Manus 等）
- **标签切换**：快速在不同 AI 平台之间切换
- **标签关闭**：支持单个关闭或一键关闭所有标签
- **状态持久化**：所有标签状态自动保存到 localStorage，重启应用后恢复

### 2. 🤖 AI 平台集成
支持的 AI 平台包括：
- 🧠 **腾讯元宝** (yuanbao.tencent.com)
- 💡 **DeepSeek** (chat.deepseek.com)
- 🌟 **Google Gemini** (gemini.google.com)
- 💬 **ChatGPT** (chatgpt.com)
- 🎯 **通义千问 Qwen** (qwen.ai)
- 🔧 **Manus** (manus.im)

### 3. 📢 问题广播
- **统一输入**：在顶部输入框输入问题
- **一键广播**：按 Enter 或点击发送按钮，问题会自动发送到所有已启用的标签页
- **自动填充**：使用 WebView 的 preload 脚本自动识别并填充各平台的输入框
- **自动提交**：自动触发各平台的提交按钮，获取 AI 回答

### 4. 🎛️ 选择性同步控制（最新功能）
- **Tab 级别控制**：每个标签页可独立控制是否接收 AI 问题
- **可视化状态**：
  - ✅ 蓝色勾选框 = 启用 AI 回答
  - ⬜ 灰色空框 = 禁用 AI 回答
- **一键切换**：点击标签上的复选框图标即可切换状态
- **默认启用**：新创建的标签默认启用 AI 回答
- **状态持久化**：同步状态随标签一起保存

### 5. 🔧 开发者工具
- **Debug 按钮**：一键打开所有标签页的 DevTools，方便调试
- **控制台日志**：WebView 的控制台输出会转发到主窗口
- **自定义 User-Agent**：模拟标准浏览器，避免登录和验证问题

### 6. 🎨 现代化 UI
- **Radix UI 组件**：基于 Radix UI 的无障碍组件库
- **Tailwind CSS**：现代化的样式系统
- **Lucide Icons**：美观的图标库
- **响应式设计**：自适应不同窗口大小

## 🏗️ 技术架构

### 技术栈
- **框架**: Electron + React 18
- **语言**: TypeScript 5+
- **UI 组件**: Radix UI
- **样式**: Tailwind CSS
- **构建工具**: Vite + electron-vite
- **打包工具**: electron-builder

### 项目结构
```
multi-tab-query-agent/
├── src/
│   ├── main/           # Electron 主进程
│   ├── preload/        # Preload 脚本（注入到 WebView）
│   │   ├── index.ts    # 主 preload
│   │   └── webview.ts  # WebView preload（问题同步逻辑）
│   └── renderer/       # React 渲染进程
│       └── src/
│           ├── App.tsx              # 主应用组件
│           ├── components/
│           │   ├── TabList.tsx      # 标签列表组件
│           │   ├── QueryInput.tsx   # 问题输入组件
│           │   └── PlatformSelect.tsx # 平台选择组件
│           └── lib/
│               └── utils.ts         # 工具函数
├── build/              # 构建配置和资源
└── out/                # 打包输出目录
```

### 核心实现

#### WebView Preload 注入
通过 `webview.ts` 为每个标签页注入脚本，监听 `question:sync` 事件：
```typescript
ipcRenderer.on('question:sync', (event, question) => {
  // 查找输入框
  const inputSelector = 'textarea, input[type="text"]'
  const input = document.querySelector(inputSelector)
  
  // 填充问题
  input.value = question
  input.dispatchEvent(new Event('input', { bubbles: true }))
  
  // 触发提交
  const submitButton = document.querySelector('button[type="submit"]')
  submitButton?.click()
})
```

#### 选择性同步逻辑
```typescript
const handleBroadcast = (question: string) => {
  Object.entries(webviewRefs.current).forEach(([id, webview]) => {
    const tab = tabs.find(t => t.id === id)
    if (tab && !tab.syncEnabled) {
      // 跳过未启用同步的标签
      return
    }
    webview.send('question:sync', question)
  })
}
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建应用

#### macOS
```bash
npm run build:mac
```

#### Windows
```bash
npm run build:win
```

#### Linux
```bash
npm run build:linux
```

打包后的应用会输出到 `out/` 目录。

## 📖 使用指南

### 基本使用流程

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **选择 AI 平台**
   - 在顶部下拉菜单中选择要添加的 AI 平台

3. **添加标签页**
   - 点击 ➕ 按钮创建新标签
   - 或点击中央的 "Open Tab" 按钮

4. **登录 AI 平台**
   - 在每个标签页中登录对应的 AI 平台
   - 登录状态会持久保存（使用独立的 partition）

5. **配置同步设置**
   - 点击标签上的 ✅/⬜ 图标选择哪些标签接收问题
   - 蓝色勾选 = 启用，灰色空框 = 禁用

6. **提问**
   - 在顶部输入框输入问题
   - 按 Enter 或点击发送按钮
   - 问题会自动发送到所有已启用的标签页

7. **查看结果**
   - 切换不同标签查看各 AI 平台的回答
   - 可以对比不同 AI 的回答质量

### 高级功能

#### 调试模式
点击 "Debug" 按钮可以打开所有标签页的 DevTools，方便：
- 查看控制台输出
- 调试 preload 脚本
- 检查网络请求
- 分析页面结构

#### 批量管理
- **关闭所有标签**：点击 🗑️ 图标一键关闭所有标签
- **状态持久化**：所有标签、URL、同步状态都会自动保存

## 🛠️ 开发说明

### 推荐 IDE 设置
- [VSCode](https://code.visualstudio.com/)
- 扩展:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- TypeScript 严格模式

### 调试技巧
1. **主进程调试**：运行 dev 后，主进程日志会输出到终端
2. **渲染进程调试**：使用 Chrome DevTools（Cmd+Option+I）
3. **WebView 调试**：点击 Debug 按钮打开每个标签的 DevTools

## 🔒 安全说明

### WebView 配置
为了兼容各种 AI 平台（特别是处理登录和 Cloudflare 验证），WebView 使用了较宽松的安全策略：
```typescript
webpreferences="contextIsolation=no, nodeIntegration=yes, sandbox=no, webSecurity=no"
```

**注意**：此配置仅适用于访问可信的 AI 平台。不要在此应用中访问不受信任的网站。

### 数据隔离
- 每个标签使用独立的 `partition`，cookie 和缓存互不影响
- 登录状态独立保存，不会相互干扰

## 📝 更新日志

### v1.2.0 (2025-12-21)
- ✨ 新增选择性同步控制功能
- 🎨 改进标签页 UI，添加同步状态图标
- 💾 优化状态持久化逻辑
- 🔧 修复重复代码问题

### v1.1.0
- 🎨 使用 Radix UI 重构 UI 组件
- 🐛 修复 Tailwind CSS 编译问题
- ✨ 添加平台选择下拉菜单
- 🔧 改进 WebView preload 注入逻辑

### v1.0.0
- 🎉 初始版本发布
- ✨ 多标签管理
- ✨ 问题广播功能
- ✨ 多平台支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

## 💡 未来计划

- [ ] 支持自定义 AI 平台
- [ ] 批量同步控制（全选/全不选）
- [ ] 导出对话历史
- [ ] AI 回答对比视图
- [ ] 快捷键支持
- [ ] 主题切换（浅色/深色模式）
