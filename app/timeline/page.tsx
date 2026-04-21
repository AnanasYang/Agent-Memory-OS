'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/particle-bg';
import { NavBar } from '@/components/nav-bar';
import { getLevelColor } from '@/lib/colors';
import { Calendar, Filter, Droplets } from 'lucide-react';

interface Activity {
  date: string;
  count: number;
  level: string;
}

export default function MemoryRiverPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filterLevel, setFilterLevel] = useState<string | 'all'>('all');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/unified-data')
      .then(r => r.json())
      .then(d => setActivities(d.activities || []));
  }, []);

  const filtered = useMemo(() => {
    if (filterLevel === 'all') return activities;
    return activities.filter(a => a.level === filterLevel);
  }, [activities, filterLevel]);

  // 按日期分组聚合
  const dateGroups = useMemo(() => {
    const groups: Record<string, Record<string, number>> = {};
    filtered.forEach(a => {
      if (!groups[a.date]) groups[a.date] = {};
      groups[a.date][a.level] = (groups[a.date][a.level] || 0) + a.count;
    });
    return groups;
  }, [filtered]);

  const dates = useMemo(() => Object.keys(dateGroups).sort(), [dateGroups]);

  // 计算每天的总高度
  const maxDaily = useMemo(() => {
    let max = 1;
    dates.forEach(d => {
      const total = Object.values(dateGroups[d]).reduce((s, c) => s + c, 0);
      max = Math.max(max, total);
    });
    return max;
  }, [dates, dateGroups]);

  const levels = ['L4', 'L3', 'L2', 'L1'];

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <NavBar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-cyan-400" />
            记忆河流
          </h1>
          <p className="text-sm text-slate-400">
            {activities.length} 条活动记录 · 时间从左到右流动 · 不同颜色代表不同层级
          </p>
        </motion.div>

        {/* 层级筛选 */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterLevel === 'all' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            全部
          </button>
          {levels.map(l => {
            const color = getLevelColor(l);
            return (
              <button
                key={l}
                onClick={() => setFilterLevel(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterLevel === l
                    ? 'border'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={
                  filterLevel === l
                    ? { background: color.bg, color: color.glow, borderColor: color.main + '40' }
                    : {}
                }
              >
                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: color.main }} />
                {l}
              </button>
            );
          })}
        </div>

        {/* River Visualization */}
        <div className="glow-card p-6 overflow-x-auto">
          <div className="flex items-end gap-1" style={{ minWidth: Math.max(dates.length * 40, 600) }}>
            {dates.map((date, di) => {
              const dayData = dateGroups[date];
              const total = Object.values(dayData).reduce((s, c) => s + c, 0);
              const isHovered = hoveredDate === date;

              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: di * 0.03 }}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  style={{ width: 36 }}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {/* 水流柱 */}
                  <div className="flex flex-col-reverse gap-[2px] w-full">
                    {levels.map(level => {
                      const count = dayData[level] || 0;
                      if (count === 0) return null;
                      const color = getLevelColor(level);
                      const height = Math.max((count / maxDaily) * 200, 4);

                      return (
                        <motion.div
                          key={level}
                          className="w-full rounded-sm"
                          style={{
                            height,
                            background: `linear-gradient(to top, ${color.main}80, ${color.glow})`,
                            opacity: isHovered ? 1 : 0.8,
                            boxShadow: isHovered ? `0 0 12px ${color.glow}60` : 'none',
                          }}
                          whileHover={{ scaleX: 1.2 }}
                        />
                      );
                    })}
                  </div>

                  {/* 日期标签 */}
                  <div className="text-center mt-1">
                    <div
                      className="text-[9px] font-mono transition-colors"
                      style={{ color: isHovered ? '#fff' : '#475569' }}
                    >
                      {date.slice(5)}
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full mb-2 p-3 rounded-lg z-50"
                      style={{
                        background: 'rgba(15, 15, 25, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        minWidth: 160,
                      }}
                    >
                      <div className="text-xs font-medium text-white mb-2">{date}</div>
                      {Object.entries(dayData)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([level, count]) => {
                          const color = getLevelColor(level);
                          return (
                            <div key={level} className="flex items-center justify-between text-xs mb-1">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: color.main }} />
                                <span style={{ color: color.glow }}>{level}</span>
                              </span>
                              <span className="text-white">{count}</span>
                            </div>
                          );
                        })}
                      <div className="text-xs text-slate-500 mt-1 pt-1 border-t border-white/10">
                        总计: {total}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
            <span className="text-xs text-slate-500">图例:</span>
            {levels.map(l => {
              const color = getLevelColor(l);
              return (
                <span key={l} className="flex items-center gap-1 text-xs">
                  <span className="w-3 h-3 rounded-sm" style={{ background: color.main }} />
                  <span style={{ color: color.glow }}>{color.name}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {levels.map(l => {
            const color = getLevelColor(l);
            const count = activities.filter(a => a.level === l).reduce((s, a) => s + a.count, 0);
            return (
              <div key={l} className="glow-card p-4 text-center" style={{ borderColor: color.main + '20' }}>
                <div className="text-2xl font-bold" style={{ color: color.glow }}>{count}</div>
                <div className="text-xs text-slate-400">{color.name}</div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
