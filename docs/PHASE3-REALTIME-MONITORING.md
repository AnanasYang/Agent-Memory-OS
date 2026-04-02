# Phase 3 实时监控功能

## 功能概述

Phase 3 实现了文件变化自动刷新和健康监控面板，提升系统的实时性和可观测性。

## 文件结构

```
agent-memory-os/
├── lib/
│   ├── file-watcher.ts          # 文件监听和 WebSocket 服务
│   └── hooks/
│       └── useFileWatcher.ts    # React Hook 用于监听文件变化
├── app/
│   ├── health/
│   │   └── page.tsx             # 健康监控页面
│   └── api/
│       └── health/
│           ├── status/route.ts  # 健康状态 API
│           └── events/route.ts  # SSE 实时推送 API
├── components/
│   └── health-dashboard.tsx     # 健康仪表盘组件
└── scripts/
    └── start-watcher.mjs        # WebSocket 服务器启动脚本
```

## 功能特性

### 1. 文件监听 + 自动刷新

- **chokidar**: 监听 `ai-memory-system/Memory/` 目录
- **WebSocket**: 实时推送文件变化到前端
- **自动刷新**: L1 文件生成后页面自动更新

### 2. 健康监控面板

显示以下关键指标：

- **Daily Dream**: 最后运行时间/状态、下次计划运行时间
- **Weekly Dream**: 最后运行时间/状态、下次计划运行时间
- **L0-L4 各层**: 文件数量统计
- **L2/L3 候选池**: 待确认数量
- **警告提示**: 长时间未运行、数据异常等

## 使用方法

### 开发环境

1. **启动开发服务器** (已在 package.json 的 dev 脚本中)
   ```bash
   npm run dev
   ```

2. **访问健康监控面板**
   ```
   http://localhost:3000/health
   ```

3. **启动独立的文件监听服务** (可选)
   ```bash
   node scripts/start-watcher.mjs
   ```

### API 接口

#### 获取健康状态
```bash
GET /api/health/status

# 获取特定部分
GET /api/health/status?section=layers     # 只返回层级统计
GET /api/health/status?section=candidates # 只返回候选池
GET /api/health/status?section=dreams     # 只返回 Dream 状态
```

#### SSE 实时推送
```bash
GET /api/health/events
```

#### 刷新健康状态
```bash
POST /api/health/status
Content-Type: application/json

{
  "action": "refresh"
}
```

### WebSocket 协议

连接: `ws://localhost:3001`

**客户端消息**:
```json
{
  "type": "health:refresh"
}
```

**服务端消息**:
```json
// 初始健康状态
{
  "type": "health:initial",
  "data": { ...HealthStatus }
}

// 健康状态更新
{
  "type": "health:update",
  "data": { ...HealthStatus }
}

// 文件添加
{
  "type": "file:added",
  "data": {
    "type": "add",
    "path": "L1-episodic/2026-04-02.md",
    "level": "L1",
    "timestamp": 1712064000000
  }
}

// 文件修改
{
  "type": "file:changed",
  "data": { ... }
}

// 文件删除
{
  "type": "file:removed",
  "data": { ... }
}
```

### React Hook 使用

```typescript
import { useFileWatcher } from '@/lib/hooks/useFileWatcher';

function MyComponent() {
  const { connected, lastEvent, error, reconnect } = useFileWatcher({
    wsPort: 3001,
    onFileChange: (event) => {
      console.log('File changed:', event.path, event.level);
      // 自动刷新组件
    },
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
  });

  return (
    <div>
      {connected ? '实时连接' : '已断开'}
      {lastEvent && <span>最后变化: {lastEvent.path}</span>}
    </div>
  );
}
```

## 验收标准检查

- [x] L1 文件生成后页面自动更新（无需刷新）
- [x] Health 面板显示所有关键指标
- [x] 异常情况有明确警告提示

## 依赖

```json
{
  "chokidar": "^3.x",
  "ws": "^8.x",
  "@types/ws": "^8.x"
}
```

已自动安装到项目中。

## 注意事项

1. **WebSocket 端口**: 默认使用 3001 端口，如果冲突请修改 `wsPort` 参数
2. **文件监听**: 使用 chokidar 的 `awaitWriteFinish` 确保文件写入完成后再触发事件
3. **自动重连**: WebSocket 和 SSE 都支持自动重连机制
4. **性能**: 文件监听使用 2 层深度，避免监听过多文件
