'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryNode {
  id: string;
  title: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  category: string;
  confidence: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface MemoryGalaxyProps {
  compact?: boolean;
}

const levelSizes: any = { L1: 18, L2: 24, L3: 30, L4: 38 };
const levelColors: any = { L1: '#3b82f6', L2: '#f59e0b', L3: '#8b5cf6', L4: '#ef4444' };
const levelGlowColors: any = { L1: 'rgba(59, 130, 246, 0.4)', L2: 'rgba(245, 158, 11, 0.4)', L3: 'rgba(139, 92, 246, 0.4)', L4: 'rgba(239, 68, 68, 0.4)' };

export function MemoryGalaxy({ compact = false }: MemoryGalaxyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const mockNodes: MemoryNode[] = [
      { id: 'L1-001', title: '记忆系统初始化', level: 'L1', category: 'system', confidence: 0.95 },
      { id: 'L1-002', title: '多智能体设计讨论', level: 'L1', category: 'design', confidence: 0.88 },
      { id: 'L1-003', title: 'Cursor IDE 推荐', level: 'L1', category: 'tool', confidence: 0.92 },
      { id: 'L1-004', title: 'JSON 偏好', level: 'L1', category: 'communication', confidence: 0.94 },
      { id: 'L1-005', title: '自动化工作流', level: 'L1', category: 'automation', confidence: 0.90 },
      { id: 'L2-001', title: '系统化思维', level: 'L2', category: 'thinking', confidence: 0.87 },
      { id: 'L2-002', title: 'AI 新闻消费习惯', level: 'L2', category: 'habit', confidence: 0.91 },
      { id: 'L2-003', title: '文档价值模式', level: 'L2', category: 'work', confidence: 0.88 },
      { id: 'L2-004', title: '自动化寻求模式', level: 'L2', category: 'tool', confidence: 0.90 },
      { id: 'L3-001', title: '资源约束框架', level: 'L3', category: 'context', confidence: 0.90 },
      { id: 'L3-002', title: '清晰结构框架', level: 'L3', category: 'communication', confidence: 0.92 },
      { id: 'L4-001', title: '追求清晰', level: 'L4', category: 'value', confidence: 0.96 },
    ];
    setNodes(mockNodes);
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

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

    // 初始化位置
    const centerX = width / 2;
    const centerY = height / 2;
    nodes.forEach((node: any, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = 50 + (i % 3) * 60;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });

    // 力导向图
    const simulation: any = d3.forceSimulation(nodes as any)
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
    const links: any = svg.selectAll('.link')
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
    const nodeGroups: any = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event: any, d: any) => setSelectedNode(d))
      .on('mouseenter', (event: any, d: any) => {
        setHoveredNode(d.id);
        d3.select(event.currentTarget).select('circle')
          .transition().duration(200)
          .attr('r', levelSizes[d.level] * 1.2);
      })
      .on('mouseleave', (event: any, d: any) => {
        setHoveredNode(null);
        d3.select(event.currentTarget).select('circle')
          .transition().duration(200)
          .attr('r', levelSizes[d.level]);
      });

    // @ts-ignore - D3 drag types are complex
    nodeGroups.call(d3.drag()
      .on('start', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
    );

    // 发光圆圈
    nodeGroups.append('circle')
      .attr('r', (d: any) => levelSizes[d.level] + 8)
      .attr('fill', (d: any) => levelGlowColors[d.level])
      .attr('opacity', 0)
      .transition().duration(500).delay((d: any, i: number) => i * 50)
      .attr('opacity', 0.6);

    // 主圆圈
    nodeGroups.append('circle')
      .attr('r', (d: any) => levelSizes[d.level])
      .attr('fill', (d: any) => levelColors[d.level])
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))');

    // 图标
    nodeGroups.append('text')
      .text((d: any) => d.level)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold');

    // 标题
    nodeGroups.append('text')
      .text((d: any) => d.title.length > 6 ? d.title.slice(0, 6) + '...' : d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => levelSizes[d.level] + 18)
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

    return () => { simulation.stop(); };
  }, [nodes]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" style={{ minHeight: compact ? '300px' : '500px' }} />
      
      {/* 图例 */}
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

      {/* 详情 */}
      <AnimatePresence>
        {selectedNode && (
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
        {hoveredNode && !selectedNode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 text-xs text-gray-400 bg-white/80 dark:bg-slate-800/80 px-3 py-2 rounded-lg backdrop-blur-sm"
          >点击查看详情</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
