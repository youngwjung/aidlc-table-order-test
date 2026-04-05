"use client";

import { Menu } from "@/types";
import { formatPrice } from "@/lib/format-utils";

interface MenuDetailModalProps {
  menu: Menu;
  onClose: () => void;
  onAddToCart: (menu: Menu) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function MenuDetailModal({ menu, onClose, onAddToCart }: MenuDetailModalProps) {
  return (
    <div
      data-testid="menu-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {menu.imageUrl ? (
            <img
              src={`${API_URL}${menu.imageUrl}`}
              alt={menu.name}
              className="w-full h-56 object-cover"
            />
          ) : (
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          <button
            data-testid="menu-detail-close"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            &#x2715;
          </button>
        </div>

        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900">{menu.name}</h2>
          <p className="text-lg font-bold text-blue-600 mt-1">{formatPrice(menu.price)}</p>
          {menu.description && (
            <p className="text-gray-600 mt-3 leading-relaxed">{menu.description}</p>
          )}

          <button
            data-testid="menu-detail-add-to-cart"
            onClick={() => onAddToCart(menu)}
            className="w-full mt-5 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            장바구니에 담기
          </button>
        </div>
      </div>
    </div>
  );
}
