"use client";

import { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (menuId: number, quantity: number) => void;
  onRemove: (menuId: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemTotal = item.unitPrice * item.quantity;

  return (
    <div data-testid={`cart-item-${item.menuId}`} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.menuName}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-400 text-xs">No img</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{item.menuName}</p>
        <p className="text-sm text-gray-500">{item.unitPrice.toLocaleString()}원</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          data-testid={`cart-item-minus-${item.menuId}`}
          onClick={() => onUpdateQuantity(item.menuId, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 active:bg-gray-200"
        >
          -
        </button>
        <span data-testid={`cart-item-qty-${item.menuId}`} className="w-8 text-center font-medium">
          {item.quantity}
        </span>
        <button
          data-testid={`cart-item-plus-${item.menuId}`}
          onClick={() => onUpdateQuantity(item.menuId, item.quantity + 1)}
          disabled={item.quantity >= 99}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30"
        >
          +
        </button>
      </div>

      <p data-testid={`cart-item-total-${item.menuId}`} className="w-20 text-right font-bold text-gray-800">
        {itemTotal.toLocaleString()}원
      </p>
    </div>
  );
}
