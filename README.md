# 🤖 Agent Memory OS

> 基于分层记忆架构的 AI Agent 记忆管理系统可视化界面

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🎯 核心概念

Agent Memory OS 采用五层记忆模型，帮助 AI Agent 实现类人的记忆管理：

| 层级 | 名称 | 描述 | 留存时间 | 颜色标识 |
|------|------|------|----------|----------|
| **L0** | 工作记忆 | 实时会话状态和上下文 | 当前会话 | 🔵 蓝色 |
| **L1** | 情景记忆 | 近期事件，逐渐消退 | 30天 | 🔷 青色 |
| **L2** | 程序记忆 | 反复出现的行为模式 | 月度沉淀 | 🟡 琥珀 |
| **L3** | 语义记忆 | 认知模型和理解框架 | 季度回顾 | 🟣 粉色 |
| **L4** | 核心记忆 | 基本价值观和身份认同 | 长期保留 | 🟪 紫色 |

---

## ✨ 功能特性

### 🧠 记忆管理
- **记忆星系 (Memory Galaxy)** - 可视化展示 L1-L4 四层记忆的结构化关系
  - D3.js 驱动的力导向图
  - 交互式节点点击查看详情
  - 支持层级晋升和审阅确认
  - 缩放/平移/拖拽交互

### 🎯 意图管理  
- **意图轨道 (Intent Orbit)** - 管理短/中/长期目标的依赖关系
  - 目标进度追踪
  - 依赖关系可视化
  - 优先级管理

### ⏱️ 时间轴
- **演变时间轴 (Timeline)** - 追踪记忆变化和个人成长历程
  - GitHub 风格活动热力图
  - 月度对齐显示
  - 层级筛选功能
  - 点击跳转记忆详情

### 📊 洞察分析
- **洞察雷达 (Insights)** - 分析记忆系统的健康状态和模式
  - 自动模式检测
  - 记忆系统健康评分
  - L2/L3 晋升候选提醒
  - 目标风险预警

### 🔍 全局搜索
- 跨记忆和意图的快速检索
- 按层级、分类筛选
- 智能结果排序

### 🌐 多语言支持
- 中英文界面切换
- 动态语言加载

