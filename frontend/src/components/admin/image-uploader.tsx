"use client";

import { useRef, useState, useEffect } from "react";

interface ImageUploaderProps {
  currentImageUrl: string | null;
  onFileSelect: (file: File | null) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ImageUploader({ currentImageUrl, onFileSelect }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl(null);
  }, [selectedFile]);

  const displayUrl = previewUrl || (currentImageUrl ? `${API_URL}${currentImageUrl}` : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div data-testid="image-uploader" className="space-y-3">
      {displayUrl && (
        <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={displayUrl}
            alt="미리보기"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        data-testid="image-uploader-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          파일 선택
        </button>
        {(selectedFile || currentImageUrl) && (
          <button
            type="button"
            data-testid="image-uploader-remove"
            onClick={handleRemove}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
          >
            제거
          </button>
        )}
      </div>
    </div>
  );
}
