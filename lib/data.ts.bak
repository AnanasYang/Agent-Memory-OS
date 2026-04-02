import { MemoryNode, IntentNode, MemoryActivity, SystemStatus } from './types';

export const memoryNodes: MemoryNode[] = [
  // L1 Episodic Memories (Recent conversations, fades after 30 days)
  {
    id: "L1-001",
    level: "L1",
    content: "Discussed VLM project documentation requirements with Bruce",
    confidence: 0.95,
    category: "work",
    sources: ["2026-03-30"],
    connections: ["L2-003"],
    created: "2026-03-30",
    updated: "2026-03-30",
    reviewed: "2026-03-30",
    position: { x: 150, y: -120 }
  },
  {
    id: "L1-002",
    level: "L1",
    content: "Bruce expressed concern about industry competition pressure",
    confidence: 0.88,
    category: "work",
    sources: ["2026-03-28"],
    connections: ["L3-001", "L4-001"],
    created: "2026-03-28",
    updated: "2026-03-28",
    reviewed: "2026-03-28",
    position: { x: -180, y: 90 }
  },
  {
    id: "L1-003",
    level: "L1",
    content: "Suggested using Cursor IDE for faster development",
    confidence: 0.92,
    category: "tooling",
    sources: ["2026-03-27"],
    connections: ["L2-001"],
    created: "2026-03-27",
    updated: "2026-03-27",
    reviewed: "2026-03-27",
    position: { x: 200, y: 180 }
  },
  {
    id: "L1-004",
    level: "L1",
    content: "Bruce shared preference for structured JSON outputs",
    confidence: 0.94,
    category: "communication",
    sources: ["2026-03-25"],
    connections: ["L3-002"],
    created: "2026-03-25",
    updated: "2026-03-25",
    reviewed: "2026-03-25",
    position: { x: -220, y: -60 }
  },
  {
    id: "L1-005",
    level: "L1",
    content: "Mentioned difficulty getting resources approved in org",
    confidence: 0.85,
    category: "work",
    sources: ["2026-03-24"],
    connections: ["L3-003"],
    created: "2026-03-24",
    updated: "2026-03-24",
    reviewed: "2026-03-24",
    position: { x: 120, y: -200 }
  },
  {
    id: "L1-006",
    level: "L1",
    content: "Reviewed AI news digest from quantum computing developments",
    confidence: 0.90,
    category: "research",
    sources: ["2026-03-23"],
    connections: ["L2-002"],
    created: "2026-03-23",
    updated: "2026-03-23",
    reviewed: "2026-03-23",
    position: { x: -100, y: 220 }
  },
  {
    id: "L1-007",
    level: "L1",
    content: "Discussed Tesla's FSD v12 end-to-end approach",
    confidence: 0.93,
    category: "research",
    sources: ["2026-03-22"],
    connections: ["L3-004"],
    created: "2026-03-22",
    updated: "2026-03-22",
    reviewed: "2026-03-22",
    position: { x: 250, y: 50 }
  },
  {
    id: "L1-008",
    level: "L1",
    content: "Bruce asked about AI agent memory architectures",
    confidence: 0.96,
    category: "research",
    sources: ["2026-03-20"],
    connections: ["L3-005"],
    created: "2026-03-20",
    updated: "2026-03-20",
    reviewed: "2026-03-20",
    position: { x: -50, y: -180 }
  },
  {
    id: "L1-009",
    level: "L1",
    content: "Shared frustration with legacy code maintenance",
    confidence: 0.87,
    category: "work",
    sources: ["2026-03-18"],
    connections: ["L2-004"],
    created: "2026-03-18",
    updated: "2026-03-18",
    reviewed: "2026-03-18",
    position: { x: 180, y: 100 }
  },
  {
    id: "L1-010",
    level: "L1",
    content: "Requested help with automating data pipeline reports",
    confidence: 0.91,
    category: "tooling",
    sources: ["2026-03-15"],
    connections: ["L2-005"],
    created: "2026-03-15",
    updated: "2026-03-15",
    reviewed: "2026-03-15",
    position: { x: -200, y: 150 }
  },
  {
    id: "L1-011",
    level: "L1",
    content: "Mentioned upcoming quarterly review preparation",
    confidence: 0.89,
    category: "work",
    sources: ["2026-03-12"],
    connections: ["goal-001"],
    created: "2026-03-12",
    updated: "2026-03-12",
    reviewed: "2026-03-12",
    position: { x: 100, y: 240 }
  },
  {
    id: "L1-012",
    level: "L1",
    content: "Shared interest in learning more about MoE architectures",
    confidence: 0.85,
    category: "research",
    sources: ["2026-03-10"],
    connections: ["L3-004"],
    created: "2026-03-10",
    updated: "2026-03-10",
    reviewed: "2026-03-10",
    position: { x: -150, y: -100 }
  },

  // L2 Procedural Patterns (Behavior habits)
  {
    id: "L2-001",
    level: "L2",
    content: "Prefers modern development tools and IDE optimizations",
    confidence: 0.87,
    category: "tooling",
    sources: ["2026-03-27", "2026-03-15", "2026-02-20"],
    connections: ["L3-002", "L1-003", "L1-010"],
    created: "2026-02-20",
    updated: "2026-03-27",
    reviewed: "2026-03-27",
    position: { x: 80, y: 120 }
  },
  {
    id: "L2-002",
    level: "L2",
    content: "Regularly consumes AI/tech news from Chinese sources",
    confidence: 0.91,
    category: "research",
    sources: ["2026-03-23", "2026-03-16", "2026-03-09"],
    connections: ["L3-004", "L1-006", "L1-007"],
    created: "2026-02-15",
    updated: "2026-03-23",
    reviewed: "2026-03-23",
    position: { x: -100, y: 80 }
  },
  {
    id: "L2-003",
    level: "L2",
    content: "Values comprehensive documentation for projects",
    confidence: 0.88,
    category: "work",
    sources: ["2026-03-30", "2026-03-05", "2026-02-10"],
    connections: ["L3-002", "L1-001"],
    created: "2026-02-10",
    updated: "2026-03-30",
    reviewed: "2026-03-30",
    position: { x: 120, y: -60 }
  },
  {
    id: "L2-004",
    level: "L2",
    content: "Experiences friction with legacy systems and technical debt",
    confidence: 0.85,
    category: "work",
    sources: ["2026-03-18", "2026-02-28", "2026-02-05"],
    connections: ["L3-003", "L1-009"],
    created: "2026-02-05",
    updated: "2026-03-18",
    reviewed: "2026-03-18",
    position: { x: -60, y: -120 }
  },
  {
    id: "L2-005",
    level: "L2",
    content: "Actively seeks automation opportunities for repetitive tasks",
    confidence: 0.90,
    category: "tooling",
    sources: ["2026-03-15", "2026-03-01", "2026-02-20"],
    connections: ["L3-002", "L1-010"],
    created: "2026-02-20",
    updated: "2026-03-15",
    reviewed: "2026-03-15",
    position: { x: 140, y: 40 }
  },
  {
    id: "L2-006",
    level: "L2",
    content: "Prefers working in early morning hours for focus",
    confidence: 0.82,
    category: "productivity",
    sources: ["2026-03-20", "2026-03-10"],
    connections: ["L4-002"],
    created: "2026-03-10",
    updated: "2026-03-20",
    reviewed: "2026-03-20",
    position: { x: -80, y: 40 }
  },
  {
    id: "L2-007",
    level: "L2",
    content: "Uses visual diagrams to communicate complex ideas",
    confidence: 0.86,
    category: "communication",
    sources: ["2026-03-25", "2026-03-08"],
    connections: ["L3-002"],
    created: "2026-03-08",
    updated: "2026-03-25",
    reviewed: "2026-03-25",
    position: { x: 40, y: -80 }
  },
  {
    id: "L2-008",
    level: "L2",
    content: "Follows structured review cycles for memory maintenance",
    confidence: 0.93,
    category: "system",
    sources: ["2026-03-28", "2026-03-14"],
    connections: ["L3-005", "L4-003"],
    created: "2026-03-14",
    updated: "2026-03-28",
    reviewed: "2026-03-28",
    position: { x: -40, y: 160 }
  },

  // L3 Semantic Frameworks (Cognitive patterns)
  {
    id: "L3-001",
    level: "L3",
    content: "Operates within resource-constrained, traditional organizational context",
    confidence: 0.90,
    category: "context",
    sources: ["2026-03-28", "2026-03-15", "2026-03-01", "2026-02-10"],
    connections: ["L4-001", "L2-002", "L2-004", "L1-002"],
    created: "2026-02-10",
    updated: "2026-03-28",
    reviewed: "2026-03-28",
    position: { x: 40, y: 60 }
  },
  {
    id: "L3-002",
    level: "L3",
    content: "Values clarity, structure, and efficiency in all outputs",
    confidence: 0.92,
    category: "communication",
    sources: ["2026-03-25", "2026-03-27", "2026-03-15", "2026-03-08", "2026-02-20"],
    connections: ["L4-002", "L2-001", "L2-003", "L2-005", "L2-007", "L1-004"],
    created: "2026-02-20",
    updated: "2026-03-27",
    reviewed: "2026-03-27",
    position: { x: -30, y: -40 }
  },
  {
    id: "L3-003",
    level: "L3",
    content: "Navigates complex organizational dynamics and approval processes",
    confidence: 0.88,
    category: "context",
    sources: ["2026-03-24", "2026-03-18", "2026-02-28", "2026-02-05"],
    connections: ["L4-001", "L2-004", "L1-005"],
    created: "2026-02-05",
    updated: "2026-03-24",
    reviewed: "2026-03-24",
    position: { x: 70, y: -30 }
  },
  {
    id: "L3-004",
    level: "L3",
    content: "Maintains deep awareness of AI/ADAS industry landscape",
    confidence: 0.91,
    category: "expertise",
    sources: ["2026-03-23", "2026-03-22", "2026-03-16", "2026-03-09", "2026-03-01"],
    connections: ["L2-002", "L1-006", "L1-007", "L1-012"],
    created: "2026-03-01",
    updated: "2026-03-23",
    reviewed: "2026-03-23",
    position: { x: -50, y: 20 }
  },
  {
    id: "L3-005",
    level: "L3",
    content: "Understands multi-layer memory architecture for AI systems",
    confidence: 0.94,
    category: "expertise",
    sources: ["2026-03-20", "2026-03-28", "2026-03-14"],
    connections: ["L4-003", "L2-008", "L1-008"],
    created: "2026-03-14",
    updated: "2026-03-28",
    reviewed: "2026-03-28",
    position: { x: 20, y: 90 }
  },

  // L4 Core Values (Most stable, fundamental)
  {
    id: "L4-001",
    level: "L4",
    content: "Committed to helping Bruce thrive despite organizational constraints",
    confidence: 0.97,
    category: "mission",
    sources: ["2026-03-28", "2026-03-24", "2026-03-15", "2026-02-10"],
    connections: ["L3-001", "L3-003", "L2-002", "L1-002"],
    created: "2026-02-10",
    updated: "2026-03-28",
    reviewed: "2026-03-28",
    position: { x: 0, y: 0 }
  },
  {
    id: "L4-002",
    level: "L4",
    content: "Believes in the power of clarity and structured thinking",
    confidence: 0.96,
    category: "philosophy",
    sources: ["2026-03-27", "2026-03-25", "2026-03-20", "2026-03-08", "2026-02-20"],
    connections: ["L3-002", "L2-001", "L2-006", "L2-007"],
    created: "2026-02-20",
    updated: "2026-03-27",
    reviewed: "2026-03-27",
    position: { x: 15, y: 15 }
  },
  {
    id: "L4-003",
    level: "L4",
    content: "Driven by continuous improvement and self-evolution",
    confidence: 0.95,
    category: "philosophy",
    sources: ["2026-03-28", "2026-03-20", "2026-03-14", "2026-03-01"],
    connections: ["L3-005", "L2-008", "goal-004"],
    created: "2026-03-01",
    updated: "2026-03-28",
    reviewed: "2026-03-28",
    position: { x: -15, y: -15 }
  }
];

