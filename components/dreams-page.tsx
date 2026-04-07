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
  Loader2,
  ListTodo,
  Target,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface WeeklyReview {
  id: string;
  week: string;
  date: string;
  l1Count: number;
  l2Candidates: number;
  actions: string[];
  content: string;
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

interface ReviewDetail extends WeeklyReview {
  stats?: {
    totalFiles: number;
    newThisWeek: number;
    archived: number;
  };
}

export function DreamsPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  
  // Daily Dreams state
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoadingDreams, setIsLoadingDreams] = useState(true);
  const [dreamsError, setDreamsError] = useState<string | null>(null);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [dreamDetail, setDreamDetail] = useState<DreamDetail | null>(null);
  const [isLoadingDreamDetail, setIsLoadingDreamDetail] = useState(false);
  
  // Weekly Reviews state
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<WeeklyReview | null>(null);
  const [reviewDetail, setReviewDetail] = useState<ReviewDetail | null>(null);
  const [isLoadingReviewDetail, setIsLoadingReviewDetail] = useState(false);

  const fetchDreams = async () => {
    setIsLoadingDreams(true);
    setDreamsError(null);
    
    try {
      const response = await fetch('/api/dreams?type=daily&limit=30');
      if (!response.ok) throw new Error('Failed to fetch dreams');
      
      const data = await response.json();
      setDreams(data.dreams || []);
    } catch (err) {
      setDreamsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingDreams(false);
    }
  };

  const fetchDreamDetail = async (dream: Dream) => {
    setSelectedDream(dream);
    setIsLoadingDreamDetail(true);
    
    try {
      const response = await fetch(`/api/dreams?type=daily&date=${dream.date}`);
      if (!response.ok) throw new Error('Failed to fetch detail');
      
      const data = await response.json();
      setDreamDetail(data);
    } catch (err) {
      console.error('Failed to load dream detail:', err);
    } finally {
      setIsLoadingDreamDetail(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    setReviewsError(null);
    
    try {
      const response = await fetch('/api/dreams?type=weekly&limit=30');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchReviewDetail = async (review: WeeklyReview) => {
    setSelectedReview(review);
    setIsLoadingReviewDetail(true);
    
    try {
      const response = await fetch(`/api/dreams?type=weekly&date=${review.date}`);
      if (!response.ok) throw new Error('Failed to fetch review detail');
      
      const data = await response.json();
      setReviewDetail(data);
    } catch (err) {
      console.error('Failed to load review detail:', err);
      // Still show basic review info even if detail fetch fails
      setReviewDetail(review as ReviewDetail);
    } finally {
      setIsLoadingReviewDetail(false);
    }
  };

  const refreshAll = () => {
    fetchDreams();
    fetchReviews();
  };

  useEffect(() => {
    fetchDreams();
    fetchReviews();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (language === 'zh') {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
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

  const getWeekNumber = (weekStr: string) => {
    const match = weekStr.match(/W(\d+)/);
    return match ? match[1] : weekStr;
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
            {language === 'zh' ? '梦境与复盘' : 'Dreams & Reviews'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'zh' 
              ? '每日梦境回顾与每周系统复盘' 
              : 'Daily dreams and weekly system reviews'}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshAll}
          disabled={isLoadingDreams || isLoadingReviews}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", (isLoadingDreams || isLoadingReviews) && "animate-spin")} />
          {language === 'zh' ? '刷新' : 'Refresh'}
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as 'daily' | 'weekly')}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            {language === 'zh' ? '每日梦境' : 'Daily Dreams'}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {language === 'zh' ? '每周复盘' : 'Weekly Reviews'}
          </TabsTrigger>
        </TabsList>

        {/* Daily Dreams Tab */}
        <TabsContent value="daily" className="space-y-6">
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="bg-card border rounded-lg p-4">
              <p className="text-2xl font-bold">{dreams.length}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '总梦境数' : 'Total Dreams'}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-2xl font-bold">
                {dreams.reduce((sum, d) => sum + d.l1Count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? 'L1 记忆' : 'L1 Memories'}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-2xl font-bold">
                {dreams.reduce((sum, d) => sum + d.sessionCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '会话数' : 'Sessions'}
              </p>
            </div>
          </motion.div>

          {/* Error State */}
          {dreamsError && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{dreamsError}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoadingDreams && dreams.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>{language === 'zh' ? '加载中...' : 'Loading...'}</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingDreams && dreams.length === 0 && !dreamsError && (
            <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
              <Moon className="w-16 h-16 opacity-30" />
              <p className="text-lg font-medium">
                {language === 'zh' ? '暂无梦境' : 'No Dreams Yet'}
              </p>
              <p className="text-sm">
                {language === 'zh' 
                  ? '等待生成第一条每日梦境' 
                  : 'Waiting for the first daily dream'}
              </p>
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
                            {dream.sessionCount} {language === 'zh' ? '会话' : 'sessions'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            {dream.l1Count} L1
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
        </TabsContent>

        {/* Weekly Reviews Tab */}
        <TabsContent value="weekly" className="space-y-6">
          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-4"
          >
            <div className="bg-card border rounded-lg p-4">
              <p className="text-2xl font-bold">{reviews.length}</p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '总复盘数' : 'Total Reviews'}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-2xl font-bold">
                {reviews.reduce((sum, r) => sum + r.l1Count, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '累计 L1' : 'Total L1'}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-2xl font-bold">
                {reviews.reduce((sum, r) => sum + r.l2Candidates, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? 'L2 候选' : 'L2 Candidates'}
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <p className="text-2xl font-bold">
                {reviews.reduce((sum, r) => sum + r.actions.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'zh' ? '行动项' : 'Actions'}
              </p>
            </div>
          </motion.div>

          {/* Error State */}
          {reviewsError && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{reviewsError}</span>
            </div>
          )}

          {/* Loading State */}
          {isLoadingReviews && reviews.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>{language === 'zh' ? '加载中...' : 'Loading...'}</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingReviews && reviews.length === 0 && !reviewsError && (
            <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 opacity-30" />
              <p className="text-lg font-medium">
                {language === 'zh' ? '暂无复盘' : 'No Reviews Yet'}
              </p>
              <p className="text-sm">
                {language === 'zh' 
                  ? '等待生成第一条周复盘' 
                  : 'Waiting for the first weekly review'}
              </p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => fetchReviewDetail(review)}
                  className="group bg-card border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-400">
                          {getWeekNumber(review.week)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(review.date)}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                            {review.week}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            {review.l1Count} L1
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {review.l2Candidates} L2 {language === 'zh' ? '候选' : 'candidates'}
                          </span>
                          <span className="flex items-center gap-1">
                            <ListTodo className="w-3 h-3" />
                            {review.actions.length} {language === 'zh' ? '行动项' : 'actions'}
                          </span>
                        </div>
                        
                        {/* Preview of actions */}
                        {review.actions.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                            {review.actions.slice(0, 2).join(' • ')}
                            {review.actions.length > 2 && ` +${review.actions.length - 2} more`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dream Detail Dialog */}
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
              {language === 'zh' ? '由 AI 自动生成的每日回顾' : 'AI-generated daily review'}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] space-y-6 py-4">
            {isLoadingDreamDetail ? (
              <div className="flex flex-col items-center gap-4 py-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>{language === 'zh' ? '加载中...' : 'Loading...'}</span>
              </div>
            ) : dreamDetail ? (
              <>
                {/* Summary */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="font-medium text-purple-400 mb-2">
                    {language === 'zh' ? '摘要' : 'Summary'}
                  </h3>
                  <p className="text-sm">{dreamDetail.insights?.summary || (language === 'zh' ? '无摘要' : 'No summary')}</p>
                </div>

                {/* Key Events */}
                {dreamDetail.insights?.keyEvents?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">
                      {language === 'zh' ? '关键事件' : 'Key Events'}
                    </h3>
                    <div className="space-y-2">
                      {dreamDetail.insights.keyEvents.map((event, i) => (
                        <div 
                          key={i}
                          className="p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{event.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {language === 'zh' ? '重要性' : 'Importance'}: {event.importance}/10
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
                    <h3 className="font-medium mb-3">
                      {language === 'zh' ? '行为模式' : 'Patterns'}
                    </h3>
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
                    <p className="text-xs text-muted-foreground">
                      {language === 'zh' ? '会话数' : 'Sessions'}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dreamDetail.l1Memories?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'zh' ? 'L1 记忆' : 'L1 Memories'}
                    </p>
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

      {/* Review Detail Dialog */}
      <Dialog 
        open={!!selectedReview} 
        onOpenChange={() => {
          setSelectedReview(null);
          setReviewDetail(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              {selectedReview?.week} {language === 'zh' ? '周复盘' : 'Weekly Review'}
            </DialogTitle>
            <DialogDescription>
              {selectedReview && formatDate(selectedReview.date)}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] space-y-6 py-4">
            {isLoadingReviewDetail ? (
              <div className="flex flex-col items-center gap-4 py-8 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>{language === 'zh' ? '加载中...' : 'Loading...'}</span>
              </div>
            ) : reviewDetail ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400">{reviewDetail.l1Count}</p>
                    <p className="text-xs text-muted-foreground mt-1">L1 {language === 'zh' ? '记忆' : 'Memories'}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{reviewDetail.l2Candidates}</p>
                    <p className="text-xs text-muted-foreground mt-1">L2 {language === 'zh' ? '候选' : 'Candidates'}</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-orange-400">{reviewDetail.actions.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">{language === 'zh' ? '行动项' : 'Actions'}</p>
                  </div>
                </div>

                {/* Action Items */}
                {reviewDetail.actions.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <ListTodo className="w-4 h-4" />
                      {language === 'zh' ? '行动清单' : 'Action Items'}
                    </h3>
                    <div className="space-y-2">
                      {reviewDetail.actions.map((action, i) => (
                        <div 
                          key={i}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded border border-muted-foreground/30 flex items-center justify-center mt-0.5">
                            <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/50" />
                          </div>
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                {reviewDetail.content && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {language === 'zh' ? '复盘内容' : 'Review Content'}
                    </h3>
                    <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                        {reviewDetail.content.length > 1000 
                          ? reviewDetail.content.substring(0, 1000) + '\n\n...' 
                          : reviewDetail.content}
                      </pre>
                    </div>
                  </div>
                )}
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
