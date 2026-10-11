"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const { logout, isLoggingOut } = useAuth();
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isLoggingOut}
        onClick={() => setOpen(true)}
      >
        ออกจากระบบ
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="ยืนยันการออกจากระบบ"
        description="คุณต้องการออกจากระบบหรือไม่? หากต้องการใช้งานอีกครั้ง จะต้องเข้าสู่ระบบใหม่"
        confirmLabel="ออกจากระบบ"
        pendingLabel="กำลังออกจากระบบ…"
        cancelLabel="อยู่ต่อ"
        destructive
        pending={isLoggingOut}
        onConfirm={() => void logout()}
      />
    </>
  );
}
