"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { useSSE } from "@/hooks/use-sse";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { TableInfo, Order, OrderStatus } from "@/types";
import Link from "next/link";

const NEXT_STATUS: Record<string, { label: string; next: OrderStatus }> = {
  pending: { label: "준비 시작", next: "preparing" },
  preparing: { label: "완료 처리", next: "completed" },
};

export default function AdminTableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const storeId = user?.store_id;
  const tableId = Number(params.id);

  const [table, setTable] = useState<TableInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadData = useCallback(async () => {
    if (!storeId) return;
    try {
      const [tablesData, ordersData] = await Promise.all([
        apiClient.get<TableInfo[]>(`/api/stores/${storeId}/tables`),
        apiClient.get<Order[]>(`/api/stores/${storeId}/orders?table_id=${tableId}`),
      ]);
      const found = tablesData.find((t) => t.id === tableId);
      setTable(found || null);
      setOrders(ordersData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [storeId, tableId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSSEEvent = useCallback(
    (event: { event_type: string; data: any }) => {
      switch (event.event_type) {
        case "order_created": {
          const order = event.data as Order;
          if (order.tableId === tableId) {
            setOrders((prev) => [order, ...prev]);
          }
          break;
        }
        case "order_status_changed": {
          const { order_id, table_id, status } = event.data;
          if (table_id === tableId) {
            setOrders((prev) => prev.map((o) => (o.id === order_id ? { ...o, status } : o)));
          }
          break;
        }
        case "order_deleted": {
          const { order_id, table_id } = event.data;
          if (table_id === tableId) {
            setOrders((prev) => prev.filter((o) => o.id !== order_id));
          }
          break;
        }
        case "table_completed": {
          if (event.data.table_id === tableId) {
            setOrders([]);
            setTable((prev) => (prev ? { ...prev, sessionId: null, sessionStartedAt: null } : prev));
          }
          break;
        }
      }
    },
    [tableId]
  );

  useSSE({ storeId: storeId ?? null, onEvent: handleSSEEvent });

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    if (!storeId) return;
    try {
      await apiClient.put(`/api/stores/${storeId}/orders/${orderId}/status`, { status: newStatus });
      setToast({ message: "상태가 변경되었습니다", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "상태 변경에 실패했습니다", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!storeId || !deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/stores/${storeId}/orders/${deleteTarget.id}`);
      setToast({ message: "주문이 삭제되었습니다", type: "success" });
      setDeleteTarget(null);
    } catch (err: any) {
      setToast({ message: err.message || "주문 삭제에 실패했습니다. 다시 시도해 주세요", type: "error" });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleComplete = async () => {
    if (!storeId) return;
    setCompleting(true);
    try {
      await apiClient.post(`/api/stores/${storeId}/tables/${tableId}/complete`);
      setToast({ message: "이용 완료 처리되었습니다", type: "success" });
      setShowComplete(false);
    } catch (err: any) {
      setToast({ message: err.message || "이용 완료에 실패했습니다", type: "error" });
      setShowComplete(false);
    } finally {
      setCompleting(false);
    }
  };

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status !== "completed").length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!table) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">테이블을 찾을 수 없습니다</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="text-gray-500 hover:text-gray-700"
              data-testid="back-to-dashboard"
            >
              ← 대시보드
            </button>
            <h1 className="text-2xl font-bold text-gray-800">테이블 {table.tableNumber}</h1>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                table.sessionId ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {table.sessionId ? "이용중" : "빈 테이블"}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/tables/${tableId}/history`}
              data-testid="view-history-button"
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              과거 내역
            </Link>
            {table.sessionId && (
              <button
                data-testid="complete-session-button"
                onClick={() => setShowComplete(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
              >
                이용 완료
              </button>
            )}
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-6">
          <div>
            <p className="text-sm text-gray-500">총 주문액</p>
            <p className="text-xl font-bold text-blue-600">{totalAmount.toLocaleString()}원</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">주문 수</p>
            <p className="text-xl font-bold">{orders.length}건</p>
          </div>
          {table.sessionStartedAt && (
            <div>
              <p className="text-sm text-gray-500">세션 시작</p>
              <p className="text-sm font-medium">{new Date(table.sessionStartedAt).toLocaleString("ko-KR")}</p>
            </div>
          )}
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} data-testid={`order-card-${order.orderNumber}`} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString("ko-KR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {NEXT_STATUS[order.status] && (
                      <button
                        data-testid={`change-status-${order.orderNumber}`}
                        onClick={() => handleStatusChange(order.id, NEXT_STATUS[order.status].next)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        {NEXT_STATUS[order.status].label}
                      </button>
                    )}
                    <button
                      data-testid={`delete-order-${order.orderNumber}`}
                      onClick={() => setDeleteTarget(order)}
                      className="px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.menuName} × {item.quantity}
                      </span>
                      <span className="text-gray-600">{(item.unitPrice * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t flex justify-end">
                  <span className="font-semibold">{order.totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">현재 주문이 없습니다</p>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteTarget && (
          <ConfirmModal
            title="주문 삭제"
            message={`주문 #${deleteTarget.orderNumber}을(를) 삭제하시겠습니까?`}
            confirmText="삭제"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isLoading={deleting}
          />
        )}

        {/* Complete Session Confirm */}
        {showComplete && (
          <ConfirmModal
            title="이용 완료"
            message={
              pendingCount > 0
                ? `미완료 주문 ${pendingCount}건이 있습니다. 그래도 이용 완료하시겠습니까?`
                : `테이블 ${table.tableNumber} 이용을 완료하시겠습니까?`
            }
            confirmText="이용 완료"
            onConfirm={handleComplete}
            onCancel={() => setShowComplete(false)}
            isLoading={completing}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
}
