"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  login as requestLogin,
  getApiError,
  type LoginPayload,
} from "@/lib/api";
export function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function login(payload: LoginPayload) {
    setLoading(true);
    setError("");
    try {
      const result = await requestLogin(payload);
      toast.success("เข้าสู่ระบบสำเร็จ");
      router.replace(result.destination);
      router.refresh();
    } catch (error) {
      const message = getApiError(error);
      setError(message);
      toast.error("เข้าสู่ระบบไม่สำเร็จ", { description: message });
    } finally {
      setLoading(false);
    }
  }
  return { login, loading, error, clearError: () => setError("") };
}
