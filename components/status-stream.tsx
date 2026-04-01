'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useMemoryStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface StatusItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface Task {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'pending';
  progress: number;
}

export function StatusStream({ className }: { className?: string }) {
  const { systemStatus, memories, intents } = useMemoryStore();
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Memory consolidation', status: 'running', progress: 65 },
    { id: '2', name: 'Intent synchronization', status: 'running', progress: 42 },
    { id: '3', name: 'Pattern analysis', status: 'pending', progress: 0 },
  ]);

  // Simulate real-time status updates
  useEffect(() => {
    const messages = [
      { type: 'info' as const, message: 'Memory node updated: L1-004', icon: <Database className="w-3 h-3" /> },
      { type: 'success' as const, message: 'Intent goal-002 progress: 45%', icon: <CheckCircle2 className="w-3 h-3" /> },
      { type: 'info' as const, message: 'New episodic memory captured', icon: <Activity className="w-3 h-3" /> },
      { type: 'warning' as const, message: 'L1 memory approaching retention limit', icon: <AlertCircle className="w-3 h-3" /> },
      { type: 'info' as const, message: 'Connection graph optimized', icon: <Zap className="w-3 h-3" /> },
    ];

    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const newItem: StatusItem = {
        id: Date.now().toString(),
        type: randomMessage.type,
        message: randomMessage.message,
        timestamp: new Date(),
        icon: randomMessage.icon,
      };
      
      setStatusItems(prev => [newItem, ...prev].slice(0, 8));

      // Update task progress
      setTasks(prev => prev.map(task => {
        if (task.status === 'running') {
          const newProgress = Math.min(task.progress + Math.random() * 5, 100);
          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'running'
          };
        }
        return task;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Database className="w-4 h-4" />}
          label="Memory Nodes"
          value={memories.length.toString()}
          color="text-memory-l2"
        />
        <StatCard 
          icon={<Activity className="w-4 h-4" />}
          label="Active Intents"
          value={intents.filter(i => i.progress < 1).length.toString()}
          color="text-intent-mid"
        />
        <StatCard 
          icon={<Cpu className="w-4 h-4" />}
          label="Active Tasks"
          value={systemStatus.activeTasks.toString()}
          color="text-primary"
        />
        <StatCard 
          icon={<RefreshCw className="w-4 h-4" />}
          label="System Load"
          value={`${(systemStatus.systemLoad * 100).toFixed(0)}%`}
          color={systemStatus.systemLoad > 0.7 ? "text-red-500" : "text-green-500"}
        />
      </div>

      {/* Active Tasks */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Active Processes
        </h3>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {task.status === 'running' && (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  )}
                  {task.status === 'completed' && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                  {task.status === 'pending' && (
                    <Clock className="w-3 h-3 text-muted-foreground" />
                  )}
                  {task.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {task.progress.toFixed(0)}%
                </span>
              </div>
              <div className="bg-muted rounded-full h-1.5">
                <motion.div 
                  className={cn(
                    "h-1.5 rounded-full",
                    task.status === 'completed' ? "bg-green-500" :
                    task.status === 'running' ? "bg-blue-500" :
                    "bg-muted-foreground"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Stream */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-memory-l1" />
          Live Activity
        </h3>
        <div className="space-y-2 max-h-48 overflow-hidden">
          <AnimatePresence initial={false}>
            {statusItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "flex items-center gap-3 p-2 rounded text-sm",
                  item.type === 'info' && "bg-blue-500/10",
                  item.type === 'success' && "bg-green-500/10",
                  item.type === 'warning' && "bg-yellow-500/10",
                  item.type === 'error' && "bg-red-500/10"
                )}
              >
                <span className={cn(
                  item.type === 'info' && "text-blue-500",
                  item.type === 'success' && "text-green-500",
                  item.type === 'warning' && "text-yellow-500",
                  item.type === 'error' && "text-red-500"
                )}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.message}</span>
                <span className="text-xs text-muted-foreground">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}
