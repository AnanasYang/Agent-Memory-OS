/**
 * Phase 3 功能测试脚本
 * 测试文件监听和健康状态 API
 */

import { getHealthStatus, getMemoryLayerStats, getCandidateCounts, getDreamStatus } from '../lib/file-watcher.ts';

async function runTests() {
  console.log('🧪 Testing Phase 3 Real-time Monitoring Features\n');

  // Test 1: 获取内存层统计
  console.log('Test 1: Memory Layer Stats');
  console.log('--------------------------');
  try {
    const stats = await getMemoryLayerStats();
    console.log('✅ Success');
    console.log('  L0:', stats.L0);
    console.log('  L1:', stats.L1);
    console.log('  L2:', stats.L2);
    console.log('  L3:', stats.L3);
    console.log('  L4:', stats.L4);
    console.log('  Total:', stats.total);
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test 2: 获取候选池数量
  console.log('Test 2: Candidate Counts');
  console.log('--------------------------');
  try {
    const candidates = await getCandidateCounts();
    console.log('✅ Success');
    console.log('  L2 Candidates:', candidates.l2);
    console.log('  L3 Candidates:', candidates.l3);
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test 3: 获取 Dream 状态
  console.log('Test 3: Dream Status');
  console.log('--------------------------');
  try {
    const dreams = await getDreamStatus();
    console.log('✅ Success');
    console.log('  Daily Dream:');
    console.log('    - Last Run:', dreams.daily.lastRun || 'Never');
    console.log('    - Status:', dreams.daily.status);
    console.log('    - Next:', dreams.daily.nextScheduled);
    console.log('  Weekly Dream:');
    console.log('    - Last Run:', dreams.weekly.lastRun || 'Never');
    console.log('    - Status:', dreams.weekly.status);
    console.log('    - Next:', dreams.weekly.nextScheduled);
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test 4: 获取完整健康状态
  console.log('Test 4: Full Health Status');
  console.log('--------------------------');
  try {
    const health = await getHealthStatus();
    console.log('✅ Success');
    console.log('  Warnings:', health.warnings.length > 0 ? health.warnings : 'None');
    console.log('  Timestamp:', new Date(health.timestamp).toISOString());
    console.log('');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  console.log('✨ All tests completed!');
}

runTests().catch(console.error);
