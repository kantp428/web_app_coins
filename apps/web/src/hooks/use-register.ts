"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  register as requestRegister,
  getApiError,
  type RegisterPayload,
} from "@/lib/api";
export function useRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function register(payload: RegisterPayload) {
    setLoading(true);
    try {
      await requestRegister(payload);
      toast.success("สมัครสมาชิกสำเร็จ", {
        description: "กรุณาเข้าสู่ระบบด้วยบัญชีที่สมัคร",
      });
      router.replace("/login");
    } catch (error) {
      toast.error("สมัครสมาชิกไม่สำเร็จ", { description: getApiError(error) });
    } finally {
      setLoading(false);
    }
  }
  return { register, loading };
}
