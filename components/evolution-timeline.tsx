'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activityData } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, Brain } from 'lucide-react';

const levelColors = {
  L0: 'bg-blue-500',
  L1: 'bg-cyan-400',
  L2: 'bg-amber-400',
  L3: 'bg-pink-400',
  L4: 'bg-violet-400',
};

export function EvolutionTimeline({ className }: { className?: string }) {
  const { weeks, maxCount } = useMemo(() => {
    const weeks: Array<{ date: string; activities: typeof activityData }> = [];
    const sortedActivities = [...activityData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group by week
    let currentWeek: typeof activityData = [];
    sortedActivities.forEach((activity, i) => {
      currentWeek.push(activity);
      if (currentWeek.length === 7 || i === sortedActivities.length - 1) {
        weeks.push({
          date: currentWeek[0].date,
          activities: [...currentWeek]
        });
        currentWeek = [];
      }
    });
    
    const maxCount = Math.max(...activityData.map(a => a.count), 1);
    return { weeks: weeks.slice(-52), maxCount };
  }, []);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count <= maxCount * 0.25) return 'opacity-30';
    if (count <= maxCount * 0.5) return 'opacity-50';
    if (count <= maxCount * 0.75) return 'opacity-75';
    return 'opacity-100';
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Total Activity</span>
          </div>
          <p className="text-2xl font-bold">
            {activityData.reduce((sum, a) => sum + a.count, 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Past year</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Brain className="w-4 h-4" />
            <span className="text-xs">Active Days</span>
          </div>
          <p className="text-2xl font-bold">
            {activityData.filter(a => a.count > 0).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Days with activity</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Peak Activity</span>
          </div>
          <p className="text-2xl font-bold">{maxCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Max daily count</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Activity Timeline</h3>
        
        {/* Month labels */}
        <div className="flex mb-2">
          <div className="w-8" /> {/* Spacer for day labels */}
          <div className="flex-1 flex justify-between text-xs text-muted-foreground">
            {monthLabels.map(month => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
        
        {/* Heatmap grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="w-8 flex flex-col justify-around text-xs text-muted-foreground mr-2">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          
          {/* Activity grid */}
          <div className="flex-1 flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const activity = week.activities[dayIndex];
                  if (!activity) return <div key={dayIndex} className="w-3 h-3" />;
                  
                  return (
                    <motion.div
                      key={dayIndex}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: weekIndex * 0.01 + dayIndex * 0.005 }}
                      className={cn(
                        "w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-offset-1 hover:ring-offset-background",
                        levelColors[activity.level],
                        getIntensity(activity.count)
                      )}
                      title={`${activity.date}: ${activity.count} activities`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-muted rounded-sm" />
            <div className="w-3 h-3 bg-primary/30 rounded-sm" />
            <div className="w-3 h-3 bg-primary/50 rounded-sm" />
            <div className="w-3 h-3 bg-primary/75 rounded-sm" />
            <div className="w-3 h-3 bg-primary rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Level Breakdown */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Activity by Memory Level</h3>
        <div className="space-y-3">
          {(['L4', 'L3', 'L2', 'L1'] as const).map(level => {
            const levelActivities = activityData.filter(a => a.level === level);
            const totalCount = levelActivities.reduce((sum, a) => sum + a.count, 0);
            const percentage = (totalCount / activityData.reduce((sum, a) => sum + a.count, 1)) * 100;
            
            return (
              <div key={level} className="flex items-center gap-4">
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
                <div className="w-20 text-right text-sm text-muted-foreground">
                  {totalCount.toLocaleString()} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
