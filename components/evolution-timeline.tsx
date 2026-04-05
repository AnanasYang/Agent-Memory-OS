'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { activityData } from '@/lib/data';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  TrendingUp, 
  Brain, 
  Filter,
  BarChart3,
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const levelColors = {
  L0: 'bg-blue-500',
  L1: 'bg-cyan-400',
  L2: 'bg-amber-400',
  L3: 'bg-pink-400',
  L4: 'bg-violet-400',
};

const levelNames = {
  L0: '工作记忆',
  L1: '情景记忆',
  L2: '程序记忆',
  L3: '语义记忆',
  L4: '核心记忆',
};

export function EvolutionTimeline({ className }: { className?: string }) {
  const [selectedLevel, setSelectedLevel] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'heatmap' | 'list'>('heatmap');

  const filteredActivities = useMemo(() => {
    if (selectedLevel === 'all') return activityData;
    return activityData.filter(a => a.level === selectedLevel);
  }, [selectedLevel]);

  const { weeks, monthLabels, maxCount } = useMemo(() => {
    const sortedActivities = [...filteredActivities].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group by week (starting from Monday)
    const weeks: Array<{ 
      weekStart: string; 
      weekNumber: number;
      activities: typeof activityData;
      month: number;
    }> = [];
    
    let currentWeek: typeof activityData = [];
    let currentWeekStart = '';
    let weekCounter = 0;
    
    sortedActivities.forEach((activity, i) => {
      const date = new Date(activity.date);
      const dayOfWeek = date.getDay();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      if (currentWeekStart !== weekStartStr && currentWeek.length > 0) {
        weeks.push({
          weekStart: currentWeekStart,
          weekNumber: weekCounter++,
          activities: [...currentWeek],
          month: new Date(currentWeekStart).getMonth()
        });
        currentWeek = [];
      }
      
      if (currentWeek.length === 0) {
        currentWeekStart = weekStartStr;
      }
      
      currentWeek.push(activity);
      
      if (currentWeek.length === 7 || i === sortedActivities.length - 1) {
        weeks.push({
          weekStart: currentWeekStart,
          weekNumber: weekCounter++,
          activities: [...currentWeek],
          month: new Date(currentWeekStart).getMonth()
        });
        currentWeek = [];
      }
    });
    
    // Generate month labels aligned with weeks
    const monthLabels: Array<{ label: string; weekIndex: number }> = [];
    let currentMonth = -1;
    
    weeks.forEach((week, index) => {
      const month = new Date(week.weekStart).getMonth();
      if (month !== currentMonth) {
        currentMonth = month;
        monthLabels.push({
          label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month],
          weekIndex: index
        });
      }
    });
    
    const maxCount = Math.max(...filteredActivities.map(a => a.count), 1);
    return { weeks: weeks.slice(-52), monthLabels, maxCount };
  }, [filteredActivities]);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count <= maxCount * 0.25) return 'opacity-30';
    if (count <= maxCount * 0.5) return 'opacity-50';
    if (count <= maxCount * 0.75) return 'opacity-75';
    return 'opacity-100';
  };

  const stats = useMemo(() => ({
    total: filteredActivities.reduce((sum, a) => sum + a.count, 0),
    activeDays: filteredActivities.filter(a => a.count > 0).length,
    maxDaily: maxCount,
    byLevel: {
      L1: filteredActivities.filter(a => a.level === 'L1').reduce((s, a) => s + a.count, 0),
      L2: filteredActivities.filter(a => a.level === 'L2').reduce((s, a) => s + a.count, 0),
      L3: filteredActivities.filter(a => a.level === 'L3').reduce((s, a) => s + a.count, 0),
      L4: filteredActivities.filter(a => a.level === 'L4').reduce((s, a) => s + a.count, 0),
    }
  }), [filteredActivities, maxCount]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">层级筛选:</span>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setSelectedLevel('all')}
              className={cn(
                "px-3 py-1 text-xs rounded-full transition-colors",
                selectedLevel === 'all'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              全部
            </button>
            {Object.entries(levelNames).map(([level, name]) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={cn(
                  "px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1",
                  selectedLevel === level
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", levelColors[level as keyof typeof levelColors])} />
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('heatmap')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'heatmap' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
            title="热力图视图"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'list' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
            title="列表视图"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">总计</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">活跃天数</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeDays}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Brain className="w-4 h-4" />
            <span className="text-xs">单日最高</span>
          </div>
          <p className="text-2xl font-bold">{stats.maxDaily}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-xs">层级分布</span>
          </div>
          <div className="flex gap-1">
            {Object.entries(stats.byLevel).map(([level, count]) => (
              count > 0 && (
                <span key={level} className={cn("text-xs px-2 py-0.5 rounded text-white", levelColors[level as keyof typeof levelColors])}>
                  {level}: {count}
                </span>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap View */}
      {viewMode === 'heatmap' && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium mb-4">活动热力图 (近52周)</h3>
          
          {/* Month Labels */}
          <div className="flex mb-2">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground"
                style={{ marginLeft: i === 0 ? `${label.weekIndex * 12}px` : `${(label.weekIndex - monthLabels[i-1].weekIndex) * 12 - 20}px` }}
              >
                {label.label}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.activities.map((activity, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: weekIndex * 0.01 + dayIndex * 0.005 }}
                    className={cn(
                      "w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary",
                      levelColors[activity.level as keyof typeof levelColors] || 'bg-gray-300',
                      getIntensity(activity.count)
                    )}
                    title={`${activity.date}: ${activity.count} activities (${activity.level})`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>少</span>
            <div className="flex gap-1">
              {[0.25, 0.5, 0.75, 1].map((opacity) => (
                <div
                  key={opacity}
                  className="w-3 h-3 rounded-sm bg-primary"
                  style={{ opacity }}
                />
              ))}
            </div>
            <span>多</span>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">活动记录</h3>
          </div>
          <div className="divide-y">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={`${activity.date}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", levelColors[activity.level as keyof typeof levelColors])} />
                  <div>
                    <p className="text-sm font-medium">{activity.date}</p>
                    <p className="text-xs text-muted-foreground">{levelNames[activity.level as keyof typeof levelNames]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{activity.count}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          href="/memory"
          className="flex-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg p-4 transition-colors"
        >
          <div className="flex items-center gap-2 text-primary mb-1">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">查看记忆图谱</span>
          </div>
          <p className="text-xs text-muted-foreground">探索所有记忆节点的关联关系</p>
        </Link>
        <Link
          href="/intent"
          className="flex-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg p-4 transition-colors"
        >
          <div className="flex items-center gap-2 text-primary mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">管理意图</span>
          </div>
          <p className="text-xs text-muted-foreground">设置和追踪你的目标与意图</p>
        </Link>
      </div>
    </div>
  );
}
