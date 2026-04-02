'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Moon, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Brain,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface Dream {
  id: string;
  date: string;
  timestamp: number;
  summary: string;
  sessionCount: number;
  l1Count: number;
  status: 'success' | 'error' | 'running';
}

interface DreamDetail {
  id: string;
  date: string;
  timestamp: number;
  insights: {
    summary: string;
    keyEvents: Array<{
      title: string;
      description: string;
      importance: number;
    }>;
    patterns: string[];
    sentiment: string;
  };
  dataSource: {
    uniqueSessions: number;
  };
  l1Memories: any[];
  markdown?: string;
}

export function DreamsPage() {
  const { t, language } = useLanguage();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [dreamDetail, setDreamDetail] = useState<DreamDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchDreams = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dreams?limit=30');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setDreams(data.dreams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDreamDetail = async (dream: Dream) => {
    setSelectedDream(dream);
    setIsLoadingDetail(true);
    
    try {
      const response = await fetch(`/api/dreams?date=${dream.date}`);
      if (!response.ok) throw new Error('Failed to fetch detail');
      
      const data = await response.json();
      setDreamDetail(data);
    } catch (err) {
      console.error('Failed to load dream detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchDreams();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (language === 'zh') {
      return date.toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getStatusIcon = (status: Dream['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Moon className="w-8 h-8 text-purple-400" />
            {t('dreams.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dreams.subtitle')}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchDreams}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          {t('dreams.refresh')}
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">{dreams.length}</p>
          <p className="text-sm text-muted-foreground">{t('dreams.totalCount')}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">
            {dreams.reduce((sum, d) => sum + d.l1Count, 0)}
          </p>
          <p className="text-sm text-muted-foreground">{t('dreams.l1Count')}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-2xl font-bold">
            {dreams.reduce((sum, d) => sum + d.sessionCount, 0)}
          </p>
          <p className="text-sm text-muted-foreground">{t('dreams.sessionCount')}</p>
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
      {isLoading && dreams.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>{t('dreams.loading')}</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && dreams.length === 0 && !error && (
        <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
          <Moon className="w-16 h-16 opacity-30" />
          <p className="text-lg font-medium">{t('dreams.empty.title')}</p>
          <p className="text-sm">{t('dreams.empty.subtitle')}</p>
        </div>
      )}

      {/* Dreams List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {dreams.map((dream, index) => (
            <motion.div
              key={dream.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => fetchDreamDetail(dream)}
              className="group bg-card border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    {getStatusIcon(dream.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(dream.date)}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {dream.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {dream.sessionCount} {t('dreams.sessions')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {dream.l1Count} {t('dreams.l1Memories')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Dialog */}
      <Dialog 
        open={!!selectedDream} 
        onOpenChange={() => {
          setSelectedDream(null);
          setDreamDetail(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-400" />
              {selectedDream && formatDate(selectedDream.date)} {language === 'zh' ? '的梦境' : ' Dream'}
            </DialogTitle>
            <DialogDescription>
              {t('dreams.generatedBy')}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] space-y-6 py-4">
            {isLoadingDetail ? (
              <div className="flex flex-col items-center gap-4 py-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>{t('common.loading')}</span>
              </div>
            ) : dreamDetail ? (
              <>
                {/* Summary */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-purple-400 mb-2">{t('dreams.summary')}</h3>
                  <p className="text-sm">{dreamDetail.insights?.summary || (language === 'zh' ? '无摘要' : 'No summary')}</p>
                </div>

                {/* Key Events */}
                {dreamDetail.insights?.keyEvents?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">{t('dreams.keyEvents')}</h3>
                    <div className="space-y-2">
                      {dreamDetail.insights.keyEvents.map((event, i) => (
                        <div 
                          key={i}
                          className="p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{event.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {t('dreams.importance')}: {event.importance}/10
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns */}
                {dreamDetail.insights?.patterns?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">{t('dreams.patterns')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {dreamDetail.insights.patterns.map((pattern, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded"
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold">{dreamDetail.dataSource?.uniqueSessions || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('dreams.sessionCount')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dreamDetail.l1Memories?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('dreams.l1Count')}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'zh' ? '无法加载详情' : 'Failed to load details'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
