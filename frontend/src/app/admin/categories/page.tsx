"use client";

import { useState, useEffect, useCallback } from "react";
import { Category } from "@/types";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminCategoryManagementPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
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
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditStart = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleEditSave = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    try {
      await apiClient.put(`/api/stores/${storeId}/categories/${id}`, { name: trimmed });
      setEditingId(null);
      setEditingName("");
      setToast({ message: "카테고리가 수정되었습니다.", type: "success" });
      await fetchCategories();
    } catch (err: any) {
      setToast({ message: err.message || "카테고리 수정에 실패했습니다.", type: "error" });
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") {
      handleEditSave(id);
    }
  };

  const handleAddSave = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    try {
      await apiClient.post(`/api/stores/${storeId}/categories`, { name: trimmed });
      setIsAdding(false);
      setNewCategoryName("");
      setToast({ message: "카테고리가 추가되었습니다.", type: "success" });
      await fetchCategories();
    } catch (err: any) {
      setToast({ message: err.message || "카테고리 추가에 실패했습니다.", type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/stores/${storeId}/categories/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      setToast({ message: "카테고리가 삭제되었습니다.", type: "success" });
      await fetchCategories();
    } catch (err: any) {
      setDeleteConfirm(null);
      setToast({ message: err.message || "카테고리 삭제에 실패했습니다.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newCategories = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    setCategories(newCategories);

    try {
      const categoryIds = newCategories.map((c) => c.id);
      await apiClient.put(`/api/stores/${storeId}/categories/reorder`, { categoryIds });
      setToast({ message: "순서가 변경되었습니다.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "순서 변경에 실패했습니다.", type: "error" });
      await fetchCategories();
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">카테고리 관리</h1>
          <button
            data-testid="category-page-add"
            onClick={() => {
              setIsAdding(true);
              setNewCategoryName("");
            }}
            disabled={isAdding}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            + 추가
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-16">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">카테고리명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-20">순서</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-40">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category, index) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      {editingId === category.id ? (
                        <input
                          data-testid={`category-edit-input-${category.id}`}
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, category.id)}
                          onBlur={() => handleEditSave(category.id)}
                          autoFocus
                          className="px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span
                          data-testid={`category-name-${category.id}`}
                          onClick={() => handleEditStart(category)}
                          className="cursor-pointer hover:text-blue-500"
                        >
                          {category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          data-testid={`category-up-${category.id}`}
                          onClick={() => handleReorder(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          &#9650;
                        </button>
                        <button
                          data-testid={`category-down-${category.id}`}
                          onClick={() => handleReorder(index, "down")}
                          disabled={index === categories.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          &#9660;
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        data-testid={`category-delete-${category.id}`}
                        onClick={() => setDeleteConfirm({ id: category.id, name: category.name })}
                        className="px-3 py-1 text-sm text-red-500 border border-red-300 rounded hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}

                {isAdding && (
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{categories.length + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        data-testid="category-new-input"
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddSave();
                        }}
                        autoFocus
                        placeholder="카테고리명을 입력하세요"
                        className="px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          data-testid="category-new-save"
                          onClick={handleAddSave}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          저장
                        </button>
                        <button
                          data-testid="category-new-cancel"
                          onClick={() => {
                            setIsAdding(false);
                            setNewCategoryName("");
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {categories.length === 0 && !isAdding && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      등록된 카테고리가 없습니다.
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
          title="카테고리 삭제"
          message={`"${deleteConfirm.name}" 카테고리를 삭제하시겠습니까?`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={isDeleting}
        />
      )}
    </AdminLayout>
  );
}
