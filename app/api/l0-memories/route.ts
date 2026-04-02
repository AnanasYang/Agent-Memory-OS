import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface OpenClawSession {
  key: string;
  sessionId: string;
  displayName: string;
  updatedAt: number;
  transcriptPath?: string;
  totalTokens: number;
  channel: string;
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

// Parse transcript file to extract conversation summary
function parseTranscript(path: string): { messageCount: number; summary: string } {
  try {
    const content = readFileSync(path, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    
    let userMessages: string[] = [];
    let assistantMessages: string[] = [];
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.role === 'user' && entry.content) {
          userMessages.push(entry.content.substring(0, 200));
        } else if (entry.role === 'assistant' && entry.content) {
          assistantMessages.push(entry.content.substring(0, 200));
        }
      } catch {
        // Skip invalid lines
      }
    }
    
    // Generate summary from first user message and key interactions
    const firstMessage = userMessages[0] || '会话开始';
    const summary = firstMessage.length > 100 
      ? firstMessage.substring(0, 100) + '...' 
      : firstMessage;
    
    return {
      messageCount: userMessages.length + assistantMessages.length,
      summary
    };
  } catch {
    return { messageCount: 0, summary: '无法读取会话内容' };
  }
}

export async function GET(request: Request) {
  try {
    // Fetch sessions from OpenClaw CLI
    const sessionsJson = execSync('openclaw sessions list --json 2>/dev/null || echo "[]"', {
      encoding: 'utf-8',
      timeout: 5000
    });
    
    const sessions: OpenClawSession[] = JSON.parse(sessionsJson);
    
    // Convert to L0 memories
    const l0Memories: L0Memory[] = sessions
      .filter(s => s.sessionId) // Only valid sessions
      .map(session => {
        const { messageCount, summary } = session.transcriptPath 
          ? parseTranscript(session.transcriptPath)
          : { messageCount: 0, summary: '新会话' };
        
        const date = new Date(session.updatedAt);
        
        return {
          id: `l0-${session.sessionId}`,
          type: 'L0' as const,
          title: `与 ${session.displayName || '用户'} 的会话`,
          content: summary,
          sessionId: session.sessionId,
          timestamp: session.updatedAt,
          messageCount,
          preview: summary,
          channel: session.channel,
          userName: session.displayName || '未知用户'
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp) // Newest first
      .slice(0, 10); // Keep only last 10 sessions
    
    return NextResponse.json({
      memories: l0Memories,
      count: l0Memories.length,
      updatedAt: Date.now()
    });
    
  } catch (error) {
    console.error('Failed to fetch L0 memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions', memories: [] },
      { status: 500 }
    );
  }
}
