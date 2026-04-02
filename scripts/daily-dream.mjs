#!/usr/bin/env node
/**
 * Daily Dream - 每日记忆复盘系统 (增强版)
 * 
 * 数据源：
 * 1. L0 原始记录 (memory/L0-raw/)
 * 2. OpenClaw sessions (如果可用)
 * 3. 手动记忆文件 (memory/YYYY-MM-DD.md)
 * 4. Cron 日志
 * 
 * 输出：
 * - L1 情景记忆 (memory/dreams/daily/)
 * - 行为模式候选 (memory/L2-procedural/candidates/)
 * - 系统运行日志
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, '..');
const MEMORY_ROOT = join(WORKSPACE_ROOT, 'memory');
const DAILY_DIR = join(MEMORY_ROOT, 'dreams', 'daily');
const L2_CANDIDATES = join(MEMORY_ROOT, 'L2-procedural', 'candidates');

// 确保目录存在
[DAILY_DIR, L2_CANDIDATES].forEach(dir => mkdirSync(dir, { recursive: true }));

const TODAY = new Date();
const DATE_STR = TODAY.toISOString().split('T')[0];
const TODAY_START = new Date(DATE_STR).getTime();

console.log(`🌙 Daily Dream Enhanced: ${DATE_STR}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

// ============ 1. 多源数据收集 ============

function collectL0Records() {
  console.log('\n📥 Phase 1: Collecting L0 Records');
  const records = [];
  
  // 1.1 从 L0-raw 目录读取
  const L0_DIR = join(MEMORY_ROOT, 'L0-raw', DATE_STR);
  if (existsSync(L0_DIR)) {
    const files = readdirSync(L0_DIR).filter(f => f.endsWith('.jsonl'));
    for (const file of files) {
      try {
        const content = readFileSync(join(L0_DIR, file), 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        for (const line of lines) {
          const record = JSON.parse(line);
          records.push({ ...record, source: 'L0-raw' });
        }
      } catch (e) {}
    }
  }
  console.log(`  └─ L0-raw records: ${records.length}`);
  
  // 1.2 从手动记忆文件读取
  const manualFile = join(MEMORY_ROOT, `${DATE_STR}.md`);
  if (existsSync(manualFile)) {
    const content = readFileSync(manualFile, 'utf-8');
    records.push({
      ts: TODAY_START,
      role: 'system',
      content: content,
      source: 'manual-memory',
      type: 'daily-notes'
    });
    console.log(`  └─ Manual memory: ✓`);
  }
  
  // 1.3 尝试 OpenClaw sessions
  try {
    const result = execSync('openclaw sessions list --json 2>/dev/null || echo "[]"', {
      encoding: 'utf-8',
      timeout: 5000
    });
    const sessions = JSON.parse(result);
    const todaySessions = sessions.filter(s => s.updatedAt >= TODAY_START);
    console.log(`  └─ OpenClaw sessions: ${todaySessions.length}`);
    
    for (const s of todaySessions) {
      records.push({
        ts: s.updatedAt,
        role: 'system',
        content: `Session with ${s.displayName} on ${s.channel}`,
        source: 'openclaw',
        sessionId: s.sessionId,
        totalTokens: s.totalTokens
      });
    }
  } catch (e) {
    console.log(`  └─ OpenClaw sessions: ✗ (${e.message})`);
  }
  
  // 按时间排序
  records.sort((a, b) => a.ts - b.ts);
  console.log(`  └─ Total collected: ${records.length}`);
  
  return records;
}

// ============ 2. 本地提炼 (无需 LLM) ============

function extractInsightsLocal(records) {
  console.log('\n🧠 Phase 2: Extracting Insights');
  
  // 统计信息
  const userMsgs = records.filter(r => r.role === 'user');
  const assistantMsgs = records.filter(r => r.role === 'assistant');
  const sources = [...new Set(records.map(r => r.source))];
  
  // 简单的关键词提取
  const keywords = extractKeywords(records);
  
  // 会话分析
  const sessions = groupBySession(records);
  
  // 生成摘要
  const summary = generateSummary(records, userMsgs, assistantMsgs);
  
  // 识别关键事件
  const keyEvents = identifyKeyEvents(records);
  
  // 检测行为模式
  const patterns = detectPatterns(records);
  
  console.log(`  └─ User messages: ${userMsgs.length}`);
  console.log(`  └─ Assistant messages: ${assistantMsgs.length}`);
  console.log(`  └─ Unique sessions: ${Object.keys(sessions).length}`);
  console.log(`  └─ Key events: ${keyEvents.length}`);
  console.log(`  └─ Patterns detected: ${patterns.length}`);
  
  return {
    summary,
    keyEvents,
    patterns,
    keywords,
    stats: {
      totalRecords: records.length,
      userMessages: userMsgs.length,
      assistantMessages: assistantMsgs.length,
      sources: sources
    }
  };
}

function extractKeywords(records) {
  const allContent = records.map(r => r.content || '').join(' ');
  const commonWords = ['the', 'and', 'is', 'of', 'to', 'a', 'in', 'that', 'have', 'it'];
  
  // 简单的词频统计
  const words = allContent
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !commonWords.includes(w));
  
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

function groupBySession(records) {
  const sessions = {};
  records.forEach(r => {
    const sid = r.sessionId || 'unknown';
    if (!sessions[sid]) sessions[sid] = [];
    sessions[sid].push(r);
  });
  return sessions;
}

function generateSummary(records, userMsgs, assistantMsgs) {
  const firstMsg = records[0];
  const lastMsg = records[records.length - 1];
  
  const duration = firstMsg && lastMsg 
    ? Math.round((lastMsg.ts - firstMsg.ts) / 60000) // 分钟
    : 0;
  
  return `今日共有 ${records.length} 条记录，包含 ${userMsgs.length} 条用户输入和 ${assistantMsgs.length} 条 AI 回复，跨越 ${duration} 分钟。主要关注领域：${extractKeywords(records).slice(0, 3).map(k => k.word).join('、') || '无显著主题'}。`;
}

function identifyKeyEvents(records) {
  const events = [];
  const userContents = records.filter(r => r.role === 'user').map(r => r.content || '');
  
  // 检测长对话（可能是深度讨论）
  const longConversations = userContents.filter(c => c.length > 500);
  if (longConversations.length > 0) {
    events.push({
      title: '深度讨论',
      description: `有 ${longConversations.length} 次较长的输入，可能涉及复杂问题分析`,
      importance: 8,
      type: 'deep-dive'
    });
  }
  
  // 检测代码相关内容
  const codeRelated = userContents.some(c => 
    c.includes('```') || c.includes('function') || c.includes('代码')
  );
  if (codeRelated) {
    events.push({
      title: '技术开发',
      description: '讨论了代码或技术实现相关内容',
      importance: 7,
      type: 'coding'
    });
  }
  
  // 检测记忆系统相关
  const memoryRelated = userContents.some(c =>
    c.includes('记忆') || c.includes('L1') || c.includes('L2') || c.includes('dream')
  );
  if (memoryRelated) {
    events.push({
      title: '记忆系统优化',
      description: '讨论了 AI 记忆系统的设计和实现',
      importance: 9,
      type: 'memory-system'
    });
  }
  
  return events;
}

function detectPatterns(records) {
  const patterns = [];
  const hourlyDistribution = new Array(24).fill(0);
  
  records.forEach(r => {
    const hour = new Date(r.ts).getHours();
    hourlyDistribution[hour]++;
  });
  
  // 检测活跃时段
  const activeHours = hourlyDistribution
    .map((count, hour) => ({ count, hour }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count);
  
  if (activeHours.length > 0) {
    const peak = activeHours[0];
    patterns.push({
      type: 'time-preference',
      description: `活跃时段: ${peak.hour}:00-${peak.hour+1}:00 (${peak.count} 条消息)`,
      confidence: 0.7
    });
  }
  
  // 检测连续性
  if (records.length > 10) {
    patterns.push({
      type: 'engagement',
      description: '今日交互频繁，持续使用 AI 助手',
      confidence: 0.8
    });
  }
  
  return patterns;
}

// ============ 3. 生成 L1 记忆 ============

function generateL1Memories(insights, records) {
  console.log('\n💭 Phase 3: Generating L1 Memories');
  
  const memories = [];
  
  // 3.1 每日总结记忆
  memories.push({
    id: `L1-${DATE_STR}-daily`,
    level: 'L1',
    type: 'daily-summary',
    title: `${DATE_STR} 每日复盘`,
    content: insights.summary,
    confidence: 0.9,
    category: 'daily-review',
    sources: [DATE_STR],
    created: new Date().toISOString(),
    metadata: {
      recordCount: insights.stats.totalRecords,
      sources: insights.stats.sources
    }
  });
  
  // 3.2 关键事件记忆
  for (let i = 0; i < insights.keyEvents.length; i++) {
    const event = insights.keyEvents[i];
    memories.push({
      id: `L1-${DATE_STR}-event-${i+1}`,
      level: 'L1',
      type: 'key-event',
      title: event.title,
      content: event.description,
      confidence: event.importance / 10,
      category: event.type,
      sources: [DATE_STR],
      created: new Date().toISOString(),
      metadata: { importance: event.importance }
    });
  }
  
  console.log(`  └─ Generated ${memories.length} L1 memories`);
  
  return memories;
}

// ============ 4. 输出 L2 候选 ============

function outputL2Candidates(insights) {
  console.log('\n🔍 Phase 4: Outputting L2 Candidates');
  
  const candidates = insights.patterns.map((p, i) => ({
    id: `L2-candidate-${DATE_STR}-${i+1}`,
    source: 'daily-dream',
    date: DATE_STR,
    type: p.type,
    description: p.description,
    confidence: p.confidence,
    occurrences: 1,
    firstSeen: DATE_STR,
    lastSeen: DATE_STR
  }));
  
  if (candidates.length > 0) {
    const candidateFile = join(L2_CANDIDATES, `${DATE_STR}.json`);
    writeFileSync(candidateFile, JSON.stringify(candidates, null, 2));
    console.log(`  └─ ${candidates.length} L2 candidates saved`);
  } else {
    console.log(`  └─ No L2 candidates today`);
  }
  
  return candidates;
}

// ============ 5. 持久化输出 ============

function saveDream(dreamData) {
  console.log('\n💾 Phase 5: Persistence');
  
  const jsonPath = join(DAILY_DIR, `${DATE_STR}-dream.json`);
  const mdPath = join(DAILY_DIR, `${DATE_STR}-dream.md`);
  
  // JSON 格式
  writeFileSync(jsonPath, JSON.stringify(dreamData, null, 2));
  
  // Markdown 格式
  const md = `# 🌙 Daily Dream - ${DATE_STR}

**生成时间**: ${new Date(dreamData.timestamp).toLocaleString('zh-CN')}  
**数据版本**: 2.0 (Enhanced)

## 📊 数据概览

| 指标 | 数值 |
|------|------|
| 总记录数 | ${dreamData.insights.stats.totalRecords} |
| 用户消息 | ${dreamData.insights.stats.userMessages} |
| AI 回复 | ${dreamData.insights.stats.assistantMessages} |
| 数据源 | ${dreamData.insights.stats.sources.join(', ')} |
| L1 记忆 | ${dreamData.l1Memories.length} |
| L2 候选 | ${dreamData.l2Candidates.length} |

## 📝 一句话总结

${dreamData.insights.summary}

## 🔑 关键事件 (${dreamData.insights.keyEvents.length})

${dreamData.insights.keyEvents.map((e, i) => 
  `### ${i+1}. ${e.title} (重要性: ${e.importance}/10)\n${e.description}`
).join('\n\n')}

## 🧬 行为模式

${dreamData.insights.patterns.map(p => `- **${p.type}**: ${p.description} (置信度: ${p.confidence})`).join('\n') || '今日未检测到显著行为模式'}

## 🏷️ 高频关键词

${dreamData.insights.keywords.map(k => `- ${k.word} (${k.count}次)`).join('\n') || '无'}

## 📁 生成的记忆

### L1 情景记忆
${dreamData.l1Memories.map(m => `- **${m.title}** (${m.type})`).join('\n')}

### L2 行为候选
${dreamData.l2Candidates.map(c => `- **${c.type}**: ${c.description}`).join('\n') || '- 无候选'}

---

## 🔗 5层记忆系统流转

\`\`\`
L0 (原始记录) → Daily Dream → L1 (情景记忆)
                                    ↓
                              行为检测
                                    ↓
L2 候选 ← 3次确认 ← 沉淀 ← L2 (程序记忆)
                                    ↓
                              季度Review
                                    ↓
                            L3 (语义记忆)
                                    ↓
                              人工确认
                                    ↓
                            L4 (核心记忆)
\`\`\`

---

*此复盘由 Agent Memory OS Daily Dream v2.0 自动生成*
`;
  
  writeFileSync(mdPath, md);
  
  console.log(`  └─ JSON: ${jsonPath}`);
  console.log(`  └─ Markdown: ${mdPath}`);
}

// ============ 主流程 ============

function main() {
  const startTime = Date.now();
  
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║     🌙 DAILY DREAM ENHANCED v2.0         ║');
  console.log('║     5-Layer Memory System                ║');
  console.log('╚═══════════════════════════════════════════╝');
  
  // 1. 收集 L0
  const records = collectL0Records();
  
  if (records.length === 0) {
    console.log('\n⚠️  警告: 未找到今日记录');
    console.log('   确保会话记录器已启用');
  }
  
  // 2. 提炼洞察
  const insights = extractInsightsLocal(records);
  
  // 3. 生成 L1
  const l1Memories = generateL1Memories(insights, records);
  
  // 4. 输出 L2 候选
  const l2Candidates = outputL2Candidates(insights);
  
  // 5. 组装 Dream 数据
  const dreamData = {
    id: `dream-${DATE_STR}`,
    type: 'daily-dream',
    version: '2.0',
    date: DATE_STR,
    timestamp: Date.now(),
    duration: Date.now() - startTime,
    records: {
      count: records.length,
      sources: insights.stats.sources
    },
    insights,
    l1Memories,
    l2Candidates,
    flow: {
      l0: '原始记录已收集',
      l1: `${l1Memories.length} 条情景记忆已生成`,
      l2: `${l2Candidates.length} 个行为候选待确认`,
      l3: '季度 Review 时沉淀',
      l4: '人工确认后写入'
    }
  };
  
  // 6. 保存
  saveDream(dreamData);
  
  // 7. 总结
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('           ✅ DREAM COMPLETE              ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏱️  Duration: ${dreamData.duration}ms`);
  console.log(`📥 L0 Records: ${records.length}`);
  console.log(`💭 L1 Memories: ${l1Memories.length}`);
  console.log(`🔍 L2 Candidates: ${l2Candidates.length}`);
  console.log(`🔄 Next: Weekly Dream on Sunday 22:00`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  process.exit(0);
}

main();
