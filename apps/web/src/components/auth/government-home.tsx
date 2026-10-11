"use client";
import { useAuth } from "@/contexts/auth-context";
export function GovernmentHome() {
  const { user } = useAuth();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">ระบบภาครัฐ</h1>
      <p>ยินดีต้อนรับ {user.displayName}</p>
      <p className="text-muted-foreground">
        เข้าสู่ระบบสำเร็จ ส่วนจัดการภาครัฐอยู่ระหว่างพัฒนา
      </p>
    </section>
  );
}
