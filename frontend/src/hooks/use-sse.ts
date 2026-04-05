"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "@/lib/token-utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SSEEvent {
  event_type: string;
  data: any;
  timestamp: string;
}

interface UseSSEOptions {
  storeId: number | null;
  onEvent: (event: SSEEvent) => void;
}

export function useSSE({ storeId, onEvent }: UseSSEOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryDelayRef = useRef(1000);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(async () => {
    if (!storeId) return;
    const token = getToken();
    if (!token) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(
        `${BASE_URL}/api/stores/${storeId}/sse/orders?token=${encodeURIComponent(token)}`,
        { signal: controller.signal, headers: { Accept: "text/event-stream" } }
      );

      if (!response.ok || !response.body) {
        throw new Error(`SSE 연결 실패: ${response.status}`);
      }

      setConnected(true);
      setError(null);
      retryDelayRef.current = 1000;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const chunk of lines) {
          const dataLine = chunk.trim();
          if (!dataLine.startsWith("data: ")) continue;
          try {
            const parsed: SSEEvent = JSON.parse(dataLine.slice(6));
            if (parsed.event_type !== "ping") {
              onEventRef.current(parsed);
            }
          } catch {
            // skip malformed data
          }
        }
      }

      setConnected(false);
      scheduleReconnect();
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setConnected(false);
      setError("실시간 연결이 끊어졌습니다. 재연결 중...");
      scheduleReconnect();
    }
  }, [storeId]);

  const scheduleReconnect = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
      connect();
    }, retryDelayRef.current);
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      abortRef.current?.abort();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [connect]);

  return { connected, error };
}
