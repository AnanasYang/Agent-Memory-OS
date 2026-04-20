import { create } from 'zustand';
import { MemoryNode, IntentNode, SystemStatus, L0Memory, DreamSummary } from '@/lib/types';

interface MemoryStore {
  // Data
  memories: MemoryNode[];
  l0Memories: L0Memory[];
  intents: IntentNode[];
  dreams: DreamSummary[];
  systemStatus: SystemStatus;
  isInitialized: boolean;
  isLoading: boolean;
  initError: string | null;
  
  // UI State
  selectedMemoryId: string | null;
  selectedIntentId: string | null;
  selectedL0MemoryId: string | null;
  searchQuery: string;
  filterLevel: MemoryNode['level'] | 'all' | 'L0';
  filterCategory: string | 'all';
  theme: 'light' | 'dark';
  isLoadingL0: boolean;
  l0Error: string | null;
  isLoadingDreams: boolean;
  dreamsError: string | null;
  
  // Actions
  initializeStore: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setSelectedMemory: (id: string | null) => void;
  setSelectedIntent: (id: string | null) => void;
  setSelectedL0Memory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterLevel: (level: MemoryNode['level'] | 'all' | 'L0') => void;
  setFilterCategory: (category: string | 'all') => void;
  toggleTheme: () => void;
  fetchL0Memories: () => Promise<void>;
  fetchDreams: () => Promise<void>;
  
  // Computed
  filteredMemories: () => MemoryNode[];
  filteredIntents: () => IntentNode[];
  getMemoryById: (id: string) => MemoryNode | undefined;
  getIntentById: (id: string) => IntentNode | undefined;
  getConnectedMemories: (id: string) => MemoryNode[];
  getL0MemoryById: (id: string) => L0Memory | undefined;
}

