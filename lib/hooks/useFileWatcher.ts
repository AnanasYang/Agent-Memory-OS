"use client";

/**
 * useFileWatcher Hook
 * 实时监听文件变化，支持 WebSocket 和 SSE
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface FileChangeEvent {
  type: "add" | "change" | "unlink" | "ready";
  path: string;
  level: "L0" | "L1" | "L2" | "L3" | "L4" | "unknown";
  timestamp: number;
  stats?: {
    size?: number;
    mtime?: number;
  };
}

export interface UseFileWatcherOptions {
  wsPort?: number;
  useSSE?: boolean; // 强制使用 SSE 而不是 WebSocket
  onFileChange?: (event: FileChangeEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export interface UseFileWatcherReturn {
  connected: boolean;
  lastEvent: FileChangeEvent | null;
  error: Error | null;
  reconnect: () => void;
}

export function useFileWatcher(
  options: UseFileWatcherOptions = {}
): UseFileWatcherReturn {
  const {
    wsPort = 3001,
    useSSE = false,
    onFileChange,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<FileChangeEvent | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理连接
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnected(false);
  }, []);

  // 连接 WebSocket
  const connectWebSocket = useCallback(() => {
    cleanup();

    try {
      const ws = new WebSocket(`ws://localhost:${wsPort}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "file:added" || message.type === "file:changed") {
            const fileEvent = message.data as FileChangeEvent;
            setLastEvent(fileEvent);
            onFileChange?.(fileEvent);
          }
        } catch (err) {
          console.warn("[useFileWatcher] Failed to parse message:", err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        onDisconnect?.();

        // 自动重连
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      ws.onerror = (err) => {
        const error = new Error("WebSocket connection failed");
        setError(error);
        onError?.(error);
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to connect");
      setError(error);
      onError?.(error);
    }
  }, [wsPort, cleanup, onConnect, onDisconnect, onError, onFileChange]);

  // 连接 SSE
  const connectSSE = useCallback(() => {
    cleanup();

    try {
      const eventSource = new EventSource("/api/health/events");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // SSE 主要用于健康状态，文件变化仍通过 WebSocket
          if (message.type === "initial") {
            // 初始数据
          }
        } catch (err) {
          console.warn("[useFileWatcher] Failed to parse SSE message:", err);
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        onDisconnect?.();

        // 自动重连
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 5000);
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to connect SSE");
      setError(error);
      onError?.(error);
    }
  }, [cleanup, onConnect, onDisconnect, onError]);

  // 手动重连
  const reconnect = useCallback(() => {
    if (useSSE) {
      connectSSE();
    } else {
      connectWebSocket();
    }
  }, [useSSE, connectSSE, connectWebSocket]);

  // 初始连接
  useEffect(() => {
    if (useSSE) {
      connectSSE();
    } else {
      connectWebSocket();
    }

    return cleanup;
  }, [useSSE, connectSSE, connectWebSocket, cleanup]);

  return {
    connected,
    lastEvent,
    error,
    reconnect,
  };
}

export default useFileWatcher;
