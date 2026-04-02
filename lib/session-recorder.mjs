#!/usr/bin/env node
/**
 * Session Recorder - 会话记录器
 * 
 * 功能：捕获每次用户-AI对话，写入持久化存储
 * 作为 Daily Dream 的 L0 数据源
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEMORY_ROOT = join(__dirname, '..', '..', 'memory');

// 获取今日日期
const getTodayStr = () => new Date().toISOString().split('T')[0];

// 确保目录存在
const ensureDir = (dir) => {
  mkdirSync(dir, { recursive: true });
};

/**
 * 记录一条消息
 * @param {Object} message - {role, content, timestamp, sessionId, channel}
 */
export function recordMessage(message) {
  const today = getTodayStr();
  const L0_DIR = join(MEMORY_ROOT, 'L0-raw', today);
  ensureDir(L0_DIR);
  
  // 按会话ID分文件存储
  const sessionFile = join(L0_DIR, `${message.sessionId || 'default'}.jsonl`);
  
  const record = {
    ts: Date.now(),
    role: message.role,
    content: message.content?.substring(0, 10000), // 限制长度
    sessionId: message.sessionId,
    channel: message.channel,
    date: today
  };
  
  // 追加写入
  writeFileSync(sessionFile, JSON.stringify(record) + '\n', { flag: 'a' });
  
  // 同时写入每日汇总
  const dailyFile = join(MEMORY_ROOT, `${today}.md`);
  const timeStr = new Date().toLocaleTimeString('zh-CN');
  const entry = `## ${timeStr} [${message.role}]\n\n${message.content?.substring(0, 500)}${message.content?.length > 500 ? '...' : ''}\n\n---\n\n`;
  writeFileSync(dailyFile, entry, { flag: 'a' });
}

/**
 * 记录会话开始
 */
export function recordSessionStart(sessionInfo) {
  const today = getTodayStr();
  const SESSION_LOG = join(MEMORY_ROOT, 'sessions.jsonl');
  
  const record = {
    type: 'session-start',
    ts: Date.now(),
    date: today,
    sessionId: sessionInfo.id,
    channel: sessionInfo.channel,
    user: sessionInfo.user
  };
  
  writeFileSync(SESSION_LOG, JSON.stringify(record) + '\n', { flag: 'a' });
}

/**
 * 获取今日所有原始记录
 */
export function getTodayRawRecords() {
  const today = getTodayStr();
  const L0_DIR = join(MEMORY_ROOT, 'L0-raw', today);
  
  if (!existsSync(L0_DIR)) {
    return [];
  }
  
  const records = [];
  const files = readdirSync(L0_DIR).filter(f => f.endsWith('.jsonl'));
  
  for (const file of files) {
    try {
      const content = readFileSync(join(L0_DIR, file), 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      for (const line of lines) {
        records.push(JSON.parse(line));
      }
    } catch (e) {}
  }
  
  return records.sort((a, b) => a.ts - b.ts);
}

// CLI 测试
if (process.argv[2] === 'test') {
  console.log('Testing session recorder...');
  recordMessage({
    role: 'user',
    content: '测试消息',
    sessionId: 'test-session',
    channel: 'test'
  });
  console.log('✅ Test message recorded');
}
