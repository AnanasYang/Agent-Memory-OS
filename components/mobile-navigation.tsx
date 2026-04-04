'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Clock, 
  LineChart, 
  Activity,
  Sparkles,
  Zap,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

export function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t('nav.dashboard') || '概览', icon: Activity },
    { href: '/l0', label: 'L0记忆', icon: Zap },
    { href: '/memory', label: t('nav.memory') || '记忆', icon: Brain },
    { href: '/intent', label: t('nav.intent') || '意图', icon: Target },
    { href: '/dreams', label: t('nav.dreams') || '梦境', icon: Sparkles },
  ];

  // 只在移动端显示
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mb-4 rounded-2xl border-t">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mobile-nav-item relative min-w-[60px] py-2 px-1 rounded-xl transition-all duration-200",
                  isActive ? "active text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-1">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
