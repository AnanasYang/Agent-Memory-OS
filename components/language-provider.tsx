'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.memory': 'Memory Galaxy',
    'nav.intent': 'Intent Orbit',
    'nav.timeline': 'Timeline',
    'nav.insights': 'Insights',
    'nav.search': 'Search',
    'nav.language': 'Language',
    'nav.toggleTheme': 'Toggle theme',
    'nav.toggleMenu': 'Toggle menu',

    // Memory Page
    'memory.title': 'Memory Galaxy',
    'memory.subtitle': 'Visualize and explore your memory architecture',
    'memory.filterLevel': 'Level',
    'memory.filterCategory': 'Category',
    'memory.allLevels': 'All Levels',
    'memory.l4Core': 'L4 Core',
    'memory.l3Semantic': 'L3 Semantic',
    'memory.l2Procedural': 'L2 Procedural',
    'memory.l1Episodic': 'L1 Episodic',
    'memory.allCategories': 'All Categories',
    'memory.l4Desc': 'Fundamental values',
    'memory.l3Desc': 'Cognitive frameworks',
    'memory.l2Desc': 'Behavior patterns',
    'memory.l1Desc': 'Recent memories',

    // Memory Detail
    'memory.back': 'Back to Memory Galaxy',
    'memory.category': 'Category',
    'memory.confidence': 'Confidence',
    'memory.created': 'Created',
    'memory.updated': 'Last Updated',
    'memory.connections': 'Connections',
    'memory.linkedMemories': 'Linked memories',
    'memory.sources': 'Sources',
    'memory.connectedMemories': 'Connected Memories',
    'memory.notFound': 'Memory not found',
    'memory.l0Desc': 'Real-time session state and context',
    'memory.l1LongDesc': 'Episodic memories - recent events that fade after 30 days',
    'memory.l2LongDesc': 'Procedural patterns - recurring behaviors and habits',
    'memory.l3LongDesc': 'Semantic frameworks - cognitive models and understanding',
    'memory.l4LongDesc': 'Core values - fundamental principles and identity',

    // Intent Page
    'intent.title': 'Intent Orbit Console',
    'intent.subtitle': 'Manage and track your goals across time horizons',
    'intent.tips': 'Intent Management Tips',
    'intent.tip1': 'Short-term goals should align with long-term vision',
    'intent.tip2': 'Regular progress reviews help maintain momentum',
    'intent.tip3': 'Dependencies help prioritize what to work on first',

    // Timeline Page
    'timeline.title': 'Evolution Timeline',
    'timeline.subtitle': 'Track memory changes and growth over time',

    // Insights Page
    'insights.title': 'Insights & Analytics',
    'insights.subtitle': 'Discover patterns and trends in your memory system',

    // Search Page
    'search.title': 'Global Search',
    'search.subtitle': 'Search across all memories and intents',
    'search.placeholder': 'Search memories, intents...',
    'search.results': 'Search Results',
    'search.noResults': 'No results found',

    // Dashboard
    'dashboard.status': 'System Status',
    'dashboard.healthTitle': 'Memory System Health: Excellent',
    'dashboard.healthDesc': 'Your memory architecture shows strong connectivity between layers. Consider reviewing L1 memories for potential elevation to L2 patterns.',
    'dashboard.viewInsights': 'View Detailed Insights',
    'dashboard.searchMemories': 'Search Memories',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.viewAll': 'View All',
  },
  zh: {
    // Navigation
    'nav.dashboard': '仪表盘',
    'nav.memory': '记忆星系',
    'nav.intent': '意图轨道',
    'nav.timeline': '时间轴',
    'nav.insights': '洞察',
    'nav.search': '搜索',
    'nav.language': '语言',
    'nav.toggleTheme': '切换主题',
    'nav.toggleMenu': '切换菜单',

    // Memory Page
    'memory.title': '记忆星系',
    'memory.subtitle': '可视化和探索你的记忆架构',
    'memory.filterLevel': '层级',
    'memory.filterCategory': '分类',
    'memory.allLevels': '所有层级',
    'memory.l4Core': 'L4 核心',
    'memory.l3Semantic': 'L3 语义',
    'memory.l2Procedural': 'L2 程序',
    'memory.l1Episodic': 'L1 情景',
    'memory.allCategories': '所有分类',
    'memory.l4Desc': '核心价值观',
    'memory.l3Desc': '认知框架',
    'memory.l2Desc': '行为模式',
    'memory.l1Desc': '近期记忆',

    // Memory Detail
    'memory.back': '返回记忆星系',
    'memory.category': '分类',
    'memory.confidence': '置信度',
    'memory.created': '创建时间',
    'memory.updated': '最后更新',
    'memory.connections': '连接',
    'memory.linkedMemories': '关联记忆',
    'memory.sources': '来源',
    'memory.connectedMemories': '关联记忆',
    'memory.notFound': '未找到记忆',
    'memory.l0Desc': '实时会话状态和上下文',
    'memory.l1LongDesc': '情景记忆 - 30天后逐渐消退的近期事件',
    'memory.l2LongDesc': '程序记忆 - 反复出现的行为和习惯',
    'memory.l3LongDesc': '语义记忆 - 认知模型和理解框架',
    'memory.l4LongDesc': '核心记忆 - 基本价值观和身份认同',

    // Intent Page
    'intent.title': '意图轨道控制台',
    'intent.subtitle': '管理和追踪跨时间维度的目标',
    'intent.tips': '意图管理技巧',
    'intent.tip1': '短期目标应与长期愿景保持一致',
    'intent.tip2': '定期回顾进度有助于保持动力',
    'intent.tip3': '依赖关系有助于确定优先事项',

    // Timeline Page
    'timeline.title': '演变时间轴',
    'timeline.subtitle': '追踪记忆变化和成长历程',

    // Insights Page
    'insights.title': '洞察与分析',
    'insights.subtitle': '发现记忆系统中的模式和趋势',

    // Search Page
    'search.title': '全局搜索',
    'search.subtitle': '搜索所有记忆和意图',
    'search.placeholder': '搜索记忆、意图...',
    'search.results': '搜索结果',
    'search.noResults': '未找到结果',

    // Dashboard
    'dashboard.status': '系统状态',
    'dashboard.healthTitle': '记忆系统健康状态：优秀',
    'dashboard.healthDesc': '你的记忆架构各层级连接良好。建议检查 L1 记忆，看看是否有可以提升到 L2 的模式。',
    'dashboard.viewInsights': '查看详细洞察',
    'dashboard.searchMemories': '搜索记忆',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.retry': '重试',
    'common.close': '关闭',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.create': '创建',
    'common.viewAll': '查看全部',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved language preference
    const saved = localStorage.getItem('memory-os-language') as Language;
    if (saved && (saved === 'zh' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('memory-os-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'zh', setLanguage: () => {}, t: () => '' }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
