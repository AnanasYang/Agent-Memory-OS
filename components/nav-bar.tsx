'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Brain, Orbit, Calendar, Moon, Radar, Activity, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/', label: '核心', icon: Sparkles, short: 'Core' },
  { href: '/memory', label: '记忆', icon: Brain, short: 'Memory' },
  { href: '/timeline', label: '河流', icon: Calendar, short: 'River' },
  { href: '/dreams', label: '梦境', icon: Moon, short: 'Dreams' },
  { href: '/insights', label: '雷达', icon: Radar, short: 'Radar' },
  { href: '/l0', label: 'L0', icon: Activity, short: 'L0' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-2xl"
        style={{
          background: 'rgba(15, 15, 25, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(59, 130, 246, 0.05)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link flex flex-col items-center gap-1 min-w-[52px] ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] hidden sm:block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
