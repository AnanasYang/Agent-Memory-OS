'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/particle-bg';
import { NavBar } from '@/components/nav-bar';
import { getLevelColor } from '@/lib/colors';
import { Moon, Calendar, ChevronDown, ChevronUp, Brain, MessageSquare, Target, Sparkles } from 'lucide-react';

interface Dream {
  id: string;
  date: string;
  timestamp: number;
  summary: string;
  sessionCount: number;
  l1Count: number;
  l2Candidates: number;
  actions: Array<{ text: string; completed: boolean }>;
  status: string;
}

export default function DreamArchivePage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    fetch('/api/dreams')
      .then(r => r.json())
      .then(d => setDreams(d.dreams || []));
  }, []);

  const groupedDreams = useMemo(() => {
    const groups: Record<string, Dream[]> = {};
    dreams.forEach(dream => {
      const date = new Date(dream.timestamp);
      let key: string;
      if (filter === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else if (filter === 'month') {
        key = date.toISOString().slice(0, 7);
      } else {
        key = 'all';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(dream);
    });
    return groups;
  }, [dreams, filter]);

  const stats = useMemo(() => ({
    total: dreams.length,
    l1Total: dreams.reduce((s, d) => s + d.l1Count, 0),
    l2Total: dreams.reduce((s, d) => s + d.l2Candidates, 0),
    actionTotal: dreams.reduce((s, d) => s + d.actions.length, 0),
  }), [dreams]);

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <NavBar />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Moon className="w-6 h-6 text-purple-400" />
            梦境档案
          </h1>
          <p className="text-sm text-slate-400">
            {stats.total} 条回顾 · {stats.l1Total} L1记忆 · {stats.l2Total} L2候选 · {stats.actionTotal} 行动项
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: '总回顾', value: stats.total, icon: Moon, color: '#A855F7' },
            { label: 'L1记忆', value: stats.l1Total, icon: Brain, color: '#06B6D4' },
            { label: 'L2候选', value: stats.l2Total, icon: Sparkles, color: '#F59E0B' },
            { label: '行动项', value: stats.actionTotal, icon: Target, color: '#3B82F6' },
          ].map((s) => (
            <div key={s.label} className="glow-card p-3 text-center" style={{ borderColor: s.color + '20' }}>
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-slate-400">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'week', label: '按周' },
            { key: 'month', label: '按月' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-cyan-500/30 to-transparent" />

          <div className="space-y-4">
            {Object.entries(groupedDreams)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([groupKey, groupDreams], gi) => (
                <div key={groupKey}>
                  {filter !== 'all' && (
                    <div className="flex items-center gap-2 mb-3 ml-10">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span className="text-xs font-medium text-slate-400">
                        {filter === 'week' ? `第${groupKey}周` : `${groupKey}月`}
                      </span>
                      <div className="flex-1 h-px bg-white/5" />
                    </div>
                  )}

                  {groupDreams.map((dream, di) => {
                    const isExpanded = expandedId === dream.id;
                    const dateObj = new Date(dream.timestamp);

                    return (
                      <motion.div
                        key={dream.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (gi + di) * 0.05 }}
                        className="relative pl-10 mb-3"
                      >
                        {/* Timeline Dot */}
                        <div
                          className="absolute left-2 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: '#A855F7',
                            background: 'rgba(168, 85, 247, 0.2)',
                            boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                          }}
                        >
                          <Moon className="w-2.5 h-2.5 text-purple-400" />
                        </div>

                        {/* Card */}
                        <div
                          className="glow-card p-4 cursor-pointer transition-all"
                          style={{
                            borderColor: isExpanded ? 'rgba(168, 85, 247, 0.3)' : undefined,
                            boxShadow: isExpanded ? '0 0 30px rgba(168, 85, 247, 0.1)' : undefined,
                          }}
                          onClick={() => setExpandedId(isExpanded ? null : dream.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-400">
                                  {dateObj.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-xs text-slate-600">
                                  {dateObj.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <h3 className="text-sm font-medium text-white mb-2 line-clamp-1">
                                {dream.date}
                              </h3>

                              <p className="text-xs text-slate-400 line-clamp-2">
                                {dream.summary.substring(0, 200).replace(/#/g, '').trim()}...
                              </p>

                              <div className="flex items-center gap-3 mt-3">
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <MessageSquare className="w-3 h-3" />
                                  {dream.sessionCount} 会话
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Brain className="w-3 h-3" />
                                  {dream.l1Count} L1
                                </span>
                                {dream.l2Candidates > 0 && (
                                  <span className="flex items-center gap-1 text-[10px] text-amber-400">
                                    <Sparkles className="w-3 h-3" />
                                    {dream.l2Candidates} L2候选
                                  </span>
                                )}
                              </div>
                            </div>

                            <button className="p-1 hover:bg-white/10 rounded transition-colors ml-2">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-white/5 overflow-hidden"
                              >
                                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto pr-2">
                                  {dream.summary}
                                </div>

                                {dream.actions.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-white/5">
                                    <h4 className="text-xs font-medium text-slate-400 mb-2">行动项</h4>
                                    <div className="space-y-1.5">
                                      {dream.actions.map((action, ai) => (
                                        <div
                                          key={ai}
                                          className={`flex items-center gap-2 text-xs p-2 rounded ${
                                            action.completed ? 'bg-green-500/10' : 'bg-white/5'
                                          }`}
                                        >
                                          <div
                                            className={`w-3 h-3 rounded-sm border ${
                                              action.completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-slate-500'
                                            }`}
                                          />
                                          <span className={action.completed ? 'text-green-400 line-through' : 'text-slate-300'}>
                                            {action.text}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
