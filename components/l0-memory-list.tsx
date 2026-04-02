'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Zap,
  Filter,
  Bot,
  X
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
  
  // 消息筛选状态
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'assistant'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch L0 memories on mount
  useEffect(() => {
    fetchL0Memories();
  }, [fetchL0Memories]);

  // 使用文件监听自动刷新
  const { connected: watcherConnected } = useFileWatcher({
    onFileChange: (event) => {
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
    setRoleFilter('all'); // 重置筛选
    setSearchQuery('');
    
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

  // 筛选消息
  const filteredMessages = useMemo(() => {
    if (!sessionDetail?.messages) return [];
    
    return sessionDetail.messages.filter(msg => {
      const matchesRole = roleFilter === 'all' || msg.role === roleFilter;
      const matchesSearch = !searchQuery || 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [sessionDetail?.messages, roleFilter, searchQuery]);

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
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg truncate">
                  与 {selectedSession?.userName || '未知用户'} 的会话
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedSession && formatTime(selectedSession.timestamp)} · {selectedSession?.messageCount} 条消息 · {getChannelIcon(selectedSession?.channel || '')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Filter Bar */}
          {sessionDetail && (
            <div className="px-6 py-3 border-b bg-muted/30">
              <div className="flex flex-wrap items-center gap-3">
                {/* Role Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">筛选:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRoleFilter('all')}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full transition-colors",
                        roleFilter === 'all'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      全部
                    </button>
                    <button
                      onClick={() => setRoleFilter('user')}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1",
                        roleFilter === 'user'
                          ? "bg-blue-500 text-white"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <User className="w-3 h-3" />
                      用户
                    </button>
                    <button
                      onClick={() => setRoleFilter('assistant')}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1",
                        roleFilter === 'assistant'
                          ? "bg-purple-500 text-white"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <Bot className="w-3 h-3" />
                      AI
                    </button>
                  </div>
                </div>
                
                {/* Search */}
                <div className="flex-1 min-w-[150px]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜索消息内容..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <MessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Message Count */}
                <span className="text-xs text-muted-foreground">
                  {filteredMessages.length} / {sessionDetail.messages.length} 条
                </span>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[50vh]">
            <div className="p-6 space-y-4">
              {/* Loading state */}
              {isLoadingDetail && (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">正在加载会话详情...</span>
                </div>
              )}

              {/* Messages */}
              {!isLoadingDetail && filteredMessages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
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
                    "flex-1 p-3 rounded-lg text-sm max-w-[85%]",
                    msg.role === 'user'
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : "bg-muted border border-border"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString('zh-CN')}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Empty state */}
              {!isLoadingDetail && filteredMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {searchQuery || roleFilter !== 'all' 
                      ? '没有匹配的消息' 
                      : '暂无消息记录'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
