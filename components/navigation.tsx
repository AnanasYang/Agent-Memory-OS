'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Brain, 
  Target, 
  Clock, 
  LineChart, 
  Search,
  Activity,
  Menu,
  X,
  Moon,
  Sun,
  Languages,
  User,
  LogOut,
  Sparkles,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';
import { useAuth } from '@/components/auth-provider';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  // 避免 Hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', label: t('nav.dashboard'), icon: Activity },
    { href: '/l0', label: t('nav.l0') || 'L0工作记忆', icon: Zap },
    { href: '/memory', label: t('nav.memory'), icon: Brain },
    { href: '/intent', label: t('nav.intent'), icon: Target },
    { href: '/dreams', label: t('nav.dreams'), icon: Sparkles },
    { href: '/timeline', label: t('nav.timeline'), icon: Clock },
    { href: '/insights', label: t('nav.insights'), icon: LineChart },
    { href: '/search', label: t('nav.search'), icon: Search },
  ];

  // 未挂载时显示简化版导航（避免图标 Hydration 错误）
  if (!mounted) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="h-6 w-6 rounded-full bg-memory-l4" />
              <span className="bg-gradient-to-r from-memory-l4 to-memory-l2 bg-clip-text text-transparent">
                Memory OS
              </span>
            </Link>
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Brain className="h-6 w-6 text-memory-l4" />
            <span className="bg-gradient-to-r from-memory-l4 to-memory-l2 bg-clip-text text-transparent">
              Memory OS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
              aria-label={t('nav.language')}
              title={t('nav.language')}
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'zh' ? '中文' : 'EN'}</span>
              <span className="sm:hidden">{language === 'zh' ? '中' : 'E'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label={t('nav.toggleTheme')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* User Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-sm text-muted-foreground">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium text-red-500"
                  title="退出登录"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium",
                  pathname === '/login'
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">登录</span>
              </Link>
            )}
            
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('nav.toggleMenu')}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile Login/Logout */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  退出 ({user?.name})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === '/login'
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <User className="h-4 w-4" />
                  登录
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
