import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface L0Message {
  ts: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sessionId?: string;
  source?: string;
}

interface L0Memory {
  id: string;
  type: 'L0';
  title: string;
  content: string;
  sessionId: string;
  timestamp: number;
  messageCount: number;
  preview: string;
  channel: string;
  userName: string;
}

// 读取预生成的静态数据（支持本地文件系统回退）
function readL0Data(): { messages: L0Message[]; memories: L0Memory[] } {
  const staticFile = join(process.cwd(), 'public', 'data', 'l0-memories.json');
  
  // 优先使用预生成的静态数据（Netlify 环境）
  if (existsSync(staticFile)) {
    try {
      const data = JSON.parse(readFileSync(staticFile, 'utf-8'));
      console.log(`[L0] 从静态文件读取: ${data.messages?.length || 0} 条消息`);
      return {
        messages: data.messages || data.memories || [],
        memories: data.memories || []
      };
    } catch (e) {
      console.error('[L0] 读取静态文件失败:', e);
    }
  }
  
  // 本地开发环境回退：直接读取 L0-state 目录
  const L0_DIR = '/home/bruce/.openclaw/workspace/ai-memory-system/Memory/L0-state';
  const { readdirSync } = require('fs');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    let l0File = join(L0_DIR, `daily-${today}.jsonl`);
    
    if (!existsSync(l0File)) {
      const files = readdirSync(L0_DIR)
        .filter((f: string) => f.match(/daily-\d{4}-\d{2}-\d{2}\.jsonl$/))
        .sort()
        .reverse();
      if (files.length > 0) l0File = join(L0_DIR, files[0]);
    }
    
    if (!existsSync(l0File)) return { messages: [], memories: [] };
    
    const content = readFileSync(l0File, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const messages: L0Message[] = [];
    
    for (const line of lines) {
      try {
        const msg = JSON.parse(line);
        if (msg.ts && msg.role) messages.push(msg);
      } catch {}
    }
    
    return { messages, memories: [] };
  } catch (e) {
    console.error('[L0] 本地回退读取失败:', e);
    return { messages: [], memories: [] };
  }
}

export async function GET(request: Request) {
  try {
    const { messages, memories: staticMemories } = readL0Data();
    
    if (staticMemories.length > 0) {
      return NextResponse.json({
        memories: staticMemories,
        messages,
        count: staticMemories.length,
        updatedAt: Date.now()
      });
    }
    
    if (messages.length === 0) {
      return NextResponse.json({
        memories: [],
        messages: [],
        count: 0,
        message: 'No L0 data found',
        updatedAt: Date.now()
      });
    }
    
    // 按会话分组
    const sessionGroups = new Map<string, L0Message[]>();
    for (const msg of messages) {
      const sessionId = msg.sessionId || 'unknown';
      if (!sessionGroups.has(sessionId)) sessionGroups.set(sessionId, []);
      sessionGroups.get(sessionId)!.push(msg);
    }
    
    const l0Memories: L0Memory[] = Array.from(sessionGroups.entries())
      .map(([sessionId, sessionMessages]) => {
        const userMessages = sessionMessages.filter(m => m.role === 'user');
        const firstMessage = userMessages[0]?.content || '会话开始';
        
        return {
          id: `l0-${sessionId}`,
          type: 'L0' as const,
          title: `会话 ${sessionId.slice(0, 8)}`,
          content: firstMessage,
          sessionId,
          timestamp: sessionMessages[sessionMessages.length - 1]?.ts || Date.now(),
          messageCount: sessionMessages.length,
          preview: firstMessage.length > 100 ? firstMessage.substring(0, 100) + '...' : firstMessage,
          channel: 'webchat',
          userName: '用户'
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    return NextResponse.json({
      memories: l0Memories,
      messages,
      count: l0Memories.length,
      totalMessages: messages.length,
      updatedAt: Date.now()
    });
    
  } catch (error) {
    console.error('Failed to fetch L0 memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch L0 data', memories: [], messages: [] },
      { status: 500 }
    );
  }
}
