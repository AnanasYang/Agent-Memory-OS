"use client";

/**
 * Health Dashboard Component
 * 显示系统健康状态、内存层统计和警告
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  RefreshCw,
  Server,
  Zap,
  BarChart3,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 健康状态类型
interface HealthStatus {
  dailyDream: {
    lastRun: string | null;
    status: "success" | "error" | "running" | "unknown";
    nextScheduled: string | null;
  };
  weeklyDream: {
    lastRun: string | null;
    status: "success" | "error" | "running" | "unknown";
    nextScheduled: string | null;
  };
  memoryLayers: {
    L0: number;
    L1: number;
    L2: number;
    L3: number;
    L4: number;
    total: number;
    lastUpdate: number;
  };
  l2Candidates: number;
  l3Candidates: number;
  warnings: string[];
  timestamp: number;
}

// WebSocket 消息类型
interface WsMessage {
  type: string;
  data: unknown;
}

// 组件属性
interface HealthDashboardProps {
  refreshInterval?: number; // 自动刷新间隔（毫秒）
  wsEnabled?: boolean; // 是否启用 WebSocket
  wsPort?: number; // WebSocket 端口
}

export default function HealthDashboard({
  refreshInterval = 30000,
  wsEnabled = true,
  wsPort = 3001,
}: HealthDashboardProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 获取健康状态
  const fetchHealthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/health/status");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setHealth(result.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        throw new Error(result.message || "Failed to fetch health status");
      }
    } catch (err) {
      console.error("[HealthDashboard] Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // 连接 WebSocket
  const connectWebSocket = useCallback(() => {
    if (!wsEnabled || typeof window === "undefined") return;

    try {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[HealthDashboard] WebSocket connected");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case "health:initial":
            case "health:update":
              setHealth(message.data as HealthStatus);
              setLastUpdate(new Date());
              break;

            case "file:added":
            case "file:changed":
              // 文件变化时刷新健康状态
              fetchHealthStatus();
              break;

            case "watcher:ready":
              console.log("[HealthDashboard] File watcher ready");
              break;

            case "watcher:error":
              console.error("[HealthDashboard] Watcher error:", message.data);
              break;
          }
        } catch (err) {
          console.error("[HealthDashboard] WebSocket message error:", err);
        }
      };

      ws.onclose = () => {
        console.log("[HealthDashboard] WebSocket disconnected");
        setWsConnected(false);
        
        // 自动重连
        if (wsEnabled && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (err) => {
        console.error("[HealthDashboard] WebSocket error:", err);
        setWsConnected(false);
      };

    } catch (err) {
      console.error("[HealthDashboard] WebSocket connection error:", err);
      setWsConnected(false);
    }
  }, [wsEnabled, wsPort, fetchHealthStatus]);

  // 断开 WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setWsConnected(false);
  }, []);

  // 初始加载
  useEffect(() => {
    fetchHealthStatus();
    
    if (wsEnabled) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [fetchHealthStatus, connectWebSocket, disconnectWebSocket, wsEnabled]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthStatus();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchHealthStatus, refreshInterval, autoRefresh]);

  // 格式化状态显示
  const formatStatus = (status: string) => {
    switch (status) {
      case "success":
        return { text: "正常", color: "text-green-500", icon: CheckCircle };
      case "error":
        return { text: "异常", color: "text-red-500", icon: AlertTriangle };
      case "running":
        return { text: "运行中", color: "text-blue-500", icon: Activity };
      default:
        return { text: "未知", color: "text-gray-500", icon: Clock };
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "从未运行";
    try {
      return format(new Date(dateStr), "MM-dd HH:mm", { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-gray-500">加载健康状态...</span>
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <span className="text-red-500">{error}</span>
          <button
            onClick={fetchHealthStatus}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const dailyStatus = formatStatus(health.dailyDream.status);
  const weeklyStatus = formatStatus(health.weeklyDream.status);

  return (
    <div className="space-y-6">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            系统健康监控
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                wsConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <Server className="w-3 h-3" />
              {wsConnected ? "实时连接" : "HTTP 轮询"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            自动刷新
          </label>
          <button
            onClick={fetchHealthStatus}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
          <span className="text-xs text-gray-400">
            更新于 {format(lastUpdate, "HH:mm:ss")}
          </span>
        </div>
      </div>

      {/* 警告区域 */}
      <AnimatePresence>
        {health.warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {health.warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="text-amber-800">{warning}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主要内容网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dream 状态卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Dream 运行状态
          </h3>
          <div className="space-y-4">
            {/* Daily Dream */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">Daily Dream</div>
                  <div className="text-sm text-gray-500">
                    每日 23:00 运行
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 font-medium ${dailyStatus.color}`}>
                  <dailyStatus.icon className="w-4 h-4" />
                  {dailyStatus.text}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  上次: {formatDate(health.dailyDream.lastRun)}
                </div>
                {health.dailyDream.nextScheduled && (
                  <div className="text-xs text-gray-400">
                    下次: {formatDate(health.dailyDream.nextScheduled)}
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Dream */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="font-medium">Weekly Dream</div>
                  <div className="text-sm text-gray-500">
                    每周日 23:00 运行
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 font-medium ${weeklyStatus.color}`}>
                  <weeklyStatus.icon className="w-4 h-4" />
                  {weeklyStatus.text}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  上次: {formatDate(health.weeklyDream.lastRun)}
                </div>
                {health.weeklyDream.nextScheduled && (
                  <div className="text-xs text-gray-400">
                    下次: {formatDate(health.weeklyDream.nextScheduled)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 内存层统计 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-500" />
            记忆层统计
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { level: "L0", label: "原始层", count: health.memoryLayers.L0, color: "bg-gray-500" },
              { level: "L1", label: "情景层", count: health.memoryLayers.L1, color: "bg-blue-500" },
              { level: "L2", label: "行为层", count: health.memoryLayers.L2, color: "bg-green-500" },
              { level: "L3", label: "认知层", count: health.memoryLayers.L3, color: "bg-purple-500" },
              { level: "L4", label: "核心层", count: health.memoryLayers.L4, color: "bg-amber-500" },
              { level: "Total", label: "总计", count: health.memoryLayers.total, color: "bg-slate-700" },
            ].map((item) => (
              <div
                key={item.level}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center"
              >
                <div className={`text-2xl font-bold ${item.color.replace('bg-', 'text-')}`}>
                  {item.count}
                </div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                <div className="text-xs font-medium text-gray-400">{item.level}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 候选池统计 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            候选池待 Review
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {health.l2Candidates}
              </div>
              <div className="text-sm text-blue-600/70 mt-1">
                L2 候选池 (行为模式)
              </div>
              <div className="text-xs text-gray-500 mt-2">
                待确认的 L1 → L2 升级
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {health.l3Candidates}
              </div>
              <div className="text-sm text-purple-600/70 mt-1">
                L3 候选池 (知识沉淀)
              </div>
              <div className="text-xs text-gray-500 mt-2">
                待确认的 L2 → L3 升级
              </div>
            </div>
          </div>
          {(health.l2Candidates > 50 || health.l3Candidates > 30) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-800">
                候选池积压较多，建议安排 Review 时间
              </span>
            </div>
          )}
        </div>

        {/* 系统信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-500" />
            系统信息
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">连接状态</span>
              <span className={wsConnected ? "text-green-500" : "text-gray-500"}>
                {wsConnected ? "WebSocket 实时" : "HTTP 轮询"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">自动刷新</span>
              <span>{autoRefresh ? "开启" : "关闭"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">刷新间隔</span>
              <span>{refreshInterval / 1000} 秒</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">最后更新</span>
              <span>{format(lastUpdate, "yyyy-MM-dd HH:mm:ss")}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">数据版本</span>
              <span className="font-mono text-xs">
                {health.timestamp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
