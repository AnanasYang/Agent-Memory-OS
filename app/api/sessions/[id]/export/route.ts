import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// Parse transcript file to extract full conversation
function parseTranscriptFull(path: string): { messages: SessionMessage[]; summary: string } {
  try {
    const content = readFileSync(path, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    
    const messages: SessionMessage[] = [];
    let firstUserMessage = '';
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.role && entry.content) {
          messages.push({
            role: entry.role,
            content: entry.content,
            timestamp: entry.timestamp
          });
          
          if (entry.role === 'user' && !firstUserMessage) {
            firstUserMessage = entry.content.substring(0, 200);
          }
        }
      } catch {
        // Skip invalid lines
      }
    }
    
    const summary = firstUserMessage.length > 100 
      ? firstUserMessage.substring(0, 100) + '...' 
      : firstUserMessage || '会话开始';
    
    return { messages, summary };
  } catch (error) {
    console.error('Failed to parse transcript:', error);
    return { messages: [], summary: '无法读取会话内容' };
  }
}

// Get session detail from OpenClaw
function getSessionDetail(sessionId: string): { transcriptPath?: string; displayName: string; channel: string } | null {
  try {
    const sessionsJson = execSync('openclaw sessions list --json 2>/dev/null || echo "[]"', {
      encoding: 'utf-8',
      timeout: 5000
    });
    
    const sessions = JSON.parse(sessionsJson);
    const session = sessions.find((s: any) => s.sessionId === sessionId);
    
    if (!session) {
      return null;
    }
    
    return {
      transcriptPath: session.transcriptPath,
      displayName: session.displayName || '未知用户',
      channel: session.channel || 'unknown'
    };
  } catch (error) {
    console.error('Failed to get session detail:', error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Get session metadata
    const sessionInfo = getSessionDetail(sessionId);
    
    if (!sessionInfo) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Parse transcript if available
    let messages: SessionMessage[] = [];
    let summary = '新会话';
    
    if (sessionInfo.transcriptPath) {
      const parsed = parseTranscriptFull(sessionInfo.transcriptPath);
      messages = parsed.messages;
      summary = parsed.summary;
    }
    
    return NextResponse.json({
      sessionId,
      displayName: sessionInfo.displayName,
      channel: sessionInfo.channel,
      messageCount: messages.length,
      summary,
      messages,
      exportedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to export session:', error);
    return NextResponse.json(
      { error: 'Failed to export session', messages: [] },
      { status: 500 }
    );
  }
}