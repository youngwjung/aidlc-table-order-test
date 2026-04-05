"use client";

import { Menu } from "@/types";
import { formatPrice } from "@/lib/format-utils";

interface MenuCardProps {
  menu: Menu;
  onAddToCart: (menu: Menu) => void;
  onClick: (menu: Menu) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function MenuCard({ menu, onAddToCart, onClick }: MenuCardProps) {
  return (
    <div
      data-testid={`menu-card-${menu.id}`}
      onClick={() => onClick(menu)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="w-full h-40 bg-gray-100">
        {menu.imageUrl ? (
          <img
            src={`${API_URL}${menu.imageUrl}`}
            alt={menu.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
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
      </div>

      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{menu.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-blue-600 font-bold">{formatPrice(menu.price)}</span>
          <button
            data-testid={`menu-card-add-${menu.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(menu);
            }}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            담기
          </button>
        </div>
      </div>
    </div>
  );
}