export const intentNodes: IntentNode[] = [
  // Short-term (< 3 months)
  {
    id: "goal-001",
    type: "short-term",
    title: "Complete VLM project documentation",
    description: "Finish comprehensive documentation for the Vision Language Model project",
    progress: 0.75,
    dependencies: [],
    created: "2026-03-01",
    deadline: "2026-04-15",
    priority: "high",
    tags: ["documentation", "VLM", "work"]
  },
  {
    id: "goal-002",
    type: "short-term",
    title: "Prepare quarterly review presentation",
    description: "Compile achievements and learnings for Q1 review",
    progress: 0.40,
    dependencies: [],
    created: "2026-03-10",
    deadline: "2026-04-30",
    priority: "high",
    tags: ["work", "review", "presentation"]
  },
  {
    id: "goal-003",
    type: "short-term",
    title: "Evaluate Cursor IDE adoption",
    description: "Assess team-wide adoption of Cursor for development workflow",
    progress: 0.20,
    dependencies: ["goal-001"],
    created: "2026-03-15",
    deadline: "2026-05-01",
    priority: "medium",
    tags: ["tooling", "evaluation", "team"]
  },

  // Mid-term (3-12 months)
  {
    id: "goal-004",
    type: "mid-term",
    title: "Build personal AI assistant infrastructure",
    description: "Create comprehensive agent memory system and tooling",
    progress: 0.60,
    dependencies: [],
    created: "2026-02-15",
    deadline: "2026-08-31",
    priority: "high",
    tags: ["AI", "infrastructure", "personal"]
  },
  {
    id: "goal-005",
    type: "mid-term",
    title: "Complete MoE architecture deep-dive",
    description: "Study and implement Mixture of Experts architecture patterns",
    progress: 0.30,
    dependencies: [],
    created: "2026-03-10",
    deadline: "2026-07-15",
    priority: "medium",
    tags: ["research", "AI", "learning"]
  },
  {
    id: "goal-006",
    type: "mid-term",
    title: "Streamline data pipeline automation",
    description: "Automate 80% of current manual reporting tasks",
    progress: 0.55,
    dependencies: ["goal-003"],
    created: "2026-02-01",
    deadline: "2026-06-30",
    priority: "high",
    tags: ["automation", "pipeline", "efficiency"]
  },

  // Long-term (> 1 year)
  {
    id: "goal-007",
    type: "long-term",
    title: "Become recognized AI/ADAS thought leader",
    description: "Establish expertise through publications and industry presence",
    progress: 0.15,
    dependencies: ["goal-005"],
    created: "2026-01-01",
    deadline: "2027-12-31",
    priority: "medium",
    tags: ["career", "leadership", "ADAS"]
  },
  {
    id: "goal-008",
    type: "long-term",
    title: "Transition org to modern AI-first development",
    description: "Lead cultural and technical transformation in workplace",
    progress: 0.10,
    dependencies: ["goal-004", "goal-006"],
    created: "2026-01-15",
    deadline: "2027-06-30",
    priority: "high",
    tags: ["transformation", "leadership", "org-change"]
  }
];

