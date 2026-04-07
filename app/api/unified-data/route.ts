import { NextResponse } from 'next/server';
import { getMemoryNodes, getDreams, getWeeklyReviews, getSystemStatus, getActivityData, getIntents } from '@/lib/unified-data';

export async function GET() {
  try {
    const [memoryNodes, dreams, weeklyReviews, status, activities, intents] = await Promise.all([
      getMemoryNodes(),
      getDreams(30),
      getWeeklyReviews(),
      getSystemStatus(),
      getActivityData(),
      getIntents()
    ]);

    return NextResponse.json({
      memoryNodes,
      dreams,
      weeklyReviews,
      status,
      activities,
      intents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch unified data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
