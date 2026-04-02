export type MemoryLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
export type IntentType = 'short-term' | 'mid-term' | 'long-term';

// L0 Memory - Raw session data from OpenClaw
export interface L0Memory {
  id: string;
  type: 'L0';
  title: string;
  content: string;
  sessionId: string;
  timestamp: number;
  messageCount: number;
  preview: string;
  channel: string;
  userName: string;
}

// Session message from OpenClaw transcript
export interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

// Dream Summary for daily memory review
export interface DreamSummary {
  id: string;
  date: string;
  timestamp: number;
  summary: string;
  sessionCount: number;
  l1Count: number;
  status: 'success' | 'error' | 'running';
}

// Dream detail with full insights
export interface DreamDetail {
  id: string;
  date: string;
  timestamp: number;
  insights: {
    summary: string;
    keyEvents: Array<{
      title: string;
      description: string;
      importance: number;
    }>;
    patterns: string[];
    actionItems: string[];
    sentiment: string;
  };
  dataSource: {
    uniqueSessions: number;
  };
  l1Memories: MemoryNode[];
  markdown?: string;
}

export interface MemoryNode {
  id: string;
  title: string;
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