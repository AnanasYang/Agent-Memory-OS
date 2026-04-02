/**
 * WebSocket Server Startup Script
 * 启动文件监听和 WebSocket 服务
 * 
 * 使用方法:
 * node scripts/start-watcher.mjs
 */

import { initFileWatcher } from '../lib/file-watcher.ts';

const PORT = process.env.WS_PORT || 3001;

console.log('🚀 Starting Agent Memory OS File Watcher...');
console.log(`📡 WebSocket server will run on port ${PORT}`);

const { watcher, wss } = initFileWatcher(Number(PORT));

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  watcher.close();
  wss.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  watcher.close();
  wss.close();
  process.exit(0);
});

console.log('✅ File watcher is running!');
console.log(`   Memory base: /home/bruce/.openclaw/workspace/ai-memory-system/Memory`);
console.log(`   WebSocket: ws://localhost:${PORT}`);
