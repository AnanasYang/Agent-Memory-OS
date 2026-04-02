'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryNode } from '@/lib/types';
import { useMemoryStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { 
  X, Link2, Calendar, Hash, Sparkles, Hand, 
  ZoomIn, ZoomOut, RotateCcw, CheckCircle, ArrowUpCircle, 
  Info, FileText, ChevronRight
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';

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

const levelNames = {
  L0: '工作记忆',
  L1: '情景记忆',
  L2: '程序记忆',
  L3: '语义记忆',
  L4: '核心记忆',
};

const levelRadii = {
  L0: 350,
  L4: 60,
  L3: 120,
  L2: 200,
  L1: 300,
};

export function MemoryGalaxy({ className, compact = false }: MemoryGalaxyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const nodesRef = useRef<{ [key: string]: d3.Selection<SVGGElement, unknown, null, undefined> }>({});
  
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
    getConnectedMemories,
    updateMemoryPosition
  } = useMemoryStore();
  const { isAuthenticated } = useAuth();
  
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    memory: MemoryNode | null;
  }>({ visible: false, x: 0, y: 0, memory: null });
  
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [elevateDialogOpen, setElevateDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  const panStart = useRef({ x: 0, y: 0 });
  const selectedMemory = selectedMemoryId ? getMemoryById(selectedMemoryId) : null;
  const connectedMemories = selectedMemoryId ? getConnectedMemories(selectedMemoryId) : [];

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (e.button === 1 || (e.button === 0 && !dragMode)) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
    }
  }, [dragMode, translate]);

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
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.max(0.3, Math.min(3, s * delta)));
  }, []);

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleElevate = () => {
    if (selectedMemory) {
      setElevateDialogOpen(false);
    }
  };

  const handleConfirmReview = () => {
    if (selectedMemory) {
      setReviewDialogOpen(false);
    }
  };

  const handleNodeClick = (memory: MemoryNode) => {
    setSelectedMemory(memory.id);
    setDetailDrawerOpen(true);
  };

  // Initial D3 render - only runs once or when data changes
  useEffect(() => {
    if (!svgRef.current || !mounted) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    nodesRef.current = {};
    
    const g = svg.append('g');
    gRef.current = g;
    
    const defs = g.append('defs');
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Create glow filters
    (['L0', 'L1', 'L2', 'L3', 'L4'] as const).forEach(level => {
      const filter = defs.append('filter')
        .attr('id', `glow-${level}`)
        .attr('x', '-50%').attr('y', '-50%')
        .attr('width', '200%').attr('height', '200%');
      
      filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
      filter.append('feMerge').append('feMergeNode').attr('in', 'coloredBlur');
      filter.append('feMerge').append('feMergeNode').attr('in', 'SourceGraphic');
    });

    // Draw rings
    const ringGroup = g.append('g').attr('class', 'rings');
    ['L3', 'L2', 'L1'].forEach((level, i) => {
      const radius = levelRadii[level as keyof typeof levelRadii] * (compact ? 0.5 : 1);
      
      ringGroup.append('circle')
        .attr('cx', centerX).attr('cy', centerY).attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', levelColors[level as keyof typeof levelColors])
        .attr('stroke-width', 8).attr('stroke-opacity', 0.1)
        .transition().duration(1000).delay(i * 150).attr('r', radius);
      
      ringGroup.append('circle')
        .attr('cx', centerX).attr('cy', centerY).attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', levelColors[level as keyof typeof levelColors])
        .attr('stroke-width', 2).attr('stroke-opacity', 0.4)
        .attr('stroke-dasharray', '8,4')
        .transition().duration(800).delay(i * 150).attr('r', radius);
    });

    // Draw connections
    const connectionGroup = g.append('g').attr('class', 'connections');
    memories.forEach(memory => {
      memory.connections.forEach(targetId => {
        const target = memories.find(m => m.id === targetId);
        if (!target || memory.id > targetId) return;
        
        const sourcePos = getNodePosition(memory, centerX, centerY, compact);
        const targetPos = getNodePosition(target, centerX, centerY, compact);
        
        connectionGroup.append('line')
          .attr('x1', sourcePos.x).attr('y1', sourcePos.y)
          .attr('x2', targetPos.x).attr('y2', targetPos.y)
          .attr('stroke', levelColors[memory.level])
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.4);
      });
    });

    // Draw nodes - with entrance animation only
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
          .attr('cursor', 'pointer')
          .attr('transform', `translate(${pos.x}, ${pos.y})`)
          .style('opacity', 0);
        
        // Store reference for hover effects
        nodesRef.current[memory.id] = nodeG;
        
        // Outer glow
        nodeG.append('circle')
          .attr('class', 'glow-ring')
          .attr('r', 0)
          .attr('fill', levelColors[level])
          .attr('opacity', 0.3)
          .transition().duration(600).delay(levelIndex * 100 + i * 40)
          .attr('r', nodeSize * 2);
        
        // Main circle
        const circle = nodeG.append('circle')
          .attr('class', 'main-circle')
          .attr('r', 0)
          .attr('fill', levelColors[level])
          .attr('filter', `url(#glow-${level})`)
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.9);
        
        // Entrance animation
        nodeG.transition()
          .duration(500)
          .delay(levelIndex * 100 + i * 40)
          .style('opacity', 1);
        
        circle.transition()
          .duration(600)
          .delay(levelIndex * 100 + i * 40)
          .ease(d3.easeElasticOut)
          .attr('r', nodeSize);
        
        // Event handlers - using D3 directly, not React state
        nodeG
          .on('mouseenter', function(event) {
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltip({
                visible: true,
                x: event.clientX - rect.left + 15,
                y: event.clientY - rect.top - 10,
                memory
              });
            }
            // Visual feedback without re-render
            d3.select(this).select('.main-circle')
              .transition().duration(150)
              .attr('stroke-width', 3);
            d3.select(this).transition().duration(150)
              .attr('transform', `translate(${pos.x}, ${pos.y}) scale(1.3)`);
          })
          .on('mousemove', function(event) {
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltip(prev => prev.visible ? {
                ...prev,
                x: event.clientX - rect.left + 15,
                y: event.clientY - rect.top - 10
              } : prev);
            }
          })
          .on('mouseleave', function() {
            setTooltip({ visible: false, x: 0, y: 0, memory: null });
            // Reset visual feedback
            d3.select(this).select('.main-circle')
              .transition().duration(150)
              .attr('stroke-width', 2);
            d3.select(this).transition().duration(150)
              .attr('transform', `translate(${pos.x}, ${pos.y}) scale(1)`);
          })
          .on('click', (event) => {
            event.stopPropagation();
            handleNodeClick(memory);
          });
      });
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memories, dimensions, compact, mounted]);

  // Update transform when pan/zoom changes (without re-rendering nodes)
  useEffect(() => {
    if (gRef.current) {
      gRef.current.attr('transform', `translate(${translate.x}, ${translate.y}) scale(${scale})`);
    }
  }, [translate, scale]);

  const getNodePosition = (memory: MemoryNode, centerX: number, centerY: number, compact: boolean) => {
    if (memory.position.x !== 0 || memory.position.y !== 0) {
      return { x: centerX + memory.position.x, y: centerY + memory.position.y };
    }
    
    const levelNodes = memories.filter(m => m.level === memory.level);
    const nodeIndex = levelNodes.findIndex(m => m.id === memory.id);
    
    if (memory.level === 'L4') {
      const angle = (nodeIndex / Math.max(levelNodes.length, 1)) * 2 * Math.PI;
      const radius = 40 * (compact ? 0.5 : 1);
      return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
    }
    
    const ringRadius = levelRadii[memory.level] * (compact ? 0.5 : 1);
    const angle = (nodeIndex / Math.max(levelNodes.length, 1)) * 2 * Math.PI;
    return { x: centerX + Math.cos(angle) * ringRadius, y: centerY + Math.sin(angle) * ringRadius };
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Controls */}
      {!compact && isAuthenticated && showControls && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md px-3 py-2 rounded-lg border shadow-lg">
            <Button variant={dragMode ? "default" : "outline"} size="sm" onClick={() => setDragMode(!dragMode)} className="gap-2">
              <Hand className="w-4 h-4" />{dragMode ? '拖拽模式' : '查看模式'}</Button>
          </div>
          <div className="flex items-center gap-1 bg-background/90 backdrop-blur-md p-1 rounded-lg border shadow-lg">
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.3, s * 0.9))}><ZoomOut className="w-4 h-4" /></Button>
            <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(3, s * 1.1))}><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={resetView}><RotateCcw className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}

      {!compact && !isAuthenticated && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border">
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
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height}
          className={cn("w-full h-full", isPanning && "cursor-grabbing", !isPanning && "cursor-grab")}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}
        />
      )}
      
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip.visible && tooltip.memory && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }} className="absolute z-30 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}>
            <div className="bg-card/95 backdrop-blur-md border rounded-lg shadow-xl p-3 min-w-[200px] max-w-[280px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: levelColors[tooltip.memory.level] }} />
                <span className="text-xs font-medium text-muted-foreground">{levelNames[tooltip.memory.level]}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full ml-auto">{(tooltip.memory.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-sm font-medium mb-1 line-clamp-2">{tooltip.memory.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{tooltip.memory.content.substring(0, 80)}...</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(tooltip.memory.created).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                {tooltip.memory.connections.length > 0 && <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{tooltip.memory.connections.length} 关联</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Legend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 flex flex-wrap gap-3 bg-background/90 backdrop-blur-md p-3 rounded-lg border shadow-lg">
        {[
          { level: 'L4', label: '核心', color: levelColors.L4 },
          { level: 'L3', label: '语义', color: levelColors.L3 },
          { level: 'L2', label: '程序', color: levelColors.L2 },
          { level: 'L1', label: '情景', color: levelColors.L1 },
        ].map(({ level, label, color }) => (
          <div key={level} className="flex items-center gap-2">
            <motion.div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} whileHover={{ scale: 1.3 }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Detail Drawer */}
      <Drawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          {selectedMemory && (
            <>
              <DrawerHeader className="border-b pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: levelColors[selectedMemory.level], boxShadow: `0 0 12px ${levelColors[selectedMemory.level]}` }} />
                  <span className="text-sm font-medium text-muted-foreground">{levelNames[selectedMemory.level]}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">置信度 {(selectedMemory.confidence * 100).toFixed(0)}%</span>
                </div>
                <DrawerTitle className="text-xl">{selectedMemory.title}</DrawerTitle>
                <DrawerDescription className="text-sm text-muted-foreground">ID: {selectedMemory.id}</DrawerDescription>
              </DrawerHeader>
              
              <div className="px-6 py-4 space-y-6 overflow-y-auto">
                <section>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-muted-foreground" />详细内容</h4>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed">{selectedMemory.content}</div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" /> 分类</span><p className="text-sm font-medium">{selectedMemory.category}</p></div>
                  <div className="space-y-1"><span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> 创建时间</span><p className="text-sm font-medium">{new Date(selectedMemory.created).toLocaleString('zh-CN')}</p></div>
                  {selectedMemory.reviewed && <div className="space-y-1"><span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3" /> 上次审阅</span><p className="text-sm font-medium">{new Date(selectedMemory.reviewed).toLocaleString('zh-CN')}</p></div>}
                </section>

                {connectedMemories.length > 0 && (
                  <section>
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3"><Link2 className="w-4 h-4 text-muted-foreground" />关联记忆 ({connectedMemories.length})</h4>
                    <div className="space-y-2">
                      {connectedMemories.map(memory => (
                        <div key={memory.id} onClick={() => setSelectedMemory(memory.id)}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: levelColors[memory.level] }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{memory.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{memory.content.substring(0, 60)}...</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <DrawerFooter className="border-t pt-4 flex-row gap-3">
                {isAuthenticated && selectedMemory.level !== 'L4' && (
                  <Button variant="outline" className="gap-2 flex-1" onClick={() => setElevateDialogOpen(true)}><ArrowUpCircle className="w-4 h-4" />提升层级</Button>
                )}
                {isAuthenticated && <Button variant="outline" className="gap-2 flex-1" onClick={() => setReviewDialogOpen(true)}><CheckCircle className="w-4 h-4" />确认审阅</Button>}
                <DrawerClose asChild><Button variant="default" className="flex-1">关闭</Button></DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Dialog open={elevateDialogOpen} onOpenChange={setElevateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowUpCircle className="w-5 h-5 text-primary" />提升记忆层级</DialogTitle>
            <DialogDescription>确定要将此记忆升级吗？</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setElevateDialogOpen(false)}>取消</Button>
            <Button onClick={handleElevate} className="gap-2"><ArrowUpCircle className="w-4 h-4" />确认提升</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" />确认审阅记忆</DialogTitle>
            <DialogDescription>标记此记忆为已审阅状态</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirmReview} className="gap-2 bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4" />确认审阅</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
