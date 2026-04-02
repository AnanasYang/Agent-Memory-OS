/**
 * Server-Sent Events (SSE) API
 * GET /api/health/events
 * 用于不支持 WebSocket 的环境下的实时推送
 */

import { NextRequest } from 'next/server';
import { startFileWatcher, getHealthStatus, stopFileWatcher } from '@/lib/file-watcher';

// 全局 watcher 实例
let watcherInstance: ReturnType<typeof startFileWatcher> | null = null;

export async function GET(request: NextRequest) {
  // 启动文件监听（如果还没启动）
  if (!watcherInstance) {
    watcherInstance = startFileWatcher();
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // 发送初始数据
      getHealthStatus().then(status => {
        const data = JSON.stringify({ type: 'initial', data: status });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });

      // 定期发送心跳
      const heartbeatInterval = setInterval(() => {
        const heartbeat = JSON.stringify({ type: 'heartbeat', timestamp: Date.now() });
        controller.enqueue(encoder.encode(`data: ${heartbeat}\n\n`));
      }, 30000);

      // 清理函数
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
