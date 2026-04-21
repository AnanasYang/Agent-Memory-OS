'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/particle-bg';
import { NavBar } from '@/components/nav-bar';
import { getLevelColor } from '@/lib/colors';
import { Radar, TrendingUp, ArrowUpCircle, Brain, Target, AlertTriangle, CheckCircle } from 'lucide-react';

interface MemoryNode {
  id: string;
  title: string;
  level: string;
  content: string;
  confidence: number;
  connections: string[];
}

interface Intent {
  id: string;
  type: string;
  title: string;
  progress: number;
  priority: string;
}

export default function PatternRadarPage() {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [intents, setIntents] = useState<Intent[]>([]);

  useEffect(() => {
    fetch('/api/unified-data')
      .then(r => r.json())
      .then(d => {
        setMemories(d.memoryNodes || []);
        setIntents(d.intents || []);
      });
  }, []);

  const levelCounts = useMemo(() => ({
    L0: 649,
    L1: memories.filter(m => m.level === 'L1').length,
    L2: memories.filter(m => m.level === 'L2').length,
    L3: memories.filter(m => m.level === 'L3').length,
    L4: memories.filter(m => m.level === 'L4').length,
  }), [memories]);

  const maxCount = Math.max(...Object.values(levelCounts), 1);

  // 雷达图数据 (5轴: L0-L4)
  const radarData = [
    { label: 'L0 工作记忆', value: levelCounts.L0 / maxCount, count: levelCounts.L0, color: '#3B82F6' },
    { label: 'L1 情景记忆', value: levelCounts.L1 / maxCount, count: levelCounts.L1, color: '#06B6D4' },
    { label: 'L2 程序记忆', value: levelCounts.L2 / maxCount, count: levelCounts.L2, color: '#F59E0B' },
    { label: 'L3 语义记忆', value: levelCounts.L3 / maxCount, count: levelCounts.L3, color: '#A855F7' },
    { label: 'L4 核心记忆', value: levelCounts.L4 / maxCount, count: levelCounts.L4, color: '#EF4444' },
  ];

  // 计算雷达图坐标
  const radarSize = 200;
  const radarCenter = radarSize / 2;
  const radarRadius = 80;

  const radarPoints = radarData.map((d, i) => {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const r = d.value * radarRadius;
    return {
      x: radarCenter + Math.cos(angle) * r,
      y: radarCenter + Math.sin(angle) * r,
      labelX: radarCenter + Math.cos(angle) * (radarRadius + 25),
      labelY: radarCenter + Math.sin(angle) * (radarRadius + 25),
      ...d,
    };
  });

  const polygonPoints = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  // 系统健康评分
  const healthScore = useMemo(() => {
    const total = Object.values(levelCounts).reduce((s, c) => s + c, 0);
    if (total === 0) return 0;
    // 加权: L4 + L3 越多分数越高
    const weighted = (levelCounts.L4 * 4 + levelCounts.L3 * 3 + levelCounts.L2 * 2 + levelCounts.L1 + levelCounts.L0 * 0.5) / total;
    return Math.min(Math.round(weighted * 25), 100);
  }, [levelCounts]);

  // L2/L3 晋升候选
  const promotionCandidates = useMemo(() => {
    const l1Candidates = memories
      .filter(m => m.level === 'L1')
      .filter(m => m.connections.length >= 1 || m.confidence >= 0.8)
      .slice(0, 5);

    const l2Candidates = memories
      .filter(m => m.level === 'L2')
      .filter(m => m.connections.length >= 2 || m.confidence >= 0.9)
      .slice(0, 3);

    return [...l1Candidates, ...l2Candidates];
  }, [memories]);

  // 建议行动
  const suggestions = useMemo(() => {
    const items = [];
    if (levelCounts.L1 > levelCounts.L4 * 10) {
      items.push({ type: 'warning', text: 'L1 记忆过多，建议 review 并沉淀到 L2/L3', icon: AlertTriangle });
    }
    if (levelCounts.L4 < 2) {
      items.push({ type: 'info', text: 'L4 核心记忆较少，建议更新核心价值观', icon: Brain });
    }
    if (intents.length === 0) {
      items.push({ type: 'info', text: '没有活跃意图目标，建议设置短期目标', icon: Target });
    }
    if (promotionCandidates.length > 0) {
      items.push({ type: 'growth', text: `检测到 ${promotionCandidates.length} 条记忆可晋升`, icon: ArrowUpCircle });
    }
    items.push({ type: 'info', text: '定期 review 有助于记忆系统健康', icon: CheckCircle });
    return items;
  }, [levelCounts, intents, promotionCandidates]);

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <NavBar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Radar className="w-6 h-6 text-pink-400" />
            模式雷达
          </h1>
          <p className="text-sm text-slate-400">
            系统健康度 {healthScore}% · {promotionCandidates.length} 条晋升候选 · {intents.length} 个活跃目标
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glow-card p-6 flex flex-col items-center"
          >
            <h3 className="text-sm font-semibold text-white mb-4">记忆分布雷达</h3>
            <svg width={radarSize} height={radarSize} className="mb-4">
              {/* 背景网格 */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
                <polygon
                  key={scale}
                  points={radarData.map((_, i) => {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const r = scale * radarRadius;
                    return `${radarCenter + Math.cos(angle) * r},${radarCenter + Math.sin(angle) * r}`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                />
              ))}

              {/* 轴线 */}
              {radarData.map((_, i) => {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={radarCenter + Math.cos(angle) * radarRadius}
                    y2={radarCenter + Math.sin(angle) * radarRadius}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={1}
                  />
                );
              })}

              {/* 数据区域 */}
              <polygon
                points={polygonPoints}
                fill="rgba(168, 85, 247, 0.15)"
                stroke="#A855F7"
                strokeWidth={2}
              />

              {/* 数据点 */}
              {radarPoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={5} fill={p.color} />
                  <circle cx={p.x} cy={p.y} r={8} fill="none" stroke={p.color} strokeWidth={1} opacity={0.5} />
                  <text
                    x={p.labelX}
                    y={p.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={p.color}
                    fontSize={9}
                    fontWeight={600}
                  >
                    {p.label.split(' ')[0]}
                  </text>
                  <text
                    x={p.labelX}
                    y={p.labelY + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#64748B"
                    fontSize={8}
                  >
                    {p.count}
                  </text>
                </g>
              ))}
            </svg>
          </motion.div>

          {/* Health Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glow-card p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">系统健康度</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg width={160} height={160} viewBox="0 0 160 160" className="transform -rotate-90">
                  <circle cx={80} cy={80} r={70} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
                  <circle
                    cx={80}
                    cy={80}
                    r={70}
                    fill="none"
                    stroke={healthScore >= 70 ? '#22C55E' : healthScore >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - healthScore / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{healthScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="text-center mt-4">
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{
                    background: healthScore >= 70 ? 'rgba(34, 197, 94, 0.2)' : healthScore >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: healthScore >= 70 ? '#4ADE80' : healthScore >= 40 ? '#FBBF24' : '#F87171',
                  }}
                >
                  {healthScore >= 70 ? '健康' : healthScore >= 40 ? '一般' : '需关注'}
                </span>
              </div>

              {/* Level Bars */}
              <div className="w-full mt-6 space-y-2">
                {radarData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 w-16">{d.label.split(' ')[0]}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.count / maxCount) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: d.color }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Promotion Candidates */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glow-card p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-amber-400" />
              晋升候选
            </h3>

            {promotionCandidates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">暂无晋升候选</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {promotionCandidates.map((m, i) => {
                  const color = getLevelColor(m.level);
                  const targetLevel = m.level === 'L1' ? 'L2' : 'L3';
                  const targetColor = getLevelColor(targetLevel);

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="p-3 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: color.bg, color: color.glow }}>
                          {m.level}
                        </span>
                        <ArrowUpCircle className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: targetColor.bg, color: targetColor.glow }}>
                          {targetLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate">{m.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-500">{m.connections.length} 关联</span>
                        <span className="text-[10px] text-slate-500">{(m.confidence * 100).toFixed(0)}% 置信度</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glow-card p-6 mt-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            建议行动
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((s, i) => {
              const Icon = s.icon;
              const colors = {
                warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', icon: '#FBBF24' },
                info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', icon: '#60A5FA' },
                growth: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', icon: '#4ADE80' },
              };
              const c = colors[s.type as keyof typeof colors] || colors.info;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.icon }} />
                  <span className="text-xs text-slate-300">{s.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
