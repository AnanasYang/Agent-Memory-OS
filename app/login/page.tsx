'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useLanguage } from '@/components/language-provider';
import { motion } from 'framer-motion';
import { Brain, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 如果已登录则重定向
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(username, password);
    if (success) {
      router.push('/');
    } else {
      setError('用户名或密码错误。请尝试用户名：bruce，密码：bruce');
    }
    setIsLoading(false);
  };

  const handleGuestLogin = () => {
    router.push('/');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-memory-l4 to-memory-l2 mb-4"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold">Agent Memory OS</h1>
          <p className="text-muted-foreground mt-1">登录以查看和管理记忆</p>
        </div>

        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl p-6 shadow-lg"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入用户名"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="w-full pl-10 pr-12 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <>
                  登录
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleGuestLogin}
              className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              以访客身份继续（仅查看）
            </button>
          </div>
        </motion.div>

        {/* Hint */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          演示账号：用户名：<strong>bruce</strong>，密码：<strong>bruce</strong>
        </motion.p>
      </motion.div>
    </div>
  );
}
