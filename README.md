# Memory Galaxy 🌌

Bruce 的记忆可视化界面 —— 将 5 层记忆架构转化为交互式神经星系。

> **数据来自 memory-core**：实时读取记忆系统的数据，构建可视化体验。

---

## 在线访问

**https://ananasyang.github.io/memory-galaxy/**

---

## 技术栈

- **Next.js 14** + TypeScript
- **Tailwind CSS** — 样式系统
- **Framer Motion** — 动画
- **Canvas / SVG** — 数据可视化

---

## 页面导航

| 页面 | 路径 | 可视化 |
|------|------|--------|
| **记忆核心** | `/` | 5 层同心圆 Canvas 动画 |
| **记忆星座** | `/memory` | SVG 轨道力导向图 |
| **记忆河流** | `/timeline` | 流动时间轴 |
| **梦境档案** | `/dreams` | 卡片时间轴 |
| **模式雷达** | `/insights` | 雷达图 + 健康度 |
| **L0 实时流** | `/l0` | 实时消息流 |

---

## 数据流

```
memory-core (GitHub)
    ↓ git clone / API
Next.js Build (GitHub Actions)
    ↓ static export
GitHub Pages CDN
    ↓ HTTPS
Browser (用户)
```

### 数据来源

- **开发/Netlify**：`/api/*` API 路由
- **GitHub Pages**：`/data/*.json` 静态 JSON 文件

---

## 设计系统

- **背景**：深空黑 `#0A0A0F`
- **层级色**：L0 蓝 → L1 青 → L2 琥珀 → L3 紫 → L4 红
- **特效**：浮动粒子连线、玻璃态发光卡片
- **导航**：底部浮动导航栏

---

## 本地开发

```bash
git clone https://github.com/AnanasYang/memory-galaxy.git
cd memory-galaxy
npm install
npm run dev
```

---

## 部署

GitHub Actions 自动部署到 GitHub Pages：

1. Push 到 `main` 分支
2. Actions 自动构建 (`next build`)
3. 部署到 `gh-pages` 分支
4. 自动发布到 CDN

---

## 关联项目

- [**memory-core**](https://github.com/AnanasYang/memory-core) — 核心记忆系统，本系统的数据来源

---

*项目创建：2026-03-31 | 全面重构 v2：2026-04-21*