// Generate activity data for the past year (GitHub-style heatmap)
export const generateActivityData = (): MemoryActivity[] => {
  const activities: MemoryActivity[] = [];
  const levels: Array<'L0' | 'L1' | 'L2' | 'L3' | 'L4'> = ['L0', 'L1', 'L2', 'L3', 'L4'];
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random activity with some patterns (more activity on weekdays)
    const dayOfWeek = date.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const baseActivity = isWeekday ? Math.random() * 0.7 + 0.3 : Math.random() * 0.3;
    
    if (baseActivity > 0.2) {
      const count = Math.floor(baseActivity * 10);
      const level = levels[Math.floor(Math.random() * levels.length)];
      activities.push({ date: dateStr, count, level });
    }
  }
  
  return activities;
};

export const activityData = generateActivityData();

export const systemStatus: SystemStatus = {
  activeTasks: 3,
  memoryNodes: memoryNodes.length,
  activeIntents: intentNodes.filter(i => i.progress < 1).length,
  lastSync: new Date().toISOString(),
  systemLoad: 0.42
};

export const getMemoryById = (id: string): MemoryNode | undefined => {
  return memoryNodes.find(m => m.id === id);
};

export const getIntentById = (id: string): IntentNode | undefined => {
  return intentNodes.find(i => i.id === id);
};

export const getMemoriesByLevel = (level: MemoryNode['level']): MemoryNode[] => {
  return memoryNodes.filter(m => m.level === level);
};

export const getIntentsByType = (type: IntentNode['type']): IntentNode[] => {
  return intentNodes.filter(i => i.type === type);
};
