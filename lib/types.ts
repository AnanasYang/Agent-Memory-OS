export type MemoryLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
export type IntentType = 'short-term' | 'mid-term' | 'long-term';

export interface MemoryNode {
  id: string;
  level: MemoryLevel;
  content: string;
  confidence: number;
  category: string;
  sources: string[];
  connections: string[];
  created: string;
  updated: string;
  reviewed: string;
  position: {
    x: number;
    y: number;
    z?: number;
  };
}

export interface IntentNode {
  id: string;
  type: IntentType;
  title: string;
  description?: string;
  progress: number;
  dependencies: string[];
  created: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface MemoryActivity {
  date: string;
  count: number;
  level: MemoryLevel;
}

export interface SystemStatus {
  activeTasks: number;
  memoryNodes: number;
  activeIntents: number;
  lastSync: string;
  systemLoad: number;
}