export const useAgentOSStore = create<MemoryStore>((set, get) => ({
  // Data - 初始为空，通过 API 加载
  memories: [],
  l0Memories: [],
  intents: [],
  dreams: [],
  systemStatus: {
    activeTasks: 0,
    memoryNodes: 0,
    activeIntents: 0,
    lastSync: new Date().toISOString(),
    lastGithubSync: 'Unknown',
    systemLoad: 0,
    weeklyReviews: 0,
    dailyDreams: 0
  },
  isInitialized: false,
  isLoading: false,
  initError: null,
  
  // UI State
  selectedMemoryId: null,
  selectedIntentId: null,
  selectedL0MemoryId: null,
  searchQuery: '',
  filterLevel: 'all',
  filterCategory: 'all',
  theme: 'light',
  isLoadingL0: false,
  l0Error: null,
  isLoadingDreams: false,
  dreamsError: null,
  
  // Actions
  initializeStore: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true, initError: null });
    try {
      // 并行获取所有数据
      const [unifiedRes, l0Res, dreamsRes] = await Promise.all([
        fetch('/api/unified-data').catch(() => null),
        fetch('/api/l0-memories').catch(() => null),
        fetch('/api/dreams?limit=30').catch(() => null)
      ]);
      
      const unifiedData = unifiedRes?.ok ? await unifiedRes.json() : {};
      const l0Data = l0Res?.ok ? await l0Res.json() : {};
      const dreamsData = dreamsRes?.ok ? await dreamsRes.json() : {};
      
      set({
        memories: unifiedData.memoryNodes || [],
        intents: unifiedData.intents || [],
        dreams: dreamsData.dreams || [],
        l0Memories: l0Data.memories || [],
        systemStatus: unifiedData.status || get().systemStatus,
        isInitialized: true,
        isLoading: false
      });
      
      console.log('[Store] 初始化完成:', {
        memories: unifiedData.memoryNodes?.length || 0,
        intents: unifiedData.intents?.length || 0,
        l0Memories: l0Data.memories?.length || 0,
        dreams: dreamsData.dreams?.length || 0
      });
    } catch (error) {
      console.error('[Store] 初始化失败:', error);
      set({
        initError: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      });
    }
  },
  
  refreshAll: async () => {
    set({ isLoading: true });
    try {
      const [unifiedRes, l0Res, dreamsRes] = await Promise.all([
        fetch('/api/unified-data').catch(() => null),
        fetch('/api/l0-memories').catch(() => null),
        fetch('/api/dreams?limit=30').catch(() => null)
      ]);
      
      const unifiedData = unifiedRes?.ok ? await unifiedRes.json() : {};
      const l0Data = l0Res?.ok ? await l0Res.json() : {};
      const dreamsData = dreamsRes?.ok ? await dreamsRes.json() : {};
      
      set({
        memories: unifiedData.memoryNodes || [],
        intents: unifiedData.intents || [],
        dreams: dreamsData.dreams || [],
        l0Memories: l0Data.memories || [],
        systemStatus: unifiedData.status || get().systemStatus,
        isLoading: false
      });
    } catch (error) {
      console.error('[Store] 刷新失败:', error);
      set({ isLoading: false });
    }
  },
  
  setSelectedMemory: (id) => set({ selectedMemoryId: id }),
  setSelectedIntent: (id) => set({ selectedIntentId: id }),
  setSelectedL0Memory: (id) => set({ selectedL0MemoryId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterLevel: (level) => set({ filterLevel: level }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  
  fetchL0Memories: async () => {
    set({ isLoadingL0: true, l0Error: null });
    try {
      const response = await fetch('/api/l0');
      if (!response.ok) {
        throw new Error(`Failed to fetch L0 memories: ${response.status}`);
      }
      const data = await response.json();
      set({ l0Memories: data.memories || [], isLoadingL0: false });
    } catch (error) {
      console.error('Failed to fetch L0 memories:', error);
      set({ 
        l0Error: error instanceof Error ? error.message : 'Unknown error',
        isLoadingL0: false 
      });
    }
  },
  
  fetchDreams: async () => {
    set({ isLoadingDreams: true, dreamsError: null });
    try {
      const response = await fetch('/api/dreams?limit=30');
      if (!response.ok) {
        throw new Error(`Failed to fetch dreams: ${response.status}`);
      }
      const data = await response.json();
      set({ dreams: data.dreams || [], isLoadingDreams: false });
    } catch (error) {
      console.error('Failed to fetch dreams:', error);
      set({
        dreamsError: error instanceof Error ? error.message : 'Unknown error',
        isLoadingDreams: false
      });
    }
  },
  
  // Computed
  filteredMemories: () => {
    const state = get();
    return state.memories.filter(memory => {
      const matchesSearch = !state.searchQuery || 
        memory.content.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        memory.category.toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchesLevel = state.filterLevel === 'all' || memory.level === state.filterLevel;
      const matchesCategory = state.filterCategory === 'all' || memory.category === state.filterCategory;
      return matchesSearch && matchesLevel && matchesCategory;
    });
  },
  
  filteredIntents: () => {
    const state = get();
    return state.intents.filter(intent => {
      const matchesSearch = !state.searchQuery || 
        intent.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        intent.description?.toLowerCase().includes(state.searchQuery.toLowerCase());
      return matchesSearch;
    });
  },
  
  getMemoryById: (id) => get().memories.find(m => m.id === id),
  getIntentById: (id) => get().intents.find(i => i.id === id),
  getConnectedMemories: (id) => {
    const memory = get().memories.find(m => m.id === id);
    if (!memory) return [];
    return get().memories.filter(m => memory.connections.includes(m.id));
  },
  getL0MemoryById: (id) => get().l0Memories.find(m => m.id === id),
}));

// Alias for backward compatibility
export const useMemoryStore = useAgentOSStore;

// Hook for auto-refresh functionality
export function useAutoRefresh(interval: number = 30000) {
  // This is a placeholder for the actual implementation
  // In a real app, this would set up polling or websocket connections
  return { refresh: () => {} };
}

// Types for L0 messages
export interface L0Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'ai';
  sessionId: string;
}
