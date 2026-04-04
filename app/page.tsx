'use client';

import { motion } from 'framer-motion';
import { MemoryGalaxy } from '@/components/memory-galaxy';
import { IntentOrbit } from '@/components/intent-orbit';
import { StatusStream } from '@/components/status-stream';
import { L0MemoryList } from '@/components/l0-memory-list';
import { useLanguage } from '@/components/language-provider';
import { 
  Brain, 
  Target, 
  Activity, 
  ArrowRight,
  Sparkles,
  MessageSquare,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold gradient-text"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Memory OS
          </motion.h1>
          <p className="text-muted-foreground mt-1">{t('nav.dashboard')}</p>
        </div>
        <motion.div 
          className="hidden md:flex items-center gap-2 text-sm text-muted-foreground glass-card px-4 py-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-memory-l4" />
          </motion.div>
          <span>系统运行中</span>
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Galaxy Preview */}
        <motion.div 
          variants={itemVariants}
          className="glass-card-hover overflow-hidden group"
        >
          <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-memory-l4/10">
                <Brain className="w-5 h-5 text-memory-l4" />
              </div>
              <h2 className="font-semibold text-lg">{t('nav.memory')}</h2>
            </div>
            <Link 
              href="/memory" 
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group/link"
            >
              {t('common.viewAll')} 
              <motion.span
                className="inline-block"
                whileHover={{ x: 4 }}
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </motion.span>
            </Link>
          </div>
          <div className="h-72 sm:h-80">
            <MemoryGalaxy compact />
          </div>
        </motion.div>

        {/* Intent Orbit Preview */}
        <motion.div 
          variants={itemVariants}
          className="glass-card-hover overflow-hidden group"
        >
          <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-intent-mid/10">
                <Target className="w-5 h-5 text-intent-mid" />
              </div>
              <h2 className="font-semibold text-lg">{t('nav.intent')}</h2>
            </div>
            <Link 
              href="/intent" 
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group/link"
            >
              {t('common.viewAll')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            <IntentOrbit compact />
          </div>
        </motion.div>

        {/* Status Stream */}
        <motion.div 
          variants={itemVariants}
          className="glass-card-hover overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-border/50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-memory-l1/10">
              <Activity className="w-5 h-5 text-memory-l1" />
            </div>
            <h2 className="font-semibold text-lg">{t('dashboard.status')}</h2>
          </div>
          <div className="p-4 sm:p-6">
            <StatusStream />
          </div>
        </motion.div>

        {/* L0 Memory List */}
        <motion.div 
          variants={itemVariants}
          className="glass-card-hover overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-border/50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">工作记忆</h2>
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">L0</span>
            </div>
          </div>
          <div className="p-4 sm:p-6 max-h-72 sm:max-h-80 overflow-auto">
            <L0MemoryList compact />
          </div>
        </motion.div>
      </div>

      {/* Quick Insights */}
      <motion.div 
        variants={itemVariants}
        className="glass-card p-6 sm:p-8 overflow-hidden relative"
      >
        {/* Background gradient decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-memory-l4/20 to-memory-l2/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-memory-l1/20 to-memory-l3/20 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row items-start gap-6">
          <motion.div 
            className="p-4 bg-primary/10 rounded-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-xl mb-2">{t('dashboard.healthTitle')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('dashboard.healthDesc')}
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link 
                href="/insights" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {t('dashboard.viewInsights')} 
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/search" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {t('dashboard.searchMemories')} 
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
