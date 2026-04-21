'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/particle-bg';
import { NavBar } from '@/components/nav-bar';
import { getLevelColor } from '@/lib/colors';
import { X, Link2, Calendar, Sparkles } from 'lucide-react';

interface MemoryNode {
  id: string;
  title: string;
  level: string;
  content: string;
  created: string;
  connections: string[];
  confidence: number;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetRadius: number;
  angle: number;
}

export default function MemoryConstellationPage() {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [positions, setPositions] = useState<Map<string, NodePosition>>(new Map());
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/memory')
      .then(r => r.json())
      .then(d => {
        const nodes = (d.memories || []).map((m: any, i: number) => ({
          ...m,
          _index: i,
        }));
        setMemories(nodes);

        // 初始化位置
        const initPos = new Map<string, NodePosition>();
        const cx = 400;
        const cy = 300;

        nodes.forEach((m: any, i: number) => {
          const levelMap: Record<string, number> = { L4: 0, L3: 1, L2: 2, L1: 3 };
          const levelIdx = levelMap[m.level] || 3;
          const baseRadius = [60, 130, 200, 280][levelIdx];
          const angle = (i / Math.max(nodes.filter((n: any) => n.level === m.level).length, 1)) * Math.PI * 2 +
            levelIdx * 1.5;

          initPos.set(m.id, {
            x: cx + Math.cos(angle) * baseRadius,
            y: cy + Math.sin(angle) * baseRadius,
            vx: 0,
            vy: 0,
            targetRadius: baseRadius,
            angle: angle,
          });
        });

        setPositions(initPos);
      });
  }, []);

  // 力导向动画
  useEffect(() => {
    if (memories.length === 0) return;

    let time = 0;
    const animate = () => {
      setPositions(prev => {
        const next = new Map(prev);
        const cx = 400;
        const cy = 300;

        next.forEach((pos, id) => {
          const node = memories.find(m => m.id === id);
          if (!node) return;

          const levelIdx = { L4: 0, L3: 1, L2: 2, L1: 3 }[node.level] || 3;
          const baseRadius = [60, 130, 200, 280][levelIdx];

          // 轨道运动
          pos.angle += [0.001, 0.0015, 0.002, 0.003][levelIdx];
          const targetX = cx + Math.cos(pos.angle) * baseRadius;
          const targetY = cy + Math.sin(pos.angle) * baseRadius;

          pos.x += (targetX - pos.x) * 0.05;
          pos.y += (targetY - pos.y) * 0.05;
        });

        return next;
      });

      time++;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [memories]);

  const getConnectedNodes = useCallback((nodeId: string) => {
    const node = memories.find(m => m.id === nodeId);
    if (!node) return [];
    return node.connections
      .map(cid => memories.find(m => m.id === cid))
      .filter(Boolean) as MemoryNode[];
  }, [memories]);

  const selectedPos = selectedNode ? positions.get(selectedNode.id) : null;

  return (
    <div className="min-h-screen relative" ref={containerRef}>
      <ParticleBackground />
      <NavBar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-1">记忆星座</h1>
          <p className="text-sm text-slate-400">
            {memories.length} 条记忆节点 · 点击节点查看详情 · 悬停高亮关联
          </p>
        </motion.div>

        <div className="flex gap-4">
          {/* SVG Graph */}
          <div className="flex-1 glow-card p-4 overflow-hidden" style={{ minHeight: 600 }}>
            <svg
              ref={svgRef}
              viewBox="0 0 800 600"
              className="w-full h-full"
              style={{ maxHeight: 600 }}
            >
              {/* 背景轨道 */}
              {[60, 130, 200, 280].map((r, i) => (
                <circle
                  key={i}
                  cx={400}
                  cy={300}
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              ))}

              {/* 连接线 */}
              {memories.map(node => {
                const pos = positions.get(node.id);
                if (!pos) return null;

                return node.connections.map((cid, ci) => {
                  const target = positions.get(cid);
                  if (!target) return null;
                  const isHighlighted = hoveredNode === node.id || hoveredNode === cid;

                  return (
                    <line
                      key={`${node.id}-${cid}-${ci}`}
                      x1={pos.x}
                      y1={pos.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255,255,255,0.03)'}
                      strokeWidth={isHighlighted ? 2 : 0.5}
                    />
                  );
                });
              })}

              {/* 节点 */}
              {memories.map(node => {
                const pos = positions.get(node.id);
                if (!pos) return null;

                const color = getLevelColor(node.level);
                const isHovered = hoveredNode === node.id;
                const isSelected = selectedNode?.id === node.id;
                const connected = selectedNode ? getConnectedNodes(selectedNode.id).some(m => m.id === node.id) : false;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                  >
                    {/* 发光圈 */}
                    {(isHovered || isSelected || connected) && (
                      <circle
                        r={isSelected ? 25 : 18}
                        fill="none"
                        stroke={color.glow}
                        strokeWidth={1}
                        opacity={0.5}
                        className="animate-pulse-slow"
                      />
                    )}
                    {/* 核心 */}
                    <circle
                      r={isSelected ? 12 : isHovered ? 10 : 7}
                      fill={color.main}
                      opacity={isSelected ? 1 : connected ? 0.9 : 0.7}
                      style={{
                        filter: `drop-shadow(0 0 ${isHovered || isSelected ? 12 : 6}px ${color.glow})`,
                      }}
                    />
                    {/* 标签 */}
                    {(isHovered || isSelected || node.level === 'L4') && (
                      <text
                        y={-15}
                        textAnchor="middle"
                        fill={color.glow}
                        fontSize={isSelected ? 11 : 9}
                        fontWeight={600}
                      >
                        {node.title.length > 15 ? node.title.slice(0, 12) + '...' : node.title}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 详情面板 */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 50, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 320 }}
                exit={{ opacity: 0, x: 50, width: 0 }}
                className="glow-card p-5 overflow-hidden flex-shrink-0"
                style={{ maxHeight: 600, overflowY: 'auto' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: getLevelColor(selectedNode.level).main,
                        boxShadow: `0 0 10px ${getLevelColor(selectedNode.level).glow}`,
                      }}
                    />
                    <span
                      className="level-badge text-xs"
                      style={{
                        background: getLevelColor(selectedNode.level).bg,
                        color: getLevelColor(selectedNode.level).glow,
                      }}
                    >
                      {selectedNode.level}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{selectedNode.title}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedNode.created).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    置信度 {(selectedNode.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedNode.content?.substring(0, 800)}
                  {selectedNode.content?.length > 800 && '...'}
                </div>

                {selectedNode.connections.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      关联记忆 ({selectedNode.connections.length})
                    </h4>
                    <div className="space-y-2">
                      {getConnectedNodes(selectedNode.id).map(conn => (
                        <div
                          key={conn.id}
                          className="flex items-center gap-2 p-2 rounded bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                          onClick={() => setSelectedNode(conn)}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: getLevelColor(conn.level).main }}
                          />
                          <span className="text-xs text-slate-300">{conn.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
