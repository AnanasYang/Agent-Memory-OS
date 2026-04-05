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
  // Data
  memories: memoryNodes,
  l0Memories: [],
  intents: intentNodes,
  dreams: [],
  systemStatus: systemStatus,
  
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
