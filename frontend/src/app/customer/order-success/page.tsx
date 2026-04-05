"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerLayout } from "@/components/layouts/customer-layout";

export default function CustomerOrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "---";
  const totalAmount = Number(searchParams.get("totalAmount")) || 0;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/customer/menu");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <CustomerLayout>
      <div data-testid="order-success-page" className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">주문 완료!</h2>

        <div data-testid="order-success-number" className="text-4xl font-bold text-blue-600 mb-2">
          #{orderNumber}
        </div>

        <p data-testid="order-success-total" className="text-lg text-gray-600 mb-8">
          총 {totalAmount.toLocaleString()}원
        </p>

        <p data-testid="order-success-countdown" className="text-sm text-gray-400 mb-4">
          {countdown}초 후 메뉴로 이동합니다
        </p>

        <button
          data-testid="order-success-go-menu"
          onClick={() => router.push("/customer/menu")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          메뉴로 돌아가기
        </button>
      </div>
    </CustomerLayout>
  );
}
