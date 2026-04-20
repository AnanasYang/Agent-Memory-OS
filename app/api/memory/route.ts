import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const staticFile = join(process.cwd(), 'public', 'data', 'memory.json');
    
    if (existsSync(staticFile)) {
      const data = JSON.parse(readFileSync(staticFile, 'utf-8'));
      return NextResponse.json({
        memories: data.memories || [],
        count: data.count || 0,
        lastUpdated: data.lastUpdated || new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      memories: [],
      count: 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories', memories: [] },
      { status: 500 }
    );
  }
}
