'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryNode } from '@/lib/types';
import { useMemoryStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { 
  X, Link2, Calendar, Hash, Sparkles, Move, CheckCircle, ArrowUpCircle, 
  ZoomIn, ZoomOut, RotateCcw, Hand, MousePointerClick, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface MemoryGalaxyProps {
  className?: string;
  compact?: boolean;
}

const levelColors = {
  L0: '#3b82f6',
  L1: '#22d3ee',
  L2: '#fbbf24',
  L3: '#f472b6',
  L4: '#a78bfa',
};

const levelRadii = {
  L4: 60,
  L3: 120,
  L2: 200,
  L1: 300,
};

export function MemoryGalaxy({ className, compact = false }: MemoryGalaxyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const { 
    memories, 
    selectedMemoryId, 
    setSelectedMemory, 
    getMemoryById, 
    updateMemoryPosition, 
    elevateMemory, 
    confirmMemoryReview 
  } = useMemoryStore();
  const { user, isAuthenticated } = useAuth();
  const [hoveredMemory, setHoveredMemory] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [elevateDialogOpen, setElevateDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  const panStart = useRef({ x: 0, y: 0 });
  const selectedMemory = selectedMemoryId ? getMemoryById(selectedMemoryId) : null;

  // 挂载状态 - 避免 Hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: Math.max(width, 400), 
          height: compact ? Math.max(height, 300) : Math.max(height, 500) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [compact]);

  // Pan/Zoom handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && !dragMode && !draggingNode)) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
      e.preventDefault();
    }
  }, [dragMode, draggingNode, translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setTranslate({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      });
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.3, Math.min(3, prev * delta)));
    }
  }, []);

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Handle elevate memory
  const handleElevate = () => {
    if (selectedMemory) {
      elevateMemory(selectedMemory.id);
      setElevateDialogOpen(false);
    }
  };

  // Handle confirm review
  const handleConfirmReview = () => {
    if (selectedMemory) {
      confirmMemoryReview(selectedMemory.id);
      setReviewDialogOpen(false);
    }
  };

  // Render galaxy
  useEffect(() => {
    if (!svgRef.current || memories.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create main group for pan/zoom
    const g = svg.append('g')
      .attr('transform', `translate(${translate.x}, ${translate.y}) scale(${scale})`);
    gRef.current = g;

    // Create glow filters
    const defs = g.append('defs');
    
    Object.entries(levelColors).forEach(([level, color]) => {
      if (level === 'L0') return;
      
      // Glow filter
      const filter = defs.append('filter')
        .attr('id', `glow-${level}`)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      
      filter.append('feGaussianBlur')
        .attr('stdDeviation', level === 'L4' ? '6' : '4')
        .attr('result', 'coloredBlur');
      
      const merge = filter.append('feMerge');
      merge.append('feMergeNode').attr('in', 'coloredBlur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');

      // Shadow filter
      const shadowFilter = defs.append('filter')
        .attr('id', `shadow-${level}`)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      
      shadowFilter.append('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 2)
        .attr('stdDeviation', 3)
        .attr('flood-color', color)
        .attr('flood-opacity', 0.5);
    });

    // Draw concentric rings with glow effect
    const ringGroup = g.append('g').attr('class', 'rings');
    
    ['L3', 'L2', 'L1'].forEach((level, i) => {
      const radius = levelRadii[level as keyof typeof levelRadii] * (compact ? 0.5 : 1);
      
      // Outer glow ring
      ringGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', levelColors[level as keyof typeof levelColors])
        .attr('stroke-width', 8)
        .attr('stroke-opacity', 0.1)
        .transition()
        .duration(1000)
        .delay(i * 150)
        .attr('r', radius);
      
      // Main ring
      const ring = ringGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', levelColors[level as keyof typeof levelColors])
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.4)
        .attr('stroke-dasharray', '8,4');
      
      // Animate ring appearance with rotation
      ring.transition()
        .duration(800)
        .delay(i * 150)
        .attr('r', radius)
        .on('end', function() {
          d3.select(this)
            .transition()
            .duration(20000)
            .ease(d3.easeLinear)
            .attrTween('transform', function() {
              return d3.interpolateString(
                `rotate(0, ${centerX}, ${centerY})`,
                `rotate(360, ${centerX}, ${centerY})`
              );
            })
            .on('end', function repeat() {
              d3.select(this)
                .attr('transform', `rotate(0, ${centerX}, ${centerY})`)
                .transition()
                .duration(20000)
                .ease(d3.easeLinear)
                .attrTween('transform', function() {
                  return d3.interpolateString(
                    `rotate(0, ${centerX}, ${centerY})`,
                    `rotate(360, ${centerX}, ${centerY})`
                  );
                })
                .on('end', repeat);
            });
        });
    });

    // Draw connections
    const connectionGroup = g.append('g').attr('class', 'connections');
    const connectionLines: { [key: string]: d3.Selection<SVGLineElement, unknown, null, undefined> } = {};
    
    memories.forEach(memory => {
      if (memory.connections.length === 0) return;
      
      memory.connections.forEach(targetId => {
        const target = memories.find(m => m.id === targetId);
        if (!target || memory.id > targetId) return; // Avoid duplicate lines
        
        const sourcePos = getNodePosition(memory, centerX, centerY, compact);
        const targetPos = getNodePosition(target, centerX, centerY, compact);
        
        const lineId = `${memory.id}-${targetId}`;
        const line = connectionGroup.append('line')
          .attr('id', lineId)
          .attr('x1', sourcePos.x)
          .attr('y1', sourcePos.y)
          .attr('x2', targetPos.x)
          .attr('y2', targetPos.y)
          .attr('stroke', `url(#gradient-${memory.level})`)
          .attr('stroke-width', selectedMemoryId && (selectedMemoryId === memory.id || selectedMemoryId === target.id) ? 2.5 : 1.5)
          .attr('stroke-opacity', selectedMemoryId && selectedMemoryId !== memory.id && selectedMemoryId !== target.id ? 0.1 : 0.5)
          .attr('stroke-linecap', 'round');
        
        connectionLines[lineId] = line;
      });
    });

    // Create gradients for connections
    memories.forEach(memory => {
      memory.connections.forEach(targetId => {
        const target = memories.find(m => m.id === targetId);
        if (!target || memory.id > targetId) return;
        
        const gradientId = `gradient-${memory.id}-${targetId}`;
        const gradient = defs.append('linearGradient')
          .attr('id', gradientId)
          .attr('gradientUnits', 'userSpaceOnUse');
        
        const sourcePos = getNodePosition(memory, centerX, centerY, compact);
        const targetPos = getNodePosition(target, centerX, centerY, compact);
        
        gradient
          .attr('x1', sourcePos.x)
          .attr('y1', sourcePos.y)
          .attr('x2', targetPos.x)
          .attr('y2', targetPos.y);
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', levelColors[memory.level]);
        
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', levelColors[target.level]);
      });
    });

    // Draw nodes with enhanced animations
    const nodeGroups: { [key: string]: d3.Selection<SVGGElement, unknown, null, undefined> } = {};
    
    (['L4', 'L3', 'L2', 'L1'] as const).forEach((level, levelIndex) => {
      const levelMemories = memories.filter(m => m.level === level);
      const nodeGroup = g.append('g').attr('class', `${level}-nodes`);
      
      levelMemories.forEach((memory, i) => {
        const pos = getNodePosition(memory, centerX, centerY, compact);
        const nodeSize = level === 'L4' ? (compact ? 14 : 22) : 
                        level === 'L3' ? (compact ? 11 : 16) : 
                        level === 'L2' ? (compact ? 9 : 12) : (compact ? 7 : 9);
        
        const nodeG = nodeGroup.append('g')
          .attr('id', `node-${memory.id}`)
          .attr('class', 'memory-node')
          .attr('cursor', isAuthenticated && dragMode ? 'grab' : 'pointer')
          .attr('transform', `translate(${pos.x}, ${pos.y})`)
          .style('opacity', 0)
          .on('click', (e) => {
            e.stopPropagation();
            setSelectedMemory(memory.id);
          })
          .on('mouseenter', () => setHoveredMemory(memory.id))
          .on('mouseleave', () => setHoveredMemory(null));
        
        // Drag behavior for authenticated users in drag mode
        if (isAuthenticated && !compact) {
          const drag = d3.drag<SVGGElement, unknown>()
            .on('start', function(event) {
              if (!dragMode) return;
              setDraggingNode(memory.id);
              d3.select(this)
                .raise()
                .transition()
                .duration(200)
                .attr('transform', `translate(${event.x}, ${event.y}) scale(1.2)`);
            })
            .on('drag', function(event) {
              if (!dragMode) return;
              const newX = event.x;
              const newY = event.y;
              d3.select(this).attr('transform', `translate(${newX}, ${newY}) scale(1.2)`);
              
              // Update connections in real-time
              updateConnections(memory.id, newX, newY, centerX, centerY, compact);
            })
            .on('end', function(event) {
              if (!dragMode) return;
              setDraggingNode(null);
              d3.select(this)
                .transition()
                .duration(300)
                .attr('transform', `translate(${event.x}, ${event.y}) scale(1)`);
              
              // Save new position
              const newX = event.x - centerX;
              const newY = event.y - centerY;
              updateMemoryPosition(memory.id, { x: newX, y: newY });
            });
          
          nodeG.call(drag);
        }
        
        // Outer glow circle
        nodeG.append('circle')
          .attr('r', 0)
          .attr('fill', levelColors[level])
          .attr('opacity', 0.3)
          .transition()
          .duration(600)
          .delay(levelIndex * 100 + i * 40)
          .attr('r', nodeSize * 2);
        
        // Main circle
        const circle = nodeG.append('circle')
          .attr('r', 0)
          .attr('fill', levelColors[level])
          .attr('filter', `url(#glow-${level})`)
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.8);
        
        // Hover effect ring
        const hoverRing = nodeG.append('circle')
          .attr('r', nodeSize)
          .attr('fill', 'none')
          .attr('stroke', levelColors[level])
          .attr('stroke-width', 3)
          .attr('opacity', 0)
          .attr('pointer-events', 'none');
        
        // Pulse animation for L4 nodes
        if (level === 'L4' && !compact) {
          const pulseGroup = nodeG.append('g').attr('class', 'pulse');
          
          [1, 2, 3].forEach((ring, idx) => {
            pulseGroup.append('circle')
              .attr('r', nodeSize)
              .attr('fill', 'none')
              .attr('stroke', levelColors.L4)
              .attr('stroke-width', 2)
              .attr('opacity', 0.6)
              .transition()
              .delay(idx * 600)
              .duration(2000)
              .ease(d3.easeSinOut)
              .attr('r', nodeSize * (2 + idx * 0.5))
              .attr('opacity', 0)
              .on('end', function repeat() {
                d3.select(this)
                  .attr('r', nodeSize)
                  .attr('opacity', 0.6)
                  .transition()
                  .delay(2000)
                  .duration(2000)
                  .ease(d3.easeSinOut)
                  .attr('r', nodeSize * (2 + idx * 0.5))
                  .attr('opacity', 0)
                  .on('end', repeat);
              });
          });
        }
        
        // Animate node appearance with bounce
        nodeG.transition()
          .duration(500)
          .delay(levelIndex * 100 + i * 40)
          .style('opacity', 1);
        
        circle.transition()
          .duration(600)
          .delay(levelIndex * 100 + i * 40)
          .ease(d3.easeElasticOut)
          .attr('r', nodeSize);
        
        nodeGroups[memory.id] = nodeG;
      });
    });

    // Update function for connections during drag
    function updateConnections(nodeId: string, x: number, y: number, centerX: number, centerY: number, compact: boolean) {
      const memory = memories.find(m => m.id === nodeId);
      if (!memory) return;
      
      // Update connections to this node
      memories.forEach(other => {
        if (other.connections.includes(nodeId) || memory.connections.includes(other.id)) {
          const lineId = other.id < nodeId ? `${other.id}-${nodeId}` : `${nodeId}-${other.id}`;
          const line = connectionLines[lineId];
          if (line) {
            if (other.connections.includes(nodeId)) {
              line.attr('x2', x).attr('y2', y);
            } else {
              line.attr('x1', x).attr('y1', y);
            }
          }
        }
      });
    }

  }, [memories, dimensions, compact, selectedMemoryId, scale, translate, dragMode, isAuthenticated, setSelectedMemory, updateMemoryPosition]);

  const getNodePosition = (memory: MemoryNode, centerX: number, centerY: number, compact: boolean) => {
    // Use custom position if available
    if (memory.position.x !== 0 || memory.position.y !== 0) {
      return {
        x: centerX + memory.position.x,
        y: centerY + memory.position.y
      };
    }
    
    // Fallback to calculated position
    const levelIndex = { L4: 0, L3: 1, L2: 2, L1: 3 }[memory.level] || 0;
    const levelNodes = memories.filter(m => m.level === memory.level);
    const nodeIndex = levelNodes.findIndex(m => m.id === memory.id);
    
    if (memory.level === 'L4') {
      const angle = (nodeIndex / Math.max(levelNodes.length, 1)) * 2 * Math.PI;
      const radius = 40 * (compact ? 0.5 : 1);
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    }
    
    const ringRadius = levelRadii[memory.level] * (compact ? 0.5 : 1);
    const angle = (nodeIndex / Math.max(levelNodes.length, 1)) * 2 * Math.PI + (levelIndex * 0.5);
    return {
      x: centerX + Math.cos(angle) * ringRadius,
      y: centerY + Math.sin(angle) * ringRadius
    };
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Controls for authenticated users */}
      {!compact && isAuthenticated && showControls && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 z-20 flex flex-col gap-2"
        >
          {/* Drag Mode Toggle */}
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-2 rounded-lg border shadow-lg">
            <Button
              variant={dragMode ? "default" : "outline"}
              size="sm"
              onClick={() => setDragMode(!dragMode)}
              className="gap-2"
            >
              <Hand className="w-4 h-4" />
              {dragMode ? '拖拽模式' : '查看模式'}
            </Button>
            
            {dragMode && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-muted-foreground"
              >
                点击并拖动节点
              </motion.span>
            )}
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-md p-1 rounded-lg border shadow-lg">
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.3, s * 0.9))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s * 1.1))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={resetView}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Guest mode hint */}
      {!compact && !isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border"
        >
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">登录后可编辑和审阅记忆</span>
        </motion.div>
      )}

      {!mounted ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">加载记忆星系...</span>
          </div>
        </div>
      ) : (
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className={cn(
            "w-full h-full",
            isPanning && "cursor-grabbing",
            !isPanning && !dragMode && "cursor-grab",
            dragMode && !draggingNode && "cursor-crosshair"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          suppressHydrationWarning
        />
      )}
      
      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 flex flex-wrap gap-3 bg-background/90 backdrop-blur-md p-3 rounded-lg border shadow-lg"
      >
        {[
          { level: 'L4', label: 'Core', color: levelColors.L4 },
          { level: 'L3', label: 'Semantic', color: levelColors.L3 },
          { level: 'L2', label: 'Procedural', color: levelColors.L2 },
          { level: 'L1', label: 'Episodic', color: levelColors.L1 },
        ].map(({ level, label, color }) => (
          <div key={level} className="flex items-center gap-2">
            <motion.div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
              whileHover={{ scale: 1.3 }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Detail Panel with Review Actions for Authenticated Users */}
      <AnimatePresence>
        {selectedMemory && !compact && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-4 right-4 w-80 bg-card/95 backdrop-blur-md border rounded-xl shadow-xl p-4 max-h-[calc(100vh-200px)] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-4 h-4 rounded-full" 
                  style={{ 
                    backgroundColor: levelColors[selectedMemory.level],
                    boxShadow: `0 0 12px ${levelColors[selectedMemory.level]}`
                  }}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedMemory.level}
                </span>
                {isAuthenticated && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                    {isAuthenticated ? '可编辑' : '只读'}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedMemory(null)}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm mb-4 leading-relaxed"
            >
              {selectedMemory.content}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2 text-xs text-muted-foreground mb-4"
            >
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3" />
                <span>{selectedMemory.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>置信度: {(selectedMemory.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>创建: {new Date(selectedMemory.created).toLocaleDateString('zh-CN')}</span>
              </div>
              {selectedMemory.reviewed && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>上次审阅: {new Date(selectedMemory.reviewed).toLocaleDateString('zh-CN')}</span>
                </div>
              )}
              {selectedMemory.connections.length > 0 && (
                <div className="flex items-start gap-2">
                  <Link2 className="w-3 h-3 mt-0.5" />
                  <span>{selectedMemory.connections.length} 个关联</span>
                </div>
              )}
            </motion.div>

            {/* Review Actions for Authenticated Users */}
            {isAuthenticated && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-4 border-t space-y-2"
              >
                <p className="text-xs font-medium text-muted-foreground mb-3">审阅操作</p>
                
                {selectedMemory.level !== 'L4' && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    onClick={() => setElevateDialogOpen(true)}
                  >
                    <ArrowUpCircle className="w-4 h-4 text-primary" />
                    <span>提升到 {selectedMemory.level === 'L1' ? 'L2' : selectedMemory.level === 'L2' ? 'L3' : 'L4'}</span>
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
                  onClick={() => setReviewDialogOpen(true)}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>确认审阅</span>
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elevate Confirmation Dialog */}
      <Dialog open={elevateDialogOpen} onOpenChange={setElevateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-primary" />
              提升记忆层级
            </DialogTitle>
            <DialogDescription>
              确定要将此记忆从 <strong>{selectedMemory?.level}</strong> 提升到 
              <strong>{selectedMemory?.level === 'L1' ? 'L2' : selectedMemory?.level === 'L2' ? 'L3' : 'L4'}</strong> 吗？
            </DialogDescription>
          </DialogHeader>
          {selectedMemory && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">{selectedMemory.content.substring(0, 100)}...</p>
              <p className="text-xs text-muted-foreground">当前层级: {selectedMemory.level} | 置信度: {(selectedMemory.confidence * 100).toFixed(0)}%</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setElevateDialogOpen(false)}>取消</Button>
            <Button onClick={handleElevate} className="gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              确认提升
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Confirmation Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              确认审阅记忆
            </DialogTitle>
            <DialogDescription>
              标记此记忆为已审阅状态，更新时间戳。
            </DialogDescription>
          </DialogHeader>
          {selectedMemory && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">{selectedMemory.content.substring(0, 100)}...</p>
              <p className="text-xs text-muted-foreground">
                上次审阅: {selectedMemory.reviewed ? new Date(selectedMemory.reviewed).toLocaleDateString('zh-CN') : '从未'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirmReview} variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4" />
              确认审阅
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
