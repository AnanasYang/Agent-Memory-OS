'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getLevelColor } from '@/lib/colors';

interface MemoryNode {
  id: string;
  title: string;
  level: string;
  content: string;
}

interface CoreData {
  memories: MemoryNode[];
  l0Count: number;
  l0Messages: number;
  intents: number;
  dreams: number;
  lastSync: string;
}

export function NeuralCore({ data }: { data: CoreData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const animationRef = useRef<number>(0);

  const levelStats = [
    { level: 'L4', count: data.memories.filter(m => m.level === 'L4').length, radius: 50, speed: 0.3 },
    { level: 'L3', count: data.memories.filter(m => m.level === 'L3').length, radius: 90, speed: 0.5 },
    { level: 'L2', count: data.memories.filter(m => m.level === 'L2').length, radius: 130, speed: 0.7 },
    { level: 'L1', count: data.memories.filter(m => m.level === 'L1').length, radius: 170, speed: 0.9 },
    { level: 'L0', count: data.l0Count || 3, radius: 210, speed: 1.2 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 480;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // 背景光晕
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      levelStats.forEach((stat) => {
        const color = getLevelColor(stat.level);
        const isHovered = hoveredLevel === stat.level;
        const baseAlpha = isHovered ? 0.8 : 0.3;
        const glowSize = isHovered ? 20 : 8;

        // 外环发光
        ctx.beginPath();
        ctx.arc(cx, cy, stat.radius, 0, Math.PI * 2);
        ctx.strokeStyle = color.main + Math.floor(baseAlpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = isHovered ? 3 : 1.5;
        ctx.shadowColor = color.glow;
        ctx.shadowBlur = glowSize;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 节点点
        const nodeCount = Math.min(stat.count, 12);
        for (let i = 0; i < nodeCount; i++) {
          const angle = (time * stat.speed * 0.01) + (i / nodeCount) * Math.PI * 2;
          const x = cx + Math.cos(angle) * stat.radius;
          const y = cy + Math.sin(angle) * stat.radius;
          const pulse = Math.sin(time * 0.05 + i) * 0.3 + 0.7;

          ctx.beginPath();
          ctx.arc(x, y, isHovered ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = color.glow;
          ctx.globalAlpha = pulse * (isHovered ? 1 : 0.7);
          ctx.fill();

          // 连接线到中心
          if (isHovered || stat.level === 'L4') {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color.main + '20';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // 计数标签
        if (isHovered || stat.level === 'L4') {
          const labelAngle = -Math.PI / 2;
          const lx = cx + Math.cos(labelAngle) * (stat.radius + 25);
          const ly = cy + Math.sin(labelAngle) * (stat.radius + 25);
          ctx.fillStyle = color.glow;
          ctx.globalAlpha = 0.9;
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${stat.level} · ${stat.count}`, lx, ly);
        }

        ctx.globalAlpha = 1;
      });

      // 中心核心
      const corePulse = Math.sin(time * 0.08) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239, 68, 68, ${corePulse})`;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 30 * corePulse;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 中心文字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CORE', cx, cy);

      time++;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [hoveredLevel]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="cursor-pointer"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - 240;
          const y = e.clientY - rect.top - 240;
          const dist = Math.sqrt(x * x + y * y);

          let found = null;
          for (const stat of levelStats) {
            if (Math.abs(dist - stat.radius) < 25) {
              found = stat.level;
              break;
            }
          }
          setHoveredLevel(found);
        }}
        onMouseLeave={() => setHoveredLevel(null)}
      />

      {/* 层级图例 */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {levelStats.map((stat) => {
          const color = getLevelColor(stat.level);
          const isActive = hoveredLevel === stat.level;
          return (
            <motion.div
              key={stat.level}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer"
              style={{
                background: isActive ? color.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? color.main + '60' : 'rgba(255,255,255,0.08)'}`,
              }}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setHoveredLevel(stat.level)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: color.main,
                  boxShadow: `0 0 8px ${color.glow}`,
                }}
              />
              <span className="text-xs font-medium" style={{ color: isActive ? color.glow : '#94A3B8' }}>
                {stat.level} · {color.name} · {stat.count}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
