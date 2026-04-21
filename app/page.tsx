'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NeuralCore } from '@/components/neural-core';
import { ParticleBackground } from '@/components/particle-bg';
import { NavBar } from '@/components/nav-bar';
import { getDataPath } from '@/lib/data-loader';
import { getLevelColor } from '@/lib/colors';
import { Brain, Zap, Target, Moon, Clock, Activity } from 'lucide-react';
import Link from 'next/link';

interface UnifiedData {
  memoryNodes: any[];
  intents: any[];
  dreams: any[];
  status: any;
}

export default function DashboardPage() {
  const [data, setData] = useState<UnifiedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getDataPath('unified-data'))
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">初始化神经核心...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const memories = data.memoryNodes || [];
  const intents = data.intents || [];
  const dreams = data.dreams || [];
  const status = data.status || {};

  const levelCounts = {
    L1: memories.filter(m => m.level === 'L1').length,
    L2: memories.filter(m => m.level === 'L2').length,
    L3: memories.filter(m => m.level === 'L3').length,
    L4: memories.filter(m => m.level === 'L4').length,
  };

  const recentMemories = memories.slice(0, 3);

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <NavBar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-glow" style={{ color: '#60A5FA' }}>神经</span>
            <span className="text-white">记忆核心</span>
          </h1>
          <p className="text-sm text-slate-400">
            五层记忆架构实时可视化 · {memories.length} 条记忆节点 · 最后同步 {new Date(status.lastSync).toLocaleString('zh-CN')}
          </p>
        </motion.div>

        {/* Core Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <NeuralCore
            data={{
              memories,
              l0Count: 3,
              l0Messages: 649,
              intents: intents.length,
              dreams: dreams.length,
              lastSync: status.lastSync,
            }}
          />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8"
        >
          {[
            { level: 'L1', count: levelCounts.L1, icon: Brain, label: '情景记忆' },
            { level: 'L2', count: levelCounts.L2, icon: Zap, label: '程序记忆' },
            { level: 'L3', count: levelCounts.L3, icon: Target, label: '语义记忆' },
            { level: 'L4', count: levelCounts.L4, icon: Activity, label: '核心记忆' },
            { level: 'L0', count: 649, icon: Moon, label: '实时消息' },
          ].map((stat) => {
            const color = getLevelColor(stat.level);
            const Icon = stat.icon;
            return (
              <Link
                key={stat.level}
                href={stat.level === 'L0' ? '/l0' : stat.level === 'L4' ? '/insights' : '/memory'}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glow-card p-4 text-center cursor-pointer"
                  style={{ borderColor: color.main + '30' }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: color.glow }} />
                  <div className="text-2xl font-bold" style={{ color: color.glow }}>
                    {stat.count}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {stat.level} · {stat.label}
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>

        {/* Recent Memories + System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Memories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glow-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">最近沉淀的记忆</h3>
              <Link href="/memory" className="text-xs text-blue-400 hover:text-blue-300">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-3">
              {recentMemories.map((m, i) => {
                const color = getLevelColor(m.level);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: color.bg }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: color.main, boxShadow: `0 0 6px ${color.glow}` }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="level-badge" style={{ background: color.bg, color: color.glow, borderColor: color.main + '40' }}>
                          {m.level}
                        </span>
                        <span className="text-xs text-slate-300 truncate">{m.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {m.content?.substring(0, 120)?.replace(/---[\s\S]*?---/, '')}...
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glow-card p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-4">系统状态</h3>
            <div className="space-y-4">
              {[
                { label: '记忆同步', value: '在线', status: 'ok', detail: status.lastGithubSync || '刚刚' },
                { label: 'Daily Dream', value: '运行中', status: 'ok', detail: '每天 23:00' },
                { label: 'Weekly Review', value: '运行中', status: 'ok', detail: '每周日 22:00' },
                { label: '自动归档', value: '运行中', status: 'ok', detail: '每天 00:00' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'ok' ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{item.value}</div>
                    <div className="text-xs text-slate-500">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-white/5">
              <Link href="/memory">
                <div className="text-center p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer">
                  <Brain className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                  <span className="text-xs text-blue-300">探索记忆</span>
                </div>
              </Link>
              <Link href="/insights">
                <div className="text-center p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors cursor-pointer">
                  <Target className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <span className="text-xs text-purple-300">模式雷达</span>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
