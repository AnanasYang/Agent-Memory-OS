/**
 * File Watcher Module
 * 监听 ai-memory-system/Memory/ 目录变化，通过 WebSocket 推送更新
 */

import { FSWatcher, watch } from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';

// 监听目录
const MEMORY_BASE_PATH = process.env.MEMORY_BASE_PATH || 
  '/home/bruce/.openclaw/workspace/ai-memory-system/Memory';

// WebSocket 服务器
let wss: WebSocketServer | null = null;
let fileWatcher: FSWatcher | null = null;

// 连接的客户端
const clients = new Set<WebSocket>();

// 文件变化事件类型
export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'ready';
  path: string;
  level: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'unknown';
  timestamp: number;
  stats?: {
    size?: number;
    mtime?: number;
  };
}

// 内存层统计
export interface MemoryLayerStats {
  L0: number;
  L1: number;
  L2: number;
  L3: number;
  L4: number;
  total: number;
  lastUpdate: number;
}

// 健康状态
export interface HealthStatus {
  dailyDream: {
    lastRun: string | null;
    status: 'success' | 'error' | 'running' | 'unknown';
    nextScheduled: string | null;
  };
  weeklyDream: {
    lastRun: string | null;
    status: 'success' | 'error' | 'running' | 'unknown';
    nextScheduled: string | null;
  };
  memoryLayers: MemoryLayerStats;
  l2Candidates: number;
  l3Candidates: number;
  warnings: string[];
  timestamp: number;
}

/**
 * 从文件路径推断内存层级
 */
function getMemoryLevel(filePath: string): FileChangeEvent['level'] {
  const normalizedPath = filePath.toLowerCase();
  if (normalizedPath.includes('l0') || normalizedPath.includes('l0-state')) return 'L0';
  if (normalizedPath.includes('l1') || normalizedPath.includes('l1-episodic')) return 'L1';
  if (normalizedPath.includes('l2') || normalizedPath.includes('l2-procedural')) return 'L2';
  if (normalizedPath.includes('l3') || normalizedPath.includes('l3-semantic')) return 'L3';
  if (normalizedPath.includes('l4') || normalizedPath.includes('l4-core')) return 'L4';
  return 'unknown';
}

/**
 * 获取各层文件数量统计
 */
export async function getMemoryLayerStats(): Promise<MemoryLayerStats> {
  const levels = ['L0-state', 'L1-episodic', 'L2-procedural', 'L3-semantic', 'L4-core'] as const;
  const stats: MemoryLayerStats = {
    L0: 0, L1: 0, L2: 0, L3: 0, L4: 0,
    total: 0,
    lastUpdate: Date.now()
  };

  for (const level of levels) {
    try {
      const levelPath = join(MEMORY_BASE_PATH, level);
      const files = await readdir(levelPath);
      // 只统计 .md 文件
      const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');
      const levelKey = level.split('-')[0] as keyof Omit<MemoryLayerStats, 'total' | 'lastUpdate'>;
      stats[levelKey] = mdFiles.length;
      stats.total += mdFiles.length;
    } catch (error) {
      console.warn(`[FileWatcher] Failed to read ${level}:`, error);
    }
  }

  return stats;
}

/**
 * 获取 L2/L3 候选池数量
 */
export async function getCandidateCounts(): Promise<{ l2: number; l3: number }> {
  let l2 = 0, l3 = 0;

  try {
    // 检查 L2 候选池 - 通常是未 review 的 L1 文件
    const l1Path = join(MEMORY_BASE_PATH, 'L1-episodic');
    const l1Files = await readdir(l1Path);
    for (const file of l1Files.filter(f => f.endsWith('.md'))) {
      const filePath = join(l1Path, file);
      const content = await readFile(filePath, 'utf-8');
      // 检查 frontmatter 中的 reviewed 状态
      if (content.includes('reviewed:') && !content.includes('reviewed: true')) {
        l2++;
      }
    }
  } catch (error) {
    console.warn('[FileWatcher] Failed to count L2 candidates:', error);
  }

  try {
    // 检查 L3 候选池
    const l2Path = join(MEMORY_BASE_PATH, 'L2-procedural');
    const l2Files = await readdir(l2Path);
    for (const file of l2Files.filter(f => f.endsWith('.md'))) {
      const filePath = join(l2Path, file);
      const content = await readFile(filePath, 'utf-8');
      if (content.includes('reviewed:') && !content.includes('reviewed: true')) {
        l3++;
      }
    }
  } catch (error) {
    console.warn('[FileWatcher] Failed to count L3 candidates:', error);
  }

  return { l2, l3 };
}

