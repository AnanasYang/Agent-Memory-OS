'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Bot, Search, Loader2 } from 'lucide-react';

interface L0Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface L0MemoryListProps {
  compact?: boolean;
}

export function L0MemoryList({ compact = false }: L0MemoryListProps) {
  const [filter, setFilter] = useState<'all' | 'user' | 'assistant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<L0Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 API 获取真实 L0 数据
  useEffect(() => {
    const fetchL0Data = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/l0-memories');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch L0 memories: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 转换 API 返回的数据格式
        let messages: L0Message[] = [];
        
        if (data.messages && Array.isArray(data.messages)) {
          messages = data.messages.map((msg: any, index: number) => ({
            id: msg.id || `msg-${index}`,
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content || '',
            timestamp: msg.timestamp || new Date().toISOString()
          }));
        } else if (data.memories && Array.isArray(data.memories)) {
          messages = data.memories.map((mem: any, index: number) => ({
            id: mem.id || `mem-${index}`,
            role: mem.role || 'assistant',
            content: mem.content || mem.preview || '',
            timestamp: mem.timestamp || new Date().toISOString()
          }));
        }
        
        setMemories(messages);
      } catch (err) {
        console.error('Failed to fetch L0 memories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load L0 memories');
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchL0Data();
    
    // 每 30 秒刷新一次
    const interval = setInterval(fetchL0Data, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredMemories = memories.filter(m => {
    if (filter !== 'all' && m.role !== filter) return false;
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-500">加载 L0 工作记忆...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <p className="text-sm text-red-500">加载失败: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <MessageSquare className="w-8 h-8 text-gray-300" />
        <p className="text-sm text-gray-500">暂无 L0 工作记忆</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 筛选器 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {(['all', 'user', 'assistant'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filter === type 
                  ? 'bg-white dark:bg-slate-600 shadow-sm' 
                  : 'text-gray-500'
              }`}
            >
              {type === 'all' ? '全部' : type === 'user' ? '用户' : 'AI'}
            </button>
          ))}
        </div>
        
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="搜索消息..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 消息列表 */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredMemories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border ${
              memory.role === 'user'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`p-1.5 rounded-full mt-0.5 ${
                memory.role === 'user'
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-purple-100 dark:bg-purple-900/30'
              }`}>
                {memory.role === 'user' ? (
                  <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Bot className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
                  {memory.content}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {memory.timestamp}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <p className="text-center text-xs text-gray-500 py-4">
          没有匹配的消息
        </p>
      )}
    </div>
  );
}
