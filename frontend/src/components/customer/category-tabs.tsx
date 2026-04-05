"use client";

import { Category } from "@/types";

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryTabs({ categories, selectedCategoryId, onSelect }: CategoryTabsProps) {
  return (
    <div
      data-testid="category-tabs"
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      <button
        data-testid="category-tab-all"
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedCategoryId === null
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          data-testid={`category-tab-${category.id}`}
          onClick={() => onSelect(category.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategoryId === category.id
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
