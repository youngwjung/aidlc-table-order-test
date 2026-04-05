"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function SetupPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [storeIdentifier, setStoreIdentifier] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post("/api/stores/setup", {
        store_name: storeName,
        store_identifier: storeIdentifier,
        admin_username: adminUsername,
        admin_password: adminPassword,
      });
      router.push("/admin/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">매장 초기 설정</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">처음 사용하시는 경우 매장 정보를 설정해 주세요.</p>

        {error && (
          <div data-testid="setup-error" className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매장명</label>
            <input
              data-testid="setup-store-name"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="매장 이름을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매장 식별자</label>
            <input
              data-testid="setup-store-identifier"
              type="text"
              value={storeIdentifier}
              onChange={(e) => setStoreIdentifier(e.target.value)}
              required
              pattern="^[a-z0-9\-]+$"
              minLength={3}
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="영문 소문자, 숫자, 하이픈"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">관리자 사용자명</label>
            <input
              data-testid="setup-admin-username"
              type="text"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              required
              pattern="^[a-z0-9_]+$"
              minLength={2}
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="영문 소문자, 숫자, 언더스코어"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">관리자 비밀번호</label>
            <input
              data-testid="setup-admin-password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              minLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="4자 이상"
            />
          </div>
          <button
            data-testid="setup-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "설정 중..." : "매장 설정 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}
