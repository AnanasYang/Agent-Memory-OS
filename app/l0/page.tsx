'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/particle-bg';
import { NavBar } from '@/components/nav-bar';
import { Activity, MessageSquare, Clock, Zap, RefreshCw } from 'lucide-react';

interface L0Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface L0Session {
  id: string;
  sessionId: string;
  messageCount: number;
  preview: string;
  timestamp: number;
}

export default function L0StreamPage() {
  const [messages, setMessages] = useState<L0Message[]>([]);
  const [sessions, setSessions] = useState<L0Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/l0-memories')
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || []);
        setSessions(d.memories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMessages = selectedSession
    ? messages.filter(m => m.id.startsWith(selectedSession))
    : messages.slice(-50); // 只显示最近50条

  const formatTime = (ts: string | number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <NavBar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-32">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
                L0 工作记忆
              </h1>
              <p className="text-sm text-slate-400">
                {messages.length} 条实时消息 · {sessions.length} 个会话 · 最近 50 条
              </p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1">
            <div className="glow-card p-4">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                会话列表
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedSession(null)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                    selectedSession === null
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  全部会话 ({messages.length})
                </button>

                {sessions.map((session) => {
                  const isActive = selectedSession === session.sessionId;
                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(isActive ? null : session.sessionId)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{session.sessionId}</span>
                        <span className="text-[10px] text-slate-500">{session.messageCount}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 truncate">{session.preview}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="lg:col-span-3">
            <div className="glow-card p-4" style={{ minHeight: 500 }}>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredMessages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            isUser
                              ? 'bg-blue-500/20 border border-blue-500/20'
                              : 'bg-white/5 border border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isUser
                                  ? 'bg-blue-500/30 text-blue-300'
                                  : 'bg-purple-500/30 text-purple-300'
                              }`}
                            >
                              {isUser ? 'User' : 'AI'}
                            </span>
                            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredMessages.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">暂无消息</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