/**
 * 获取 Dream 运行状态
 */
export async function getDreamStatus(): Promise<{
  daily: HealthStatus['dailyDream'];
  weekly: HealthStatus['weeklyDream'];
}> {
  const daily: HealthStatus['dailyDream'] = {
    lastRun: null,
    status: 'unknown',
    nextScheduled: null
  };
  const weekly: HealthStatus['weeklyDream'] = {
    lastRun: null,
    status: 'unknown',
    nextScheduled: null
  };

  try {
    // 读取 cron 配置
    const cronPath = '/home/bruce/.openclaw/workspace/agent-memory-os/cron/daily-dream.json';
    const cronContent = await readFile(cronPath, 'utf-8');
    
    // 检查日志目录获取最后运行时间
    const logsPath = '/home/bruce/.openclaw/workspace/memory/dreams/logs';
    try {
      const logFiles = await readdir(logsPath);
      const dailyLogs = logFiles
        .filter(f => f.startsWith('daily-') && f.endsWith('.json'))
        .sort()
        .reverse();
      
      if (dailyLogs.length > 0) {
        const lastLog = dailyLogs[0];
        const logDate = lastLog.replace('daily-', '').replace('.json', '');
        daily.lastRun = logDate;
        
        // 检查是否是今天的
        const today = new Date().toISOString().split('T')[0];
        daily.status = logDate === today ? 'success' : 'error';
      }
    } catch {
      // 日志目录不存在
    }

    // 计算下次计划运行时间 (23:00)
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(23, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    daily.nextScheduled = nextRun.toISOString();

    // Weekly dream - 周日晚 23:00
    const nextWeekly = new Date(now);
    nextWeekly.setHours(23, 0, 0, 0);
    const daysUntilSunday = (7 - nextWeekly.getDay()) % 7 || 7;
    nextWeekly.setDate(nextWeekly.getDate() + daysUntilSunday);
    weekly.nextScheduled = nextWeekly.toISOString();

    // 检查 weekly 日志
    const reviewsPath = '/home/bruce/.openclaw/workspace/ai-memory-system/Meta/reviews/weekly';
    try {
      const weeklyFiles = await readdir(reviewsPath);
      const weeklyLogs = weeklyFiles
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse();
      
      if (weeklyLogs.length > 0) {
        const lastLog = weeklyLogs[0];
        // 从文件名提取日期，如 weekly-review-2026-03-30.md
        const match = lastLog.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) {
          weekly.lastRun = match[1];
          const lastRunDate = new Date(match[1]);
          const daysSinceLastRun = (now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24);
          weekly.status = daysSinceLastRun <= 7 ? 'success' : 'error';
        }
      }
    } catch {
      // 目录不存在
    }

  } catch (error) {
    console.warn('[FileWatcher] Failed to get dream status:', error);
  }

  return { daily, weekly };
}

/**
 * 生成健康状态
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const [memoryLayers, candidates, dreamStatus] = await Promise.all([
    getMemoryLayerStats(),
    getCandidateCounts(),
    getDreamStatus()
  ]);

  const warnings: string[] = [];
  const now = Date.now();

  // 检查 Daily Dream
  if (dreamStatus.daily.status === 'error') {
    warnings.push('Daily Dream 超过24小时未运行');
  }

  // 检查 Weekly Dream
  if (dreamStatus.weekly.status === 'error') {
    warnings.push('Weekly Dream 超过7天未运行');
  }

  // 检查数据异常
  if (memoryLayers.L0 > 1000) {
    warnings.push('L0 层文件数量过多 (>1000)，建议归档');
  }
  if (memoryLayers.L1 > 500) {
    warnings.push('L1 层文件数量过多 (>500)，建议 review');
  }
  if (candidates.l2 > 50) {
    warnings.push(`L2 候选池积压 ${candidates.l2} 条，需要 review`);
  }
  if (candidates.l3 > 30) {
    warnings.push(`L3 候选池积压 ${candidates.l3} 条，需要 review`);
  }

  return {
    dailyDream: dreamStatus.daily,
    weeklyDream: dreamStatus.weekly,
    memoryLayers,
    l2Candidates: candidates.l2,
    l3Candidates: candidates.l3,
    warnings,
    timestamp: now
  };
}

/**
 * 广播消息给所有连接的客户端
 */
