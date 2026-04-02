/**
 * Health Status API
 * GET /api/health/status
 * 返回系统健康状态和内存统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHealthStatus, getMemoryLayerStats, getCandidateCounts, getDreamStatus } from '@/lib/file-watcher';

export async function GET(request: NextRequest) {
  try {
    // 支持查询特定部分
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    // 获取完整健康状态
    const healthStatus = await getHealthStatus();

    // 根据 section 参数返回部分数据
    switch (section) {
      case 'layers':
        const layers = await getMemoryLayerStats();
        return NextResponse.json({ 
          success: true, 
          data: layers 
        });

      case 'candidates':
        const candidates = await getCandidateCounts();
        return NextResponse.json({ 
          success: true, 
          data: candidates 
        });

      case 'dreams':
        const dreams = await getDreamStatus();
        return NextResponse.json({ 
          success: true, 
          data: dreams 
        });

      default:
        // 返回完整状态
        return NextResponse.json({ 
          success: true, 
          data: healthStatus 
        });
    }

  } catch (error) {
    console.error('[Health API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get health status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 支持 POST 请求用于刷新特定数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'refresh':
        const healthStatus = await getHealthStatus();
        return NextResponse.json({ 
          success: true, 
          data: healthStatus,
          message: 'Health status refreshed'
        });

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unknown action',
            supportedActions: ['refresh']
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('[Health API] POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 跨域配置
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
