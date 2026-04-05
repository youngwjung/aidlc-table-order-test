"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { OrderHistory, TableInfo } from "@/types";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function AdminOrderHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const storeId = user?.store_id;
  const tableId = Number(params.id);

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState(formatDate(weekAgo));
  const [dateTo, setDateTo] = useState(formatDate(today));
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data = await apiClient.get<OrderHistory[]>(
        `/api/stores/${storeId}/orders/table/${tableId}/history?date_from=${dateFrom}&date_to=${dateTo}`
      );
      setHistory(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [storeId, tableId, dateFrom, dateTo]);

  useEffect(() => {
    if (!storeId) return;
    apiClient.get<TableInfo[]>(`/api/stores/${storeId}/tables`).then((tables) => {
      const found = tables.find((t) => t.id === tableId);
      if (found) setTableNumber(found.tableNumber);
    });
  }, [storeId, tableId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/tables/${tableId}`)}
            className="text-gray-500 hover:text-gray-700"
            data-testid="back-to-table-detail"
          >
            ← 테이블 상세
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            테이블 {tableNumber ?? tableId} - 과거 내역
          </h1>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              data-testid="history-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              data-testid="history-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            data-testid="history-search-button"
            onClick={loadHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            조회
          </button>
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} data-testid={`history-card-${h.orderNumber}`} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">#{h.orderNumber}</span>
                    <span className="text-sm text-gray-500">
                      주문: {new Date(h.orderedAt).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    완료: {new Date(h.completedAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                <div className="space-y-1">
                  {h.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.menuName} × {item.quantity}
                      </span>
                      <span className="text-gray-600">{(item.unitPrice * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t flex justify-end">
                  <span className="font-semibold">{h.totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">조회 기간에 내역이 없습니다</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
