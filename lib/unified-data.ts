/**
 * 统一数据层 - 从 ai-memory-system 读取真实数据
 * 打通 agent-memory-os 和 ai-memory-system 的数据隔阂
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

// 基础路径配置
const AI_MEMORY_BASE = '/home/bruce/.openclaw/workspace/ai-memory-system';
const MEMORY_OS_BASE = '/home/bruce/.openclaw/workspace/agent-memory-os';

// ============ 类型定义 ============

export interface MemoryNode {
  id: string;
  title: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  content: string;
  category: string;
  confidence: number;
  created: string;
  updated: string;
  reviewed: string | null;
  sources: string[];
  connections: string[];
  position?: { x: number; y: number };
}

export interface Dream {
  id: string;
  date: string;
  timestamp: number;
  summary: string;
  sessionCount: number;
  l1Count: number;
  status: 'success' | 'error' | 'running';
  insights?: {
    keyEvents: Array<{ title: string; description: string; importance: number }>;
    patterns: string[];
    sentiment: string;
  };
  l1Memories?: any[];
}

export interface WeeklyReview {
  id: string;
  week: string;
  date: string;
  l1Count: number;
  l2Candidates: number;
  actions: string[];
  content: string;
}

export interface SystemStatus {
  activeTasks: number;
  memoryNodes: number;
  activeIntents: number;
  lastSync: string;
  lastGithubSync: string;
  systemLoad: number;
  weeklyReviews: number;
  dailyDreams: number;
}

export interface ActivityData {
  date: string;
  count: number;
  level: 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
}

// ============ 文件读取工具 ============

function parseFrontmatter(content: string): { data: any; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  
  const frontmatter = match[1];
  const body = match[2].trim();
  
  const data: any = {};
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      data[key] = value.replace(/^["']|["']$/g, ''); // 去除引号
    }
  });
  
  return { data, body };
}

// ============ L1-L4 记忆读取 ============

export function getMemoryNodes(): MemoryNode[] {
  const nodes: MemoryNode[] = [];
  
  const levelDirs = ['L1-episodic', 'L2-procedural', 'L3-semantic', 'L4-core'];
  
  levelDirs.forEach(levelDir => {
    const dirPath = join(AI_MEMORY_BASE, 'Memory', levelDir);
    if (!existsSync(dirPath)) return;
    
    const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
    
    files.forEach((file, index) => {
      try {
        const content = readFileSync(join(dirPath, file), 'utf-8');
        const { data, body } = parseFrontmatter(content);
        
        const level = levelDir.split('-')[0].toUpperCase() as 'L1' | 'L2' | 'L3' | 'L4';
        
        // 计算环形布局位置
        const angle = (index / Math.max(files.length, 1)) * Math.PI * 2;
        const radius = level === 'L4' ? 60 : level === 'L3' ? 120 : level === 'L2' ? 180 : 240;
        
        nodes.push({
          id: file.replace('.md', ''),
          title: data.title || body.split('\n')[0]?.replace('# ', '') || file.replace('.md', ''),
          level,
          content: body,
          category: data.category || 'general',
          confidence: parseFloat(data.confidence) || 0.8,
          created: data.created || data.date || '2026-01-01',
          updated: data.updated || data.created || '2026-01-01',
          reviewed: data.reviewed || null,
          sources: [],
          connections: [],
          position: {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          }
        });
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    });
  });
  
  return nodes;
}

// ============ Dreams 读取 ============

export function getDreams(limit: number = 30): Dream[] {
  const dreams: Dream[] = [];
  
  // 1. 从 ai-memory-system/Memory/L1-episodic/ 读取 daily-dream 文件
  const l1Dir = join(AI_MEMORY_BASE, 'Memory', 'L1-episodic');
  if (existsSync(l1Dir)) {
    const files = readdirSync(l1Dir)
      .filter(f => f.includes('daily-dream') || f.includes('daily'))
      .sort()
      .reverse()
      .slice(0, limit);
    
    files.forEach(file => {
      try {
        const content = readFileSync(join(l1Dir, file), 'utf-8');
        const { data, body } = parseFrontmatter(content);
        
        // 提取日期
        const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : data.date || '2026-01-01';
        
        dreams.push({
          id: file.replace('.md', ''),
          date,
          timestamp: new Date(date).getTime(),
          summary: body.split('\n').slice(0, 3).join(' ').substring(0, 100) + '...',
          sessionCount: parseInt(data.sessions) || 0,
          l1Count: 1,
          status: 'success'
        });
      } catch (e) {
        console.error(`Failed to parse dream ${file}:`, e);
      }
    });
  }
  
  // 2. 从 agent-memory-os 自己的 dreams 目录补充
  const osDreamsDir = join(MEMORY_OS_BASE, 'memory', 'dreams', 'daily');
  if (existsSync(osDreamsDir)) {
    const files = readdirSync(osDreamsDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);
    
    files.forEach(file => {
      try {
        const content = readFileSync(join(osDreamsDir, file), 'utf-8');
        const data = JSON.parse(content);
        
        // 避免重复
        const date = data.date || file.split('-dream')[0];
        if (!dreams.find(d => d.date === date)) {
          dreams.push({
            id: data.id || file.replace('.json', ''),
            date,
            timestamp: data.timestamp || new Date(date).getTime(),
            summary: data.insights?.summary || data.summary || '无摘要',
            sessionCount: data.sessions || data.dataSource?.uniqueSessions || 0,
            l1Count: data.l1Memories?.length || 0,
            status: 'success',
            insights: data.insights,
            l1Memories: data.l1Memories
          });
        }
      } catch (e) {
        console.error(`Failed to parse os dream ${file}:`, e);
      }
    });
  }
  
  return dreams.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ============ Weekly Reviews 读取 ============

export function getWeeklyReviews(): WeeklyReview[] {
  const reviews: WeeklyReview[] = [];
  
  const reviewsDir = join(AI_MEMORY_BASE, 'Meta', 'reviews', 'weekly');
  if (!existsSync(reviewsDir)) return reviews;
  
  const files = readdirSync(reviewsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();
  
  files.forEach(file => {
    try {
      const content = readFileSync(join(reviewsDir, file), 'utf-8');
      const { data, body } = parseFrontmatter(content);
      
      // 提取周数
      const weekMatch = file.match(/W(\d+)/) || body.match(/W(\d+)/);
      const week = weekMatch ? `W${weekMatch[1]}` : data.week || 'W00';
      
      // 提取行动项
      const actionMatches = body.match(/- \[.\] (.+)/g) || [];
      const actions = actionMatches.map(a => a.replace(/- \[[ x]\] /, ''));
      
      reviews.push({
        id: file.replace('.md', ''),
        week,
        date: data.date || file.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '2026-01-01',
        l1Count: parseInt(data.l1_count) || 0,
        l2Candidates: parseInt(data.l2_candidates) || 0,
        actions,
        content: body
      });
    } catch (e) {
      console.error(`Failed to parse review ${file}:`, e);
    }
  });
  
  return reviews;
}

// ============ System Status ============

export function getSystemStatus(): SystemStatus {
  // 获取真实文件统计
  const l1Dir = join(AI_MEMORY_BASE, 'Memory', 'L1-episodic');
  const l2Dir = join(AI_MEMORY_BASE, 'Memory', 'L2-procedural');
  const l3Dir = join(AI_MEMORY_BASE, 'Memory', 'L3-semantic');
  const l4Dir = join(AI_MEMORY_BASE, 'Memory', 'L4-core');
  const reviewsDir = join(AI_MEMORY_BASE, 'Meta', 'reviews', 'weekly');
  const dreamsDir = join(MEMORY_OS_BASE, 'memory', 'dreams', 'daily');
  
  const countFiles = (dir: string) => {
    if (!existsSync(dir)) return 0;
    return readdirSync(dir).filter(f => f.endsWith('.md')).length;
  };
  
  // 获取 GitHub 最后同步时间
  let lastGithubSync = 'Unknown';
  try {
    const gitDir = join(AI_MEMORY_BASE, '.git');
    if (existsSync(gitDir)) {
      // 简单检查最新提交时间
      const refsDir = join(gitDir, 'refs', 'heads');
      if (existsSync(refsDir)) {
        const mainRef = join(refsDir, 'main');
        if (existsSync(mainRef)) {
          const stats = statSync(mainRef);
          lastGithubSync = stats.mtime.toISOString();
        }
      }
    }
  } catch (e) {
    console.error('Failed to get git status:', e);
  }
  
  return {
    activeTasks: 0, // 需要从 Intent 轨道计算
    memoryNodes: countFiles(l1Dir) + countFiles(l2Dir) + countFiles(l3Dir) + countFiles(l4Dir),
    activeIntents: 0, // 需要从 Intent 目录计算
    lastSync: new Date().toISOString(),
    lastGithubSync,
    systemLoad: 0,
    weeklyReviews: countFiles(reviewsDir),
    dailyDreams: existsSync(dreamsDir) ? readdirSync(dreamsDir).filter(f => f.endsWith('.json')).length : 0
  };
}

// ============ Activity Data (GitHub 风格热力图) ============

export function getActivityData(): ActivityData[] {
  const activities: ActivityData[] = [];
  
  // 获取 L1 文件的真实日期
  const l1Dir = join(AI_MEMORY_BASE, 'Memory', 'L1-episodic');
  if (existsSync(l1Dir)) {
    const files = readdirSync(l1Dir).filter(f => f.endsWith('.md'));
    
    const dateCount: Record<string, { count: number; levels: Set<string> }> = {};
    
    files.forEach(file => {
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const date = dateMatch[1];
        if (!dateCount[date]) {
          dateCount[date] = { count: 0, levels: new Set() };
        }
        dateCount[date].count++;
        dateCount[date].levels.add('L1');
      }
    });
    
    // 转换为数组
    Object.entries(dateCount).forEach(([date, data]) => {
      activities.push({
        date,
        count: data.count,
        level: 'L1'
      });
    });
  }
  
  // 补充 Dreams 的数据
  const dreams = getDreams(100);
  dreams.forEach(dream => {
    const existing = activities.find(a => a.date === dream.date);
    if (existing) {
      existing.count += dream.l1Count;
    } else {
      activities.push({
        date: dream.date,
        count: dream.l1Count,
        level: 'L1'
      });
    }
  });
  
  return activities.sort((a, b) => a.date.localeCompare(b.date));
}

// ============ 意图数据 ============

export function getIntents() {
  const intents: any[] = [];
  
  const intentDirs = ['short-term', 'mid-term', 'long-term'];
  
  intentDirs.forEach(timeframe => {
    const dirPath = join(AI_MEMORY_BASE, 'Intent', 'goals', timeframe);
    if (!existsSync(dirPath)) return;
    
    const files = readdirSync(dirPath).filter(f => f.endsWith('.md'));
    
    files.forEach(file => {
      try {
        const content = readFileSync(join(dirPath, file), 'utf-8');
        const { data, body } = parseFrontmatter(content);
        
        intents.push({
          id: file.replace('.md', ''),
          title: data.title || body.split('\n')[0]?.replace('# ', '') || file.replace('.md', ''),
          timeframe,
          progress: parseFloat(data.progress) || 0,
          deadline: data.deadline || data.due || null,
          priority: data.priority || 'medium',
          content: body
        });
      } catch (e) {
        console.error(`Failed to parse intent ${file}:`, e);
      }
    });
  });
  
  return intents;
}
