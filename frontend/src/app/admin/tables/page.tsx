"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { TableInfo } from "@/types";

export default function AdminTableManagementPage() {
  const { user } = useAuth();
  const storeId = user?.store_id;

  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState<TableInfo | null>(null);
  const [formData, setFormData] = useState({ table_number: "", password: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TableInfo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showPasswords, setShowPasswords] = useState<Set<number>>(new Set());

  const loadTables = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await apiClient.get<TableInfo[]>(`/api/stores/${storeId}/tables`);
      setTables(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const openAddForm = () => {
    setEditingTable(null);
    setFormData({ table_number: "", password: "" });
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (table: TableInfo) => {
    setEditingTable(table);
    setFormData({ table_number: String(table.tableNumber), password: "" });
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!storeId) return;
    const num = parseInt(formData.table_number);
    if (!num || num < 1 || num > 999) {
      setFormError("테이블 번호는 1~999 사이의 숫자를 입력해 주세요");
      return;
    }
    if (!editingTable && !formData.password) {
      setFormError("비밀번호를 입력해 주세요");
      return;
    }

    setSaving(true);
    try {
      if (editingTable) {
        const body: any = { table_number: num };
        if (formData.password) body.password = formData.password;
        await apiClient.put(`/api/stores/${storeId}/tables/${editingTable.id}`, body);
        setToast({ message: "테이블이 수정되었습니다", type: "success" });
      } else {
        await apiClient.post(`/api/stores/${storeId}/tables`, {
          table_number: num,
          password: formData.password,
        });
        setToast({ message: "테이블이 추가되었습니다", type: "success" });
      }
      setShowForm(false);
      await loadTables();
    } catch (err: any) {
      setFormError(err.message || "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!storeId || !deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/stores/${storeId}/tables/${deleteTarget.id}`);
      setToast({ message: "테이블이 삭제되었습니다", type: "success" });
      setDeleteTarget(null);
      await loadTables();
    } catch (err: any) {
      setToast({ message: err.message || "삭제에 실패했습니다", type: "error" });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const togglePassword = (id: number) => {
    setShowPasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">테이블 관리</h1>
          <button
            data-testid="add-table-button"
            onClick={openAddForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            테이블 추가
          </button>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">테이블 번호</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">비밀번호</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">상태</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">관리</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id} data-testid={`table-row-${table.tableNumber}`} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">테이블 {table.tableNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <button
                      onClick={() => togglePassword(table.id)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      {showPasswords.has(table.id) ? "숨기기" : "보기"}
                    </button>
                    {showPasswords.has(table.id) && (
                      <span className="ml-2 font-mono" data-testid={`table-password-${table.tableNumber}`}>
                        {/* Password shown only when loaded from API - not available in list response */}
                        ****
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        table.sessionId ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {table.sessionId ? "이용중" : "빈 테이블"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      data-testid={`edit-table-${table.tableNumber}`}
                      onClick={() => openEditForm(table)}
                      className="text-blue-600 hover:underline text-sm mr-3"
                    >
                      수정
                    </button>
                    <button
                      data-testid={`delete-table-${table.tableNumber}`}
                      onClick={() => setDeleteTarget(table)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    등록된 테이블이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold mb-4">{editingTable ? "테이블 수정" : "테이블 추가"}</h3>
              {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
                  <input
                    data-testid="table-form-number"
                    type="number"
                    min={1}
                    max={999}
                    value={formData.table_number}
                    onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="1~999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호{editingTable && " (변경 시에만 입력)"}
                  </label>
                  <input
                    data-testid="table-form-password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder={editingTable ? "변경하지 않으려면 비워두세요" : "비밀번호 입력"}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  data-testid="table-form-cancel"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  data-testid="table-form-save"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteTarget && (
          <ConfirmModal
            title="테이블 삭제"
            message={`테이블 ${deleteTarget.tableNumber}을(를) 삭제하시겠습니까?`}
            confirmText="삭제"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isLoading={deleting}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
}
