# Agent Memory OS v2 — Neural Core Design

## 设计哲学

将抽象的记忆层级转化为具象的"数字大脑"——一个有生命、有层次、有流动的神经系统。

## 视觉语言

### 色彩系统（层级色）
| 层级 | 名称 | 主色 | 发光色 | 隐喻 |
|------|------|------|--------|------|
| L0 | 工作记忆 | `#3B82F6` | `#60A5FA` | 脉冲电信号 |
| L1 | 情景记忆 | `#06B6D4` | `#22D3EE` | 涟漪水波 |
| L2 | 程序记忆 | `#F59E0B` | `#FBBF24` | 编织纹理 |
| L3 | 语义记忆 | `#A855F7` | `#C084FC` | 晶体结构 |
| L4 | 核心记忆 | `#EF4444` | `#F87171` | 心脏搏动 |

### 背景
- 主背景：`#0A0A0F`（深空黑）
- 卡片背景：`rgba(15, 15, 25, 0.8)` + backdrop-blur
- 边框：`rgba(255, 255, 255, 0.08)`
- 文字主色：`#E2E8F0`
- 文字次色：`#64748B`

## 页面架构

### 1. Core Dashboard (/) — 记忆核心
中央五层同心圆可视化：
- 最内圈 L4：心脏搏动动画，核心价值观摘要
- 第二层 L3：旋转晶体，思维模式关键词
- 第三层 L2：编织环，行为模式计数
- 第四层 L1：涟漪环，近期事件缩略
- 最外层 L0：脉冲粒子流，实时消息计数

底部：
- 系统健康仪表盘（5个指标）
- 最近3条记忆预览
- 快捷导航

### 2. Memory Constellation (/memory) — 记忆星座
改进的力导向图：
- L4 节点固定在中心（红色发光）
- L3 节点在第二层轨道（紫色）
- L2 节点散布中层（琥珀色）
- L1 节点外层，透明度按时间衰减（青色→透明）
- 连线表示来源关联和晋升路径
- 右侧滑出详情面板

### 3. Memory River (/timeline) — 记忆河流
替代 GitHub 热力图：
- 水平时间轴，从左（过去）到右（现在）
- 每天是一个垂直切片
- 不同层级的记忆用不同颜色的"水流"表示
- 鼠标悬停显示当天详情
- 底部有层级筛选器

### 4. Dream Archive (/dreams) — 梦境档案
沉浸式卡片时间轴：
- 左侧时间轴线条
- 右侧卡片瀑布流
- 卡片带自动摘要高亮
- 展开动画查看完整内容
- 按周/月自动分组

### 5. Pattern Radar (/insights) — 模式雷达
多维度分析仪表盘：
- 中心：记忆分布雷达图（5轴：L0-L4）
- 左侧：系统健康评分（环形进度）
- 右侧：晋升候选列表（带动画）
- 底部：建议行动（可勾选）

## 动画规范

- 入场：stagger 延迟，从中心向外扩散
- 悬停：节点放大 + 发光增强
- 数据更新：平滑过渡（1s ease-out）
- 背景：缓慢浮动的粒子（opacity 0.3）

## 数据结构映射

```
unified-data.json
├── memoryNodes[] → Memory Constellation + Core Dashboard
├── intents[] → Core Dashboard（底部）+ Pattern Radar
├── dreams[] → Dream Archive
├── activities[] → Memory River
└── status → 所有页面的系统状态

l0-memories.json
├── memories[] → Core Dashboard 外层 + L0 页面

memory.json
├── memories[] → Memory Constellation 数据源
```

## 组件清单

### 核心可视化组件
- `NeuralCore` — 五层同心圆（Dashboard）
- `ConstellationGraph` — 力导向星座图
- `MemoryRiver` — 河流时间轴
- `DreamCards` — 梦境卡片流
- `PatternRadar` — 雷达分析图

### 通用组件
- `GlowCard` — 发光边框卡片
- `LevelBadge` — 层级徽章（带色）
- `ParticleBackground` — 浮动粒子背景
- `SlidePanel` — 右侧滑出详情面板

### 布局组件
- `Navigation` — 底部/侧边导航
- `PageTransition` — 页面切换动画

## 文件结构

```
app/
├── page.tsx              → Core Dashboard
├── layout.tsx            → 根布局 + 粒子背景
├── globals.css           → 深色主题 + 动画
├── memory/
│   └── page.tsx          → Memory Constellation
├── timeline/
│   └── page.tsx          → Memory River
├── dreams/
│   └── page.tsx          → Dream Archive
├── insights/
│   └── page.tsx          → Pattern Radar
├── l0/
│   └── page.tsx          → L0 Stream (实时消息流)
components/
├── neural-core.tsx       → 五层同心圆
├── constellation.tsx     → 星座图
├── memory-river.tsx      → 河流时间轴
├── dream-cards.tsx       → 梦境卡片
├── pattern-radar.tsx     → 雷达分析
├── glow-card.tsx         → 发光卡片
├── level-badge.tsx       → 层级徽章
├── particle-bg.tsx       → 粒子背景
├── slide-panel.tsx       → 滑出面板
├── nav-bar.tsx           → 导航栏
lib/
├── colors.ts             → 层级色彩配置
```
