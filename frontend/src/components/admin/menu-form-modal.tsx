"use client";

import { useState } from "react";
import { Menu, Category } from "@/types";
import { ImageUploader } from "@/components/admin/image-uploader";

interface MenuFormModalProps {
  menu: Menu | null;
  categories: Category[];
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  price?: string;
  categoryId?: string;
}

export function MenuFormModal({ menu, categories, onSave, onClose }: MenuFormModalProps) {
  const [name, setName] = useState(menu?.name || "");
  const [price, setPrice] = useState(menu?.price?.toString() || "");
  const [description, setDescription] = useState(menu?.description || "");
  const [categoryId, setCategoryId] = useState(menu?.categoryId?.toString() || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "메뉴 이름을 입력해주세요.";
    }

    if (!price.trim()) {
      newErrors.price = "가격을 입력해주세요.";
    } else {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = "올바른 가격을 입력해주세요.";
      }
    }

    if (!categoryId) {
      newErrors.categoryId = "카테고리를 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      formData.append("description", description.trim());
      formData.append("categoryId", categoryId);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await onSave(formData);
    } catch {
      // Error handling delegated to parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      data-testid="menu-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">
            {menu ? "메뉴 수정" : "메뉴 추가"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메뉴 이름 <span className="text-red-500">*</span>
              </label>
              <input
                data-testid="menu-form-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="메뉴 이름을 입력하세요"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격 <span className="text-red-500">*</span>
              </label>
              <input
                data-testid="menu-form-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="가격을 입력하세요"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                data-testid="menu-form-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="메뉴 설명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                data-testid="menu-form-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoryId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지
              </label>
              <ImageUploader
                currentImageUrl={menu?.imageUrl || null}
                onFileSelect={setImageFile}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                data-testid="menu-form-cancel"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="submit"
                data-testid="menu-form-save"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
