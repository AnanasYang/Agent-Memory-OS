/**
 * Empty State Components
 */

'use client';

import React from 'react';
import { Inbox, CheckCircle, SearchX } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: EmptyStateAction;
}

export default function EmptyState({ 
  title = '暂无数据', 
  description = '当前没有可显示的内容',
  icon = <Inbox className="w-12 h-12 text-gray-300" />,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={`px-4 py-2 text-sm rounded transition-colors ${
            action.variant === 'primary' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface EmptyAllDoneProps {
  title?: string;
  description?: string;
}

export function EmptyAllDone({ 
  title = '全部完成！', 
  description = '当前没有待处理的候选' 
}: EmptyAllDoneProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<CheckCircle className="w-12 h-12 text-green-400" />}
    />
  );
}

interface EmptyFilterProps {
  filterCount?: number;
  onClearFilters?: () => void;
}

export function EmptyFilter({ filterCount, onClearFilters }: EmptyFilterProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <SearchX className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">没有匹配结果</h3>
      <p className="text-sm text-gray-500 mb-4">
        {filterCount ? `当前有 ${filterCount} 个筛选条件` : '尝试调整筛选条件'}
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
