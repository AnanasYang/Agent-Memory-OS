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
            {(['L4', 'L3', 'L2', 'L1', 'L0'] as const).map(level => (
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
                <span className={cn("w-2 h-2 rounded-full", levelColors[level])} />
                {level}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('heatmap')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1",
              viewMode === 'heatmap'
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            热力图
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1",
              viewMode === 'list'
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <Layers className="w-4 h-4" />
            列表
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/memory" className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">总活动</span>
          </div>
          <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">过去52周</p>
        </Link>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Brain className="w-4 h-4" />
            <span className="text-xs">活跃天数</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeDays}</p>
          <p className="text-xs text-muted-foreground mt-1">有活动的天数</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">峰值活动</span>
          </div>
          <p className="text-2xl font-bold">{stats.maxDaily}</p>
          <p className="text-xs text-muted-foreground mt-1">单日最高</p>
        </div>
        
        <Link href="/insights" className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-xs">L4核心记忆</span>
          </div>
          <p className="text-2xl font-bold text-violet-400">{stats.byLevel.L4}</p>
          <p className="text-xs text-muted-foreground mt-1">查看详情 →</p>
        </Link>
      </div>

      {/* Heatmap View */}
      {viewMode === 'heatmap' && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-4">活动热力图</h3>
          
          {/* Month labels - properly aligned */}
          <div className="flex mb-2">
            <div className="w-10" /> {/* Spacer for day labels */}
            <div className="flex-1 flex relative h-5">
              {monthLabels.map((m, i) => (
                <span 
                  key={i} 
                  className="text-xs text-muted-foreground absolute"
                  style={{ left: `${(m.weekIndex / weeks.length) * 100}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
          
          {/* Heatmap grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="w-10 flex flex-col justify-around text-xs text-muted-foreground mr-2 h-[84px]">
              <span>一</span>
              <span>三</span>
              <span>五</span>
            </div>
            
            {/* Activity grid */}
            <div className="flex-1 flex gap-1 overflow-x-auto pb-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const activity = week.activities[dayIndex];
                    if (!activity) return <div key={dayIndex} className="w-3 h-3" />;
                    
                    return (
                      <Link
                        key={dayIndex}
                        href={`/memory?date=${activity.date}`}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: weekIndex * 0.01 + dayIndex * 0.005 }}
                          className={cn(
                            "w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-offset-1 hover:ring-offset-background cursor-pointer",
                            levelColors[activity.level],
                            getIntensity(activity.count)
                          )}
                          title={`${activity.date}: ${activity.count} 活动 · ${levelNames[activity.level]}`}
                        />
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>少</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <div className="w-3 h-3 bg-primary/30 rounded-sm" />
              <div className="w-3 h-3 bg-primary/50 rounded-sm" />
              <div className="w-3 h-3 bg-primary/75 rounded-sm" />
              <div className="w-3 h-3 bg-primary rounded-sm" />
            </div>
            <span>多</span>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">活动列表</h3>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {[...filteredActivities]
              .filter(a => a.count > 0)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 50)
              .map((activity, index) => (
                <Link
                  key={activity.date}
                  href={`/memory?date=${activity.date}`}
                  className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", levelColors[activity.level])} />
                  <span className="text-sm w-24">{activity.date}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${(activity.count / maxCount) * 200}px` }}
                      />
                      <span className="text-sm text-muted-foreground">{activity.count}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{levelNames[activity.level]}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Level Breakdown */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">按记忆层级分布</h3>
        <div className="space-y-3">
          {(['L4', 'L3', 'L2', 'L1'] as const).map(level => {
            const count = stats.byLevel[level];
            const total = stats.total || 1;
            const percentage = (count / total) * 100;
            
            return (
              <Link 
                key={level} 
                href={`/memory?level=${level}`}
                className="flex items-center gap-4 group hover:bg-muted/50 p-2 rounded-lg transition-colors"
              >
                <div className="w-12 text-sm font-medium">{level}</div>
                <div className="flex-1">
                  <div className="bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={cn("h-2 rounded-full", levelColors[level])}
                    />
                  </div>
                </div>
                <div className="w-24 text-right text-sm text-muted-foreground group-hover:text-foreground">
                  {count.toLocaleString()} ({percentage.toFixed(1)}%)
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Growth Trend */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">记忆增长趋势</h3>
        <div className="h-32 flex items-end gap-1">
          {weeks.slice(-12).map((week, i) => {
            const total = week.activities.reduce((s, a) => s + a.count, 0);
            const maxWeekly = Math.max(...weeks.slice(-12).map(w => 
              w.activities.reduce((s, a) => s + a.count, 0)
            ), 1);
            
            return (
              <div 
                key={i} 
                className="flex-1 flex flex-col justify-end group cursor-pointer"
              >
                <div 
                  className="w-full bg-primary/60 rounded-t transition-all group-hover:bg-primary"
                  style={{ height: `${(total / maxWeekly) * 100}%` }}
                  title={`${week.weekStart}: ${total} 活动`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>12周前</span>
          <span>本周</span>
        </div>
      </div>
    </div>
  );
}
