#!/bin/bash
# fix-problem3-l0.sh - 创建L0页面

cd /home/bruce/.openclaw/workspace/agent-memory-os

echo "🔧 修复问题3：创建L0查看页面"

mkdir -p app/l0

cat > app/l0/page.tsx << 'PAGE'
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/language-provider';
import { 
  Activity, 
  Clock, 
  MessageSquare, 
  RefreshCw,
  AlertCircle,
  Loader2,
  Database,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface L0Session {
  id: string;
  type: 'L0';
  title: string;
  content: string;
  sessionId: string;
  timestamp: number;
  messageCount: number;
  preview: string;
  channel: string;
  userName: string;
}

export default function L0Page() {
  const { t } = useLanguage();
  const [memories, setMemories] = useState<L0Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchL0Memories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/l0-memories');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setMemories(data.memories || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchL0Memories();
    
    // 每30秒自动刷新
    const interval = setInterval(fetchL0Memories, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalMessages = memories.reduce((sum, m) => sum + m.messageCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">{t('l0.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('l0.subtitle')}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchL0Memories}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          {t('common.refresh') || 'Refresh'}
        </Button>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">{t('l0.today')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{totalMessages}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('l0.messages')}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Database className="w-4 h-4" />
            <span className="text-xs">{t('l0.realtime')}</span>
          </div>
          <p className="text-2xl font-bold">{memories.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('l0.sessions')}</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{t('l0.lastUpdated')}</span>
          </div>
          <p className="text-2xl font-bold">
            {lastUpdated ? formatTime(lastUpdated.getTime()) : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {memories.length > 0 ? t('common.live') || 'Live' : t('common.pending') || 'Pending'}
          </p>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-400 mb-1">{t('l0.whatIs')}</h3>
            <p className="text-sm text-muted-foreground">{t('l0.explanation')}</p>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && memories.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && memories.length === 0 && !error && (
        <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
          <Activity className="w-16 h-16 opacity-30" />
          <p className="text-lg font-medium">{t('l0.noData')}</p>
          <p className="text-sm">{t('l0.checkBack')}</p>
        </div>
      )}

      {/* L0 Sessions List */}
      <div className="space-y-3">
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border rounded-lg p-4 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                    L0
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {memory.channel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(memory.timestamp)}
                  </span>
                </div>
                
                <h3 className="font-medium mb-1">{memory.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {memory.preview}
                </p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {memory.messageCount} messages
                  </span>
                  <span className="font-mono text-xs opacity-50">
                    {memory.sessionId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
PAGE

echo "✅ 已创建 app/l0/page.tsx"

# 更新导航，添加L0链接
if ! grep -q "href: '/l0'" components/navigation.tsx; then
  sed -i "/{ href: '\/memory', label: t('nav.memory') },/a\    { href: '/l0', label: 'L0 Stream', icon: Activity }," components/navigation.tsx
  echo "✅ 已添加L0导航链接"
fi

echo "✅ L0页面修复完成"
