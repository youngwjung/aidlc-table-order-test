"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { TableCard } from "@/components/admin/table-card";
import { useSSE } from "@/hooks/use-sse";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { playNotificationSound } from "@/lib/notification-sound";
import { TableInfo, Order } from "@/types";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const storeId = user?.store_id ?? null;

  const [tables, setTables] = useState<TableInfo[]>([]);
  const [ordersByTable, setOrdersByTable] = useState<Record<number, Order[]>>({});
  const [filter, setFilter] = useState<number | null>(null);
  const [highlightedTables, setHighlightedTables] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const highlightTimers = useRef<Record<number, NodeJS.Timeout>>({});

  const loadData = useCallback(async () => {
    if (!storeId) return;
    try {
      const [tablesData, ordersData] = await Promise.all([
        apiClient.get<TableInfo[]>(`/api/stores/${storeId}/tables`),
        apiClient.get<Order[]>(`/api/stores/${storeId}/orders`),
      ]);
      setTables(tablesData);

      const grouped: Record<number, Order[]> = {};
      for (const order of ordersData) {
        if (!grouped[order.tableId]) grouped[order.tableId] = [];
        grouped[order.tableId].push(order);
      }
      setOrdersByTable(grouped);
    } catch {
      // error handled by api-client
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const highlightTable = useCallback((tableId: number) => {
    setHighlightedTables((prev) => new Set(prev).add(tableId));
    if (highlightTimers.current[tableId]) clearTimeout(highlightTimers.current[tableId]);
    highlightTimers.current[tableId] = setTimeout(() => {
      setHighlightedTables((prev) => {
        const next = new Set(prev);
        next.delete(tableId);
        return next;
      });
    }, 3000);
  }, []);

  const handleSSEEvent = useCallback(
    (event: { event_type: string; data: any }) => {
      switch (event.event_type) {
        case "order_created": {
          const order = event.data as Order;
          setOrdersByTable((prev) => ({
            ...prev,
            [order.tableId]: [order, ...(prev[order.tableId] || [])],
          }));
          highlightTable(order.tableId);
          playNotificationSound();
          break;
        }
        case "order_status_changed": {
          const { order_id, table_id, status } = event.data;
          setOrdersByTable((prev) => ({
            ...prev,
            [table_id]: (prev[table_id] || []).map((o) =>
              o.id === order_id ? { ...o, status } : o
            ),
          }));
          break;
        }
        case "order_deleted": {
          const { order_id, table_id } = event.data;
          setOrdersByTable((prev) => ({
            ...prev,
            [table_id]: (prev[table_id] || []).filter((o) => o.id !== order_id),
          }));
          break;
        }
        case "table_completed": {
          const { table_id } = event.data;
          setOrdersByTable((prev) => ({ ...prev, [table_id]: [] }));
          setTables((prev) =>
            prev.map((t) =>
              t.id === table_id ? { ...t, sessionId: null, sessionStartedAt: null } : t
            )
          );
          break;
        }
      }
    },
    [highlightTable]
  );

  const { connected, error: sseError } = useSSE({
    storeId,
    onEvent: handleSSEEvent,
  });

  const filteredTables = filter ? tables.filter((t) => t.id === filter) : tables;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">주문 모니터링</h1>
          <div className="flex items-center gap-3">
            <select
              data-testid="dashboard-table-filter"
              value={filter ?? ""}
              onChange={(e) => setFilter(e.target.value ? Number(e.target.value) : null)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">전체 테이블</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  테이블 {t.tableNumber}
                </option>
              ))}
            </select>
            <div
              data-testid="sse-connection-indicator"
              className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
              title={connected ? "실시간 연결됨" : "연결 끊김"}
            />
          </div>
        </div>

        {/* SSE Error Banner */}
        {sseError && (
          <div
            data-testid="sse-error-banner"
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700"
          >
            {sseError}
          </div>
        )}

        {/* Table Grid */}
        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                orders={ordersByTable[table.id] || []}
                isHighlighted={highlightedTables.has(table.id)}
                onClick={() => router.push(`/admin/tables/${table.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">
              {tables.length === 0 ? "등록된 테이블이 없습니다. 테이블 관리에서 추가해 주세요." : "선택된 필터에 해당하는 테이블이 없습니다."}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
