import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function readStaticData(filename: string) {
  const staticFile = join(process.cwd(), 'public', 'data', `${filename}.json`);
  if (existsSync(staticFile)) {
    try {
      return JSON.parse(readFileSync(staticFile, 'utf-8'));
    } catch (e) {
      console.error(`[API] 读取静态文件失败 ${filename}:`, e);
    }
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type') || 'daily'; // 'daily' | 'weekly'
    const limit = parseInt(searchParams.get('limit') || '30');
    
    if (type === 'weekly') {
      const data = readStaticData('unified-data');
      const reviews = (data?.weeklyReviews || []).slice(0, limit);
      
      if (date) {
        const review = reviews.find((r: any) => r.date === date || r.week === date);
        if (!review) {
          return NextResponse.json(
            { error: 'Review not found', date },
            { status: 404 }
          );
        }
        return NextResponse.json(review);
      }
      
      return NextResponse.json({
        reviews,
        count: reviews.length,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Daily dreams
    const data = readStaticData('dreams');
    const dreams = (data?.dreams || []).slice(0, limit);
    
    if (date) {
      const dream = dreams.find((d: any) => d.date === date);
      if (!dream) {
        return NextResponse.json(
          { error: 'Dream not found', date },
          { status: 404 }
        );
      }
      return NextResponse.json(dream);
    }
    
    return NextResponse.json({
      dreams,
      count: dreams.length,
      lastUpdated: data?.lastUpdated || new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch dreams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dreams', dreams: [] },
      { status: 500 }
    );
  }
}
