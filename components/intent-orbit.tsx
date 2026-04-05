'use client';

import { motion } from 'framer-motion';
import { Target, Clock, CheckCircle2, ArrowUpRight, TrendingUp } from 'lucide-react';

interface IntentOrbitProps {
  compact?: boolean;
}

export function IntentOrbit({ compact = false }: IntentOrbitProps) {
  const intents = [
    { 
      id: 1, 
      title: 'Complete VLM project documentation', 
      progress: 0.75, 
      deadline: '2026-04-15', 
      priority: 'high',
      shortTerm: 3,
      midTerm: 3,
      longTerm: 2
    },
    { 
      id: 2, 
      title: 'Build personal AI assistant infrastructure', 
      progress: 0.60, 
      deadline: '2026-08-31', 
      priority: 'high',
      shortTerm: 2,
      midTerm: 4,
      longTerm: 5
    },
    { 
      id: 3, 
      title: 'Streamline data pipeline automation', 
      progress: 0.55, 
      deadline: '2026-06-30', 
      priority: 'medium',
      shortTerm: 1,
      midTerm: 3,
      longTerm: 2
    },
    { 
      id: 4, 
      title: 'Complete MoE architecture deep-dive', 
      progress: 0.30, 
      deadline: '2026-07-15', 
      priority: 'medium',
      shortTerm: 0,
      midTerm: 2,
      longTerm: 3
    },
  ];

  const totalProgress = intents.reduce((sum, i) => sum + i.progress, 0) / intents.length;

  return (
    <div className="space-y-3">
      {intents.map((intent, index) => (
        <motion.div
          key={intent.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, x: 4 }}
          className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${
                  intent.priority === 'high' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>
                  <Target className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {intent.title}
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* 时间线展示 */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  {intent.deadline}
                </span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  intent.priority === 'high' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {intent.priority}
                </span>
              </div>
            </div>
            
            {/* 进度圆形指示器 */}
            <div className="flex flex-col items-end gap-1">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-gray-100 dark:text-slate-700"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    initial={{ strokeDashoffset: `${2 * Math.PI * 20}` }}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 20 * (1 - intent.progress)}` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`${
                      intent.progress >= 0.7 ? 'text-green-500' :
                      intent.progress >= 0.4 ? 'text-blue-500' :
                      'text-amber-500'
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">{(intent.progress * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${intent.progress * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              className={`h-full rounded-full ${
                intent.progress >= 0.7 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                intent.progress >= 0.4 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}
            />
          </div>

          {/* 时间分布标签 */}
          <div className="flex gap-2">
            <TimeTag count={intent.shortTerm} label="Short-term" color="green" />
            <TimeTag count={intent.midTerm} label="Mid-term" color="blue" />
            <TimeTag count={intent.longTerm} label="Long-term" color="rose" />
          </div>
        </motion.div>
      ))}

      {/* 总体统计 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">总体进度</p>
              <p className="text-xs text-gray-500">{intents.length} 个活跃目标</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(totalProgress * 100).toFixed(0)}%
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              按计划进行
            </div>
          </div>
        </div>
        
        {/* 总体进度条 */}
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress * 100}%` }}
            transition={{ duration: 1, delay: 0.7 }}
            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
          />
        </div>
      </motion.div>
    </div>
  );
}

// 时间标签组件
function TimeTag({ count, label, color }: { count: number; label: string; color: 'green' | 'blue' | 'rose' }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200'
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${colorClasses[color]}`}>
      <span className="font-bold">{count}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}
