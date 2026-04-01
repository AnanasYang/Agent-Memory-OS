'use client';

import { useMemoryStore } from '@/lib/store';
import { useLanguage } from '@/components/language-provider';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Brain, 
  Calendar, 
  Hash, 
  Link2, 
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const levelColors = {
  L0: 'bg-blue-500',
  L1: 'bg-cyan-400',
  L2: 'bg-amber-400',
  L3: 'bg-pink-400',
  L4: 'bg-violet-400',
};

const levelDescriptions: Record<string, string> = {
  L0: 'memory.l0Desc',
  L1: 'memory.l1LongDesc',
  L2: 'memory.l2LongDesc',
  L3: 'memory.l3LongDesc',
  L4: 'memory.l4LongDesc',
};

// Stable date formatter that produces same output on server and client
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function MemoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { getMemoryById, memories } = useMemoryStore();
  const { t } = useLanguage();
  const memory = id ? getMemoryById(id) : undefined;

  if (!memory) {
    notFound();
  }

  const connectedMemories = memory.connections
    .map(connId => memories.find(m => m.id === connId))
    .filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/memory" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('memory.back')}
      </Link>

      {/* Memory Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border rounded-lg p-6"
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0",
            levelColors[memory.level],
            "shadow-lg"
          )}>
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                "bg-primary/10 text-primary"
              )}>
                {memory.level}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(levelDescriptions[memory.level])}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2">{memory.content}</h1>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                {memory.category}
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                {(memory.confidence * 100).toFixed(0)}% {t('memory.confidence')}
              </span>
              <span className="flex items-center gap-1" suppressHydrationWarning>
                <Clock className="w-4 h-4" />
                {t('memory.created')} {formatDate(memory.created)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Memory Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{t('memory.created')}</span>
          </div>
          <p className="font-medium" suppressHydrationWarning>{formatDate(memory.created)}</p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            {formatTime(memory.created)}
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">{t('memory.updated')}</span>
          </div>
          <p className="font-medium" suppressHydrationWarning>{formatDate(memory.updated)}</p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            {formatTime(memory.updated)}
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Link2 className="w-4 h-4" />
            <span className="text-xs">{t('memory.connections')}</span>
          </div>
          <p className="font-medium">{memory.connections.length}</p>
          <p className="text-xs text-muted-foreground">
            {t('memory.linkedMemories')}
          </p>
        </div>
      </motion.div>

      {/* Sources */}
      {memory.sources.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-6"
        >
          <h2 className="font-semibold mb-4">{t('memory.sources')}</h2>
          <div className="flex flex-wrap gap-2">
            {memory.sources.map((source, i) => (
              <span 
                key={i}
                className="px-3 py-1 bg-muted rounded-full text-sm"
              >
                {source}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Connected Memories */}
      {connectedMemories.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg p-6"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {t('memory.connectedMemories')}
          </h2>
          <div className="grid gap-2">
            {connectedMemories.map(conn => conn && (
              <Link
                key={conn.id}
                href={`/memory/${conn.id}`}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className={cn("w-3 h-3 rounded-full", levelColors[conn.level])} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{conn.content}</p>
                  <p className="text-xs text-muted-foreground">{conn.level} • {conn.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
