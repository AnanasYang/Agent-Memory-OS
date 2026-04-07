import { NextResponse } from 'next/server';
import { getMemoryNodes } from '@/lib/unified-data';

export async function GET() {
  try {
    const memoryNodes = await getMemoryNodes();
    
    return NextResponse.json({
      memories: memoryNodes,
      count: memoryNodes.length,
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