### 🎨 主题切换
- 深色/浅色模式
- 系统级主题同步

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Agent Memory OS                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer                                             │
│  ├── Next.js 14 (App Router)                               │
│  ├── React 18 + TypeScript                                 │
│  ├── Tailwind CSS + shadcn/ui                              │
│  ├── Framer Motion (动画)                                   │
│  └── D3.js (可视化)                                         │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├── Zustand (全局状态)                                     │
│  ├── React Context (主题/语言)                              │
│  └── Custom Hooks (文件监听)                                │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                  │
│  ├── /api/l0-memories (L0 实时会话)                         │
│  ├── /api/dreams (Daily/Weekly Dreams)                      │
│  ├── /api/sessions/:id/export (会话导出)                    │
│  └── /api/health/* (系统健康检查)                           │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── Memory L0 (工作记忆) - 实时监控                        │
│  ├── Memory L1-L4 (长期记忆) - JSON 文件存储                │
│  ├── Dreams (提炼结果) - daily/weekly 汇总                  │
│  └── Intent (目标意图) - 结构化存储                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 9+ 或 yarn 1.22+

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/AnanasYang/Agent-Memory-OS.git
cd Agent-Memory-OS

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:3000
```

### 生产部署

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

---

## 📁 项目结构

```
agent-memory-os/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── dreams/route.ts       # Dreams API
│   │   ├── l0-memories/route.ts  # L0 记忆 API
│   │   ├── sessions/[id]/        # 会话详情 API
│   │   └── health/               # 健康检查 API
│   ├── page.tsx                  # 仪表盘首页
│   ├── layout.tsx                # 根布局
│   ├── memory/                   # 记忆星系页面
│   │   ├── page.tsx
│   │   └── [id]/page.tsx         # 记忆详情页
│   ├── l0/                       # L0 工作记忆页面
│   ├── intent/                   # 意图轨道页面
│   ├── dreams/                   # Dreams 页面
│   ├── timeline/                 # 演变时间轴页面
│   ├── insights/                 # 洞察雷达页面
│   ├── search/                   # 全局搜索页面
│   └── login/                    # 登录页面
├── components/                   # React 组件
│   ├── memory-galaxy.tsx         # 记忆星系可视化
│   ├── intent-orbit.tsx          # 意图轨道
│   ├── evolution-timeline.tsx    # 演变时间轴
│   ├── insights-radar.tsx        # 洞察雷达
│   ├── l0-memory-list.tsx        # L0 记忆列表
│   ├── dreams-page.tsx           # Dreams 页面组件
│   ├── global-search.tsx         # 全局搜索
│   ├── navigation.tsx            # 导航栏
│   └── ui/                       # shadcn/ui 组件
├── lib/                          # 工具库
│   ├── store.ts                  # Zustand 状态管理
│   ├── data.ts                   # 模拟数据
│   ├── types.ts                  # TypeScript 类型
│   ├── utils.ts                  # 工具函数
│   └── hooks/                    # 自定义 Hooks
│       └── useFileWatcher.ts     # 文件监听 Hook
├── memory/                       # 数据存储目录
│   ├── dreams/                   # Dreams 数据
│   │   ├── daily/                # Daily Dreams
│   │   └── weekly/               # Weekly Dreams
│   └── L2-procedural/            # L2 程序记忆
├── docs/                         # 文档
├── scripts/                      # 脚本工具
├── cron/                         # 定时任务配置
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🔑 演示账号

- **用户名**: `bruce`
- **密码**: `bruce`

---

## 📖 使用指南

### 1. 记忆星系
- 点击节点查看记忆详情
- 拖拽节点调整布局
- 登录后可晋升记忆层级
- 滚轮缩放，拖拽平移

### 2. L0 工作记忆
- 实时显示当前会话
- 点击会话查看完整对话
- 支持按角色/内容筛选消息

### 3. Dreams
- 查看每日/每周记忆提炼
- 点击卡片查看详情
- 了解关键事件和模式

### 4. Timeline
- 查看活动热力图
- 点击热力图方块查看对应日期的记忆
- 切换层级筛选

### 5. Insights
- 查看系统自动检测的模式
- 关注晋升候选记忆
- 查看记忆系统健康评分

---

## 🛠️ 技术栈详情

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 14, React 18 |
| **语言** | TypeScript 5 |
| **样式** | Tailwind CSS, shadcn/ui |
| **状态** | Zustand |
| **可视化** | D3.js |
| **动画** | Framer Motion |
| **图标** | Lucide React |
| **工具** | date-fns, clsx, tailwind-merge |

---

## 🎨 界面预览

| 页面 | 描述 |
|------|------|
| **仪表盘** | 系统概览，快捷入口，实时状态 |
| **记忆星系** | 交互式可视化记忆网络 |
| **L0工作记忆** | 实时会话监控 |
| **意图轨道** | 目标依赖关系图 |
| **Dreams** | 记忆提炼展示 |
| **演变时间轴** | 时间维度的成长轨迹 |
| **洞察雷达** | 系统健康与模式分析 |
| **全局搜索** | 跨维度快速检索 |

---

## 🔄 数据流

```
OpenClaw Session → L0 Capture → API → Store → UI
                                    ↓
Daily/Weekly Review → Dream Generation → API → Dreams Page
                                    ↓
Manual Review → Memory Elevation → L1 → L2 → L3 → L4
```

---

## 🔧 配置说明

### 环境变量

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 记忆数据配置

记忆数据存储在 `memory/` 目录下：
- `dreams/daily/` - 每日提炼结果
- `dreams/weekly/` - 每周提炼结果
- `L2-procedural/` - L2 程序记忆

---

## 📝 开发计划

- [x] 五层记忆模型可视化
- [x] L0 实时工作记忆
- [x] 记忆星系交互
- [x] 意图轨道管理
- [x] 演变时间轴
- [x] 洞察分析系统
- [x] 全局搜索
- [x] 多语言支持
- [x] 主题切换
- [ ] 记忆导入导出
- [ ] AI 辅助记忆整理
- [ ] 协作记忆空间
- [ ] 移动端优化

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [D3.js](https://d3js.org/)
- [Zustand](https://github.com/pmndrs/zustand)

---

Made with ❤️ by [AnanasYang](https://github.com/AnanasYang)
