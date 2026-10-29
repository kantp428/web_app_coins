import type { Metadata, Viewport } from "next";
import { requireRole } from "@/lib/auth";
import { AiChat } from "@/components/chat/ai-chat";

export const metadata: Metadata = { title: "ผู้ช่วย AI | THAI Please" };
export const viewport: Viewport = {
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
};

export default async function Page() {
  await requireRole("CUSTOMER");
  return <AiChat />;
}
