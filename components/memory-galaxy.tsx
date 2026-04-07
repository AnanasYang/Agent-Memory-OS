'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

// 从 unified-data.ts 导入的 MemoryNode 类型
interface MemoryNode {
  id: string;
  title: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  content: string;
  category: string;
  confidence: number;
  created: string;
  updated: string;
  reviewed: string | null;
  sources: string[];
  connections: string[];
  position?: { x: number; y: number };
  // D3 使用的动态属性
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface MemoryGalaxyProps {
  compact?: boolean;
}

const levelSizes: Record<string, number> = { L1: 18, L2: 24, L3: 30, L4: 38 };
const levelColors: Record<string, string> = { L1: '#3b82f6', L2: '#f59e0b', L3: '#8b5cf6', L4: '#ef4444' };
const levelGlowColors: Record<string, string> = { 
  L1: 'rgba(59, 130, 246, 0.4)', 
  L2: 'rgba(245, 158, 11, 0.4)', 
  L3: 'rgba(139, 92, 246, 0.4)', 
  L4: 'rgba(239, 68, 68, 0.4)' 
};

export function MemoryGalaxy({ compact = false }: MemoryGalaxyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // 从 API 获取真实数据
  useEffect(() => {
    const fetchMemoryNodes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/memory');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch memory nodes: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
        } else if (Array.isArray(data)) {
          setNodes(data);
        } else {
          setNodes([]);
        }
      } catch (err) {
        console.error('Failed to fetch memory nodes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load memory nodes');
        setNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemoryNodes();
  }, []);

  // D3 可视化
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // 背景网格
    const gridGroup = svg.append('g').attr('class', 'grid');
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      gridGroup.append('line')
        .attr('x1', x).attr('y1', 0)
        .attr('x2', x).attr('y2', height)
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.03)
        .attr('stroke-width', 1);
    }
    for (let y = 0; y < height; y += gridSize) {
      gridGroup.append('line')
        .attr('x1', 0).attr('y1', y)
        .attr('x2', width).attr('y2', y)
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.03)
        .attr('stroke-width', 1);
    }

    // 初始化位置 - 使用预计算位置或环形布局
    const centerX = width / 2;
    const centerY = height / 2;
    
    nodes.forEach((node: MemoryNode, i) => {
      if (node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number') {
        // 使用预计算位置（相对于中心的偏移）
        node.x = centerX + node.position.x;
        node.y = centerY + node.position.y;
      } else {
        // 使用环形布局
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = 50 + (i % 3) * 60;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
      }
    });

    // 力导向图
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => levelSizes[d.level] + 15))
      .force('link', d3.forceLink()
        .links(nodes.slice(1).map((n, i) => ({ source: nodes[0], target: n })))
        .distance(80)
        .strength(0.3)
      );

    // 发光滤镜
    const defs = svg.append('defs');
    ['L1', 'L2', 'L3', 'L4'].forEach(level => {
      const filter = defs.append('filter')
        .attr('id', `glow-${level}`)
        .attr('x', '-50%').attr('y', '-50%')
        .attr('width', '200%').attr('height', '200%');
      filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
      filter.append('feMerge').append('feMergeNode').attr('in', 'coloredBlur');
      filter.append('feMerge').append('feMergeNode').attr('in', 'SourceGraphic');
    });

    // 连线
    const links = svg.selectAll('.link')
      .data(nodes.slice(1).map((n, i) => ({ source: nodes[0], target: n })))
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.3);

    const lineGradient = defs.append('linearGradient').attr('id', 'line-gradient').attr('gradientUnits', 'userSpaceOnUse');
    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#8b5cf6').attr('stop-opacity', 0.5);
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.2);

    // 节点
    const nodeGroups = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (_event: any, d: MemoryNode) => {
        setSelectedNode(d);
        // 使用 router.push 跳转到详情页
        router.push(`/memory/${d.id}`);
      })
      .on('mouseenter', (event: any, d: MemoryNode) => {
        setHoveredNode(d.id);
        d3.select(event.currentTarget).select('circle')
          .transition().duration(200)
          .attr('r', levelSizes[d.level] * 1.2);
      })
      .on('mouseleave', (event: any, d: MemoryNode) => {
        setHoveredNode(null);
        d3.select(event.currentTarget).select('circle')
          .transition().duration(200)
          .attr('r', levelSizes[d.level]);
      });

    nodeGroups.call(d3.drag<SVGGElement, MemoryNode>()
      .on('start', (event: any, d: MemoryNode) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x ?? null;
        d.fy = d.y ?? null;
      })
      .on('drag', (event: any, d: MemoryNode) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: MemoryNode) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
    );

    // 发光圆圈
    nodeGroups.append('circle')
      .attr('r', (d: MemoryNode) => levelSizes[d.level] + 8)
      .attr('fill', (d: MemoryNode) => levelGlowColors[d.level])
      .attr('opacity', 0)
      .transition().duration(500).delay((_d: MemoryNode, i: number) => i * 50)
      .attr('opacity', 0.6);

    // 主圆圈
    nodeGroups.append('circle')
      .attr('r', (d: MemoryNode) => levelSizes[d.level])
      .attr('fill', (d: MemoryNode) => levelColors[d.level])
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))');

    // 图标
    nodeGroups.append('text')
      .text((d: MemoryNode) => d.level)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold');

    // 标题
    nodeGroups.append('text')
      .text((d: MemoryNode) => d.title.length > 6 ? d.title.slice(0, 6) + '...' : d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', (d: MemoryNode) => levelSizes[d.level] + 18)
      .attr('fill', 'currentColor')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .style('opacity', 0.8);

    // 更新位置
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { 
      simulation.stop(); 
    };
  }, [nodes, loading, router]);

  return (
    <div className="relative w-full h-full">
      {/* Loading 状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">加载记忆星系...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-red-100 dark:border-red-900 max-w-xs text-center">
            <p className="text-red-500 text-sm mb-2">加载失败</p>
            <p className="text-gray-500 text-xs">{error}</p>
          </div>
        </div>
      )}

      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: compact ? '300px' : '500px' }} />
      
      {/* 图例 */}
      {!loading && !error && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 text-xs backdrop-blur-sm"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span>L1 情境记忆</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span>L2 行为模式</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span>L3 认知框架</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span>L4 核心记忆</span></div>
          </div>
        </motion.div>
      )}

      {/* 详情 */}
      <AnimatePresence>
        {selectedNode && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-xs backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedNode.level === 'L1' ? 'bg-blue-100 text-blue-700' :
                selectedNode.level === 'L2' ? 'bg-amber-100 text-amber-700' :
                selectedNode.level === 'L3' ? 'bg-purple-100 text-purple-700' :
                'bg-red-100 text-red-700'
              }`}>
                {selectedNode.level}
              </span>
              <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <h4 className="font-semibold text-base mb-1">{selectedNode.title}</h4>
            <p className="text-xs text-gray-500 capitalize mb-3">{selectedNode.category}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedNode.confidence * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    selectedNode.level === 'L1' ? 'bg-blue-500' :
                    selectedNode.level === 'L2' ? 'bg-amber-500' :
                    selectedNode.level === 'L3' ? 'bg-purple-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">{(selectedNode.confidence * 100).toFixed(0)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 悬停提示 */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white/80 dark:bg-slate-800/80 px-3 py-2 rounded-lg backdrop-blur-sm"
          >点击查看详情</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
