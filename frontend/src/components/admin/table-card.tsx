"use client";

import { TableInfo, Order } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";

interface TableCardProps {
  table: TableInfo;
  orders: Order[];
  isHighlighted: boolean;
  onClick: () => void;
}

export function TableCard({ table, orders, isHighlighted, onClick }: TableCardProps) {
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const previewOrders = orders.slice(0, 3);
  const hasSession = table.sessionId !== null;

  return (
    <div
      data-testid={`table-card-${table.tableNumber}`}
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all border-l-4 ${
        hasSession ? "border-l-green-500" : "border-l-gray-300"
      } ${isHighlighted ? "animate-pulse bg-yellow-50" : ""}`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">테이블 {table.tableNumber}</h3>
          <span
            data-testid={`table-session-badge-${table.tableNumber}`}
            className={`text-xs px-2 py-0.5 rounded-full ${
              hasSession ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {hasSession ? "이용중" : "빈 테이블"}
          </span>
        </div>
        <span className="text-lg font-semibold text-blue-600">
          {totalAmount.toLocaleString()}원
        </span>
      </div>

      {previewOrders.length > 0 ? (
        <div className="space-y-1.5">
          {previewOrders.map((order) => (
            <div key={order.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">#{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </div>
              <span className="text-gray-700">{order.totalAmount.toLocaleString()}원</span>
            </div>
          ))}
          {orders.length > 3 && (
            <p className="text-xs text-gray-400 text-center">외 {orders.length - 3}건</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-2">주문 없음</p>
      )}
    </div>
  );
}
