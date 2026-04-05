import { OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "대기중", className: "bg-yellow-100 text-yellow-800" },
  preparing: { label: "준비중", className: "bg-blue-100 text-blue-800" },
  completed: { label: "완료", className: "bg-green-100 text-green-800" },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span data-testid="status-badge" className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
