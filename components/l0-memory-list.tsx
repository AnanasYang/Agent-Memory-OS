'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemoryStore } from '@/lib/store';
import { L0Memory, SessionMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useFileWatcher } from '@/lib/hooks/useFileWatcher';
import { 
  MessageSquare, 
  Clock, 
  User, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface L0MemoryListProps {
  className?: string;
  compact?: boolean;
}

export function L0MemoryList({ className, compact = false }: L0MemoryListProps) {
  const { 
    l0Memories, 
    isLoadingL0, 
    l0Error, 
    fetchL0Memories,
    fetchL0SessionDetail 
  } = useMemoryStore();
  
  const [selectedSession, setSelectedSession] = useState<L0Memory | null>(null);
  const [sessionDetail, setSessionDetail] = useState<{
    messages: SessionMessage[];
    summary: string;
    displayName: string;
    channel: string;
  } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch L0 memories on mount
  useEffect(() => {
    fetchL0Memories();
  }, [fetchL0Memories]);

  // 使用文件监听自动刷新
  const { connected: watcherConnected, lastEvent } = useFileWatcher({
    onFileChange: (event) => {
      // 当 L0 层有新文件时自动刷新
      if (event.level === 'L0' && autoRefresh) {
        console.log('[L0MemoryList] Detected L0 file change, refreshing...');
        fetchL0Memories();
      }
    },
  });

  const handleSessionClick = async (session: L0Memory) => {
    setSelectedSession(session);
    setDialogOpen(true);
    setIsLoadingDetail(true);
    
    const detail = await fetchL0SessionDetail(session.sessionId);
    
    if (detail) {
      setSessionDetail({
        messages: detail.messages,
        summary: detail.summary,
        displayName: session.userName,
        channel: session.channel
      });
    }
    
    setIsLoadingDetail(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, string> = {
      feishu: '飞书',
      telegram: 'Telegram',
      discord: 'Discord',
      webchat: 'Web',
      slack: 'Slack'
    };
    return icons[channel?.toLowerCase()] || channel;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">工作记忆 (L0)</span>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
            {l0Memories.length}
          </span>
          {watcherConnected && autoRefresh && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
              <Zap className="w-3 h-3" />
              实时
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "text-xs",
              autoRefresh ? "text-green-600" : "text-gray-400"
            )}
          >
            {autoRefresh ? "自动" : "手动"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchL0Memories}
            disabled={isLoadingL0}
          >
            <RefreshCw className={cn("w-3 h-3", isLoadingL0 && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {l0Error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{l0Error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoadingL0 && l0Memories.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">正在加载会话...</span>
        </div>
      )}

      {/* Empty state */}
      {!isLoadingL0 && l0Memories.length === 0 && !l0Error && (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <MessageSquare className="w-8 h-8 opacity-50" />
          <span className="text-sm">暂无会话记录</span>
        </div>
      )}

      {/* Session list */}
      <AnimatePresence mode="popLayout">
        {l0Memories.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => handleSessionClick(session)}
            className={cn(
              "group p-3 bg-card/50 hover:bg-card border border-border/50 hover:border-border rounded-lg cursor-pointer transition-all",
              compact && "p-2"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {session.userName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 border rounded">
                    {getChannelIcon(session.channel)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {session.preview}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(session.timestamp)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {session.messageCount} 条消息
                  </span>
                </div>
              </div>
              
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Session Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  与 {selectedSession?.userName || '未知用户'} 的会话
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedSession && formatTime(selectedSession.timestamp)} · {selectedSession?.messageCount} 条消息 · {getChannelIcon(selectedSession?.channel || '')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh]">
            <div className="p-6 space-y-4">
              {/* Loading state */}
              {isLoadingDetail && (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">正在加载会话详情...</span>
                </div>
              )}

              {/* Messages */}
              {!isLoadingDetail && sessionDetail?.messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    msg.role === 'user' 
                      ? "bg-blue-500/20 text-blue-400" 
                      : "bg-purple-500/20 text-purple-400"
                  )}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={cn(
                    "flex-1 p-3 rounded-lg text-sm max-w-[80%]",
                    msg.role === 'user'
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : "bg-muted border border-border"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {!isLoadingDetail && (!sessionDetail?.messages || sessionDetail.messages.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">暂无消息记录</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
