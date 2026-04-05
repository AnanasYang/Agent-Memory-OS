'use client';

import { motion } from 'framer-motion';
import { MemoryGalaxy } from '@/components/memory-galaxy';
import { IntentOrbit } from '@/components/intent-orbit';
import { L0MemoryList } from '@/components/l0-memory-list';
import { 
  Brain, 
  Target, 
  Activity, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  Heart,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

// 模拟数据
const memoryStats = {
  l1Count: 5,
  l2Count: 4,
  l3Count: 2,
  l4Count: 1,
  weeklyReviews: 5
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/30 dark:bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Memory OS
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              基于 5 层记忆架构的智能可视化系统
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-300">系统运行中</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <StatCard 
            icon={<Brain className="w-4 h-4" />}
            title="L1 情境记忆" 
            value={memoryStats.l1Count} 
            subtitle="近期对话摘要" 
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard 
            icon={<Layers className="w-4 h-4" />}
            title="L2 行为模式" 
            value={memoryStats.l2Count} 
            subtitle="习惯与偏好" 
            gradient="from-amber-500 to-orange-500"
          />
          <StatCard 
            icon={<Zap className="w-4 h-4" />}
            title="L3 认知框架" 
            value={memoryStats.l3Count} 
            subtitle="思维模式" 
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard 
            icon={<Heart className="w-4 h-4" />}
            title="L4 核心价值观" 
            value={memoryStats.l4Count} 
            subtitle="身份认同" 
            gradient="from-red-500 to-rose-500"
          />
          <StatCard 
            icon={<Calendar className="w-4 h-4" />}
            title="每周复盘" 
            value={memoryStats.weeklyReviews} 
            subtitle="历史记录" 
            gradient="from-green-500 to-emerald-500"
          />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Memory Galaxy Preview */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-purple-100 dark:border-slate-700"
          >
            <div className="p-4 border-b border-purple-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="font-semibold text-lg">记忆星系</h2>
              </div>
              <Link 
                href="/memory" 
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 transition-colors"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="h-80 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-slate-900 dark:to-slate-800">
              <MemoryGalaxy compact />
            </div>
          </motion.div>

          {/* Intent Orbit Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-blue-100 dark:border-slate-700"
          >
            <div className="p-4 border-b border-blue-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-semibold text-lg">意图轨道</h2>
              </div>
              <Link 
                href="/intent" 
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4 h-80">
              <IntentOrbit compact />
            </div>
          </motion.div>

          {/* L0 Memory List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100 dark:border-slate-700"
          >
            <div className="p-4 border-b border-indigo-100 dark:border-slate-700 flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-semibold text-lg">工作记忆 (L0)</h2>
              <span className="ml-auto text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                实时
              </span>
            </div>
            <div className="p-4 max-h-80 overflow-auto">
              <L0MemoryList compact />
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-green-100 dark:border-slate-700"
          >
            <div className="p-4 border-b border-green-100 dark:border-slate-700 flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-semibold text-lg">系统状态</h2>
            </div>
            <div className="p-4 space-y-4">
              <StatusItem 
                label="Daily Dream" 
                status="正常运行" 
                time="今天 23:00"
                progress={78}
                color="green"
              />
              <StatusItem 
                label="Weekly Dream" 
                status="正常运行" 
                time="周日 22:00"
                progress={45}
                color="blue"
              />
              <StatusItem 
                label="GitHub 同步" 
                status="已连接" 
                time="刚刚"
                progress={100}
                color="purple"
              />
              <StatusItem 
                label="自动归档" 
                status="正常运行" 
                time="每天 00:00"
                progress={92}
                color="amber"
              />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-200 dark:border-slate-700"
        >
          <div className="flex items-start gap-4">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-md"
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">记忆系统健康状态：优秀</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                你的记忆架构各层级连接良好。建议检查 L1 记忆，看看是否有可以提升到 L2 的模式。
              </p>
              <div className="flex gap-4 mt-4">
                <Link 
                  href="/insights" 
                  className="text-sm px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  查看详细洞察 →
                </Link>
                <Link 
                  href="/search" 
                  className="text-sm px-4 py-2 bg-white dark:bg-slate-700 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                >
                  探索记忆 →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ icon, title, value, subtitle, gradient }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  gradient: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-100 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm text-gray-500">{title}</h3>
        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
          {icon}
        </div>
      </div>
      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</div>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </motion.div>
  );
}

// 状态项组件
function StatusItem({ label, status, time, progress, color }: {
  label: string;
  status: string;
  time: string;
  progress: number;
  color: 'green' | 'blue' | 'purple' | 'amber';
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500'
  };

  const progressColors = {
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    amber: 'from-amber-400 to-amber-600'
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${colorClasses[color]} animate-pulse`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{status}</div>
          <div className="text-xs text-gray-400">{time}</div>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full bg-gradient-to-r ${progressColors[color]}`}
        />
      </div>
    </div>
  );
}
