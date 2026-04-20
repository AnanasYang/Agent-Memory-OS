import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 读取预生成的静态数据（支持本地文件系统回退）
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

export async function GET() {
  try {
    const data = readStaticData('unified-data');
    
    if (data) {
      return NextResponse.json({
        memoryNodes: data.memoryNodes || [],
        dreams: data.dreams || [],
        weeklyReviews: data.weeklyReviews || [],
        status: data.status || {},
        activities: data.activities || [],
        intents: data.intents || [],
        timestamp: new Date().toISOString()
      });
    }
    
    // 如果静态数据不存在，返回空数据
    return NextResponse.json({
      memoryNodes: [],
      dreams: [],
      weeklyReviews: [],
      status: {
        activeTasks: 0,
        memoryNodes: 0,
        activeIntents: 0,
        lastSync: new Date().toISOString(),
        lastGithubSync: 'Unknown',
        systemLoad: 0,
        weeklyReviews: 0,
        dailyDreams: 0
      },
      activities: [],
      intents: [],
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
