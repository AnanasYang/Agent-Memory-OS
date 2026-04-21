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
  // 优先从 weekly reviews 读取（真实的 dream 回顾数据）
  const weeklyDir = join(AI_MEMORY_BASE, 'Meta', 'reviews', 'weekly');
  const reviewsDir = join(AI_MEMORY_BASE, 'Meta', 'reviews');
  let files = [];
  
  // 先尝试 weekly 子目录
  if (existsSync(weeklyDir)) {
    files = readdirSync(weeklyDir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({ name: f, dir: weeklyDir }));
  }
  
  // 再尝试 reviews 根目录（兼容旧数据）
  if (existsSync(reviewsDir)) {
    const rootFiles = readdirSync(reviewsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({ name: f, dir: reviewsDir }));
    files = files.concat(rootFiles);
  }
  
  // 去重并按时间排序（最新的在前）
  const seen = new Set();
  files = files
    .filter(f => { const dup = seen.has(f.name); seen.add(f.name); return !dup; })
    .sort((a, b) => b.name.localeCompare(a.name))
    .slice(0, 30);
  
  return files.map((file, index) => {
    const filepath = join(file.dir, file.name);
    const content = readFileSync(filepath, 'utf-8');
    const stats = statSync(filepath);
    
    return {
      id: `dream-${index}`,
      date: file.name.replace('.md', '').replace('-weekly-review', ''),
      timestamp: stats.mtime.getTime(),
      summary: content.slice(0, 800),
      sessionCount: 0,
      l1Count: 0,
      status: 'success'
    };
  });
}

function readIntents() {
  const goalsDir = join(AI_MEMORY_BASE, 'Intent', 'goals');
  if (!existsSync(goalsDir)) return [];
  
  const intents = [];
  const types = ['short-term', 'mid-term', 'long-term'];
  
  types.forEach(type => {
    const typeDir = join(goalsDir, type);
    if (!existsSync(typeDir)) return;
    
    const files = readdirSync(typeDir).filter(f => f.endsWith('.md'));
    files.forEach((filename, index) => {
      const filepath = join(typeDir, filename);
      const content = readFileSync(filepath, 'utf-8');
      const stats = statSync(filepath);
      
      // 尝试从 frontmatter 提取进度
      const progressMatch = content.match(/progress:\s*(\d+)/);
      const progress = progressMatch ? parseInt(progressMatch[1]) : 0;
      
      // 尝试提取优先级
      const priorityMatch = content.match(/priority:\s*(high|medium|low)/);
      const priority = priorityMatch ? priorityMatch[1] : 'medium';
      
      intents.push({
        id: `intent-${type}-${index}`,
        type: type,
        title: filename.replace('.md', ''),
        description: content.replace(/^---[\s\S]*?---/, '').slice(0, 300).trim(),
        progress: progress,
        dependencies: [],
        created: stats.birthtime.toISOString(),
        deadline: undefined,
        priority: priority
      });
    });
  });
  
  return intents;
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
