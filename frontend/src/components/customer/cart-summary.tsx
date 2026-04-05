"use client";

interface CartSummaryProps {
  totalAmount: number;
  itemCount: number;
  onSubmit: () => void;
  isDisabled: boolean;
  isLoading: boolean;
}

export function CartSummary({ totalAmount, itemCount, onSubmit, isDisabled, isLoading }: CartSummaryProps) {
  return (
    <div data-testid="cart-summary" className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{itemCount}개 항목</span>
        <span data-testid="cart-total" className="text-lg font-bold text-gray-800">
          총 {totalAmount.toLocaleString()}원
        </span>
      </div>
      <button
        data-testid="cart-submit-button"
        onClick={onSubmit}
        disabled={isDisabled || isLoading}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? "주문 중..." : "주문하기"}
      </button>
    </div>
  );
}
