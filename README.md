# Agent Memory OS

基于分层记忆架构的 AI Agent 记忆管理系统可视化界面。

## 🎯 核心概念

Agent Memory OS 采用五层记忆模型，帮助 AI Agent 实现类人的记忆管理：

| 层级 | 名称 | 描述 | 留存时间 |
|------|------|------|----------|
| L0 | 工作记忆 | 实时会话状态和上下文 | 当前会话 |
| L1 | 情景记忆 | 近期事件，逐渐消退 | 30天 |
| L2 | 程序记忆 | 反复出现的行为模式 | 月度沉淀 |
| L3 | 语义记忆 | 认知模型和理解框架 | 季度回顾 |
| L4 | 核心记忆 | 基本价值观和身份认同 | 长期保留 |

## ✨ 功能特性

- **记忆星系 (Memory Galaxy)** - 可视化展示 L1-L4 四层记忆的结构化关系
- **意图轨道 (Intent Orbit)** - 管理短/中/长期目标的依赖关系
- **演变时间轴 (Timeline)** - 追踪记忆变化和个人成长历程
- **洞察雷达 (Insights)** - 分析记忆系统的健康状态和模式
- **全局搜索** - 跨记忆和意图的快速检索
- **多语言支持** - 中英文界面切换
- **主题切换** - 支持深色/浅色模式

## 🛠 技术栈

- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **动画**: Framer Motion
- **可视化**: D3.js
- **状态管理**: Zustand

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/AnanasYang/Agent-Memory-OS.git
cd Agent-Memory-OS

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 🔑 演示账号

- 用户名: `bruce`
- 密码: `bruce`

## 📁 项目结构

```
agent-memory-os/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 仪表盘首页
│   ├── memory/            # 记忆星系
│   ├── intent/            # 意图轨道
│   ├── timeline/          # 演变时间轴
│   ├── insights/          # 洞察雷达
│   ├── search/            # 全局搜索
│   └── login/             # 登录页面
├── components/            # React 组件
│   ├── memory-galaxy.tsx
│   ├── intent-orbit.tsx
│   ├── evolution-timeline.tsx
│   ├── insights-radar.tsx
│   └── ui/               # shadcn/ui 组件
├── lib/                   # 工具库
│   ├── store.ts          # Zustand 状态管理
│   ├── data.ts           # 模拟数据
│   └── utils.ts          # 工具函数
└── public/               # 静态资源
```

## 🎨 界面预览

- 仪表盘 - 系统概览和快捷入口
- 记忆星系 - 交互式可视化记忆网络
- 意图轨道 - 目标依赖关系图
- 演变时间轴 - 时间维度的成长轨迹

## 📝 License

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [D3.js](https://d3js.org/)

---

Made with ❤️ by AnanasYang
