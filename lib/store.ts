import { create } from 'zustand';
import { MemoryNode, IntentNode, SystemStatus } from '@/lib/types';
import { memoryNodes, intentNodes, systemStatus } from '@/lib/data';

interface MemoryStore {
  // Data
  memories: MemoryNode[];
  intents: IntentNode[];
  systemStatus: SystemStatus;
  
  // UI State
  selectedMemoryId: string | null;
  selectedIntentId: string | null;
  searchQuery: string;
  filterLevel: MemoryNode['level'] | 'all';
  filterCategory: string | 'all';
  theme: 'light' | 'dark';
  
  // Actions
  setSelectedMemory: (id: string | null) => void;
  setSelectedIntent: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterLevel: (level: MemoryNode['level'] | 'all') => void;
  setFilterCategory: (category: string | 'all') => void;
  toggleTheme: () => void;
  updateMemory: (id: string, updates: Partial<MemoryNode>) => void;
  updateMemoryPosition: (id: string, position: { x: number; y: number }) => void;
  updateIntent: (id: string, updates: Partial<IntentNode>) => void;
  addMemory: (memory: MemoryNode) => void;
  addIntent: (intent: IntentNode) => void;
  elevateMemory: (id: string) => void;
  confirmMemoryReview: (id: string) => void;
  
  // Computed
  filteredMemories: () => MemoryNode[];
  filteredIntents: () => IntentNode[];
  getMemoryById: (id: string) => MemoryNode | undefined;
  getIntentById: (id: string) => IntentNode | undefined;
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  // Initial state
  memories: memoryNodes,
  intents: intentNodes,
  systemStatus: systemStatus,
  selectedMemoryId: null,
  selectedIntentId: null,
  searchQuery: '',
  filterLevel: 'all',
  filterCategory: 'all',
  theme: 'dark',

  // Actions
  setSelectedMemory: (id) => set({ selectedMemoryId: id }),
  setSelectedIntent: (id) => set({ selectedIntentId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterLevel: (level) => set({ filterLevel: level }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  updateMemory: (id, updates) => set((state) => ({
    memories: state.memories.map(m => 
      m.id === id ? { ...m, ...updates, updated: new Date().toISOString() } : m
    )
  })),
  
  updateMemoryPosition: (id, position) => set((state) => ({
    memories: state.memories.map(m => 
      m.id === id ? { ...m, position: { ...m.position, ...position }, updated: new Date().toISOString() } : m
    )
  })),
  
  updateIntent: (id, updates) => set((state) => ({
    intents: state.intents.map(i => 
      i.id === id ? { ...i, ...updates } : i
    )
  })),
  
  addMemory: (memory) => set((state) => ({
    memories: [...state.memories, memory]
  })),
  
  addIntent: (intent) => set((state) => ({
    intents: [...state.intents, intent]
  })),
  
  // Elevate memory to next level (L1 -> L2 -> L3 -> L4)
  elevateMemory: (id) => set((state) => ({
    memories: state.memories.map(m => {
      if (m.id !== id) return m;
      
      const levelMap: Record<string, string> = {
        'L1': 'L2',
        'L2': 'L3',
        'L3': 'L4',
      };
      
      const newLevel = levelMap[m.level] as MemoryNode['level'];
      if (!newLevel) return m;
      
      return {
        ...m,
        level: newLevel,
        updated: new Date().toISOString(),
        reviewed: new Date().toISOString(),
      };
    })
  })),
  
  // Confirm review of a memory
  confirmMemoryReview: (id) => set((state) => ({
    memories: state.memories.map(m => 
      m.id === id 
        ? { ...m, reviewed: new Date().toISOString(), updated: new Date().toISOString() }
        : m
    )
  })),
  
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
}));
