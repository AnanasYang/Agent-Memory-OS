#!/usr/bin/env node
/**
 * Memory System Status Check
 * 
 * 检查记忆系统各组件运行状态
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEMORY_OS = '/home/bruce/.openclaw/workspace/agent-memory-os';
const AI_SYSTEM = '/home/bruce/.openclaw/workspace/ai-memory-system';

console.log('🔍 Memory System Status Check\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 1. 检查数据源
console.log('📊 Data Sources:');
const l1Dir = path.join(AI_SYSTEM, 'Memory/L1-episodic');
const l2Dir = path.join(AI_SYSTEM, 'Memory/L2-procedural');
const l3Dir = path.join(AI_SYSTEM, 'Memory/L3-semantic');
const l4Dir = path.join(AI_SYSTEM, 'Memory/L4-core');

function countFiles(dir, ext = '.md') {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(f => f.endsWith(ext)).length;
}

console.log(`  L1 (情景): ${countFiles(l1Dir)} files`);
console.log(`  L2 (程序): ${countFiles(l2Dir)} files`);
console.log(`  L3 (语义): ${countFiles(l3Dir)} files`);
console.log(`  L4 (核心): ${countFiles(l4Dir)} files`);

// 2. 检查同步状态
console.log('\n🔄 Sync Status:');
const syncedFile = path.join(MEMORY_OS, 'memory/synced/memories.json');
if (fs.existsSync(syncedFile)) {
  const data = JSON.parse(fs.readFileSync(syncedFile, 'utf-8'));
  console.log(`  Last sync: ${data.metadata?.syncedAt || 'unknown'}`);
  console.log(`  Total memories: ${data.memories?.length || 0}`);
  console.log(`  L1: ${data.metadata?.stats?.L1 || 0}`);
  console.log(`  L2: ${data.metadata?.stats?.L2 || 0}`);
  console.log(`  L3: ${data.metadata?.stats?.L3 || 0}`);
  console.log(`  L4: ${data.metadata?.stats?.L4 || 0}`);
} else {
  console.log('  ❌ No synced data found');
}

// 3. 检查 Dreams
console.log('\n🌙 Dreams:');
const dailyDir = path.join(MEMORY_OS, 'memory/dreams/daily');
const weeklyDir = path.join(MEMORY_OS, 'memory/dreams/weekly');

if (fs.existsSync(dailyDir)) {
  const dailyCount = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json')).length;
  console.log(`  Daily dreams: ${dailyCount}`);
}
if (fs.existsSync(weeklyDir)) {
  const weeklyCount = fs.readdirSync(weeklyDir).filter(f => f.endsWith('.json')).length;
  console.log(`  Weekly dreams: ${weeklyCount}`);
}

// 4. 检查 Cron 任务
console.log('\n⏰ Cron Jobs:');
try {
  const crontab = execSync('crontab -l', { encoding: 'utf-8' });
  const jobs = crontab.split('\n').filter(l => l.includes('agent-memory-os') || l.includes('ai-digest'));
  jobs.forEach(job => {
    if (job.trim() && !job.startsWith('#')) {
      console.log(`  ✓ ${job.substring(0, 60)}...`);
    }
  });
} catch (e) {
  console.log('  ❌ No crontab found');
}

// 5. 检查 API 端点
console.log('\n🔌 API Endpoints:');
const apiDir = path.join(MEMORY_OS, 'app/api');
if (fs.existsSync(apiDir)) {
  const endpoints = fs.readdirSync(apiDir);
  endpoints.forEach(ep => {
    console.log(`  ✓ /api/${ep}`);
  });
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Status check complete');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
