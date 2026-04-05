"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/layouts/customer-layout";
import { CartItem } from "@/components/customer/cart-item";
import { CartSummary } from "@/components/customer/cart-summary";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";

export default function CustomerCartPage() {
  const { items, totalAmount, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmitOrder = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post<{ order_number: string; total_amount: number }>(
        `/api/stores/${user.storeId}/orders`,
        {
          table_id: user.id,
          items: items.map((item) => ({
            menu_id: item.menuId,
            quantity: item.quantity,
          })),
        }
      );
      clearCart();
      router.push(
        `/customer/order-success?orderNumber=${response.order_number}&totalAmount=${response.total_amount}`
      );
    } catch (err: any) {
      setToast({ message: err.message || "주문 실패. 다시 시도해주세요.", type: "error" });
      setShowOrderConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-4 pb-36">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">장바구니</h2>
          {items.length > 0 && (
            <button
              data-testid="cart-clear-button"
              onClick={() => setShowClearConfirm(true)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              전체 삭제
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div data-testid="cart-empty" className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">장바구니가 비어있습니다</p>
            <button
              onClick={() => router.push("/customer/menu")}
              className="text-blue-600 hover:underline"
            >
              메뉴 보러가기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.menuId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}

        {items.length > 0 && (
          <CartSummary
            totalAmount={totalAmount}
            itemCount={itemCount}
            onSubmit={() => setShowOrderConfirm(true)}
            isDisabled={items.length === 0}
            isLoading={isSubmitting}
          />
        )}
      </div>

      {showOrderConfirm && (
        <ConfirmModal
          title="주문 확인"
          message={`${itemCount}개 항목, 총 ${totalAmount.toLocaleString()}원을 주문하시겠습니까?`}
          confirmText="주문하기"
          cancelText="취소"
          onConfirm={handleSubmitOrder}
          onCancel={() => setShowOrderConfirm(false)}
          isLoading={isSubmitting}
        />
      )}

      {showClearConfirm && (
        <ConfirmModal
          title="장바구니 비우기"
          message="장바구니를 비우시겠습니까?"
          confirmText="비우기"
          cancelText="취소"
          onConfirm={() => {
            clearCart();
            setShowClearConfirm(false);
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </CustomerLayout>
  );
}
