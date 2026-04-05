import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SYNCED_DATA_PATH = '/home/bruce/.openclaw/workspace/agent-memory-os/memory/synced/memories.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    
    // 读取同步后的数据
    if (!existsSync(SYNCED_DATA_PATH)) {
      return NextResponse.json(
        { error: 'Memory data not synced yet', memories: [] },
        { status: 404 }
      );
    }
    
    const content = readFileSync(SYNCED_DATA_PATH, 'utf-8');
    const data = JSON.parse(content);
    let memories = data.memories || [];
    
    // 应用过滤器
    if (level && level !== 'all') {
      memories = memories.filter((m: any) => m.level === level);
    }
    
    if (category && category !== 'all') {
      memories = memories.filter((m: any) => m.category === category);
    }
    
    return NextResponse.json({
      memories,
      count: memories.length,
      total: data.memories?.length || 0,
      syncedAt: data.metadata?.syncedAt,
      stats: data.metadata?.stats
    });
    
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories', memories: [] },
      { status: 500 }
    );
  }
}
