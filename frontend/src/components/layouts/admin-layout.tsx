"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const navItems = [
  { href: "/admin/dashboard", label: "주문 대시보드" },
  { href: "/admin/tables", label: "테이블 관리" },
  { href: "/admin/menus", label: "메뉴 관리" },
  { href: "/admin/categories", label: "카테고리 관리" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-56 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-800">Table Order</h1>
          <p className="text-sm text-gray-500">관리자</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`admin-nav-${item.href.split("/").pop()}`}
              className={`block px-4 py-3 rounded-lg mb-1 text-sm ${
                pathname.startsWith(item.href)
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            data-testid="admin-logout-button"
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
