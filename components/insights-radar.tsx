'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  ArrowUpCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { useMemoryStore } from '@/lib/store';
import { memoryNodes, intentNodes } from '@/lib/data';
import { MemoryNode, IntentNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Insight {
  id: string;
  type: 'pattern' | 'conflict' | 'growth' | 'deviation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
}

// 计算记忆系统健康评分
function calculateHealthScore(memories: MemoryNode[], intents: IntentNode[]): string {
  const l1Count = memories.filter(m => m.level === 'L1').length;
  const l2Count = memories.filter(m => m.level === 'L2').length;
  const l3Count = memories.filter(m => m.level === 'L3').length;
  const l4Count = memories.filter(m => m.level === 'L4').length;
  const total = memories.length;
  
  if (total === 0) return 'N/A';
  
  // 评分算法：L4和L3越多分数越高，L1过多会扣分
  const weightedScore = (l4Count * 4 + l3Count * 3 + l2Count * 2 + l1Count) / Math.max(total, 1);
  const balanceScore = l1Count > (l4Count + l3Count + l2Count) * 3 ? 0.7 : 1;
  const finalScore = (weightedScore / 4) * balanceScore * 100;
  
  if (finalScore >= 80) return 'Excellent';
  if (finalScore >= 60) return 'Good';
  if (finalScore >= 40) return 'Fair';
  return 'Needs Attention';
}

// L2/L3 候选提醒组件
function PromotionCandidates({ memories }: { memories: MemoryNode[] }) {
  const [expanded, setExpanded] = useState(false);
  
  // 找出可能可以晋升的L1记忆（有多个connections且confidence高）
  const l1Candidates = useMemo(() => {
    return memories
      .filter(m => m.level === 'L1')
      .filter(m => m.connections.length >= 2 && m.confidence >= 0.85)
      .slice(0, 3);
  }, [memories]);
  
  // 找出可能可以晋升的L2记忆
  const l2Candidates = useMemo(() => {
    return memories
      .filter(m => m.level === 'L2')
      .filter(m => m.connections.length >= 3 && m.confidence >= 0.9)
      .slice(0, 3);
  }, [memories]);
  
  const allCandidates = [...l1Candidates, ...l2Candidates];
  
  if (allCandidates.length === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-lg p-4"
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <ArrowUpCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-400">晋升候选记忆</h3>
            <p className="text-sm text-muted-foreground">
              {l1Candidates.length > 0 && `${l1Candidates.length} 个L1记忆可能晋升到L2`}
              {l1Candidates.length > 0 && l2Candidates.length > 0 && ' · '}
              {l2Candidates.length > 0 && `${l2Candidates.length} 个L2记忆可能晋升到L3`}
            </p>
          </div>
        </div>
        <ChevronRight className={cn("w-5 h-5 transition-transform", expanded && "rotate-90")} />
      </div>
      
      {expanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-2"
        >
          {allCandidates.map((memory) => (
            <Link
              key={memory.id}
              href={`/memory/${memory.id}`}
              className="flex items-center gap-3 p-3 bg-background/50 rounded-lg hover:bg-background transition-colors"
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                memory.level === 'L1' ? 'bg-cyan-400' : 'bg-amber-400'
              )} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{memory.title}</p>
                <p className="text-xs text-muted-foreground">
                  {memory.level} → {memory.level === 'L1' ? 'L2' : 'L3'} · 
                  {memory.connections.length} 关联 · 
                  {(memory.confidence * 100).toFixed(0)}% 置信度
                </p>
              </div>
              <ArrowUpCircle className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export function InsightsRadar({ className }: { className?: string }) {
  const { memories, intents } = useMemoryStore();

  const insights: Insight[] = useMemo(() => {
    const newInsights: Insight[] = [];
    
    // Pattern detection
    const workMemories = memories.filter(m => m.category === 'work');
    if (workMemories.length > 5) {
      newInsights.push({
        id: 'pattern-1',
        type: 'pattern',
        title: 'Strong Work Focus',
        description: `You have ${workMemories.length} work-related memories, indicating a strong professional focus.`,
        severity: 'info',
        metric: `${workMemories.length} memories`,
        trend: 'up'
      });
    }

    // Research pattern
    const researchMemories = memories.filter(m => m.category === 'research');
    if (researchMemories.length > 3) {
      newInsights.push({
        id: 'pattern-2',
        type: 'pattern',
        title: 'Active Research Mindset',
        description: 'Consistent engagement with AI/tech research topics.',
        severity: 'info',
        metric: `${researchMemories.length} research items`,
        trend: 'up'
      });
    }

    // Goal progress analysis
    const completedGoals = intents.filter(i => i.progress >= 1);
    const inProgressGoals = intents.filter(i => i.progress < 1 && i.progress > 0);
    
    if (completedGoals.length > 0) {
      newInsights.push({
        id: 'growth-1',
        type: 'growth',
        title: 'Goal Achievement',
        description: `${completedGoals.length} goals completed. Keep the momentum going!`,
        severity: 'info',
        metric: `${completedGoals.length}/${intents.length} done`,
        trend: 'up'
      });
    }

    // High priority goals at risk
    const highPriorityPending = intents.filter(
      i => i.priority === 'high' && i.progress < 0.5 && i.deadline
    );
    
    const now = new Date();
    const atRiskGoals = highPriorityPending.filter(i => {
      if (!i.deadline) return false;
      const deadline = new Date(i.deadline);
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil < 30 && daysUntil > 0;
    });

    if (atRiskGoals.length > 0) {
      newInsights.push({
        id: 'deviation-1',
        type: 'deviation',
        title: 'Goals Needing Attention',
        description: `${atRiskGoals.length} high-priority goals have approaching deadlines with < 50% progress.`,
        severity: 'warning',
        metric: `${atRiskGoals.length} at risk`,
        trend: 'down'
      });
    }

    // Memory level balance
    const l1Count = memories.filter(m => m.level === 'L1').length;
    const l4Count = memories.filter(m => m.level === 'L4').length;
    
    if (l1Count > l4Count * 5) {
      newInsights.push({
        id: 'conflict-1',
        type: 'conflict',
        title: 'Memory Consolidation Needed',
        description: 'High ratio of ephemeral to core memories. Consider reviewing and elevating key learnings.',
        severity: 'warning',
        metric: `${l1Count}:${l4Count} ratio`,
        trend: 'stable'
      });
    }

    // Long-term vs short-term balance
    const longTermGoals = intents.filter(i => i.type === 'long-term');
    const shortTermGoals = intents.filter(i => i.type === 'short-term');
    
    if (longTermGoals.length > shortTermGoals.length * 2) {
      newInsights.push({
        id: 'pattern-3',
        type: 'pattern',
        title: 'Vision-Driven Planning',
        description: 'More long-term goals than short-term. Consider breaking down into actionable steps.',
        severity: 'info',
        metric: `${longTermGoals.length} long-term`,
        trend: 'stable'
      });
    }

    return newInsights;
  }, [memories, intents]);

  const exportInsights = () => {
    const markdown = `# Memory OS Insights Report

Generated: ${new Date().toLocaleString()}

## Summary
- Total Memories: ${memories.length}
- Active Intents: ${intents.filter(i => i.progress < 1).length}
- Insights Detected: ${insights.length}

## Insights

${insights.map(i => `
### ${i.title}
**Type:** ${i.type} | **Severity:** ${i.severity}

${i.description}

${i.metric ? `**Metric:** ${i.metric}` : ''}
${i.trend ? `**Trend:** ${i.trend}` : ''}
`).join('\n---\n')}

## Memory Distribution
- L4 (Core): ${memories.filter(m => m.level === 'L4').length}
- L3 (Semantic): ${memories.filter(m => m.level === 'L3').length}
- L2 (Procedural): ${memories.filter(m => m.level === 'L2').length}
- L1 (Episodic): ${memories.filter(m => m.level === 'L1').length}

## Intent Distribution
- Short-term: ${intents.filter(i => i.type === 'short-term').length}
- Mid-term: ${intents.filter(i => i.type === 'mid-term').length}
- Long-term: ${intents.filter(i => i.type === 'long-term').length}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-os-insights-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview - 删除重复标题 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard
          icon={<Brain className="w-4 h-4" />}
          label="Memory Health"
          value={calculateHealthScore(memories, intents)}
          trend="up"
          color="text-memory-l3"
        />
        <OverviewCard
          icon={<Target className="w-4 h-4" />}
          label="Goal Progress"
          value={`${(intents.filter(i => i.progress >= 1).length / intents.length * 100).toFixed(0)}%`}
          trend="up"
          color="text-intent-mid"
        />
        <OverviewCard
          icon={<Zap className="w-4 h-4" />}
          label="Active Patterns"
          value={insights.filter(i => i.type === 'pattern').length.toString()}
          trend="stable"
          color="text-yellow-500"
        />
        <OverviewCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Attention Needed"
          value={insights.filter(i => i.severity !== 'info').length.toString()}
          trend={insights.filter(i => i.severity !== 'info').length > 0 ? 'down' : 'stable'}
          color="text-orange-500"
        />
      </div>

      {/* L2/L3 Promotion Candidates */}
      <PromotionCandidates memories={memories} />

      {/* Insights List */}
      <div className="grid gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-lg border bg-card cursor-pointer hover:border-primary/50 transition-colors",
              insight.severity === 'critical' && "border-red-500/50 bg-red-500/5",
              insight.severity === 'warning' && "border-yellow-500/50 bg-yellow-500/5",
              insight.severity === 'info' && "border-blue-500/50 bg-blue-500/5"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-2 rounded-lg",
                insight.type === 'pattern' && "bg-purple-500/10 text-purple-500",
                insight.type === 'conflict' && "bg-red-500/10 text-red-500",
                insight.type === 'growth' && "bg-green-500/10 text-green-500",
                insight.type === 'deviation' && "bg-orange-500/10 text-orange-500"
              )}>
                {insight.type === 'pattern' && <Brain className="w-5 h-5" />}
                {insight.type === 'conflict' && <AlertTriangle className="w-5 h-5" />}
                {insight.type === 'growth' && <TrendingUp className="w-5 h-5" />}
                {insight.type === 'deviation' && <Target className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{insight.title}</h3>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    insight.severity === 'critical' && "bg-red-500/20 text-red-500",
                    insight.severity === 'warning' && "bg-yellow-500/20 text-yellow-500",
                    insight.severity === 'info' && "bg-blue-500/20 text-blue-500"
                  )}>
                    {insight.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
                
                {(insight.metric || insight.trend) && (
                  <div className="flex items-center gap-4 mt-3">
                    {insight.metric && (
                      <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                        {insight.metric}
                      </span>
                    )}
                    {insight.trend && (
                      <span className={cn(
                        "flex items-center gap-1 text-sm",
                        insight.trend === 'up' && "text-green-500",
                        insight.trend === 'down' && "text-red-500",
                        insight.trend === 'stable' && "text-muted-foreground"
                      )}>
                        {insight.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                        {insight.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
                        {insight.trend === 'stable' && <Minus className="w-4 h-4" />}
                        {insight.trend}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No insights detected yet. Keep building your memory system!</p>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ 
  icon, 
  label, 
  value, 
  trend,
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <p className={cn("text-2xl font-bold", color)}>{value}</p>
        {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
        {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
        {trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
      </div>
    </div>
  );
}
