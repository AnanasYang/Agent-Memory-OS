'use client';

import { useMemo } from 'react';
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
  Download
} from 'lucide-react';
import { useMemoryStore } from '@/lib/store';
import { memoryNodes, intentNodes } from '@/lib/data';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'pattern' | 'conflict' | 'growth' | 'deviation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
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
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insights & Analytics</h2>
          <p className="text-muted-foreground">Auto-detected patterns and recommendations</p>
        </div>
        <button
          onClick={exportInsights}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard
          icon={<Brain className="w-4 h-4" />}
          label="Memory Health"
          value="Good"
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

      {/* Insights List */}
      <div className="grid gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-lg border bg-card",
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
