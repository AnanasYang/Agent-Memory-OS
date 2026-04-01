'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Brain, Target, X } from 'lucide-react';
import { useMemoryStore } from '@/lib/store';
import { MemoryNode, IntentNode } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const levelColors = {
  L0: 'bg-blue-500',
  L1: 'bg-cyan-400',
  L2: 'bg-amber-400',
  L3: 'bg-pink-400',
  L4: 'bg-violet-400',
};

const typeColors = {
  'short-term': 'bg-emerald-400',
  'mid-term': 'bg-blue-400',
  'long-term': 'bg-red-400',
};

export function GlobalSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'memory' | 'intent'>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const { memories, intents } = useMemoryStore();

  const results = useMemo(() => {
    const searchQuery = query.toLowerCase();
    
    const memoryResults = memories.filter(m => {
      const matchesQuery = !searchQuery || 
        m.content.toLowerCase().includes(searchQuery) ||
        m.category.toLowerCase().includes(searchQuery) ||
        m.id.toLowerCase().includes(searchQuery);
      const matchesLevel = filterLevel === 'all' || m.level === filterLevel;
      return matchesQuery && matchesLevel && (filterType === 'all' || filterType === 'memory');
    });

    const intentResults = intents.filter(i => {
      const matchesQuery = !searchQuery || 
        i.title.toLowerCase().includes(searchQuery) ||
        i.description?.toLowerCase().includes(searchQuery) ||
        i.tags?.some(t => t.toLowerCase().includes(searchQuery));
      return matchesQuery && (filterType === 'all' || filterType === 'intent');
    });

    return {
      memories: memoryResults,
      intents: intentResults,
    };
  }, [query, memories, intents, filterType, filterLevel]);

  const categories = useMemo(() => {
    const cats = new Set(memories.map(m => m.category));
    return Array.from(cats);
  }, [memories]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search memories, intents, patterns..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Type:</span>
          <div className="flex gap-1">
            {(['all', 'memory', 'intent'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-colors",
                  filterType === type 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {(filterType === 'all' || filterType === 'memory') && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Level:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-1 text-sm bg-muted rounded-full border-0 focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Levels</option>
              <option value="L4">L4 - Core</option>
              <option value="L3">L3 - Semantic</option>
              <option value="L2">L2 - Procedural</option>
              <option value="L1">L1 - Episodic</option>
              <option value="L0">L0 - State</option>
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Memory Results */}
        {(filterType === 'all' || filterType === 'memory') && results.memories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Memories ({results.memories.length})
            </h3>
            <div className="grid gap-2">
              <AnimatePresence>
                {results.memories.map((memory) => (
                  <MemoryResultCard key={memory.id} memory={memory} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Intent Results */}
        {(filterType === 'all' || filterType === 'intent') && results.intents.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Intents ({results.intents.length})
            </h3>
            <div className="grid gap-2">
              <AnimatePresence>
                {results.intents.map((intent) => (
                  <IntentResultCard key={intent.id} intent={intent} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* No Results */}
        {query && results.memories.length === 0 && results.intents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No results found for &quot;{query}&quot;</p>
            <p className="text-sm mt-1">Try different keywords or filters</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {!query && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">{memories.length}</p>
            <p className="text-sm text-muted-foreground">Total Memories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{intents.length}</p>
            <p className="text-sm text-muted-foreground">Active Intents</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {memories.filter(m => m.level === 'L4').length}
            </p>
            <p className="text-sm text-muted-foreground">Core Values</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryResultCard({ memory }: { memory: MemoryNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Link
        href={`/memory/${memory.id}`}
        className="flex items-start gap-3 p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors"
      >
        <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0", levelColors[memory.level])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{memory.content}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{memory.level}</span>
            <span>•</span>
            <span className="capitalize">{memory.category}</span>
            <span>•</span>
            <span>{(memory.confidence * 100).toFixed(0)}% confidence</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function IntentResultCard({ intent }: { intent: IntentNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Link
        href="/intent"
        className="flex items-start gap-3 p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors"
      >
        <div className={cn("w-3 h-3 rounded-full mt-1.5 flex-shrink-0", typeColors[intent.type])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{intent.title}</p>
          {intent.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{intent.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="capitalize">{intent.type.replace('-', ' ')}</span>
            <span>•</span>
            <span>{(intent.progress * 100).toFixed(0)}% complete</span>
            {intent.priority && (
              <>
                <span>•</span>
                <span className={cn(
                  intent.priority === 'high' ? "text-red-500" :
                  intent.priority === 'medium' ? "text-yellow-500" :
                  "text-green-500"
                )}>
                  {intent.priority}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
