import { Order } from "@/types";
import { StatusBadge } from "./status-badge";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const time = new Date(order.createdAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div data-testid={`order-card-${order.orderNumber}`} className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800">주문 #{order.orderNumber}</span>
          <StatusBadge status={order.status} />
        </div>
        <span className="text-sm text-gray-500">{time}</span>
      </div>
      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600">
            <span>
              {item.menuName} x{item.quantity}
            </span>
            <span>{(item.unitPrice * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 flex justify-end">
        <span className="font-bold text-gray-800">
          합계: {order.totalAmount.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
