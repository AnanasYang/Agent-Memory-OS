#!/usr/bin/env node
/**
 * Memory Data Sync Script
 * 
 * 将 ai-memory-system 的数据同步到 agent-memory-os
 * 支持 L1-L4 记忆数据的自动同步
 */

const fs = require('fs');
const path = require('path');

// 路径配置
const AI_MEMORY_SYSTEM = '/home/bruce/.openclaw/workspace/ai-memory-system';
const AGENT_MEMORY_OS = '/home/bruce/.openclaw/workspace/agent-memory-os';

const MEMORY_LAYERS = {
  L1: path.join(AI_MEMORY_SYSTEM, 'Memory/L1-episodic'),
  L2: path.join(AI_MEMORY_SYSTEM, 'Memory/L2-procedural'),
  L3: path.join(AI_MEMORY_SYSTEM, 'Memory/L3-semantic'),
  L4: path.join(AI_MEMORY_SYSTEM, 'Memory/L4-core')
};

const OUTPUT_DIR = path.join(AGENT_MEMORY_OS, 'memory/synced');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 解析 Markdown 文件的 frontmatter
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };
  
  const frontmatter = match[1];
  const body = match[2].trim();
  const metadata = {};
  
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  });
  
  return { metadata, body };
}

/**
 * 从文件路径生成记忆 ID
 */
function generateId(filePath, level) {
  const basename = path.basename(filePath, '.md');
  return `${level.toLowerCase()}-${basename}`;
}

/**
 * 读取单个记忆文件
 */
function readMemoryFile(filePath, level) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { metadata, body } = parseFrontmatter(content);
    
    return {
      id: generateId(filePath, level),
      title: metadata.title || path.basename(filePath, '.md'),
      level: level,
      content: body.substring(0, 500), // 截取前500字符作为摘要
      fullContent: body,
      confidence: parseFloat(metadata.confidence) || 0.8,
      category: metadata.category || 'general',
      sources: metadata.sources ? metadata.sources.split(',').map(s => s.trim()) : [],
      connections: [],
      created: metadata.created || new Date().toISOString(),
      updated: metadata.updated || metadata.created || new Date().toISOString(),
      reviewed: metadata.reviewed || null,
      position: { x: 0, y: 0 },
      filePath: filePath
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 扫描目录中的所有 Markdown 文件
 */
function scanDirectory(dirPath, level) {
  const memories = [];
  
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return memories;
  }
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归扫描子目录
      memories.push(...scanDirectory(filePath, level));
    } else if (file.endsWith('.md')) {
      const memory = readMemoryFile(filePath, level);
      if (memory) {
        memories.push(memory);
      }
    }
  }
  
  return memories;
}

/**
 * 同步所有记忆层数据
 */
function syncAllLayers() {
  console.log('🔄 Starting Memory Data Sync...\n');
  
  const allMemories = [];
  const stats = { L1: 0, L2: 0, L3: 0, L4: 0 };
  
  // 同步每一层
  for (const [level, dirPath] of Object.entries(MEMORY_LAYERS)) {
    console.log(`📂 Scanning ${level} from ${dirPath}...`);
    const memories = scanDirectory(dirPath, level);
    allMemories.push(...memories);
    stats[level] = memories.length;
    console.log(`   ✓ Found ${memories.length} memories\n`);
  }
  
  // 为记忆分配位置（简单的环形布局）
  const levelGroups = {};
  allMemories.forEach(m => {
    if (!levelGroups[m.level]) levelGroups[m.level] = [];
    levelGroups[m.level].push(m);
  });
  
  const levelRadii = { L4: 60, L3: 120, L2: 200, L1: 300 };
  
  for (const [level, memories] of Object.entries(levelGroups)) {
    const radius = levelRadii[level] || 100;
    const angleStep = (2 * Math.PI) / Math.max(memories.length, 1);
    
    memories.forEach((memory, index) => {
      const angle = index * angleStep;
      memory.position = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
    });
  }
  
  // 生成连接关系（基于共同来源）
  const sourceMap = {};
  allMemories.forEach(m => {
    m.sources.forEach(source => {
      if (!sourceMap[source]) sourceMap[source] = [];
      sourceMap[source].push(m.id);
    });
  });
  
  for (const [source, memoryIds] of Object.entries(sourceMap)) {
    if (memoryIds.length > 1) {
      for (let i = 0; i < memoryIds.length; i++) {
        for (let j = i + 1; j < memoryIds.length; j++) {
          const m1 = allMemories.find(m => m.id === memoryIds[i]);
          const m2 = allMemories.find(m => m.id === memoryIds[j]);
          if (m1 && m2 && !m1.connections.includes(m2.id)) {
            m1.connections.push(m2.id);
            m2.connections.push(m1.id);
          }
        }
      }
    }
  }
  
  // 保存同步后的数据
  const outputData = {
    metadata: {
      syncedAt: new Date().toISOString(),
      version: '1.0',
      stats: stats
    },
    memories: allMemories.map(m => ({
      id: m.id,
      title: m.title,
      level: m.level,
      content: m.content,
      confidence: m.confidence,
      category: m.category,
      sources: m.sources,
      connections: m.connections,
      created: m.created,
      updated: m.updated,
      reviewed: m.reviewed,
      position: m.position
    }))
  };
  
  const outputPath = path.join(OUTPUT_DIR, 'memories.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
// 生成数据模块（可选：用于静态导出）
  const dataModule = `// Auto-generated from ai-memory-system
// Synced at: ${new Date().toISOString()}

export const memoryNodes = ${JSON.stringify(outputData.memories, null, 2)};

export const systemStatus = {
  activeTasks: 0,
  memoryNodes: ${allMemories.length},
  activeIntents: 0,
  lastSync: "${new Date().toISOString()}",
  systemLoad: 0
};
`;
  
  // ⚠️ lib/data.ts 已废弃 - 所有组件现在使用 API 路由
  // 如需静态数据备份，取消下面注释：
  // fs.writeFileSync(path.join(AGENT_MEMORY_OS, 'lib/data.ts'), dataModule);
  
  // 如果存在旧的 lib/data.ts，删除它以避免混淆
  const oldDataFile = path.join(AGENT_MEMORY_OS, 'lib/data.ts');
  if (fs.existsSync(oldDataFile)) {
    fs.unlinkSync(oldDataFile);
    console.log('🗑️  已删除废弃的 lib/data.ts');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Memory Data Sync Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Stats:`);
  console.log(`   L1 (情景记忆): ${stats.L1}`);
  console.log(`   L2 (程序记忆): ${stats.L2}`);
  console.log(`   L3 (语义记忆): ${stats.L3}`);
  console.log(`   L4 (核心记忆): ${stats.L4}`);
  console.log(`   ───────────────`);
  console.log(`   Total: ${allMemories.length}`);
  console.log(`\n📁 Output files:`);
  console.log(`   - ${outputPath}`);
  // console.log(`   - ${path.join(AGENT_MEMORY_OS, 'lib/data.ts')}`);
  console.log('   (lib/data.ts 已废弃 - 使用 API 路由)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return { stats, count: allMemories.length };
}

// 主函数
if (require.main === module) {
  syncAllLayers();
}

module.exports = { syncAllLayers, readMemoryFile };
