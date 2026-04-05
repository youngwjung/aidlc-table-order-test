"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/layouts/customer-layout";
import { OrderCard } from "@/components/ui/order-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { Order } from "@/types";

interface SessionOrdersResponse {
  orders: Order[];
  session_total: number;
}

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      try {
        const data = await apiClient.get<SessionOrdersResponse>(
          `/api/stores/${user!.storeId}/orders/table/${user!.id}/current`
        );
        setOrders(data.orders);
        setSessionTotal(data.session_total);
      } catch (err: any) {
        setError(err.message || "주문 내역을 불러올 수 없습니다");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  return (
    <CustomerLayout>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">주문 내역</h2>

        {sessionTotal > 0 && (
          <p data-testid="orders-session-total" className="text-sm text-gray-500 mb-4">
            이번 방문 총 금액: <span className="font-bold text-gray-800">{sessionTotal.toLocaleString()}원</span>
          </p>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div data-testid="orders-empty" className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">주문 내역이 없습니다</p>
            <button
              onClick={() => router.push("/customer/menu")}
              className="text-blue-600 hover:underline"
            >
              메뉴 보러가기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
    </CustomerLayout>
  );
}
