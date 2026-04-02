import { create } from 'zustand';
import { MemoryNode, IntentNode, SystemStatus, L0Memory, DreamSummary } from '@/lib/types';
import { memoryNodes, intentNodes, systemStatus } from '@/lib/data';

interface MemoryStore {
  // Data
  memories: MemoryNode[];
  l0Memories: L0Memory[];
  intents: IntentNode[];
  dreams: DreamSummary[];
  systemStatus: SystemStatus;
  
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
  setSelectedMemory: (id: string | null) => void;
  setSelectedIntent: (id: string | null) => void;
  setSelectedL0Memory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterLevel: (level: MemoryNode['level'] | 'all' | 'L0') => void;
  setFilterCategory: (category: string | 'all') => void;
  toggleTheme: () => void;
  updateMemory: (id: string, updates: Partial<MemoryNode>) => void;
  updateMemoryPosition: (id: string, position: { x: number; y: number }) => void;
  updateIntent: (id: string, updates: Partial<IntentNode>) => void;
  addMemory: (memory: MemoryNode) => void;
  addIntent: (intent: IntentNode) => void;
  elevateMemory: (id: string) => void;
  confirmMemoryReview: (id: string) => void;
  fetchL0Memories: () => Promise<void>;
  fetchL0SessionDetail: (sessionId: string) => Promise<{ messages: any[]; summary: string } | null>;
  fetchDreams: () => Promise<void>;
  
  // Computed
  filteredMemories: () => MemoryNode[];
  filteredIntents: () => IntentNode[];
  getMemoryById: (id: string) => MemoryNode | undefined;
  getIntentById: (id: string) => IntentNode | undefined;
  getConnectedMemories: (id: string) => MemoryNode[];
  getL0MemoryById: (id: string) => L0Memory | undefined;
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  // Initial state
  memories: memoryNodes,
  l0Memories: [],
  intents: intentNodes,
  dreams: [],
  systemStatus: systemStatus,
  selectedMemoryId: null,
  selectedIntentId: null,
  selectedL0MemoryId: null,
  searchQuery: '',
  filterLevel: 'all',
  filterCategory: 'all',
  theme: 'dark',
  isLoadingL0: false,
  l0Error: null,
  isLoadingDreams: false,
  dreamsError: null,

  // Actions
  setSelectedMemory: (id) => set({ selectedMemoryId: id }),
  setSelectedIntent: (id) => set({ selectedIntentId: id }),
  setSelectedL0Memory: (id) => set({ selectedL0MemoryId: id }),
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
  
  // Fetch L0 memories from OpenClaw API
  fetchL0Memories: async () => {
    set({ isLoadingL0: true, l0Error: null });
    try {
      const response = await fetch('/api/l0-memories');
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
  
  // Fetch detailed session content from OpenClaw
  fetchL0SessionDetail: async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/export`);
      if (!response.ok) {
        throw new Error(`Failed to fetch session detail: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch session detail:', error);
      return null;
    }
  },
  
  // Fetch Dreams from API
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
