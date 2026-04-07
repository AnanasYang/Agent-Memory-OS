import { NextResponse } from 'next/server';
import { getDreams, getWeeklyReviews } from '@/lib/unified-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type') || 'daily'; // 'daily' | 'weekly'
    const limit = parseInt(searchParams.get('limit') || '30');
    
    if (type === 'weekly') {
      const reviews = await getWeeklyReviews();
      
      if (date) {
        const review = reviews.find(r => r.date === date || r.week === date);
        if (!review) {
          return NextResponse.json(
            { error: 'Review not found', date },
            { status: 404 }
          );
        }
        return NextResponse.json(review);
      }
      
      return NextResponse.json({
        reviews: reviews.slice(0, limit),
        count: reviews.length,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Daily dreams
    const dreams = await getDreams(limit);
    
    if (date) {
      const dream = dreams.find(d => d.date === date);
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
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to fetch dreams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dreams', dreams: [] },
      { status: 500 }
    );
  }
}
