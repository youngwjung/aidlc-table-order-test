"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Category, Menu } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { Toast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CustomerLayout } from "@/components/layouts/customer-layout";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { MenuCard } from "@/components/customer/menu-card";
import { MenuDetailModal } from "@/components/customer/menu-detail-modal";

export default function CustomerMenuPage() {
  const { user } = useAuth();
  const cart = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.storeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [categoriesData, menusData] = await Promise.all([
        apiClient.get<Category[]>(`/api/stores/${user.storeId}/categories`),
        apiClient.get<Menu[]>(`/api/stores/${user.storeId}/menus`),
      ]);
      setCategories(categoriesData);
      setMenus(menusData);
    } catch {
      setError("메뉴를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요");
    } finally {
      setIsLoading(false);
    }
  }, [user?.storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMenus = useMemo(() => {
    if (selectedCategoryId === null) return menus;
    return menus.filter((menu) => menu.categoryId === selectedCategoryId);
  }, [menus, selectedCategoryId]);

  const handleAddToCart = useCallback(
    (menu: Menu) => {
      cart.addItem({
        menuId: menu.id,
        menuName: menu.name,
        unitPrice: menu.price,
        quantity: 1,
        imageUrl: menu.imageUrl,
      });
      setSelectedMenu(null);
      setToast("장바구니에 추가되었습니다");
    },
    [cart]
  );

  if (isLoading) {
    return (
      <CustomerLayout>
        <LoadingSpinner />
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div data-testid="customer-menu-error" className="text-center py-20 px-4">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            data-testid="customer-menu-refresh"
            onClick={fetchData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            새로고침
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div data-testid="customer-menu-page" className="p-4 pb-24">
        <CategoryTabs
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        {filteredMenus.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">등록된 메뉴가 없습니다</p>
          </div>
        ) : (
          <div
            data-testid="customer-menu-grid"
            className="grid grid-cols-2 gap-3 mt-4"
          >
            {filteredMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onAddToCart={handleAddToCart}
                onClick={setSelectedMenu}
              />
            ))}
          </div>
        )}

        {selectedMenu && (
          <MenuDetailModal
            menu={selectedMenu}
            onClose={() => setSelectedMenu(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {toast && (
          <Toast
            message={toast}
            type="success"
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </CustomerLayout>
  );
}
