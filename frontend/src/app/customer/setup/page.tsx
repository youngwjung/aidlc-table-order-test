"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { TokenResponse } from "@/types";
import { setTableCredentials } from "@/lib/token-utils";

export default function CustomerSetupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [storeIdentifier, setStoreIdentifier] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<TokenResponse>("/api/auth/table/login", {
        store_identifier: storeIdentifier,
        table_number: parseInt(tableNumber),
        password,
      });
      setTableCredentials({
        storeIdentifier,
        tableNumber: parseInt(tableNumber),
        password,
      });
      login(res.access_token);
      router.push("/customer/menu");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">태블릿 설정</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">관리자가 테이블 정보를 설정합니다.</p>

        {error && (
          <div data-testid="customer-setup-error" className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매장 식별자</label>
            <input
              data-testid="customer-setup-store-identifier"
              type="text"
              value={storeIdentifier}
              onChange={(e) => setStoreIdentifier(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">테이블 번호</label>
            <input
              data-testid="customer-setup-table-number"
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              data-testid="customer-setup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            data-testid="customer-setup-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "설정 중..." : "설정 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}
