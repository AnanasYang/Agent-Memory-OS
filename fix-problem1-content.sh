#!/bin/bash
# fix-problem1-content.sh - 增强L1-L3记忆内容深度

cd /home/bruce/.openclaw/workspace/agent-memory-os

echo "🔧 修复问题1：增强记忆内容深度"

# 1. 备份原脚本
cp scripts/daily-dream.mjs scripts/daily-dream.mjs.bak

# 2. 创建增强版L1生成逻辑
cat > scripts/daily-dream-enhanced.mjs << 'ENHANCED'
#!/usr/bin/env node
/**
 * Daily Dream Enhanced - 增强版每日记忆复盘
 * 特点：增加深度思考、详细分析、关联说明
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

[DAILY_DIR, L2_CANDIDATES].forEach(dir => mkdirSync(dir, { recursive: true }));

const TODAY = new Date();
const DATE_STR = TODAY.toISOString().split('T')[0];
const TODAY_START = new Date(DATE_STR).getTime();

// ============ 增强版数据收集 ============
function collectL0Records() {
  console.log('\n📥 Phase 1: 收集L0原始记录');
  const records = [];
  
  // 从L0-state目录读取
  const L0_DIR = join('/home/bruce/.openclaw/workspace/ai-memory-system/Memory/L0-state');
  if (existsSync(L0_DIR)) {
    const files = readdirSync(L0_DIR).filter(f => f.endsWith('.jsonl'));
    for (const file of files) {
      try {
        const content = readFileSync(join(L0_DIR, file), 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        for (const line of lines) {
          const record = JSON.parse(line);
          records.push({ ...record, source: 'L0-state' });
        }
      } catch (e) {}
    }
  }
  
  // 从手动记忆文件读取
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
  }
  
  records.sort((a, b) => a.ts - b.ts);
  console.log(`  └─ 共收集 ${records.length} 条记录`);
  
  return records;
}

// ============ 增强版洞察提取 ============
function extractInsightsEnhanced(records) {
  console.log('\n🧠 Phase 2: 深度洞察分析');
  
  const userMsgs = records.filter(r => r.role === 'user');
  const assistantMsgs = records.filter(r => r.role === 'assistant');
  
  // 深度主题分析
  const themes = analyzeThemes(records);
  
  // 情感趋势分析
  const sentiment = analyzeSentiment(records);
  
  // 交互模式分析
  const interactionPatterns = analyzeInteractionPatterns(records);
  
  // 知识领域映射
  const knowledgeDomains = mapKnowledgeDomains(records);
  
  // 生成深度总结（包含思考过程）
  const summary = generateDeepSummary(records, themes, sentiment, interactionPatterns);
  
  // 识别关键事件（增强版）
  const keyEvents = identifyKeyEventsEnhanced(records, themes);
  
  // 检测行为模式（增强版）
  const patterns = detectPatternsEnhanced(records, interactionPatterns);
  
  console.log(`  └─ 识别 ${themes.length} 个主题`);
  console.log(`  └─ 发现 ${keyEvents.length} 个关键事件`);
  console.log(`  └─ 检测到 ${patterns.length} 个行为模式`);
  
  return {
    summary,
    keyEvents,
    patterns,
    themes,
    sentiment,
    interactionPatterns,
    knowledgeDomains,
    stats: {
      totalRecords: records.length,
      userMessages: userMsgs.length,
      assistantMessages: assistantMsgs.length,
      avgMessageLength: Math.round(
        records.reduce((sum, r) => sum + (r.content?.length || 0), 0) / records.length
      )
    }
  };
}

function analyzeThemes(records) {
  const userContents = records
    .filter(r => r.role === 'user')
    .map(r => r.content || '');
  
  // 主题关键词映射
  const themeKeywords = {
    '技术开发': ['代码', '编程', '函数', 'API', '开发', '实现', 'bug', 'error', 'debug', 'cursor', 'ide'],
    '记忆系统': ['记忆', 'L1', 'L2', 'L3', 'L4', 'dream', '复盘', '沉淀'],
    'AI研究': ['AI', '模型', 'LLM', 'agent', '智能体', 'prompt', ' Claude', 'GPT'],
    '项目管理': ['项目', '任务', '进度', '计划', '排期', '交付'],
    '工作协作': ['会议', '沟通', '协调', '反馈', 'review', '汇报'],
    '学习成长': ['学习', '研究', '了解', '掌握', '深入', '探索']
  };
  
  const themes = [];
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const matches = userContents.filter(content => 
      keywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()))
    ).length;
    
    if (matches > 0) {
      themes.push({
        name: theme,
        occurrences: matches,
        intensity: Math.min(matches / userContents.length * 5, 1),
        relatedMessages: userContents.filter(content => 
          keywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()))
        ).slice(0, 3)
      });
    }
  }
  
  return themes.sort((a, b) => b.occurrences - a.occurrences);
}

function analyzeSentiment(records) {
  const positiveWords = ['完成', '成功', '解决', '好的', '优秀', '完美', '赞', '✅'];
  const negativeWords = ['错误', '失败', '问题', '困难', 'bug', '报错', '❌', '失败'];
  const urgentWords = ['紧急', '立即', '马上', 'asap', 'urgent', '急'];
  
  let positive = 0, negative = 0, urgent = 0;
  
  records.forEach(r => {
    const content = r.content || '';
    if (positiveWords.some(w => content.includes(w))) positive++;
    if (negativeWords.some(w => content.includes(w))) negative++;
    if (urgentWords.some(w => content.includes(w))) urgent++;
  });
  
  const total = records.length || 1;
  return {
    positive: (positive / total * 100).toFixed(1),
    negative: (negative / total * 100).toFixed(1),
    urgent: (urgent / total * 100).toFixed(1),
    neutral: ((total - positive - negative - urgent) / total * 100).toFixed(1),
    overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral'
  };
}

function analyzeInteractionPatterns(records) {
  const hourlyDistribution = new Array(24).fill(0);
  const sessionGaps = [];
  let lastTs = null;
  
  records.forEach(r => {
    const hour = new Date(r.ts).getHours();
    hourlyDistribution[hour]++;
    
    if (lastTs) {
      const gap = r.ts - lastTs;
      if (gap > 60000) sessionGaps.push(gap); // >1分钟视为间隔
    }
    lastTs = r.ts;
  });
  
  const activeHours = hourlyDistribution
    .map((count, hour) => ({ count, hour }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count);
  
  const avgSessionGap = sessionGaps.length > 0 
    ? sessionGaps.reduce((a, b) => a + b, 0) / sessionGaps.length 
    : 0;
  
  return {
    peakHour: activeHours[0]?.hour || 0,
    activeHourCount: activeHours.length,
    avgSessionGapMinutes: Math.round(avgSessionGap / 60000),
    totalSessions: sessionGaps.length + 1
  };
}

function mapKnowledgeDomains(records) {
  const domains = [];
  const allContent = records.map(r => r.content || '').join(' ');
  
  // 技术栈检测
  if (allContent.includes('React') || allContent.includes('Next.js')) {
    domains.push({ name: '前端开发', tools: ['React', 'Next.js', 'TypeScript'] });
  }
  if (allContent.includes('Node') || allContent.includes('JavaScript')) {
    domains.push({ name: '后端/脚本', tools: ['Node.js', 'JavaScript'] });
  }
  if (allContent.includes('AI') || allContent.includes('模型')) {
    domains.push({ name: 'AI/ML', tools: ['LLM', 'Agent', 'Prompt Engineering'] });
  }
  
  return domains;
}

function generateDeepSummary(records, themes, sentiment, patterns) {
  const totalRecords = records.length;
  const duration = records.length > 1 
    ? Math.round((records[records.length - 1].ts - records[0].ts) / 3600000 * 10) / 10
    : 0;
  
  let summary = `## 📊 数据概览\n\n`;
  summary += `今日共产生 **${totalRecords}** 条交互记录，跨越约 **${duration}** 小时。`;
  summary += `交互高峰出现在 **${patterns.peakHour}:00**，共涉及 **${patterns.totalSessions}** 个独立会话。\n\n`;
  
  summary += `## 🎯 核心主题\n\n`;
  if (themes.length > 0) {
    themes.slice(0, 3).forEach((theme, i) => {
      summary += `${i + 1}. **${theme.name}** (${theme.occurrences}次提及)`;
      if (theme.relatedMessages[0]) {
        const preview = theme.relatedMessages[0].substring(0, 50) + '...';
        summary += ` - 例如："${preview}"`;
      }
      summary += '\n';
    });
  }
  summary += '\n';
  
  summary += `## 💭 情感分析\n\n`;
  summary += `今日整体情绪倾向：**${sentiment.overall === 'positive' ? '积极' : sentiment.overall === 'negative' ? '消极' : '中性'}**。`;
  summary += `其中积极表达占 ${sentiment.positive}%，消极表达占 ${sentiment.negative}%。`;
  if (parseFloat(sentiment.urgent) > 5) {
    summary += ` 有 ${sentiment.urgent}% 的消息带有紧急性质，显示今日有重要任务在推进。`;
  }
  summary += '\n\n';
  
  summary += `## 🔍 深度观察\n\n`;
  summary += `- **工作节奏**：平均每 ${patterns.avgSessionGapMinutes} 分钟产生一次交互';
  summary += `，显示${patterns.avgSessionGapMinutes < 10 ? '高度专注的工作状态' : '较为分散的工作节奏'}。\n`;
  summary += `- **活跃时段**：在 ${patterns.activeHourCount} 个不同的小时有活动记录。\n`;
  
  return summary;
}

function identifyKeyEventsEnhanced(records, themes) {
  const events = [];
  const userContents = records.filter(r => r.role === 'user').map(r => r.content || '');
  
  // 深度讨论检测
  const longConversations = userContents.filter(c => c.length > 500);
  if (longConversations.length > 0) {
    events.push({
      title: '深度技术讨论',
      description: `今日有 ${longConversations.length} 次深度输入，平均长度 ${Math.round(longConversations.reduce((a, b) => a + b.length, 0) / longConversations.length)} 字符。这表明在解决复杂问题或进行深度思考。`,
      importance: 9,
      type: 'deep-dive',
      thinking: '长文本输入通常意味着用户在处理需要深度认知的任务，如架构设计、问题排查或方案评估。'
    });
  }
  
  // 代码相关活动
  const codeRelated = userContents.filter(c => 
    c.includes('```') || c.includes('function') || c.includes('const') || c.includes('import')
  );
  if (codeRelated.length > 0) {
    events.push({
      title: '代码开发与实现',
      description: `进行了 ${codeRelated.length} 次代码相关的讨论或实现，涉及具体技术实现细节。`,
      importance: 8,
      type: 'coding',
      thinking: '代码级别的交互表明正在进行实际的开发工作，而非仅仅概念讨论。'
    });
  }
  
  // 记忆系统优化
  const memoryRelated = userContents.filter(c =>
    c.includes('记忆') || c.includes('L1') || c.includes('L2') || c.includes('dream') || c.includes('沉淀')
  );
  if (memoryRelated.length > 0) {
    events.push({
      title: '记忆系统迭代优化',
      description: `持续关注并优化AI记忆系统架构，讨论了5层记忆模型的实现细节。`,
      importance: 10,
      type: 'memory-system',
      thinking: '记忆系统是核心基础设施，持续的优化投入表明对其长期价值的认可。'
    });
  }
  
  return events;
}

function detectPatternsEnhanced(records, patterns) {
  const detectedPatterns = [];
  
  // 工作时段模式
  if (patterns.peakHour >= 9 && patterns.peakHour <= 18) {
    detectedPatterns.push({
      type: '工作时间专注',
      description: `主要活跃时段在 ${patterns.peakHour}:00，符合标准工作时间规律`,
      confidence: 0.85,
      thinking: '规律的工作时间模式表明稳定的工作习惯，有利于长期生产力维持。'
    });
  } else if (patterns.peakHour < 9 || patterns.peakHour > 20) {
    detectedPatterns.push({
      type: '非标准工作时段',
      description: `活跃高峰出现在 ${patterns.peakHour}:00，显示弹性工作习惯`,
      confidence: 0.75,
      thinking: '非标准时段活跃可能表明高效利用碎片时间或存在工作-生活边界模糊。'
    });
  }
  
  // 持续使用模式
  if (records.length > 20) {
    detectedPatterns.push({
      type: '高频使用AI助手',
      description: `今日产生 ${records.length} 条交互记录，显示深度依赖AI辅助工作流`,
      confidence: 0.9,
      thinking: '高频交互表明AI助手已深度融入日常工作流，形成稳定的协作模式。'
    });
  }
  
  // 响应时间模式
  const responseTimes = [];
  for (let i = 1; i < records.length; i++) {
    if (records[i].role === 'assistant' && records[i-1].role === 'user') {
      responseTimes.push(records[i].ts - records[i-1].ts);
    }
  }
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;
  
  if (avgResponseTime < 30000) {
    detectedPatterns.push({
      type: '快速迭代模式',
      description: `平均响应时间仅 ${Math.round(avgResponseTime/1000)} 秒，显示快速试错和迭代`,
      confidence: 0.8,
      thinking: '快速响应模式适合探索性任务，但也需要注意深度思考的时间分配。'
    });
  }
  
  return detectedPatterns;
}

// ============ 增强版L1记忆生成 ============
function generateL1MemoriesEnhanced(insights) {
  console.log('\n💭 Phase 3: 生成增强L1记忆');
  
  const memories = [];
  
  // 每日深度总结记忆
  memories.push({
    id: `L1-${DATE_STR}-daily`,
    level: 'L1',
    type: 'daily-summary',
    title: `${DATE_STR} 深度复盘`,
    content: insights.summary,
    confidence: 0.92,
    category: 'daily-review',
    sources: [DATE_STR],
    created: new Date().toISOString(),
    metadata: {
      recordCount: insights.stats.totalRecords,
      themes: insights.themes.map(t => t.name),
      sentiment: insights.sentiment
    }
  });
  
  // 关键事件记忆（带思考过程）
  insights.keyEvents.forEach((event, i) => {
    memories.push({
      id: `L1-${DATE_STR}-event-${i+1}`,
      level: 'L1',
      type: 'key-event',
      title: event.title,
      content: `${event.description}\n\n**思考过程**：${event.thinking}`,
      confidence: event.importance / 10,
      category: event.type,
      sources: [DATE_STR],
      created: new Date().toISOString(),
      metadata: { 
        importance: event.importance,
        thinking: event.thinking
      }
    });
  });
  
  // 行为模式记忆
  insights.patterns.forEach((pattern, i) => {
    memories.push({
      id: `L1-${DATE_STR}-pattern-${i+1}`,
      level: 'L1',
      type: 'behavior-pattern',
      title: `模式检测：${pattern.type}`,
      content: `${pattern.description}\n\n**分析依据**：${pattern.thinking}`,
      confidence: pattern.confidence,
      category: 'pattern',
      sources: [DATE_STR],
      created: new Date().toISOString(),
      metadata: {
        confidence: pattern.confidence,
        analysis: pattern.thinking
      }
    });
  });
  
  console.log(`  └─ 生成 ${memories.length} 条增强L1记忆`);
  
  return memories;
}

// ============ 主流程 ============
function main() {
  const startTime = Date.now();
  
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║  🌙 DAILY DREAM ENHANCED v3.0             ║');
  console.log('║  深度思考 + 详细分析 + 关联说明           ║');
  console.log('╚═══════════════════════════════════════════╝');
  
  const records = collectL0Records();
  
  if (records.length === 0) {
    console.log('\n⚠️ 警告: 未找到今日记录');
    return;
  }
  
  const insights = extractInsightsEnhanced(records);
  const l1Memories = generateL1MemoriesEnhanced(insights);
  
  // 输出L2候选
  const l2Candidates = insights.patterns.map((p, i) => ({
    id: `L2-candidate-${DATE_STR}-${i+1}`,
    source: 'daily-dream-enhanced',
    date: DATE_STR,
    type: p.type,
    description: p.description,
    confidence: p.confidence,
    thinking: p.thinking,
    occurrences: 1
  }));
  
  // 保存
  const dreamData = {
    id: `dream-${DATE_STR}`,
    type: 'daily-dream-enhanced',
    version: '3.0',
    date: DATE_STR,
    timestamp: Date.now(),
    insights,
    l1Memories,
    l2Candidates
  };
  
  writeFileSync(
    join(DAILY_DIR, `${DATE_STR}-dream.json`),
    JSON.stringify(dreamData, null, 2)
  );
  
  console.log('\n✅ 增强版Daily Dream完成！');
  console.log(`   L1记忆: ${l1Memories.length} 条`);
  console.log(`   L2候选: ${l2Candidates.length} 个`);
  console.log(`   耗时: ${Date.now() - startTime}ms`);
}

main();
ENHANCED

chmod +x scripts/daily-dream-enhanced.mjs
echo "✅ 已创建增强版daily-dream脚本"