function broadcast(message: object) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/**
 * 启动文件监听
 */
export function startFileWatcher(): FSWatcher {
  if (fileWatcher) {
    console.log('[FileWatcher] Already running');
    return fileWatcher;
  }

  console.log('[FileWatcher] Starting watcher for:', MEMORY_BASE_PATH);

  fileWatcher = watch(MEMORY_BASE_PATH, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: false, // 初始扫描也触发
    depth: 2, // 监听两层深度
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });

  // 文件添加
  fileWatcher.on('add', async (path) => {
    const event: FileChangeEvent = {
      type: 'add',
      path: relative(MEMORY_BASE_PATH, path),
      level: getMemoryLevel(path),
      timestamp: Date.now()
    };
    
    try {
      const fileStat = await stat(path);
      event.stats = {
        size: fileStat.size,
        mtime: fileStat.mtime.getTime()
      };
    } catch {}

    console.log('[FileWatcher] File added:', event.path, `(${event.level})`);
    broadcast({ type: 'file:added', data: event });
  });

  // 文件修改
  fileWatcher.on('change', async (path) => {
    const event: FileChangeEvent = {
      type: 'change',
      path: relative(MEMORY_BASE_PATH, path),
      level: getMemoryLevel(path),
      timestamp: Date.now()
    };

    try {
      const fileStat = await stat(path);
      event.stats = {
        size: fileStat.size,
        mtime: fileStat.mtime.getTime()
      };
    } catch {}

    console.log('[FileWatcher] File changed:', event.path, `(${event.level})`);
    broadcast({ type: 'file:changed', data: event });
  });

  // 文件删除
  fileWatcher.on('unlink', (path) => {
    const event: FileChangeEvent = {
      type: 'unlink',
      path: relative(MEMORY_BASE_PATH, path),
      level: getMemoryLevel(path),
      timestamp: Date.now()
    };

    console.log('[FileWatcher] File removed:', event.path, `(${event.level})`);
    broadcast({ type: 'file:removed', data: event });
  });

  // 初始扫描完成
  fileWatcher.on('ready', () => {
    console.log('[FileWatcher] Initial scan complete');
    broadcast({ type: 'watcher:ready', data: { timestamp: Date.now() } });
  });

  // 错误处理
  fileWatcher.on('error', (error: unknown) => {
    console.error('[FileWatcher] Error:', error);
    broadcast({ type: 'watcher:error', data: { error: error instanceof Error ? error.message : 'Unknown error' } });
  });

  return fileWatcher;
}

/**
 * 启动 WebSocket 服务器
 */
export function startWebSocketServer(port: number = 3001): WebSocketServer {
  if (wss) {
    console.log('[WebSocket] Server already running');
    return wss;
  }

  wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    clients.add(ws);

    // 发送初始健康状态
    getHealthStatus().then(status => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'health:initial', data: status }));
      }
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // 处理客户端请求
        if (data.type === 'health:refresh') {
          getHealthStatus().then(status => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'health:update', data: status }));
            }
          });
        }
      } catch (error) {
        console.warn('[WebSocket] Invalid message:', message);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Client error:', error);
      clients.delete(ws);
    });
  });

  console.log(`[WebSocket] Server started on port ${port}`);
  return wss;
}

/**
 * 停止所有监听
 */
export function stopFileWatcher(): void {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
    console.log('[FileWatcher] Stopped');
  }

  if (wss) {
    clients.forEach(client => client.close());
    clients.clear();
    wss.close();
    wss = null;
    console.log('[WebSocket] Server stopped');
  }
}

/**
 * 获取当前状态
 */
export function getWatcherStatus(): {
  watching: boolean;
  clientCount: number;
  wsPort: number | null;
} {
  return {
    watching: fileWatcher !== null,
    clientCount: clients.size,
    wsPort: wss ? 3001 : null
  };
}

// 导出默认启动函数
export default function initFileWatcher(port?: number): {
  watcher: FSWatcher;
  wss: WebSocketServer;
} {
  const watcher = startFileWatcher();
  const server = startWebSocketServer(port);
  
  return { watcher, wss: server };
}
