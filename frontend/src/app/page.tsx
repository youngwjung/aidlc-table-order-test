"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await apiClient.get<{ setup_required: boolean }>("/api/stores/check-setup");
        if (res.setup_required) {
          router.replace("/setup");
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setIsLoading(false);
      }
    }
    checkSetup();
  }, [router]);

  if (isLoading) return <LoadingSpinner />;
  return null;
}
