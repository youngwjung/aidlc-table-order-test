"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const tabs = [
  { href: "/customer/menu", label: "메뉴", icon: "📋" },
  { href: "/customer/cart", label: "장바구니", icon: "🛒" },
  { href: "/customer/orders", label: "주문내역", icon: "📄" },
];

export function CustomerLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "table")) {
      router.push("/customer/setup");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.role !== "table") return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-4 py-3 text-center">
        <h1 className="text-lg font-bold text-gray-800">
          테이블 {user.tableNumber}
        </h1>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
      <nav className="bg-white border-t flex">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            data-testid={`customer-tab-${tab.href.split("/").pop()}`}
            className={`flex-1 flex flex-col items-center py-3 text-xs relative ${
              pathname.startsWith(tab.href) ? "text-blue-600 font-medium" : "text-gray-500"
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            {tab.label}
            {tab.href === "/customer/cart" && itemCount > 0 && (
              <span
                data-testid="cart-badge"
                className="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {itemCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
