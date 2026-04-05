"use client";

import { useState, useEffect, useCallback } from "react";
import { Category, Menu } from "@/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MenuFormModal } from "@/components/admin/menu-form-modal";
import { formatPrice } from "@/lib/format-utils";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminMenuManagementPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const storeId = user?.storeId;

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await apiClient.get<Category[]>(`/api/stores/${storeId}/categories`);
      setCategories(data);
    } catch (err: any) {
      setToast({ message: err.message || "카테고리 목록을 불러오지 못했습니다.", type: "error" });
    }
  }, [storeId]);

  const fetchMenus = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await apiClient.get<Menu[]>(`/api/stores/${storeId}/menus`);
      setMenus(data);
    } catch (err: any) {
      setToast({ message: err.message || "메뉴 목록을 불러오지 못했습니다.", type: "error" });
    }
  }, [storeId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchMenus()]);
      setIsLoading(false);
    };
    load();
  }, [fetchCategories, fetchMenus]);

  const filteredMenus = selectedCategoryId
    ? menus.filter((m) => m.categoryId === selectedCategoryId)
    : menus;

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "-";
  };

  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleModalSave = async (formData: FormData) => {
    try {
      if (editingMenu) {
        await apiClient.uploadPut(`/api/stores/${storeId}/menus/${editingMenu.id}`, formData);
        setToast({ message: "메뉴가 수정되었습니다.", type: "success" });
      } else {
        await apiClient.upload(`/api/stores/${storeId}/menus`, formData);
        setToast({ message: "메뉴가 추가되었습니다.", type: "success" });
      }
      setIsModalOpen(false);
      setEditingMenu(null);
      await fetchMenus();
    } catch (err: any) {
      setToast({ message: err.message || "메뉴 저장에 실패했습니다.", type: "error" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/stores/${storeId}/menus/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      setToast({ message: "메뉴가 삭제되었습니다.", type: "success" });
      await fetchMenus();
    } catch (err: any) {
      setDeleteConfirm(null);
      setToast({ message: err.message || "메뉴 삭제에 실패했습니다.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newMenus = [...filteredMenus];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMenus.length) return;

    [newMenus[index], newMenus[targetIndex]] = [newMenus[targetIndex], newMenus[index]];

    // Update the full menus list with the reordered filtered subset
    const updatedMenus = menus.map((m) => {
      const reorderedItem = newMenus.find((rm) => rm.id === m.id);
      return reorderedItem || m;
    });
    setMenus(updatedMenus);

    try {
      const menuIds = newMenus.map((m) => m.id);
      const categoryId = selectedCategoryId || newMenus[0]?.categoryId;
      await apiClient.put(`/api/stores/${storeId}/menus/reorder`, { menuIds, categoryId });
      setToast({ message: "순서가 변경되었습니다.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "순서 변경에 실패했습니다.", type: "error" });
      await fetchMenus();
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">메뉴 관리</h1>
          <button
            data-testid="menu-page-add"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + 추가
          </button>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              onClick={() => setSelectedCategoryId(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategoryId === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-16">이미지</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">메뉴명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-28">가격</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-28">카테고리</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-20">순서</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-40">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMenus.map((menu, index) => (
                  <tr key={menu.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {menu.imageUrl ? (
                        <img
                          src={`${IMAGE_BASE_URL}${menu.imageUrl}`}
                          alt={menu.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{menu.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatPrice(menu.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getCategoryName(menu.categoryId)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          data-testid={`menu-up-${menu.id}`}
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          &#9650;
                        </button>
                        <button
                          data-testid={`menu-down-${menu.id}`}
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === filteredMenus.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          &#9660;
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          data-testid={`menu-edit-${menu.id}`}
                          onClick={() => handleOpenEditModal(menu)}
                          className="px-3 py-1 text-sm text-blue-500 border border-blue-300 rounded hover:bg-blue-50"
                        >
                          수정
                        </button>
                        <button
                          data-testid={`menu-delete-${menu.id}`}
                          onClick={() => setDeleteConfirm({ id: menu.id, name: menu.name })}
                          className="px-3 py-1 text-sm text-red-500 border border-red-300 rounded hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMenus.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      등록된 메뉴가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="메뉴 삭제"
          message={`"${deleteConfirm.name}" 메뉴를 삭제하시겠습니까?`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={isDeleting}
        />
      )}

      {isModalOpen && (
        <MenuFormModal
          menu={editingMenu}
          categories={categories}
          onSave={handleModalSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMenu(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
