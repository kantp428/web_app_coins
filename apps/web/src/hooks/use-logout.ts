"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logout as requestLogout, getApiError } from "@/lib/api";
export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setLoading(true);
    setError("");
    try {
      await requestLogout();
      toast.success("ออกจากระบบสำเร็จ");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      const message = getApiError(error);
      setError(message);
      toast.error("ออกจากระบบไม่สำเร็จ", { description: message });
    } finally {
      setLoading(false);
    }
  }
  return { logout, loading, error };
}
