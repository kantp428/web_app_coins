"use client";
import type { ReactNode } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  onConfirm: () => void;
  pending?: boolean;
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  pending = false,
  confirmLabel = "ยืนยัน",
  pendingLabel = "กำลังดำเนินการ…",
  cancelLabel = "ยกเลิก",
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={`mb-2 flex size-10 items-center justify-center rounded-full ${destructive ? "bg-destructive/10 text-destructive" : "bg-muted"}`}
          >
            <AlertCircle className="size-5" aria-hidden="true" />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            autoFocus
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
