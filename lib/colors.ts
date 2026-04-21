// 层级色彩系统 — Neural Core Design
export const levelColors = {
  L0: { main: '#3B82F6', glow: '#60A5FA', bg: 'rgba(59, 130, 246, 0.15)', name: '工作记忆' },
  L1: { main: '#06B6D4', glow: '#22D3EE', bg: 'rgba(6, 182, 212, 0.15)', name: '情景记忆' },
  L2: { main: '#F59E0B', glow: '#FBBF24', bg: 'rgba(245, 158, 11, 0.15)', name: '程序记忆' },
  L3: { main: '#A855F7', glow: '#C084FC', bg: 'rgba(168, 85, 247, 0.15)', name: '语义记忆' },
  L4: { main: '#EF4444', glow: '#F87171', bg: 'rgba(239, 68, 68, 0.15)', name: '核心记忆' },
} as const;

export type MemoryLevel = keyof typeof levelColors;

export const theme = {
  bg: {
    primary: '#0A0A0F',
    card: 'rgba(15, 15, 25, 0.8)',
    elevated: 'rgba(25, 25, 40, 0.9)',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.15)',
    glow: (color: string) => `0 0 20px ${color}40, 0 0 40px ${color}20`,
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    muted: '#64748B',
    accent: (color: string) => color,
  },
  animation: {
    pulse: 'pulse-glow 3s ease-in-out infinite',
    float: 'float 6s ease-in-out infinite',
    spin: 'spin-slow 20s linear infinite',
  },
};

export function getLevelColor(level: string) {
  return levelColors[level as MemoryLevel] || levelColors.L1;
}
