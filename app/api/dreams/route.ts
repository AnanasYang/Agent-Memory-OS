import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const DREAMS_DIR = '/home/bruce/.openclaw/workspace/agent-memory-os/memory/dreams';
const DAILY_DIR = join(DREAMS_DIR, 'daily');

interface DreamSummary {
  id: string;
  date: string;
  timestamp: number;
  summary: string;
  sessionCount: number;
  l1Count: number;
  status: 'success' | 'error' | 'running';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '30');
    
    if (date) {
      return getDreamDetail(date);
    }
    
    return getDreamList(limit);
    
  } catch (error) {
    console.error('Failed to fetch dreams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dreams', dreams: [] },
      { status: 500 }
    );
  }
}

function getDreamList(limit: number) {
  console.log('Reading dreams from:', DAILY_DIR);
  
  if (!existsSync(DAILY_DIR)) {
    console.log('Dreams directory does not exist');
    return NextResponse.json({ dreams: [], count: 0 });
  }
  
  const files = readdirSync(DAILY_DIR)
    .filter(f => f.endsWith('-dream.json'))
    .sort()
    .reverse()
    .slice(0, limit);
  
  console.log('Found dream files:', files.length);
  
  const dreams: DreamSummary[] = files.map(filename => {
    try {
      const filepath = join(DAILY_DIR, filename);
      const content = readFileSync(filepath, 'utf-8');
      const data = JSON.parse(content);
      
      return {
        id: data.id || filename.replace('-dream.json', ''),
        date: data.date,
        timestamp: data.timestamp,
        summary: data.insights?.summary || data.summary || '无摘要',
        sessionCount: data.sessions || data.dataSource?.uniqueSessions || 0,
        l1Count: data.l1Memories?.length || 0,
        status: 'success'
      };
    } catch (e) {
      const dateStr = filename.replace('-dream.json', '');
      return {
        id: filename.replace('-dream.json', ''),
        date: dateStr,
        timestamp: 0,
        summary: '解析失败',
        sessionCount: 0,
        l1Count: 0,
        status: 'error'
      };
    }
  });
  
  return NextResponse.json({
    dreams,
    count: dreams.length,
    lastUpdated: Date.now()
  });
}

function getDreamDetail(date: string) {
  const jsonPath = join(DAILY_DIR, `${date}-dream.json`);
  const mdPath = join(DAILY_DIR, `${date}-dream.md`);
  
  if (!existsSync(jsonPath)) {
    return NextResponse.json(
      { error: 'Dream not found', date },
      { status: 404 }
    );
  }
  
  try {
    const content = readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(content);
    
    let markdown = null;
    if (existsSync(mdPath)) {
      markdown = readFileSync(mdPath, 'utf-8');
    }
    
    return NextResponse.json({ ...data, markdown });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to parse dream data', date },
      { status: 500 }
    );
  }
}