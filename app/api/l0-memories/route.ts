import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync } from 'fs';
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

const L0_DIR = '/home/bruce/.openclaw/workspace/ai-memory-system/Memory/L0-state';

// 从 L0-state 目录读取今日数据
function readL0FromFile(): L0Message[] {
  const today = new Date().toISOString().split('T')[0];
  const l0File = join(L0_DIR, `daily-${today}.jsonl`);
  
  if (!existsSync(l0File)) {
    console.log('L0 file not found:', l0File);
    return [];
  }
  
  try {
    const content = readFileSync(l0File, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const messages: L0Message[] = [];
    for (const line of lines) {
      try {
        const msg = JSON.parse(line);
        if (msg.ts && msg.role) {
          messages.push(msg);
        }
      } catch {
        // Skip invalid lines
      }
    }
    
    return messages;
  } catch (error) {
    console.error('Failed to read L0 file:', error);
    return [];
  }
}

// 按会话分组消息
function groupBySession(messages: L0Message[]): Map<string, L0Message[]> {
  const groups = new Map<string, L0Message[]>();
  
  for (const msg of messages) {
    const sessionId = msg.sessionId || 'unknown';
    if (!groups.has(sessionId)) {
      groups.set(sessionId, []);
    }
    groups.get(sessionId)!.push(msg);
  }
  
  return groups;
}

export async function GET(request: Request) {
  try {
    // 从 L0-state 文件读取
    const messages = readL0FromFile();
    
    if (messages.length === 0) {
      return NextResponse.json({
        memories: [],
        count: 0,
        message: 'No L0 data found for today',
        updatedAt: Date.now()
      });
    }
    
    // 按会话分组
    const sessionGroups = groupBySession(messages);
    
    // 转换为 L0 memories
    const l0Memories: L0Memory[] = Array.from(sessionGroups.entries())
      .map(([sessionId, sessionMessages]) => {
        const userMessages = sessionMessages.filter(m => m.role === 'user');
        const firstMessage = userMessages[0]?.content || '会话开始';
        const lastMessage = sessionMessages[sessionMessages.length - 1];
        
        return {
          id: `l0-${sessionId}`,
          type: 'L0' as const,
          title: `会话 ${sessionId.slice(0, 8)}`,
          content: firstMessage,
          sessionId,
          timestamp: lastMessage?.ts || Date.now(),
          messageCount: sessionMessages.length,
          preview: firstMessage.length > 100 
            ? firstMessage.substring(0, 100) + '...' 
            : firstMessage,
          channel: 'webchat',
          userName: '用户'
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    return NextResponse.json({
      memories: l0Memories,
      count: l0Memories.length,
      totalMessages: messages.length,
      updatedAt: Date.now()
    });
    
  } catch (error) {
    console.error('Failed to fetch L0 memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch L0 data', memories: [] },
      { status: 500 }
    );
  }
}
