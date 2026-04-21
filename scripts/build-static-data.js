const { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

// 基础路径配置：Netlify 构建时从 /tmp 读取 clone 的数据，本地开发时读取本地路径
const AI_MEMORY_BASE = process.env.NETLIFY
  ? '/tmp/ai-memory-system'
  : '/home/bruce/.openclaw/workspace/ai-memory-system';

console.log(`📂 Memory data source: ${AI_MEMORY_BASE}`);
if (!existsSync(AI_MEMORY_BASE)) {
  console.error(`❌ Memory data directory not found: ${AI_MEMORY_BASE}`);
  console.error('   For Netlify builds, ensure build-netlify.sh clones the repo first.');
  console.error('   For local builds, ensure ai-memory-system repo exists at the local path.');
  process.exit(1);
}
const PUBLIC_DATA_DIR = join(__dirname, '../public/data');

// 确保目录存在
if (!existsSync(PUBLIC_DATA_DIR)) {
  mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
}

// ============ 数据读取函数（从 ai-memory-system）============

function readMemoryDir(level) {
  const dir = join(AI_MEMORY_BASE, 'Memory', level);
  if (!existsSync(dir)) return [];
  
  const files = readdirSync(dir).filter(f => f.endsWith('.md'));
  return files.map(filename => {
    const filepath = join(dir, filename);
    const content = readFileSync(filepath, 'utf-8');
    const stats = statSync(filepath);
    
    return {
      id: `${level.toLowerCase()}-${filename.replace('.md', '')}`,
      title: filename.replace('.md', ''),
      level: level.split('-')[0], // 'L1-episodic' → 'L1'
      content: content.slice(0, 5000), // 限制大小
      category: 'general',
      confidence: 0.85,
      created: stats.birthtime.toISOString(),
      updated: stats.mtime.toISOString(),
      reviewed: null,
      sources: [filepath],
      connections: []
    };
  });
}

function readL0Data() {
  const l0Dir = join(AI_MEMORY_BASE, 'Memory', 'L0-state');
  if (!existsSync(l0Dir)) return [];
  
  const files = readdirSync(l0Dir)
    .filter(f => f.endsWith('.jsonl'))
    .sort()
    .slice(-3); // 只取最近 3 天
  
  const messages = [];
  files.forEach(file => {
    const filepath = join(l0Dir, file);
    const lines = readFileSync(filepath, 'utf-8').trim().split('\n').filter(Boolean);
    lines.slice(-20).forEach((line, idx) => { // 每条文件只取最近 20 条
      try {
        const msg = JSON.parse(line);
        messages.push({
          id: `${file.replace('.jsonl', '')}-${idx}`,
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content?.slice(0, 200) || '',
          timestamp: msg.ts ? new Date(msg.ts).toISOString() : new Date().toISOString()
        });
      } catch (e) {}
    });
  });
  
  return messages;
}

function readDreams() {
  const dreamsDir = join(AI_MEMORY_BASE, 'Meta', 'reviews');
  if (!existsSync(dreamsDir)) return [];
  
  const files = readdirSync(dreamsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, 30);
  
  return files.map((filename, index) => {
    const filepath = join(dreamsDir, filename);
    const content = readFileSync(filepath, 'utf-8');
    const stats = statSync(filepath);
    
    return {
      id: `dream-${index}`,
      date: filename.replace('.md', ''),
      timestamp: stats.mtime.getTime(),
      summary: content.slice(0, 500),
      sessionCount: 0,
      l1Count: 0,
      status: 'success'
    };
  });
}

function readIntents() {
  const intentDir = join(AI_MEMORY_BASE, 'Intent', 'goals');
  if (!existsSync(intentDir)) return [];
  
  const files = readdirSync(intentDir).filter(f => f.endsWith('.md'));
  return files.map((filename, index) => {
    const filepath = join(intentDir, filename);
    const content = readFileSync(filepath, 'utf-8');
    const stats = statSync(filepath);
    
    return {
      id: `intent-${index}`,
      type: 'short-term',
      title: filename.replace('.md', ''),
      description: content.slice(0, 300),
      progress: 0,
      dependencies: [],
      created: stats.birthtime.toISOString(),
      deadline: undefined,
      priority: 'medium'
    };
  });
}

function getSystemStatus() {
  const memoryDir = join(AI_MEMORY_BASE, 'Memory');
  let memoryNodes = 0;
  ['L1-episodic', 'L2-procedural', 'L3-semantic', 'L4-core'].forEach(level => {
    const dir = join(memoryDir, level);
    if (existsSync(dir)) {
      memoryNodes += readdirSync(dir).filter(f => f.endsWith('.md')).length;
    }
  });
  
  const reviewsDir = join(AI_MEMORY_BASE, 'Meta', 'reviews');
  const weeklyReviews = existsSync(reviewsDir) 
    ? readdirSync(reviewsDir).filter(f => f.endsWith('.md')).length 
    : 0;
  
  return {
    activeTasks: 0,
    memoryNodes,
    activeIntents: 0,
    lastSync: new Date().toISOString(),
    lastGithubSync: new Date().toISOString(),
    systemLoad: 0,
    weeklyReviews,
    dailyDreams: 0
  };
}

function getActivityData() {
  const activities = [];
  ['L1-episodic', 'L2-procedural', 'L3-semantic', 'L4-core'].forEach(level => {
    const dir = join(AI_MEMORY_BASE, 'Memory', level);
    if (existsSync(dir)) {
      const files = readdirSync(dir).filter(f => f.endsWith('.md'));
      files.forEach(file => {
        const stats = statSync(join(dir, file));
        activities.push({
          date: stats.mtime.toISOString().split('T')[0],
          count: 1,
          level: level.split('-')[0]
        });
      });
    }
  });
  return activities;
}

// ============ 主函数：生成静态 JSON ============

console.log('🔧 Generating static data for production build...\n');

// 1. 生成 unified-data.json
const memoryNodes = [
  ...readMemoryDir('L1-episodic'),
  ...readMemoryDir('L2-procedural'),
  ...readMemoryDir('L3-semantic'),
  ...readMemoryDir('L4-core')
];

const dreams = readDreams();
const weeklyReviews = dreams;
const status = getSystemStatus();
const activities = getActivityData();
const intents = readIntents();

const unifiedData = {
  memoryNodes,
  dreams,
  weeklyReviews,
  status,
  activities,
  intents,
  timestamp: new Date().toISOString()
};

writeFileSync(
  join(PUBLIC_DATA_DIR, 'unified-data.json'),
  JSON.stringify(unifiedData, null, 2)
);
console.log(`✅ unified-data.json (${memoryNodes.length} memories, ${dreams.length} dreams)`);

// 2. 生成 l0-memories.json
const l0Messages = readL0Data();
const l0Data = {
  messages: l0Messages,
  memories: l0Messages, // 兼容两种格式
  count: l0Messages.length,
  lastUpdated: new Date().toISOString()
};

writeFileSync(
  join(PUBLIC_DATA_DIR, 'l0-memories.json'),
  JSON.stringify(l0Data, null, 2)
);
console.log(`✅ l0-memories.json (${l0Messages.length} messages)`);

// 3. 生成 dreams.json
const dreamsData = {
  dreams,
  count: dreams.length,
  lastUpdated: new Date().toISOString()
};

writeFileSync(
  join(PUBLIC_DATA_DIR, 'dreams.json'),
  JSON.stringify(dreamsData, null, 2)
);
console.log(`✅ dreams.json (${dreams.length} dreams)`);

// 4. 生成 memory.json
const memoryData = {
  memories: memoryNodes,
  count: memoryNodes.length,
  lastUpdated: new Date().toISOString()
};

writeFileSync(
  join(PUBLIC_DATA_DIR, 'memory.json'),
  JSON.stringify(memoryData, null, 2)
);
console.log(`✅ memory.json (${memoryNodes.length} memories)`);

console.log('\n📁 All static data written to public/data/');
console.log('   Netlify will include these in the deployment.\n');
