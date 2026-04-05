/**
 * CandidateCard Component
 * 简化的候选卡片组件
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Candidate {
  id: string;
  title: string;
  level: string;
  category: string;
  confidence: number;
  occurrences: number;
  description: string;
  createdAt: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  onViewDetail: (candidate: Candidate) => void;
}

export function CandidateCard({ 
  candidate, 
  onConfirm, 
  onDismiss, 
  onViewDetail 
}: CandidateCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'L2': return 'from-orange-400 to-amber-500';
      case 'L3': return 'from-purple-400 to-indigo-500';
      case 'L4': return 'from-red-400 to-pink-500';
      default: return 'from-blue-400 to-cyan-500';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'L2': return 'bg-orange-50 border-orange-200';
      case 'L3': return 'bg-purple-50 border-purple-200';
      case 'L4': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`rounded-xl border-2 p-4 ${getLevelBg(candidate.level)} hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getLevelColor(candidate.level)} text-white`}>
            {candidate.level}
          </span>
          <span className="text-xs text-gray-500 capitalize">{candidate.category}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <TrendingUp className="w-3 h-3" />
          <span>{candidate.occurrences}次</span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
        {candidate.title}
      </h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {candidate.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>置信度: {Math.round(candidate.confidence * 100)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(candidate.id)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          确认
        </button>
        <button
          onClick={() => onViewDetail(candidate)}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          详情
        </button>
        <button
          onClick={() => onDismiss(candidate.id)}
          className="px-3 py-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          忽略
        </button>
      </div>
    </motion.div>
  );
}

export default CandidateCard;
