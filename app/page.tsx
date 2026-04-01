'use client';

import { motion } from 'framer-motion';
import { MemoryGalaxy } from '@/components/memory-galaxy';
import { IntentOrbit } from '@/components/intent-orbit';
import { StatusStream } from '@/components/status-stream';
import { useLanguage } from '@/components/language-provider';
import { 
  Brain, 
  Target, 
  Activity, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Memory OS</h1>
          <p className="text-muted-foreground">{t('nav.dashboard')}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span>系统运行中</span>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Galaxy Preview */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-lg overflow-hidden"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-memory-l4" />
              <h2 className="font-semibold">{t('nav.memory')}</h2>
            </div>
            <Link 
              href="/memory" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-80">
            <MemoryGalaxy compact />
          </div>
        </motion.div>

        {/* Intent Orbit Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg overflow-hidden"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-intent-mid" />
              <h2 className="font-semibold">{t('nav.intent')}</h2>
            </div>
            <Link 
              href="/intent" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            <IntentOrbit compact />
          </div>
        </motion.div>

        {/* Status Stream */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-lg overflow-hidden"
        >
          <div className="p-4 border-b flex items-center gap-2">
            <Activity className="w-5 h-5 text-memory-l1" />
            <h2 className="font-semibold">{t('dashboard.status')}</h2>
          </div>
          <div className="p-4">
            <StatusStream />
          </div>
        </motion.div>

        {/* Evolution Timeline Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-lg overflow-hidden"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold">{t('nav.timeline')}</h2>
            </div>
            <Link 
              href="/timeline" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">活动总数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">+23%</p>
                <p className="text-sm text-muted-foreground">较上月</p>
              </div>
            </div>
            <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground">
              <Link href="/timeline" className="hover:text-primary transition-colors">
                {t('common.viewAll')} →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-memory-l4/10 to-memory-l2/10 border rounded-lg p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{t('dashboard.healthTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.healthDesc')}
            </p>
            <div className="flex gap-3 mt-3">
              <Link 
                href="/insights" 
                className="text-sm text-primary hover:underline"
              >
                {t('dashboard.viewInsights')} →
              </Link>
              <Link 
                href="/search" 
                className="text-sm text-primary hover:underline"
              >
                {t('dashboard.searchMemories')} →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
