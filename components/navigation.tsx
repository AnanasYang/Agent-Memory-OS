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
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';
import { useAuth } from '@/components/auth-provider';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  // 避免 Hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-card border-b rounded-none">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-memory-l4 to-memory-l2 animate-pulse" />
            <span className="gradient-text">Memory OS</span>
          </Link>
          <div className="h-10 w-20 bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled 
            ? "glass-card border-b shadow-lg" 
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="h-7 w-7 text-memory-l4" />
              </motion.div>
              <span className="gradient-text hidden sm:inline">Memory OS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-muted/50 backdrop-blur-sm rounded-2xl p-1">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute inset-0 bg-background rounded-xl shadow-sm border"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button - Desktop */}
              <Link
                href="/search"
                className={cn(
                  "hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  pathname === '/search'
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Search className="h-4 w-4" />
                <span>搜索</span>
              </Link>

              {/* Language Switcher */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-accent transition-all duration-200 text-sm font-medium"
                aria-label={t('nav.language')}
                title={t('nav.language')}
              >
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'zh' ? '中文' : 'EN'}</span>
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl hover:bg-accent transition-all duration-200"
                aria-label={t('nav.toggleTheme')}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.name}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all duration-200 text-sm font-medium text-red-500"
                    title="退出登录"
                  >
                    <LogOut className="h-4 w-4" />
                  </motion.button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "hidden md:flex items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium",
                    pathname === '/login'
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>登录</span>
                </Link>
              )}
              
              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2 rounded-xl hover:bg-accent transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={t('nav.toggleMenu')}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden"
              >
                <motion.div 
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  exit={{ y: -20 }}
                  className="border-t py-4 space-y-2"
                >
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive 
                              ? "bg-accent text-accent-foreground" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                  
                  {/* Mobile User Actions */}
                  <div className="border-t pt-4 mt-4 space-y-2">
                    {isAuthenticated ? (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        退出 ({user?.name})
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                            pathname === '/login'
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <User className="h-5 w-5" />
                          登录
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}
